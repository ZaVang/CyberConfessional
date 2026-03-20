import numpy as np
from ..models.schemas import EngineInputSchema, EngineOutputSchema

class ComplexCausalEngine:
    """
    V3.0 终极赛博神父引擎 (四维灵魂矩阵版)
    """
    def __init__(self, payload: EngineInputSchema):
        params = payload.graph_params if isinstance(payload.graph_params, dict) else payload.graph_params.model_dump()
        
        # 1. 解析四个隐变量的先验分布 (Priors)
        priors = params.get('u_priors', {})
        self.prior_risk = priors.get('u_risk', {'mean': 5.0, 'std': 2.0})
        self.prior_action = priors.get('u_action', {'mean': 5.0, 'std': 2.0})
        self.prior_emotion = priors.get('u_emotion', {'mean': 5.0, 'std': 2.0})
        self.prior_locus = priors.get('u_locus', {'mean': 5.0, 'std': 2.0})

        self.z_val = params.get('z_val', 1.0)

        # 2. 解析 M 的权重向量 (包含对四个 U 的敏感度)
        m_weights = params.get('m_weights', {})
        self.w_mx = m_weights.get('w_x', 1.0)
        self.w_mz = m_weights.get('w_z', 0.0)
        self.w_m_u_risk = m_weights.get('w_u_risk', 0.0)
        self.w_m_u_action = m_weights.get('w_u_action', 0.0)
        self.w_m_u_emotion = m_weights.get('w_u_emotion', 0.0)
        self.w_m_u_locus = m_weights.get('w_u_locus', 0.0)
        self.bias_m = m_weights.get('bias', 0.0)

        # 3. 解析 Y 的权重向量
        y_weights = params.get('y_weights', {})
        self.w_yx = y_weights.get('w_x', 1.0)
        self.w_ym = y_weights.get('w_m', -5.0)
        self.w_yz = y_weights.get('w_z', -2.0)
        self.w_y_u_risk = y_weights.get('w_u_risk', 0.0)
        self.w_y_u_action = y_weights.get('w_u_action', 0.0)
        self.w_y_u_emotion = y_weights.get('w_u_emotion', 0.0)
        self.w_y_u_locus = y_weights.get('w_u_locus', 0.0)
        self.bias_y = y_weights.get('bias', 0.0)

        # 事实与反事实状态
        self.factual_x = payload.factual.X if not isinstance(payload, dict) else payload['factual']['X']
        self.factual_y = payload.factual.Y if not isinstance(payload, dict) else payload['factual']['Y']
        self.cf_x = payload.counterfactual.do_X if not isinstance(payload, dict) else payload['counterfactual']['do_X']

    def _sigmoid(self, z):
        return 1 / (1 + np.exp(-z))

    def _get_m_prob(self, x, z, u_risk, u_action, u_emotion, u_locus):
        """计算中介行为 M 发生的概率 (高维张量运算)"""
        logit = (self.w_mx * x + self.w_mz * z + 
                 self.w_m_u_risk * u_risk + 
                 self.w_m_u_action * u_action + 
                 self.w_m_u_emotion * u_emotion + 
                 self.w_m_u_locus * u_locus + self.bias_m)
        return self._sigmoid(logit)

    def _get_y_prob_given_m(self, x, m, z, u_risk, u_action, u_emotion, u_locus):
        """在已知 M 的情况下，计算 Y 的概率"""
        logit = (self.w_yx * x + self.w_ym * m + self.w_yz * z + 
                 self.w_y_u_risk * u_risk + 
                 self.w_y_u_action * u_action + 
                 self.w_y_u_emotion * u_emotion + 
                 self.w_y_u_locus * u_locus + self.bias_y)
        return self._sigmoid(logit)

    def _calculate_marginal_y_prob(self, x, z, u_risk, u_action, u_emotion, u_locus):
        """边缘化中介变量 M"""
        p_m1 = self._get_m_prob(x, z, u_risk, u_action, u_emotion, u_locus)
        p_m0 = 1.0 - p_m1
        p_y_given_m1 = self._get_y_prob_given_m(x, 1, z, u_risk, u_action, u_emotion, u_locus)
        p_y_given_m0 = self._get_y_prob_given_m(x, 0, z, u_risk, u_action, u_emotion, u_locus)
        return (p_y_given_m1 * p_m1) + (p_y_given_m0 * p_m0)

    def run_inference(self, num_samples: int = 100000):
        # 1. 溯因 (Abduction)：在四个维度上同时生成 10 万个平行宇宙的灵魂碎片
        samples_risk = np.random.normal(self.prior_risk['mean'], self.prior_risk['std'], num_samples)
        samples_action = np.random.normal(self.prior_action['mean'], self.prior_action['std'], num_samples)
        samples_emotion = np.random.normal(self.prior_emotion['mean'], self.prior_emotion['std'], num_samples)
        samples_locus = np.random.normal(self.prior_locus['mean'], self.prior_locus['std'], num_samples)

        # 极速并行计算这 10 万个宇宙中，现实 Y 发生的概率
        y_probs_obs = self._calculate_marginal_y_prob(
            self.factual_x, self.z_val, 
            samples_risk, samples_action, samples_emotion, samples_locus
        )
        
        # 抛硬币筛选：只保留那些与用户现实结局吻合的世界线
        likelihoods = y_probs_obs if self.factual_y == 1 else (1 - y_probs_obs)
        random_thresholds = np.random.uniform(0, 1, num_samples)
        accept_mask = random_thresholds < likelihoods

        # 提取幸存的世界线
        accepted_risk = samples_risk[accept_mask]
        accepted_action = samples_action[accept_mask]
        accepted_emotion = samples_emotion[accept_mask]
        accepted_locus = samples_locus[accept_mask]

        if len(accepted_risk) < 10:
            return {
                "counterfactual_prob": 0.0,
                "retained_universes": len(accepted_risk),
                "inferred_latents": {
                    "u_risk": 0.5,
                    "u_action": 0.5,
                    "u_emotion": 0.5,
                    "u_locus": 0.5
                },
                "message": "世界线断裂：参数设定极度矛盾，无法反推过去。"
            }

        # 2 & 3. 干预与预测 (Intervention & Prediction)：强制改变 X，在幸存的宇宙中推演未来
        y_probs_cf = self._calculate_marginal_y_prob(
            self.cf_x, self.z_val, 
            accepted_risk, accepted_action, accepted_emotion, accepted_locus
        )
        
        expected_cf_prob = float(np.mean(y_probs_cf))

        # 返回结果：分别计算四个维度的后验均值
        return {
            "counterfactual_prob": expected_cf_prob,
            "retained_universes": len(accepted_risk),
            "inferred_latents": {
                "u_risk": float(np.mean(accepted_risk)),
                "u_action": float(np.mean(accepted_action)),
                "u_emotion": float(np.mean(accepted_emotion)),
                "u_locus": float(np.mean(accepted_locus))
            },
            "message": "高维命运张量已收束。"
        }