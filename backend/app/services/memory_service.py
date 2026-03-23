import uuid
from datetime import datetime, timezone
from typing import List, Optional
from sqlmodel import Session, select
from app.models.domain import SoulMatrix, CausalMemoryNode, CausalMemoryEdge
from app.models.schemas import EngineInputSchema, EngineOutputSchema
from app.services.llm_service import llm_service

class MemoryService:
    def __init__(self):
        pass

    def consolidate_memory(self, session: Session, soul_id: uuid.UUID, engine_input: dict, engine_output: EngineOutputSchema):
        """
        Extract Nodes and Edges from the SCM parameters and upsert into the Causal Knowledge Graph.
        """
        params = engine_input.get('graph_params', {})
        factual = engine_input.get('factual', {})
        
        z_name = params.get('z_name', 'Unknown Environment')
        m_weights = params.get('m_weights', {})
        m_name = m_weights.get('name', 'Unknown Mechanism')
        
        # Helper to get or create a node
        def _get_or_create_node(n_type: str, n_name: str) -> CausalMemoryNode:
            statement = select(CausalMemoryNode).where(
                CausalMemoryNode.soul_id == soul_id,
                CausalMemoryNode.node_type == n_type,
                CausalMemoryNode.name == n_name
            )
            node = session.exec(statement).first()
            if node:
                node.trigger_count += 1
                node.last_triggered_at = datetime.now(timezone.utc)
            else:
                node = CausalMemoryNode(soul_id=soul_id, node_type=n_type, name=n_name)
                session.add(node)
                session.flush() # flush to get ID
            return node

        # Helper to get or create edge
        def _get_or_create_edge(src_id: uuid.UUID, tgt_id: uuid.UUID, rel: str):
            statement = select(CausalMemoryEdge).where(
                CausalMemoryEdge.source_node_id == src_id,
                CausalMemoryEdge.target_node_id == tgt_id,
                CausalMemoryEdge.relationship == rel
            )
            edge = session.exec(statement).first()
            if not edge:
                edge = CausalMemoryEdge(source_node_id=src_id, target_node_id=tgt_id, relationship=rel)
                session.add(edge)

        # 1. Upsert Nodes
        z_node = _get_or_create_node("Z", z_name)
        m_node = _get_or_create_node("M", m_name)
        x_name = factual.get("x_name", f"Action_{factual.get('X', 1)}")
        x_node = _get_or_create_node("X", x_name)
        y_name = factual.get("y_name", f"Outcome_{factual.get('Y', 0)}")
        y_node = _get_or_create_node("Y", y_name)
        u_node = _get_or_create_node("U", "Latent_Traits")

        # 2. Update Posterior in U node
        inferred = engine_output.inferred_latents
        u_node.u_risk_posterior = inferred.get("u_risk", 0.5)
        u_node.u_action_posterior = inferred.get("u_action", 0.5)
        u_node.u_emotion_posterior = inferred.get("u_emotion", 0.5)
        u_node.u_locus_posterior = inferred.get("u_locus", 0.5)

        # 3. Form Edges
        _get_or_create_edge(z_node.id, m_node.id, "TRIGGERS")
        _get_or_create_edge(u_node.id, m_node.id, "INFLUENCES")
        _get_or_create_edge(x_node.id, m_node.id, "TRIGGERS")
        _get_or_create_edge(m_node.id, y_node.id, "RESULTS_IN")

        session.commit()

    def retrieve_subgraph(self, session: Session, soul_id: uuid.UUID, current_text: str) -> str:
        """
        Retrieve 1-hop subgraph based on simple keyword matching or recent frequency.
        For V1, we fetch the top 3 most frequently triggered M nodes and their posteriors.
        """
        statement = select(CausalMemoryNode).where(
            CausalMemoryNode.soul_id == soul_id,
            CausalMemoryNode.node_type == "M"
        ).order_by(CausalMemoryNode.trigger_count.desc()).limit(3)
        
        m_nodes = session.exec(statement).all()
        
        if not m_nodes:
            return "No significant past causal graph found."

        # Fetch the U node to get priors
        u_statement = select(CausalMemoryNode).where(
            CausalMemoryNode.soul_id == soul_id,
            CausalMemoryNode.node_type == "U"
        ).first()

        subgraph_text = "【Past Causal Graph Nodes】\n"
        for m in m_nodes:
            subgraph_text += f"- Flawed Mechanism (M): '{m.name}' (Triggered {m.trigger_count} times in the past. Last triggered at {m.last_triggered_at.strftime('%Y-%m-%d')})\n"
        
        if u_statement:
            subgraph_text += "\n【Historical Posterior Latents (Use as Priors)】\n"
            subgraph_text += f"u_risk: {u_statement.u_risk_posterior:.4f}, u_action: {u_statement.u_action_posterior:.4f}, "
            subgraph_text += f"u_emotion: {u_statement.u_emotion_posterior:.4f}, u_locus: {u_statement.u_locus_posterior:.4f}\n"

        return subgraph_text

    async def evolve_persona(self, session: Session, soul_id: uuid.UUID, current_text: str, engine_output: EngineOutputSchema):
        """
        Background task to evolve the user's global persona summary using the LLM.
        """
        soul = session.get(SoulMatrix, soul_id)
        if not soul:
            return

        old_persona = soul.global_persona_summary or "None"
        
        prompt = f"""
        You are tracking the evolving soul of a human.
        Current Global Persona Summary: {old_persona}
        ---
        New Confession Event: "{current_text}"
        Resulting Counterfactual Prob: {engine_output.counterfactual_prob:.2f}
        ---
        Please rewrite and update the Global Persona Summary in 2-3 sentences max. 
        Focus on their recurring causal flaws and emotional patterns.
        Reply ONLY with the new persona text. Do not use markdown.
        """

        try:
            # We use the existing llm service bridge for a quick simple call
            response = await llm_service.bridge.chat(
                model="priest_gemini",
                messages=[{"role": "user", "content": prompt}],
                tools=[{"google_search": {}}]
            )
            new_persona = response.content.strip()
            soul.global_persona_summary = new_persona
            session.add(soul)
            session.commit()
        except Exception as e:
            print(f"[MemoryService] Warning: Persona evolution failed ({e})")

memory_service = MemoryService()
