from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from app.db.database import get_session
from app.models.domain import VoidReceiptLog, SoulMatrix
from pydantic import BaseModel
from typing import List, Optional
import uuid

router = APIRouter(tags=["receipts"])

class ReceiptCastPayload(BaseModel):
    confession_text: str
    z_val: float
    m_bias: float
    prob_score: float
    is_catharsis: bool
    soul_id: Optional[str] = None  # Optional: link receipt to caster for resonance notifications

@router.post("/cast", response_model=dict)
def cast_receipt(payload: ReceiptCastPayload, db: Session = Depends(get_session)):
    try:
        parsed_soul_id = None
        if payload.soul_id:
            try:
                parsed_soul_id = uuid.UUID(payload.soul_id)
            except ValueError:
                pass  # Invalid UUID, cast anonymously

        new_receipt = VoidReceiptLog(
            confession_text=payload.confession_text[:500],
            z_val=payload.z_val,
            m_bias=payload.m_bias,
            prob_score=payload.prob_score,
            is_catharsis=payload.is_catharsis,
            soul_id=parsed_soul_id,
        )
        db.add(new_receipt)
        db.commit()
        return {"status": "success", "message": "Receipt cast into the void."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/drift", response_model=List[dict])
def drift_receipts(db: Session = Depends(get_session)):
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
            "resonance_count": r.resonance_count,
            "created_at": r.created_at.isoformat()
            # soul_id intentionally excluded to preserve anonymity
        } for r in receipts
    ]

@router.post("/{receipt_id}/resonate", response_model=dict)
def resonate(receipt_id: str, db: Session = Depends(get_session)):
    """Send a Resonance Signal to a void receipt."""
    try:
        rid = uuid.UUID(receipt_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid receipt ID")

    receipt = db.get(VoidReceiptLog, rid)
    if not receipt:
        raise HTTPException(status_code=404, detail="Receipt dissolved into entropy.")

    receipt.resonance_count += 1
    receipt.new_resonance_count += 1
    db.add(receipt)
    db.commit()
    return {"status": "resonance_sent", "total": receipt.resonance_count}

@router.get("/resonances/{soul_id}", response_model=dict)
def get_resonances(soul_id: str, db: Session = Depends(get_session)):
    """Check pending (unseen) resonances for a soul."""
    try:
        sid = uuid.UUID(soul_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid soul ID")

    stmt = select(func.sum(VoidReceiptLog.new_resonance_count)).where(
        VoidReceiptLog.soul_id == sid
    )
    total_new = db.exec(stmt).first() or 0
    return {"new_resonance_count": int(total_new)}

@router.post("/resonances/{soul_id}/dismiss", response_model=dict)
def dismiss_resonances(soul_id: str, db: Session = Depends(get_session)):
    """Mark all resonances as seen for a soul."""
    try:
        sid = uuid.UUID(soul_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid soul ID")

    stmt = select(VoidReceiptLog).where(
        VoidReceiptLog.soul_id == sid,
        VoidReceiptLog.new_resonance_count > 0
    )
    receipts = db.exec(stmt).all()
    for r in receipts:
        r.new_resonance_count = 0
        db.add(r)
    db.commit()
    return {"status": "cleared", "count": len(receipts)}
