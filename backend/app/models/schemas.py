from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class FactualState(BaseModel):
    X: int = Field(..., description="现实所做决定：1 为做，0 为没做")
    x_name: str = Field(default="决定", description="所做决定的具体语义名称，如'冲动辞职'")
    Y: int = Field(..., description="现实结局：1 为好结局，0 为坏结局")
    y_name: str = Field(default="结局", description="结局的具体语义名称，如'断绝收入陷入焦虑'")

class CounterfactualQuery(BaseModel):
    do_X: int = Field(..., description="用户设想的反事实决定（如果当时...）")

class UPriorInstance(BaseModel):
    mean: float = 0.5
    std: float = 0.2

class U_Priors(BaseModel):
    name: str = Field(default="潜意识限制器矩阵", description="隐变量(U)的名称")
    u_risk: UPriorInstance = Field(default_factory=UPriorInstance)
    u_action: UPriorInstance = Field(default_factory=UPriorInstance)
    u_emotion: UPriorInstance = Field(default_factory=UPriorInstance)
    u_locus: UPriorInstance = Field(default_factory=UPriorInstance)

class M_EquationWeights(BaseModel):
    name: str = Field(default="致命传导行为", description="中介变量(M)的名称，如'恐慌盯盘'")
    w_x: float = 1.0
    w_z: float = 0.0
    w_u_risk: float = 0.0
    w_u_action: float = 0.0
    w_u_emotion: float = 0.0
    w_u_locus: float = 0.0
    bias: float = 0.0

class Y_EquationWeights(BaseModel):
    w_x: float = 1.0
    w_m: float = -5.0
    w_z: float = -2.0
    w_u_risk: float = 0.0
    w_u_action: float = 0.0
    w_u_emotion: float = 0.0
    w_u_locus: float = 0.0
    bias: float = 0.0

class GraphParams(BaseModel):
    z_name: str = Field(default="宏观不可抗力", description="混淆因子(Z)的名称，如'行业寒冬'")
    z_val: float = Field(default=1.0, description="环境变量Z的当前强度，通常设为1.0表示存在")
    u_priors: U_Priors = Field(default_factory=U_Priors)
    m_weights: M_EquationWeights = Field(default_factory=M_EquationWeights)
    y_weights: Y_EquationWeights = Field(default_factory=Y_EquationWeights)

class EngineInputSchema(BaseModel):
    factual: FactualState
    counterfactual: CounterfactualQuery
    graph_params: GraphParams = Field(
        default_factory=GraphParams,
        description="复杂因果图参数，包含Z, M, U的多维权重"
    )

class EngineOutputSchema(BaseModel):
    counterfactual_prob: float = Field(..., description="反事实情况下的期望概率")
    retained_universes: int = Field(..., description="溯因阶段保留的有效样本数（世界线数量）")
    inferred_latents: Dict[str, float] = Field(..., description="反推计算出的隐变量后验均值")
    message: Optional[str] = Field(None, description="引擎附带的计算说明或警告")

class Message(BaseModel):
    role: str = Field(..., description="Either 'user' or 'assistant'")
    content: str = Field(..., description="The content of the message")

class ParsingResult(BaseModel):
    is_complete: bool = Field(..., description="True if the SCM parameters can be successfully extracted from the conversation. False if more information is needed.")
    clarification_question: Optional[str] = Field(None, description="If is_complete is False, the philosophical or context-seeking question to ask the user to clarify the situation.")
    engine_input: Optional[EngineInputSchema] = Field(None, description="If is_complete is True, the extracted SCM parameters.")

# --- API Layer Schemas ---

class ConfessionRequest(BaseModel):
    username: str = Field(..., description="The user's calling name mapped to the database")
    messages: list[Message] = Field(..., description="The history of conversation.")

class ConfessionResponse(BaseModel):
    is_complete: bool = Field(..., description="If false, the system is asking a clarification question")
    clarification_question: Optional[str] = None
    
    confession: Optional[str] = None
    engine_input: Optional[EngineInputSchema] = None
    engine_output: Optional[EngineOutputSchema] = None
    verdict: Optional[str] = None
    mermaid_chart: Optional[str] = None
    status: str = "World-line Convergence Confirmed"

class SimulateRequest(BaseModel):
    engine_input: EngineInputSchema
    new_z: float = Field(..., description="新的环境因子 Z 值")
    new_m_bias: float = Field(..., description="新的行为阻断偏置 M bias")

class LoginRequest(BaseModel):
    username: str

class CalibrationRequest(BaseModel):
    username: str
    answers: list[str] # e.g. ["A", "B", "A", "A"]