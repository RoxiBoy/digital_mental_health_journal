from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer
import torch

# Define the new, larger model name for better generation quality
GENERATION_MODEL_NAME = "EleutherAI/gpt-neo-1.3B"

app = FastAPI(
    title="ML Microservices",
    description="Provides NLP analysis and adaptive feedback for the journaling app (Using GPT-Neo 1.3B for feedback)",
)

class JournalInput(BaseModel):
    content: str
    moodRating: float = None

# Initialize NLP models
sentiment_model = pipeline(
    "text-classification",
    model="michellejieli/emotion_text_classifier",
    device=-1
)

# Load once (do this at startup)
print("Loading GPT-Neo 1.3B for feedback generation...")
gpt_tokenizer = AutoTokenizer.from_pretrained(GENERATION_MODEL_NAME)
if gpt_tokenizer.pad_token is None:
    gpt_tokenizer.pad_token = gpt_tokenizer.eos_token

gpt_model = AutoModelForCausalLM.from_pretrained(
    GENERATION_MODEL_NAME,
    torch_dtype=torch.float16,   # saves VRAM
    low_cpu_mem_usage=True
)
gpt_model.eval()
if torch.cuda.is_available():
    gpt_model = gpt_model.cuda()

def generate_feedback_journal(journal_text: str, detected_emotion: str = "unknown"):
    """
    Generate high-quality, compassionate feedback using GPT-Neo 1.3B
    """
    prompt = (
        "You are a warm, empathetic, non-clinical companion who helps people reflect on their feelings. "
        "Respond in 2–4 gentle sentences. Acknowledge what they shared, validate their emotions, "
        "and offer a small spark of kindness or hope. Never give advice or use clinical language.\n\n"
        f"Journal entry:\n\"{journal_text.strip()}\"\n\n"
        f"Detected emotion: {detected_emotion}\n\n"
        "Your supportive response:"
    )

    inputs = gpt_tokenizer(
        prompt,
        return_tensors="pt",
        truncation=True,
        max_length=1024,
        padding=False
    )
    if torch.cuda.is_available():
        inputs = {k: v.cuda() for k, v in inputs.items()}

    input_len = inputs["input_ids"].shape[1]

    with torch.no_grad():
        output = gpt_model.generate(
            inputs["input_ids"],
            attention_mask=inputs["attention_mask"],
            max_new_tokens=120,
            do_sample=True,
            temperature=0.8,
            top_p=0.92,
            top_k=50,
            repetition_penalty=1.15,
            pad_token_id=gpt_tokenizer.eos_token_id,
            eos_token_id=gpt_tokenizer.eos_token_id,
        )

    full_text = gpt_tokenizer.decode(output[0], skip_special_tokens=True)
    response = full_text[len(prompt):].strip()

    # Clean up any accidental repetition
    if "Journal entry:" in response:
        response = response.split("Journal entry:")[0].strip()
    if "Your supportive response:" in response:
        response = response.split("Your supportive response:")[1].strip()

    if not response or len(response) < 10:
        response = "Thank you for sharing this with me. Your feelings make complete sense, and I'm here with you."

    return response

@app.post("/analyze_and_feedback")
async def analyze_and_feedback(journal: JournalInput):
    content = journal.content

    if not content:
        raise HTTPException(status_code=400, detail="Content is required")

    # Step 1: Sentiment/Emotion analysis
    sentiment_result = sentiment_model(content)[0]
    
    sentiment_score = sentiment_result["score"]  
    
    negative_emotions = ["sadness", "fear", "anger"]
    
    sentiment = "negative" if sentiment_result["label"] in negative_emotions else "positive"  

    sentiment_data = {
        "emotion": sentiment_result["label"].lower(),
        "sentiment_score": sentiment_score,
        "sentiment": sentiment
    }

    print("Sentiment Analysed")
    # print("Generating Feedback")
    # Step 2: Generate feedback using GPT-Neo 1.3B
    feedback_data = generate_feedback_journal(content, sentiment_data["emotion"])

    feedback_data = {
        "feedbackText": feedback_data,
        "feedbackType": f"Emotion: {sentiment_data['emotion']}",
        "ruleTriggered": f"Sentiment: {sentiment_data['sentiment']}"
    }

    # Step 4: Return combined result
    response = {
        "emotion": sentiment_data["emotion"],
        "sentiment": sentiment_data["sentiment"],
        "sentimentScore": sentiment_data["sentiment_score"],
        "feedbackText": feedback_data["feedbackText"],
        "feedbackType": feedback_data["feedbackType"],
        "ruleTriggered": feedback_data["ruleTriggered"]
    }

    return response
