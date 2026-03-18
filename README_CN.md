# 赛博神父 (Cyber Confessional)

[English](./README.md) | [中文]

---

† **数学中寻真理，因果中见众生。** †

“赛博神父”是一个结合了**珀尔因果推断 (Causal Inference)** 理论与宗教仪式感的心理疏导应用。它通过结构因果模型 (SCM) 分析你的遗憾，探讨若是当初做了不同的决定，你的世界线是否真的会发生跃迁，还是会无可避免地收束到同样的结局。

### 核心特性

- **因果推理引擎**：严格遵循“溯因-干预-预测”三阶段，计算反事实概率 $P(Y_{do(X')} | X, Y)$。
- **双重人格神父**：基于 Jinja2 模板动态生成的 AI 人格，既能进行冷酷的数学批判，也能进行温柔的存在主义启示。
- **深色祭坛 UI**：极致黑化设计，配合霓虹灯效与终端风格的计算日志，营造神圣的仪式感。
- **统一 LLM 桥接**：集成 Gemini/OpenAI，支持结构化输出 (Structured Output) 与自动故障转移。

### 项目结构

```text
.
├── docs/           # 产品需求文档 (PRD)、设计规格
├── backend/        # FastAPI 服务、因果引擎、LLM 桥接、提示词模板
│   ├── llm_bridge/ # 可复用的多供应商 LLM 适配器
│   ├── prompts/    # 用于参数提取和判词生成的 Jinja2 模板
│   └── .env        # 敏感 API 密钥
├── frontend/       # React (Vite) 前端
└── start.py        # 一键启动脚本
```

### 快速开始

1. **环境依赖**：Python 3.10+, Node.js 18+。
2. **后端配置**：
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env  # 填入你的 GOOGLE_API_KEY
   ```
3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```
4. **一键启动**：
   ```bash
   python start.py
   ```

---
*"人总是经常后悔，总是会回想若是当初做的决定不一样，现在是什么样子。放下执念吧，凡人。"*
