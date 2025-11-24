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
    "sentiment-analysis",
    model="michellejieli/emotion_text_classifier",
    device=-1
)
#
# # Initialize the larger, more capable generative model (GPT-Neo 1.3B)
# gpt_tokenizer = AutoTokenizer.from_pretrained(GENERATION_MODEL_NAME)
# # Set the padding token to the end-of-sequence token as is common for GPT-style models
# if gpt_tokenizer.pad_token is None:
#     gpt_tokenizer.pad_token = gpt_tokenizer.eos_token
# gpt_model = AutoModelForCausalLM.from_pretrained(GENERATION_MODEL_NAME)
# gpt_model.eval()  # set to evaluation mode
#
#
# def generate_feedback_journal(journal_text: str, sentiment_data: dict):
#     """
#     Use GPT-Neo (1.3B) to generate better quality, persona-adherent feedback.
#     
#     The Few-Shot prompting technique is retained as it is still useful for guiding
#     the model's response structure.
#     """
#     
#     # We provide examples (few-shot) so the model sees the pattern it needs to complete.
#     prompt = (
#         "Imagine you are a compassionate therapist helping people with their mental health. From the journal text provide a therapeutic response to the user to help them navigate or deal with what they are dealing. Maintain 100-150 word count.\n\n"
#         f"Journal Entry: {journal_text}\n"
#         "Therapist Response:"
#     )
#
#     # *** FIX: Use the tokenizer's call method and ensure `return_attention_mask=True` ***
#     # This returns a dictionary of tensors, including `input_ids` and `attention_mask`.
#     inputs = gpt_tokenizer(
#         prompt, 
#         return_tensors="pt", 
#         padding=True, 
#         truncation=True,
#         return_attention_mask=True # Explicitly request the attention mask
#     )
#     
#     # Calculate dynamic length: Input length + 60 new tokens for the response
#     input_length = inputs['input_ids'].shape[1]
#     
#     with torch.no_grad():
#         outputs = gpt_model.generate(
#             inputs['input_ids'],           # Pass input_ids
#             attention_mask=inputs['attention_mask'], # *** FIX: Pass attention_mask to generate ***
#             max_length=input_length + 60,  # Generate about 60 words of feedback
#             do_sample=True,
#             temperature=0.7,
#             top_k=50,
#             top_p=0.9,
#             repetition_penalty=1.2,        # Penalizes loops
#             pad_token_id=gpt_tokenizer.eos_token_id,
#             num_return_sequences=1
#         )
#
#     # Decode the result
#     full_output = gpt_tokenizer.decode(outputs[0], skip_special_tokens=True)
#
#     # Parsing: We only want the text AFTER the last "Therapist Response:"
#     response_parts = full_output.split("Therapist Response:")
#     feedbackText = response_parts[-1].strip()
#
#     # Clean up: If the model generated a new "Journal Entry:" line after the response, cut it off.
#     if "Journal Entry:" in feedbackText:
#         feedbackText = feedbackText.split("Journal Entry:")[0].strip()
#
#     # Fallback if empty
#     if not feedbackText:
#         feedbackText = "Thank you for sharing your thoughts. I am here to listen."
#
#     return {
#         "feedbackText": feedbackText,
#         "feedbackType": "general",
#         "ruleTriggered": "DEFAULT"
#     }
#

@app.post("/analyze_and_feedback")
async def analyze_and_feedback(journal: JournalInput):
    content = journal.content

    if not content:
        raise HTTPException(status_code=400, detail="Content is required")

    # Step 1: Sentiment/Emotion analysis
    sentiment_result = sentiment_model(content)[0]
    
    sentiment_score = sentiment_result["score"]  
    
    negative_emotions = ["sadness", "depression", "anxiety", "fear", "anger", "emptiness", "hopelessness"]
    
    sentiment = "negative" if sentiment_result["label"] in negative_emotions else "positive"  

    sentiment_data = {
        "emotion": sentiment_result["label"],
        "sentiment_score": sentiment_score,
        "sentiment": sentiment
    }

    print("Sentiment Analysed")
    # print("Generating Feedback")

    # Step 2: Generate feedback using GPT-Neo 1.3B
    # feedback_data = generate_feedback_journal(content, sentiment_data)

    # print("Feedback generated")

    # Step 3: Explicitly set the type and rule based on reliable analysis data
    # feedback_data["feedbackType"] = f"Emotion: {sentiment_data['emotion']}"
    # feedback_data["ruleTriggered"] = f"Sentiment: {sentiment_data['sentiment']}"

    # Step 4: Return combined result
    response = {
        "emotion": sentiment_data["emotion"],
        "sentiment": sentiment_data["sentiment"],
        "sentimentScore": sentiment_data["sentiment_score"],
        # "feedbackText": feedback_data["feedbackText"],
        # "feedbackType": feedback_data["feedbackType"],
        # "ruleTriggered": feedback_data["ruleTriggered"]
    }

    return response
