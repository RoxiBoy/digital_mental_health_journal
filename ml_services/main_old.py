from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
import torch

# Define the new, larger model name for better generation quality
GENERATION_MODEL_NAME = "microsoft/Phi-3-mini-4k-instruct"

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
)

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
print("Loading :", GENERATION_MODEL_NAME)
gpt_tokenizer = AutoTokenizer.from_pretrained(GENERATION_MODEL_NAME)

device = "mps" if torch.backends.mps.is_available() else "cpu"

if gpt_tokenizer.pad_token is None:
    gpt_tokenizer.pad_token = gpt_tokenizer.eos_token

gpt_model = AutoModelForCausalLM.from_pretrained(
    GENERATION_MODEL_NAME,
    quantization_config=bnb_config,
    torch_dtype="auto",   # saves VRAM
    device_map=device,
    trust_remote_code=True
)

gpt_model.eval()

if torch.cuda.is_available():
    gpt_model = gpt_model.cuda()

def generate_feedback_journal(journal_text: str, detected_emotion: str = "unknown"):
   
    prompt = (
        f"<|user|>\nI am writing a journal entry. I feel {detected_emotion}. "
        f"Here is my entry: \"{journal_text.strip()}\"\n"
        "As my empathetic companion, give me a warm, 2-sentence response.<|end|>\n"
        "<|assistant|>\n"
    )

    inputs = gpt_tokenizer(
        prompt,
        return_tensors="pt",
    ).to(device)

    if torch.cuda.is_available():
        inputs = {k: v.cuda() for k, v in inputs.items()}

    input_len = inputs["input_ids"].shape[1]

    with torch.no_grad():
        output = gpt_model.generate(
            **inputs,
            max_new_tokens=80,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            repetition_penalty=1.1,
            pad_token_id=gpt_tokenizer.eos_token_id,
        )

    full_text = gpt_tokenizer.decode(output[0], skip_special_tokens=True)
    response = full_text.split("assistant")[-1].strip()

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
    feedback_data = generate_feedback_journal(content, sentiment_data["emotion"])

    feedback_data = {
        "feedbackText": feedback_data,
        "feedbackType": f"Emotion: {sentiment_data['emotion']}",
        "ruleTriggered": f"Sentiment: {sentiment_data['sentiment']}"
    }

    response = {
        "emotion": sentiment_data["emotion"],
        "sentiment": sentiment_data["sentiment"],
        "sentimentScore": sentiment_data["sentiment_score"],
        "feedbackText": feedback_data["feedbackText"],
        "feedbackType": feedback_data["feedbackType"],
        "ruleTriggered": feedback_data["ruleTriggered"]
    }

    return response
