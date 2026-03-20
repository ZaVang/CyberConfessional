import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Ensure the backend directory is in the path for modular imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.api.router import router as api_router
from app.api.gate import router as gate_router

app = FastAPI(title="Cyber Confessional API V3.0")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the main API routers
app.include_router(api_router)
app.include_router(gate_router, prefix="/api/gate")

from app.db.database import create_db_and_tables

@app.on_event("startup")
def on_startup():
    print("Initializing Cyber Altar Database...")
    create_db_and_tables()
    print("Database connected and schema initialized successfully.")

@app.get("/health")
def health_check():
    return {"status": "Altar Online, World-lines stabilizing...", "version": "2.0-Phase1"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8888)