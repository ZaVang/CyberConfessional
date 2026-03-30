from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from ..models.schemas import EngineInputSchema, EngineOutputSchema, Message, ParsingResult, ConfessionRequest, ConfessionResponse, SimulateRequest
from ..core.causal_engine import ComplexCausalEngine
from ..services.llm_service import llm_service
from ..services.memory_service import memory_service
import json
from typing import List

router = APIRouter()

# --- Helper Function: Generate Mermaid DAG ---
def generate_mermaid_dag(parsed_data: EngineInputSchema, engine_output: EngineOutputSchema) -> str:
    """
    根据输入参数和引擎计算结果，动态生成包含实际数值的因果图。
    """
    params = parsed_data.graph_params
    z_name = params.z_name
    m_name = params.m_weights.name
    u_name = params.u_priors.name
    
    # 获取引擎溯因推导出的 U 的真实数值
    inferred_latents = engine_output.inferred_latents
    # 获取字典中的第一个值（即我们反推的 U_hidden），如果为空则给默认值
    u_computed_val = list(inferred_latents.values())[0] if inferred_latents else 0.0

    # 事实状态的描述映射
    x_desc = "做了" if parsed_data.factual.X == 1 else "未做"
    y_desc = "好结局" if parsed_data.factual.Y == 1 else "坏结局"

    # 使用 f-string 注入计算结果，注意转义 { 和 }
    # 使用最稳健的 [ ] 节点语法，避免部分版本对 { } 或 (( )) 的解析错误
    mermaid_str = f"""
    graph TD;
        Z["[{z_name}] 环境因子"] 
        U["[{u_name}] 反推值: {u_computed_val:.2f}"]
        X["事实: {x_desc}"]
        M["中介传导: {m_name}"]
        Y["观测结局: {y_desc}"]

        %% 核心因果连线
        Z --> X
        Z --> M
        Z --> Y
        
        U --> M
        U --> Y
        
        X --> M
        M --> Y
        
        %% 样式高亮
        style U stroke:#FF003C,stroke-width:2px,fill:#1a0509,color:#FF003C;
        style M stroke:#EAB308,stroke-width:2px,fill:#1a1505,color:#EAB308;
    """
    return mermaid_str

from fastapi import Depends
from ..db.database import get_session
from sqlmodel import Session, select
from ..models.domain import SoulMatrix, ConfessionLog

@router.post("/confess", response_model=ConfessionResponse)
async def confess_endpoint(request: ConfessionRequest, session: Session = Depends(get_session)):
    """
    The main ritual: Parse, Compute, Judge, and Visualize.
    Now with Bayesian Updating.
    """
    try:
        # Load User Prior
        statement = select(SoulMatrix).where(SoulMatrix.username == request.username)
        user = session.exec(statement).first()
        if not user:
            raise HTTPException(status_code=404, detail="灵魂未锚定。请先进行接入仪式。")
            
        last_confession = request.messages[-1].content if request.messages else ""
        
        # --- Memory Step 1: Subgraph Retrieval ---
        subgraph = memory_service.retrieve_subgraph(session, user.id, last_confession)
        persona = user.global_persona_summary
            
        # 1. 解析自然语言到复杂 SCM
        parsing_result = await llm_service.parse_confession(request.messages, persona=persona, subgraph=subgraph)
        
        if not parsing_result.is_complete:
            return ConfessionResponse(
                is_complete=False,
                clarification_question=parsing_result.clarification_question,
                status="Seeking Clarification"
            )
            
        engine_input = parsing_result.engine_input
        
        # Inject DB Priors into engine input
        engine_input.graph_params.u_priors.u_risk.mean = user.u_risk_mean
        engine_input.graph_params.u_priors.u_risk.std = user.u_risk_std
        engine_input.graph_params.u_priors.u_action.mean = user.u_action_mean
        engine_input.graph_params.u_priors.u_action.std = user.u_action_std
        engine_input.graph_params.u_priors.u_emotion.mean = user.u_emotion_mean
        engine_input.graph_params.u_priors.u_emotion.std = user.u_emotion_std
        engine_input.graph_params.u_priors.u_locus.mean = user.u_locus_mean
        engine_input.graph_params.u_priors.u_locus.std = user.u_locus_std
        
        # 2. 运行因果推断引擎
        engine = ComplexCausalEngine(engine_input)
        engine_result_dict = engine.run_inference(num_samples=100000)
        engine_output = EngineOutputSchema(**engine_result_dict)
        
        # 3. 生成判词
        verdict = await llm_service.generate_verdict(last_confession, engine_output, persona=persona, subgraph=subgraph)
        
        # 4. 生成动态拓扑图
        mermaid_chart = generate_mermaid_dag(engine_input, engine_output)
        
        # 5. Bayesian State Update
        latents = engine_output.inferred_latents
        
        # Update means with exponential moving average (alpha = 0.3 for new observation)
        user.u_risk_mean = user.u_risk_mean * 0.7 + latents.get("u_risk", user.u_risk_mean) * 0.3
        user.u_action_mean = user.u_action_mean * 0.7 + latents.get("u_action", user.u_action_mean) * 0.3
        user.u_emotion_mean = user.u_emotion_mean * 0.7 + latents.get("u_emotion", user.u_emotion_mean) * 0.3
        user.u_locus_mean = user.u_locus_mean * 0.7 + latents.get("u_locus", user.u_locus_mean) * 0.3
        
        # Reduce std to simulate conviction over time
        user.u_risk_std = max(user.u_risk_std * 0.9, 0.2)
        user.u_action_std = max(user.u_action_std * 0.9, 0.2)
        user.u_emotion_std = max(user.u_emotion_std * 0.9, 0.2)
        user.u_locus_std = max(user.u_locus_std * 0.9, 0.2)
        
        user.confession_count += 1
        
        messages_json = json.dumps([m.model_dump() for m in request.messages], ensure_ascii=False)
        
        log_entry = ConfessionLog(
            soul_id=user.id,
            content=last_confession,
            messages_history=messages_json,
            counterfactual_prob=engine_output.counterfactual_prob,
            inferred_u_risk=latents.get("u_risk"),
            inferred_u_action=latents.get("u_action"),
            inferred_u_emotion=latents.get("u_emotion"),
            inferred_u_locus=latents.get("u_locus"),
            z_name=engine_input.graph_params.z_name,
            m_name=engine_input.graph_params.m_weights.name,
            verdict_text=verdict,
            mermaid_chart=mermaid_chart
        )
        
        session.add(log_entry)
        session.add(user)
        session.commit()
        
        # --- Memory Step 2 & 3: Consolidate Graph and Evolve Persona ---
        engine_input_dict = engine_input.model_dump()
        memory_service.consolidate_memory(session, user.id, engine_input_dict, engine_output)
        
        # In a production app, this should be a FastAPI BackgroundTask, but await is fine for V1.
        await memory_service.evolve_persona(session, user.id, last_confession, engine_output)
        
        return ConfessionResponse(
            is_complete=True,
            confession=last_confession,
            engine_input=engine_input,
            engine_output=engine_output,
            verdict=verdict,
            mermaid_chart=mermaid_chart
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"World-line computation failed: {str(e)}")

@router.post("/simulate")
async def simulate_endpoint(request: SimulateRequest):
    """
    Phase 1: Lightweight simulation for the Intervention Sandbox.
    """
    try:
        # 1. 更新参数
        engine_input = request.engine_input
        # 更新 Z 和 M 的权重偏置来模拟干预
        engine_input.graph_params.z_val = request.new_z
        engine_input.graph_params.m_weights.bias = request.new_m_bias
        
        # 2. 运行引擎（不调用 LLM）
        engine = ComplexCausalEngine(engine_input)
        engine_result_dict = engine.run_inference(num_samples=50000)
        engine_output = EngineOutputSchema(**engine_result_dict)
        
        # 3. 生成新的动态拓扑图
        mermaid_chart = generate_mermaid_dag(engine_input, engine_output)
        
        return {
            "counterfactual_prob": engine_output.counterfactual_prob,
            "inferred_latents": engine_output.inferred_latents,
            "mermaid_chart": mermaid_chart,
            "message": "干预成功，世界线预测已更新。"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation failed: {str(e)}")
