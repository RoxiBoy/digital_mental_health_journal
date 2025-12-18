import pandas as pd
from transformers import pipeline
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import seaborn as sns
import matplotlib.pyplot as plt
import numpy as np
import torch

# ------------------- 1. Load and fix your CSV -------------------
print("Loading journal_entries.csv and fixing encoding issues...")
df = pd.read_csv("../journal_entries.csv")

def fix_encoding(text):
    """Fix common smart-quote / Windows corruption"""
    if not isinstance(text, str):
        return text
    fixes = {
        '': '"', '': '"', '': "'", '': "'", '': '-', '': '-',
        '': '...', '': '"', '': '"', '': "'", '': "'",
        '': '-', '': '-', '': '-', '': '-'
    }
    for bad, good in fixes.items():
        text = text.replace(bad, good)
    return text

df['text'] = df['text'].apply(fix_encoding)
df = df.dropna(subset=['text', 'label'])  # safety
print(f"Loaded {len(df)} entries. Emotions: {df['label'].value_counts().to_dict()}")

# ------------------- 2. Load the Hugging Face model -------------------
print("Loading michellejieli/emotion_text_classifier model...")
classifier = pipeline(
    "text-classification",
    model="michellejieli/emotion_text_classifier",
    return_all_scores=False,
    truncation=True,
    max_length=512,
    device=0 if torch.cuda.is_available() else -1
)

# ------------------- 3. Run inference -------------------
print("Running inference on all entries (this may take 2–10 minutes)...")
predictions = []
confidences = []

for text in df['text']:
    result = classifier(text)[0]
    pred_label = result['label'].lower()
    predictions.append(pred_label)
    confidences.append(result['score'])

df['predicted'] = predictions
df['confidence'] = confidences

# ------------------- 4. Compute metrics -------------------
y_true = df['label'].str.lower()
y_pred = df['predicted']

accuracy = accuracy_score(y_true, y_pred)
report = classification_report(y_true, y_pred, digits=4, output_dict=True)

print("\n" + "="*60)
print(f"OVERALL ACCURACY: {accuracy:.4f} ({accuracy*100:.2f}%)")
print("="*60)

# Pretty per-class table (perfect for your thesis)
print("\nPer-class performance:")
class_df = pd.DataFrame({
    'Emotion':   [k.capitalize() for k in report.keys() if k not in ['accuracy', 'macro avg', 'weighted avg']],
    'Precision': [report[k]['precision'] for k in report if k not in ['accuracy', 'macro avg', 'weighted avg']],
    'Recall':    [report[k]['recall']    for k in report if k not in ['accuracy', 'macro avg', 'weighted avg']],
    'F1-score':  [report[k]['f1-score']  for k in report if k not in ['accuracy', 'macro avg', 'weighted avg']],
    'Support':   [int(report[k]['support']) for k in report if k not in ['accuracy', 'macro avg', 'weighted avg']]
})
print(class_df.to_string(index=False))

print(f"\nMacro F1-score:  {report['macro avg']['f1-score']:.4f}")
print(f"Weighted F1-score: {report['weighted avg']['f1-score']:.4f}")

# ------------------- 5. Save results for your report -------------------
df.to_csv("evaluation_results_with_predictions.csv", index=False)

# Optional: save nice table as image
class_df.round(4).to_latex("results_table.tex", index=False, caption="Emotion Classification Performance on Synthetic Journal Dataset")

# Optional: confusion matrix plot
cm = confusion_matrix(y_true, y_pred, labels=sorted(y_true.unique()))
plt.figure(figsize=(8,6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=sorted(y_true.unique()),
            yticklabels=sorted(y_true.unique()))
plt.ylabel('True')
plt.xlabel('Predicted')
plt.title('Confusion Matrix')
plt.tight_layout()
plt.savefig("confusion_matrix.png", dpi=300)
plt.show()

print("\nDone! Files saved:")
print("   → evaluation_results_with_predictions.csv")
print("   → results_table.tex  (copy into LaTeX)")
print("   → confusion_matrix.png")
print("You can now copy the printed table directly into Chapter 5!")
