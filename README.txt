Digital Mental Health Journal - Project Overview

This project is a digital mental health journaling platform where users can:
- Create and manage journal entries
- Get AI-powered emotional analysis and empathetic feedback
- Track mood and engagement over time via surveys and analytics

The system is split into three main modules: client, server, and ml_services.

1. client (Frontend)
--------------------
Tech stack:
- React + TypeScript
- Vite
- Chakra UI
- React Router

Role:
The client is the user-facing web application where people sign up, log in, and interact with the journal.

Key features:
- Authentication flows (Login, Signup) managed via an AuthProvider and ProtectedRoute.
- Main user experience pages: Dashboard, JournalWrite, JournalEntry, MoodSurvey, Profile.
- Sends requests to the Node/Express API to:
  - Create journal entries (which triggers ML analysis in the backend)
  - Fetch past entries, feedback, and survey data
  - Display analytics (e.g., mood trends, journaling behavior).

2. server (Backend API)
-----------------------
Tech stack:
- Node.js
- Express
- Mongoose / MongoDB

Role:
The server is the central API and data layer, orchestrating between the client, the database, and the ML microservice.

Key responsibilities:
- Connects to MongoDB and defines models such as JournalEntry, Feedback, MoodSurvey, and User.
- Exposes REST endpoints under:
  - /api/users      – user management and auth
  - /api/journal    – create, read, delete journal entries, plus basic analytics
  - /api/feedback   – manage AI feedback linked to entries
  - /api/engagement – track engagement metrics
  - /api/surveys    – mood survey CRUD
- On journal creation, calls the ML service (http://localhost:8000/analyze_and_feedback) to:
  - Analyze emotion and sentiment
  - Generate empathetic feedback
  - Store both the enriched journal entry and its feedback in MongoDB.

3. ml_services (ML Microservice)
--------------------------------
Tech stack:
- Python
- FastAPI
- Hugging Face Transformers
- Ollama

Role:
The ml_services module is a dedicated microservice for text analysis and AI feedback generation.

Core endpoint:
- POST /analyze_and_feedback
  - Input: journal text (and optional mood rating).
  - Processing steps:
    1. Emotion and sentiment detection using the "michellejieli/emotion_text_classifier" model on CPU.
    2. Empathetic response generation via a local Ollama model ("phi3:mini"), prompted as a warm, non-clinical journaling companion.
  - Output: structured JSON containing:
    - emotion
    - sentiment ("positive" or "negative")
    - sentimentScore
    - feedbackText (the empathetic AI message)
    - feedbackType
    - ruleTriggered

The Node server calls this ML microservice so that the heavy ML/LLM logic is isolated and can be scaled or swapped independently.