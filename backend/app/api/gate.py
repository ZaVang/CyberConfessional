from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List

from ..db.database import get_session
from ..models.domain import SoulMatrix

router = APIRouter()

class LoginRequest(BaseModel):
    username: str

class CalibrationRequest(BaseModel):
    username: str
    answers: List[str] # e.g. ["A", "B", "A", "A"]

@router.post("/identify")
def identify_soul(request: LoginRequest, session: Session = Depends(get_session)):
    """First phase: Identify the wandering soul"""
    statement = select(SoulMatrix).where(SoulMatrix.username == request.username)
    user = session.exec(statement).first()
    
    if user:
        return {"status": "recognized", "is_new": False, "user_id": str(user.id)}
    else:
        return {"status": "unknown", "is_new": True, "username": request.username}

@router.post("/calibrate")
def calibrate_soul(request: CalibrationRequest, session: Session = Depends(get_session)):
    """Second phase: Calibration and mapping of hidden variables"""
    answers = request.answers
    if len(answers) != 4:
        raise HTTPException(status_code=400, detail="Calibration requires exactly 4 answers.")
        
    u_risk_mean = 0.3 if answers[0] == "A" else 0.7 if answers[0] == "B" else 0.5
    u_action_mean = 0.3 if answers[1] == "A" else 0.7 if answers[1] == "B" else 0.5
    u_emotion_mean = 0.3 if answers[2] == "A" else 0.7 if answers[2] == "B" else 0.5
    u_locus_mean = 0.7 if answers[3] == "A" else 0.3 if answers[3] == "B" else 0.5
    
    new_soul = SoulMatrix(
        username=request.username,
        u_risk_mean=u_risk_mean, u_risk_std=0.2,
        u_action_mean=u_action_mean, u_action_std=0.2,
        u_emotion_mean=u_emotion_mean, u_emotion_std=0.2,
        u_locus_mean=u_locus_mean, u_locus_std=0.2
    )
    
    session.add(new_soul)
    session.commit()
    session.refresh(new_soul)
    
    return {
        "status": "calibrated", 
        "message": "灵魂已锚定。世界线初始化完成。",
        "user_id": str(new_soul.id)
    }
