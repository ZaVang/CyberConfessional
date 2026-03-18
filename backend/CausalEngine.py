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


class ComplexCausalEngine(BaseCausalEngine):
    """
    V2.0 复杂赛博神父引擎。
    包含环境变量 (Z) 与 中介传导路径 (M)。
    因果图结构：
    Z -> X, Z -> M, Z -> Y
    U -> M, U -> Y
    X -> M -> Y
    """
    def __init__(self, payload):
        super().__init__(payload)
        # 为了兼容性，这里使用 dict 的 get 方法。
        # 如果您的 payload.graph_params 已经是 Pydantic 对象，请改为点号(.)访问
        params = self.payload.graph_params if isinstance(self.payload.graph_params, dict) else self.payload.graph_params.model_dump()
        
        # 1. 隐变量 U (如：天生性格) 的先验
        u_prior = params.get('u_prior', {})
        self.u_mean = u_prior.get('mean', 0.0)
        self.u_std = u_prior.get('std', 1.0)

        # 2. 环境变量 Z (如：宏观经济)。假设在事实和反事实中 Z 是不变的常量
        self.z_val = params.get('z_val', 0.0)

        # 3. 中介变量 M 的方程权重: M = sigmoid(w_mx*X + w_mz*Z + w_mu*U + bias_m)
        m_weights = params.get('m_weights', {})
        self.w_mx = m_weights.get('w_x', 1.0)  # X 导致 M 发生的概率权重
        self.w_mz = m_weights.get('w_z', 0.0)  # 环境 Z 对 M 的压迫感
        self.w_mu = m_weights.get('w_u', 2.0)  # 隐变量 U 对 M 的影响
        self.bias_m = m_weights.get('bias', 0.0)

        # 4. 结局变量 Y 的方程权重: Y = sigmoid(w_yx*X + w_ym*M + w_yz*Z + w_yu*U + bias_y)
        y_weights = params.get('y_weights', {})
        self.w_yx = y_weights.get('w_x', 1.0)  # X 对 Y 的直接效应
        self.w_ym = y_weights.get('w_m', -5.0) # M(骚操作) 对 Y 的致命打击
        self.w_yz = y_weights.get('w_z', -2.0) # 环境 Z 对 Y 的宏观影响
        self.w_yu = y_weights.get('w_u', 3.0)  # 隐变量 U 对 Y 的直接影响
        self.bias_y = y_weights.get('bias', 0.0)

    def _sigmoid(self, z):
        return 1 / (1 + np.exp(-z))

    def _get_m_prob(self, x, z, u):
        """计算中介行为 M 发生的概率"""
        logit = self.w_mx * x + self.w_mz * z + self.w_mu * u + self.bias_m
        return self._sigmoid(logit)

    def _get_y_prob_given_m(self, x, m, z, u):
        """在已知是否发生 M 的情况下，计算好结局 Y 的概率"""
        logit = self.w_yx * x + self.w_ym * m + self.w_yz * z + self.w_yu * u + self.bias_y
        return self._sigmoid(logit)

    def _calculate_marginal_y_prob(self, x, z, u):
        """
        核心数学逻辑：边缘化中介变量 M。
        因为 M 的发生是一个概率事件，我们需要计算：
        P(Y) = P(Y|M=1)*P(M=1) + P(Y|M=0)*P(M=0)
        """
        p_m1 = self._get_m_prob(x, z, u)
        p_m0 = 1.0 - p_m1

        p_y_given_m1 = self._get_y_prob_given_m(x, 1, z, u)
        p_y_given_m0 = self._get_y_prob_given_m(x, 0, z, u)

        return (p_y_given_m1 * p_m1) + (p_y_given_m0 * p_m0)

    def run_inference(self, num_samples: int = 100000): # -> EngineOutputSchema:
        factual_x = self.payload.factual.X
        factual_y = self.payload.factual.Y
        cf_x = self.payload.counterfactual.do_X

        # 1. 溯因 (Abduction)：在当前环境 Z_val 下，反推用户的真实隐变量 U
        u_samples = np.random.normal(self.u_mean, self.u_std, num_samples)
        y_probs_obs = self._calculate_marginal_y_prob(factual_x, self.z_val, u_samples)
        
        likelihoods = y_probs_obs if factual_y == 1 else (1 - y_probs_obs)
        random_thresholds = np.random.uniform(0, 1, num_samples)
        accepted_u = u_samples[random_thresholds < likelihoods]

        if len(accepted_u) < 10:
            # 兼容您的输出 Schema
            return {
                "counterfactual_prob": 0.0,
                "retained_universes": len(accepted_u),
                "inferred_latents": {"U_hidden": 0.0},
                "message": "世界线断裂：现实参数过于极端，无法匹配平行宇宙。"
            }

        # 2 & 3. 干预与预测 (Intervention & Prediction)：强制执行 do(X)
        # 注意：这里我们强制改变了 X，这会引起 M 发生概率的连锁改变！
        y_probs_cf = self._calculate_marginal_y_prob(cf_x, self.z_val, accepted_u)
        expected_cf_prob = float(np.mean(y_probs_cf))

        return {
            "counterfactual_prob": expected_cf_prob,
            "retained_universes": len(accepted_u),
            "inferred_latents": {"U_hidden": float(np.mean(accepted_u))},
            "message": "推演完成，包含环境因素与行为中介的多维命运已收束。"
        }