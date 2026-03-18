from abc import ABC, abstractmethod
import numpy as np
from schemas import EngineInputSchema, EngineOutputSchema


class BaseCausalEngine(ABC):
    """
    赛博神父因果计算引擎基类。
    所有具体的 SCM 引擎必须继承此基类并实现 run_inference 方法。
    """
    def __init__(self, payload: EngineInputSchema):
        self.payload = payload
        # 引擎初始化时，子类可以从 payload.graph_params 中提取自己需要的参数

    @abstractmethod
    def run_inference(self, num_samples: int = 100000) -> EngineOutputSchema:
        """
        执行反事实推理三步曲（溯因、干预、预测）。
        必须返回符合 EngineOutputSchema 标准的计算结果。
        """
        pass


class LogitConvergenceEngine(BaseCausalEngine):
    def __init__(self, payload: EngineInputSchema):
        super().__init__(payload)
        # 从结构化的 graph_params 中提取参数
        params = self.payload.graph_params
        
        self.u_mean = params.u_prior.mean if params.u_prior else 0.0
        self.u_std = params.u_prior.std if params.u_prior else 1.0
        self.w_x = params.equation_weights.w_x if params.equation_weights else 1.0
        self.w_u = params.equation_weights.w_u if params.equation_weights else 5.0
        self.bias = params.equation_weights.bias if params.equation_weights else 0.0


    def _sigmoid(self, z):
        return 1 / (1 + np.exp(-z))

    def _calculate_y_prob(self, x, u):
        logit = self.w_x * x + self.w_u * u + self.bias
        return self._sigmoid(logit)

    def run_inference(self, num_samples: int = 100000) -> EngineOutputSchema:
        factual_x = self.payload.factual.X
        factual_y = self.payload.factual.Y
        cf_x = self.payload.counterfactual.do_X

        # 1. 溯因 (Abduction)
        u_samples = np.random.normal(self.u_mean, self.u_std, num_samples)
        y_probs_obs = self._calculate_y_prob(factual_x, u_samples)
        
        likelihoods = y_probs_obs if factual_y == 1 else (1 - y_probs_obs)
        random_thresholds = np.random.uniform(0, 1, num_samples)
        accepted_u = u_samples[random_thresholds < likelihoods]

        if len(accepted_u) < 10:
            return EngineOutputSchema(
                counterfactual_prob=0.0,
                retained_universes=len(accepted_u),
                inferred_latents={"U_hidden": 0.0},
                message="世界线断裂：参数设定过于极端，无法反推历史。"
            )

        # 2 & 3. 干预与预测 (Intervention & Prediction)
        y_probs_cf = self._calculate_y_prob(cf_x, accepted_u)
        expected_cf_prob = float(np.mean(y_probs_cf))

        return EngineOutputSchema(
            counterfactual_prob=expected_cf_prob,
            retained_universes=len(accepted_u),
            inferred_latents={"U_hidden": float(np.mean(accepted_u))},
            message="推演完成，命运收束。"
        )