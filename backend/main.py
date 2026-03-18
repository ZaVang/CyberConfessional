from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from schemas import EngineInputSchema, EngineOutputSchema
from CausalEngine import LogitConvergenceEngine
from llm_service import LLMService

app = FastAPI(title="Cyber Confessional API")
llm = LLMService()

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Boundaries ---

class ConfessionRequest(BaseModel):
    confession: str = Field(..., description="The user's natural language confession.")

class ConfessionResponse(BaseModel):
    confession: str
    engine_input: EngineInputSchema
    engine_output: EngineOutputSchema
    verdict: str
    status: str = "World-line Convergence Confirmed"

# --- Endpoints ---

@app.post("/confess", response_model=ConfessionResponse)
async def confess_endpoint(request: ConfessionRequest):
    """
    The main ritual: Parse, Compute, Judge.
    """
    try:
        # 1. Parse natural language to Causal SCM
        engine_input = await llm.parse_confession(request.confession)
        
        # 2. Run Causal Inference
        engine = LogitConvergenceEngine(engine_input)
        engine_output = engine.run_inference(num_samples=100000)
        
        # 3. Generate Priest Persona Verdict
        verdict = await llm.generate_verdict(request.confession, engine_output)
        
        return ConfessionResponse(
            confession=request.confession,
            engine_input=engine_input,
            engine_output=engine_output,
            verdict=verdict
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "Altar Online"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8888)
