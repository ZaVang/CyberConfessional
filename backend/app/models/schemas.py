from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

class FactualState(BaseModel):
    X: int = Field(..., description="现实所做决定：1 为做，0 为没做")
    Y: int = Field(..., description="现实结局：1 为好结局，0 为坏结局")

class CounterfactualQuery(BaseModel):
    do_X: int = Field(..., description="用户设想的反事实决定（如果当时...）")

class PriorParams(BaseModel):
    name: str = Field(default="潜意识限制器", description="隐变量(U)的名称")
    mean: float = 0.0
    std: float = 1.0

class M_EquationWeights(BaseModel):
    name: str = Field(default="致命传导行为", description="中介变量(M)的名称，如'恐慌盯盘'")
    w_x: float = 1.0
    w_z: float = 0.0
    w_u: float = 2.0
    bias: float = 0.0

class Y_EquationWeights(BaseModel):
    w_x: float = 1.0
    w_m: float = -5.0
    w_z: float = -2.0
    w_u: float = -2.0
    bias: float = 0.0

class GraphParams(BaseModel):
    z_name: str = Field(default="宏观不可抗力", description="混淆因子(Z)的名称，如'行业寒冬'")
    z_val: float = Field(default=1.0, description="环境变量Z的当前强度，通常设为1.0表示存在")
    u_prior: PriorParams = Field(default_factory=PriorParams)
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