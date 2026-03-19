from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from ..models.schemas import EngineInputSchema, EngineOutputSchema
from ..core.causal_engine import ComplexCausalEngine
from ..services.llm_service import llm_service

router = APIRouter()

class ConfessionRequest(BaseModel):
    confession: str = Field(..., description="The user's natural language confession.")

class ConfessionResponse(BaseModel):
    confession: str
    engine_input: EngineInputSchema
    engine_output: EngineOutputSchema
    verdict: str
    mermaid_chart: str = Field(..., description="动态生成的 Mermaid 因果图语法")
    status: str = "World-line Convergence Confirmed"

# --- Helper Function: Generate Mermaid DAG ---
def generate_mermaid_dag(parsed_data: EngineInputSchema, engine_output: EngineOutputSchema) -> str:
    """
    根据输入参数和引擎计算结果，动态生成包含实际数值的因果图。
    """
    params = parsed_data.graph_params
    z_name = params.z_name
    m_name = params.m_weights.name
    u_name = params.u_prior.name
    
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

@router.post("/confess", response_model=ConfessionResponse)
async def confess_endpoint(request: ConfessionRequest):
    """
    The main ritual: Parse, Compute, Judge, and Visualize.
    """
    try:
        # 1. 解析自然语言到复杂 SCM
        engine_input = await llm_service.parse_confession(request.confession)
        
        # 2. 运行因果推断引擎
        engine = ComplexCausalEngine(engine_input)
        engine_result_dict = engine.run_inference(num_samples=100000)
        engine_output = EngineOutputSchema(**engine_result_dict)
        
        # 3. 生成判词
        verdict = await llm_service.generate_verdict(request.confession, engine_output)
        
        # 4. 生成动态拓扑图
        mermaid_chart = generate_mermaid_dag(engine_input, engine_output)
        
        return ConfessionResponse(
            confession=request.confession,
            engine_input=engine_input,
            engine_output=engine_output,
            verdict=verdict,
            mermaid_chart=mermaid_chart
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"World-line computation failed: {str(e)}")

class SimulateRequest(BaseModel):
    engine_input: EngineInputSchema
    new_z: float = Field(..., description="新的环境因子 Z 值")
    new_m_bias: float = Field(..., description="新的行为阻断偏置 M bias")

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
