from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Dict, Any
from uuid import UUID

from ..db.database import get_session
from ..models.domain import SoulMatrix, CausalMemoryNode, CausalMemoryEdge

router = APIRouter()

@router.get("/")
def get_all_users(session: Session = Depends(get_session)):
    """Fetch a list of all users with basic info and persona"""
    statement = select(SoulMatrix).order_by(SoulMatrix.created_at.desc())
    users = session.exec(statement).all()
    
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "username": u.username,
            "created_at": u.created_at,
            "confession_count": u.confession_count,
            "global_persona_summary": u.global_persona_summary
        })
    return result

@router.get("/{user_id}/graph")
def get_user_graph(user_id: UUID, session: Session = Depends(get_session)):
    """Fetch the full LTM Causal Graph for a specific user"""
    # 1. Fetch user info
    user = session.get(SoulMatrix, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # 2. Fetch Nodes
    node_statement = select(CausalMemoryNode).where(CausalMemoryNode.soul_id == user_id)
    nodes = session.exec(node_statement).all()
    
    # Extract node IDs to fetch internal edges
    node_ids = [n.id for n in nodes]
    
    # 3. Fetch Edges connecting these nodes
    edges = []
    if node_ids:
        edge_statement = select(CausalMemoryEdge).where(
            CausalMemoryEdge.source_node_id.in_(node_ids),
            CausalMemoryEdge.target_node_id.in_(node_ids)
        )
        edges = session.exec(edge_statement).all()
        
    # Construct response
    nodes_res = [{
        "id": n.id,
        "node_type": n.node_type,
        "name": n.name,
        "description": n.description,
        "trigger_count": n.trigger_count,
        "last_triggered_at": n.last_triggered_at,
        "u_risk_posterior": n.u_risk_posterior,
        "u_action_posterior": n.u_action_posterior,
        "u_emotion_posterior": n.u_emotion_posterior,
        "u_locus_posterior": n.u_locus_posterior
    } for n in nodes]
    
    edges_res = [{
        "id": e.id,
        "source": e.source_node_id,
        "target": e.target_node_id,
        "relationship": e.relationship,
        "weight": e.weight
    } for e in edges]

    return {
        "user": {
            "id": user.id,
            "username": user.username,
            "global_persona_summary": user.global_persona_summary,
            "confessions": user.confession_count,
            "u_risk_mean": user.u_risk_mean,
            "u_action_mean": user.u_action_mean,
            "u_emotion_mean": user.u_emotion_mean,
            "u_locus_mean": user.u_locus_mean,
        },
        "nodes": nodes_res,
        "edges": edges_res
    }
