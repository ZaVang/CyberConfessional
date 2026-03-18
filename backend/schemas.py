from pydantic import BaseModel, Field
from typing import Dict, Any, Optional


class FactualState(BaseModel):
    X: int = Field(..., description="现实所做决定：1 为做，0 为没做")
    Y: int = Field(..., description="现实结局：1 为好结局，0 为坏结局")
    # 未来可以扩展 M: Optional[int], Z: Optional[float] 等

class CounterfactualQuery(BaseModel):
    do_X: int = Field(..., description="用户设想的反事实决定（如果当时...）")

class PriorParams(BaseModel):
    mean: float = 0.0
    std: float = 1.0

class EquationWeights(BaseModel):
    w_x: float = 1.0
    w_u: float = 5.0
    bias: float = 0.0

class GraphParams(BaseModel):
    u_prior: Optional[PriorParams] = Field(default_factory=PriorParams)
    equation_weights: Optional[EquationWeights] = Field(default_factory=EquationWeights)

class EngineInputSchema(BaseModel):
    factual: FactualState
    counterfactual: CounterfactualQuery
    graph_params: GraphParams = Field(
        default_factory=GraphParams,
        description="因果图参数，包含先验分布(priors)和结构方程权重(weights)"
    )


class EngineOutputSchema(BaseModel):
    counterfactual_prob: float = Field(..., description="反事实情况下的期望概率")
    retained_universes: int = Field(..., description="溯因阶段保留的有效样本数（世界线数量）")
    inferred_latents: Dict[str, float] = Field(..., description="反推计算出的隐变量后验均值")
    message: Optional[str] = Field(None, description="引擎附带的计算说明或警告")