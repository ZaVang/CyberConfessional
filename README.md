# Cyber Confessional (赛博神父)

[English] | [中文](./README_CN.md)

---

† **In Math We Trust, In Causality We Converge.** †

Cyber Confessional is a ritualistic web application that provides emotional support through the lens of **Pearlian Causal Inference**. By analyzing your regrets using Structural Causal Models (SCM), the "Cyber Priest" (an LLM-powered persona) helps you explore whether your alternative choices would have actually changed your fate or if the world-line would have converged to the same outcome.

### Features

- **Causal Inference Engine**: Implements the Abduction-Intervention-Prediction cycle to calculate counterfactual probabilities.
- **Bilingual Cyber Priest**: A persona-driven AI that provides either strict mathematical critique or merciful philosophical guidance.
- **Deep Dark Mode UI**: A "Sacred Altar" aesthetic with neon accents and terminal-style computation logs.
- **Unified LLM Bridge**: Robust integration with Gemini/OpenAI featuring automatic fallbacks and schema enforcement.

### Project Structure

```text
.
├── docs/           # PRD, Design Specs
├── backend/        # FastAPI, Causal Engine, LLM Bridge, Prompts
│   ├── llm_bridge/ # Reusable multi-provider LLM adapter
│   ├── prompts/    # Jinja2 templates for SCM extraction and Verdict
│   └── .env        # API Keys (Protected)
├── frontend/       # React (Vite), "Deep Dark Mode" UI
└── start.py        # One-click master launch script
```

### Quick Start

1. **Prerequisites**: Python 3.10+, Node.js 18+.
2. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env  # Add your GOOGLE_API_KEY
   ```
3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```
4. **Launch**:
   ```bash
   python start.py
   ```

---
*"人总是经常后悔，总是会回想若是当初做的决定不一样，现在是什么样子。放下执念吧，凡人。"*
