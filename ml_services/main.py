from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
import ollama
import torch

app = FastAPI(
    title="ML Microservices",
    description="Sentiment Analysis + Ollama Empathetic Feedback",
)

class JournalInput(BaseModel):
    content: str
    moodRating: float = None

# Initialize the small Emotion Classifier
# This runs easily on CPU (device=-1) for both Mac and Windows
print("Loading Emotion Classifier...")
sentiment_model = pipeline(
    "text-classification",
    model="michellejieli/emotion_text_classifier",
    device=-1 
)

def generate_feedback_journal(journal_text: str, detected_emotion: str):
    """
    Sends the journal entry to Ollama to generate a warm response.
    """
    try:
        response = ollama.chat(model='phi3:mini', messages=[
            {
                'role': 'system',
                'content': (
                    "You are a warm, empathetic journaling companion. "
                    "Acknowledge the user's emotion and offer 1-2 gentle sentences of support. "
                    "Do not offer medical advice. Do not use forum language or labels like 'Response:'."
                )
            },
            {
                'role': 'user',
                'content': f"I feel {detected_emotion}. My journal entry is: \"{journal_text}\""
            },
        ])
        
        return response['message']['content'].strip()
    
    except Exception as e:
        print(f"Ollama Error: {e}")
        return "Thank you for sharing your thoughts with me. I'm here to support you through these feelings."

@app.post("/analyze_and_feedback")
async def analyze_and_feedback(journal: JournalInput):
    content = journal.content

    if not content:
        raise HTTPException(status_code=400, detail="Content is required")

    # Step 1: Sentiment/Emotion analysis (Local Transformer)
    sentiment_result = sentiment_model(content)[0]
    label = sentiment_result["label"].lower()
    score = sentiment_result["score"]
    
    negative_emotions = ["sadness", "fear", "anger"]
    sentiment_type = "negative" if label in negative_emotions else "positive"

    print(f"Analysis Complete: {label} ({sentiment_type})")

    # Step 2: Generate Empathetic Feedback (Ollama)
    feedback_text = generate_feedback_journal(content, label)

    # Step 3: Return combined response
    return {
        "emotion": label,
        "sentiment": sentiment_type,
        "sentimentScore": score,
        "feedbackText": feedback_text,
        "feedbackType": f"Emotion: {label}",
        "ruleTriggered": f"Sentiment: {sentiment_type}"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
