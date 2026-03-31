from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.database import get_session
from app.models.domain import VoidReceiptLog
from pydantic import BaseModel
from typing import List

router = APIRouter(tags=["receipts"])

class ReceiptCastPayload(BaseModel):
    confession_text: str
    z_val: float
    m_bias: float
    prob_score: float
    is_catharsis: bool

@router.post("/cast", response_model=dict)
def cast_receipt(payload: ReceiptCastPayload, db: Session = Depends(get_session)):
    try:
        new_receipt = VoidReceiptLog(
            confession_text=payload.confession_text[:500],  # Truncate for safety
            z_val=payload.z_val,
            m_bias=payload.m_bias,
            prob_score=payload.prob_score,
            is_catharsis=payload.is_catharsis
        )
        db.add(new_receipt)
        db.commit()
        return {"status": "success", "message": "Receipt cast into the void."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/drift", response_model=List[dict])
def drift_receipts(db: Session = Depends(get_session)):
    # Get last 40 descending to populate the sea
    stmt = select(VoidReceiptLog).order_by(VoidReceiptLog.created_at.desc()).limit(40)
    receipts = db.exec(stmt).all()
    
    return [
        {
            "id": str(r.id),
            "confession_text": r.confession_text,
            "z_val": r.z_val,
            "m_bias": r.m_bias,
            "prob_score": r.prob_score,
            "is_catharsis": r.is_catharsis,
            "created_at": r.created_at.isoformat()
        } for r in receipts
    ]
