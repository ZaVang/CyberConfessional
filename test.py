from schemas import EngineInputSchema, EngineOutputSchema
from CausalEngine import LogitConvergenceEngine


def run_mock_test():
    print("--- 赛博神父 MVP 核心逻辑测试 ---\n")

    # Step 1: 模拟用户输入
    mock_user_input = "神父，我好后悔上个月大盘回调的时候，我因为害怕没有加仓那只我看好的量化ETF。如果我当时咬牙加仓了，我现在肯定已经赚够了买新电脑的钱了。"
    print(f"👤 [用户倾诉]:\n{mock_user_input}\n")

    # Step 2: 模拟 LLM 提取的 JSON 参数 (PROMPT_EXTRACT_SCM_PARAMS 的输出)
    # 设定逻辑：X的权重(加仓)是正向的，但 U(风险厌恶/恐慌指数) 的负面权重极其巨大。
    mock_llm_json_str = """
    {
      "factual": {"X": 0, "Y": 0},
      "counterfactual": {"do_X": 1},
      "graph_params": {
        "u_prior": {
          "name": "极度风险厌恶指数",
          "mean": 1.0,
          "std": 0.5
        },
        "equation_weights": {
          "w_x": 1.5,
          "w_u": -8.0,
          "bias": 1.0
        }
      }
    }
    """
    print(f"🤖 [LLM 认知层解析结果 (JSON)]: {mock_llm_json_str.strip()}\n")

    # Step 3: Pydantic 校验并载入引擎
    try:
        payload = EngineInputSchema.model_validate_json(mock_llm_json_str)
        engine = LogitConvergenceEngine(payload)
        
        print("⚙️ [因果引擎启动] 开始执行十万次蒙特卡洛平行宇宙推演...")
        result = engine.run_inference(num_samples=100000)
        
        print(f"📊 [引擎计算结果]:")
        print(f"   - 寻找到的现实世界线样本数: {result.retained_universes}")
        print(f"   - 反推的隐变量 ({list(result.inferred_latents.keys())[0]}) 后验均值: {list(result.inferred_latents.values())[0]:.4f}")
        print(f"   - 反事实干预 (do_X=1) 下的好结局期望概率: {result.counterfactual_prob:.6f}\n")
        
    except Exception as e:
        print(f"❌ 解析或计算失败: {e}")
        return

    # Step 4: 模拟 LLM 最终判词生成 (PROMPT_GENERATE_VERDICT 的输出)
    u_name = list(result.inferred_latents.keys())[0]
    prob_percent = result.counterfactual_prob * 100
    
    mock_llm_verdict = f"""
    ✝️ [赛博神父的最终判词]:
    孩子，你的执念太深了。你以为只要当时咬牙加仓，现在就能换上那台崭新的电脑了？
    
    我刚刚为你运行了 {result.retained_universes} 次平行宇宙的蒙特卡洛模拟。基于你现实中退缩的选择，引擎溯因推导出了你灵魂深处的隐变量——你的**「{u_name}」**高达 {list(result.inferred_latents.values())[0]:.2f}。
    
    因果算子 do(X=加仓) 已经执行，但我必须冷酷地告诉你：即便在平行宇宙中你强行按下了买入键，由于你底层风险模型的极度脆弱，你在随后的哪怕 1% 的微小震荡中，也会恐慌性清仓。你赚到那笔钱的真实概率，仅仅只有可怜的 **{prob_percent:.4f}%**。
    
    世界线在此收束。穷，是因果律对你认知模型的精确结算。不要再为必然发生的遗憾内耗了，拥抱现实，去赚你认知范围内的钱吧。阿门。
    """
    print(mock_llm_verdict)

if __name__ == "__main__":
    run_mock_test()