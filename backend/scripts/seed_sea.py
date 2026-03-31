import os
import sys

# Append backend root to python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from app.db.database import get_session, engine, create_db_and_tables
from app.models.domain import ConfessionLog, VoidReceiptLog

def seed_void_sea():
    print("Initializing Database Connection...")
    create_db_and_tables()
    with Session(engine) as session:
        # Check if we already seeded to avoid infinite spamming duplicates
        existing = session.exec(select(VoidReceiptLog)).all()
        if existing:
            print(f"VoidReceiptLog already has {len(existing)} drifting receipts. Still seeding more...")

        confessions = session.exec(select(ConfessionLog)).all()
        if not confessions:
            print("No ConfessionLog records found. Cannot seed the Void Sea.")
            return

        print(f"Found {len(confessions)} historical ConfessionLog records. Transmuting into Void Sea...")
        
        count = 0
        for log in confessions:
            # Fallbacks if properties are null in DB
            z_val = log.inferred_u_locus if log.inferred_u_locus is not None else 1.0
            m_bias = log.inferred_u_action if log.inferred_u_action is not None else 0.5
            is_catharsis = '<catharsis>' in (log.verdict_text or "")

            try:
                receipt = VoidReceiptLog(
                    confession_text=log.content[:500],
                    z_val=float(z_val),
                    m_bias=float(m_bias),
                    prob_score=float(log.counterfactual_prob),
                    is_catharsis=is_catharsis,
                    created_at=log.created_at
                )
                session.add(receipt)
                count += 1
            except Exception as e:
                print(f"Failed to copy log {log.id}: {e}")
                
        session.commit()
        print(f"====================================")
        print(f"SUCCESS: {count} anomalous receipts cast into the Void Sea.")
        print(f"====================================")

if __name__ == "__main__":
    seed_void_sea()
