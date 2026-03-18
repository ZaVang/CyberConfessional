from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

from schemas import EngineInputSchema, EngineOutputSchema
# 引入我们升级后的多变量复杂引擎
from CausalEngine import ComplexCausalEngine  
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

    # 使用 f-string 注入计算结果
    mermaid_str = f"""
    graph TD;
        %% 定义节点，动态注入名称和数值
        Z{{"[{z_name}]<br/>环境因子"}} 
        U(({"[{u_name}]<br/>反推值: <b>{u_computed_val:.2f}</b>"}))
        X["事实: {x_desc}"]
        M>"中介传导: {m_name}"]
        Y("观测结局: {y_desc}")

        %% 核心因果连线
        Z -->|大势所趋| X
        Z -->|宏观压迫| M
        Z -->|环境降维打击| Y
        
        U -->|潜意识限制| M
        U -->|底层命运设定| Y
        
        X -->|触发机制| M
        M -->|致命连锁反应| Y
        
        %% 高亮警告隐变量 U 和 致命中介 M
        style U stroke:#FF003C,stroke-width:2px,fill:#1a0509,color:#FF003C;
        style M stroke:#EAB308,stroke-width:2px,stroke-dasharray: 5 5,fill:#1a1505,color:#EAB308;
    """
    return mermaid_str

# --- Endpoints ---

@app.post("/confess", response_model=ConfessionResponse)
async def confess_endpoint(request: ConfessionRequest):
    """
    The main ritual: Parse, Compute, Judge, and Visualize.
    """
    try:
        # 1. 解析自然语言到复杂 SCM
        engine_input = await llm.parse_confession(request.confession)
        
        # 2. 运行因果推断引擎
        engine = ComplexCausalEngine(engine_input)
        engine_result_dict = engine.run_inference(num_samples=100000)
        engine_output = EngineOutputSchema(**engine_result_dict)
        
        # 3. 生成判词 (修复 BUG：直接传入 engine_output 对象，去掉 .model_dump())
        verdict = await llm.generate_verdict(request.confession, engine_output)
        
        # 4. 生成动态拓扑图 (修复 BUG：同时传入 input 和 output 提取反推数值)
        mermaid_chart = generate_mermaid_dag(engine_input, engine_output)
        
        return ConfessionResponse(
            confession=request.confession,
            engine_input=engine_input,
            engine_output=engine_output,
            verdict=verdict,
            mermaid_chart=mermaid_chart
        )
    except Exception as e:
        # 打印详细日志，方便追踪 LLM 层或 Engine 层的报错
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"World-line computation failed: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "Altar Online, World-lines stabilizing..."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8888)