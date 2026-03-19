import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Ensure the backend directory is in the path for modular imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.api.router import router as api_router

app = FastAPI(title="Cyber Confessional API V2.0")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the main API router
app.include_router(api_router)

@app.get("/health")
def health_check():
    return {"status": "Altar Online, World-lines stabilizing...", "version": "2.0-Phase1"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8888)