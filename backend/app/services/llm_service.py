import os
from jinja2 import Template
from .llm_bridge.bridge import LLMBridge, ChatParameters
from ..models.schemas import EngineInputSchema, EngineOutputSchema, FactualState, CounterfactualQuery, Message, ParsingResult

class LLMService:
    def __init__(self, config_path: str = None):
        if config_path is None:
            # Look for config in app/config/
            config_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "config", "llm_bridge_config.yaml")
        
        self.bridge = LLMBridge.from_config(config_path)
        self.prompt_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "prompts")

    def _load_template(self, filename: str) -> Template:
        with open(os.path.join(self.prompt_dir, filename), "r", encoding="utf-8") as f:
            return Template(f.read())

    async def parse_confession(self, messages: list[Message], persona: str = None, subgraph: str = None) -> ParsingResult:
        """
        Parse human conversation history into structured Causal Engine input via Jinja2 template.
        """
        try:
            conversation_text = ""
            for m in messages:
                role_name = "User" if m.role == "user" else "Priest"
                conversation_text += f"{role_name}: {m.content}\n"

            template = self._load_template("EXTRACT_SCM_PARAMS.j2")
            prompt_content = template.render(
                conversation=conversation_text,
                persona=persona,
                subgraph=subgraph
            )

            response = await self.bridge.chat(
                model="priest_gemini",
                messages=[{"role": "user", "content": prompt_content}],
                response_model=ParsingResult,
                params=ChatParameters(temperature=0.1)
            )
            return response.parsed
        except Exception as e:
            print(f"[LLMService] Warning: LLM parsing failed ({e}). Falling back to Mock.")
            return ParsingResult(
                is_complete=True,
                engine_input=EngineInputSchema(
                    factual=FactualState(X=1, Y=0),
                    counterfactual=CounterfactualQuery(do_X=0)
                )
            )

    async def generate_verdict(self, text: str, engine_result: EngineOutputSchema, persona: str = None, subgraph: str = None, future_aspiration: str = None) -> str:
        """
        Generate the Cyber Priest's persona response based on the causal calculation via Jinja2.
        """
        try:
            template = self._load_template("GENERATE_VERDICT.j2")
            verdict_prompt = template.render(
                confession=text,
                prob=engine_result.counterfactual_prob,
                u_value=engine_result.inferred_latents.get("U_hidden", 0.0),
                message=engine_result.message,
                persona=persona,
                subgraph=subgraph,
                future_aspiration=future_aspiration
            )

            response = await self.bridge.chat(
                model="priest_gemini",
                messages=[{"role": "user", "content": verdict_prompt}],
                params=ChatParameters(temperature=0.8)
            )
            return response.content.strip()

        except Exception as e:
            print(f"[LLMService] Warning: LLM generation failed ({e}). Falling back to Mock.")
            return f"世界线观测受到干扰。在你的平行宇宙中，成功率为 {engine_result.counterfactual_prob:.4f}。命运依然收束。放下执念吧，凡人。"

llm_service = LLMService()

