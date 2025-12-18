from main import sentiment_model, generate_feedback_journal
import torch

# Your 7 perfect representative entries
examples = {
    "sadness":  "Everything feels heavy lately. I stare at my laptop for hours and nothing gets done. I feel like I'm letting everyone down.",
    "joy":      "My best friend surprised me with coffee today and we laughed for two hours straight. Some days the world feels kind again.",
    "anger":    "I'm so furious that my group members left everything to the last minute again. Why am I always the one fixing their mess?",
    "fear":     "I keep waking up at 3am with my heart racing, terrified that I won't finish this degree or that I'll disappoint my family.",
    "love":     "My little sister sent me the silliest voice note and I cried from laughing. I'm so lucky to have these people in my life.",
    "surprise": "I got an email saying I was shortlisted for the scholarship. I genuinely thought it was spam at first — still in shock!",
    "neutral":  "Woke up, had coffee, attended lectures, did some reading. Nothing special, just a regular day."
}

print("Generating 7 real feedback examples using your live GPT-Neo 1.3B model...\n")
print("="*90)

for name, text in examples.items():
    # Use your real emotion model
    result = sentiment_model(text)[0]
    emotion = result["label"].lower()
    confidence = result["score"]

    # Use your real feedback function
    feedback = generate_feedback_journal(text, emotion)

    print(f"{name.upper()}")
    print(f"Detected → {emotion} (confidence: {confidence:.3f})")
    print(f"Entry: {text}")
    print(f"Feedback: {feedback}\n")
    print("-" * 90)
