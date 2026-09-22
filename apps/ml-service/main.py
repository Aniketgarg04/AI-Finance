import os
from dotenv import load_dotenv

# Load env vars before importing anything else that depends on them
load_dotenv(override=True)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router

app = FastAPI(
    title="AI Finance ML Service",
    description="Microservice for AI-driven financial analytics and LLM features",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

@app.get("/")
def health_check():
    return {"status": "ok", "message": "ML Service is running"}
# trigger reload
