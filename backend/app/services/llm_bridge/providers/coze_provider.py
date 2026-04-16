"""
LLM Bridge — Coze Bot API provider adapter.

Integrates with Coze Bot API for chat completions.

**API Documentation:** https://www.coze.cn/docs/developer_guides/chat_v3

**Authentication:**
- Requires `access_token` (Personal Access Token from Coze)
- Bot ID specified in config or per-request

**Parameters:**
- `bot_id`: The Coze Bot ID to use
- `user_id`: User identifier for conversation tracking
- `conversation_id`: Optional, for multi-turn conversations

**Response mapping:**
- Coze returns events stream, we parse the final message
- Content extracted from `content` field
- Usage info from `usage` field if available
"""

from __future__ import annotations

import aiohttp
import asyncio
import json
import logging
from typing import Optional, Type

from pydantic import BaseModel

from ..models import ChatParameters, UnifiedResponse, UsageInfo
from .base import BaseProvider

logger = logging.getLogger("llm_bridge.coze")


class CozeProvider(BaseProvider):
    """Adapter for Coze Bot API."""

    BASE_URL = "https://api.coze.cn"

    async def chat(
        self,
        model: str,  # This will be the bot_id for Coze
        messages: list[dict],
        api_key: str,  # This is the access_token
        *,
        response_model: Optional[Type[BaseModel]] = None,
        params: Optional[ChatParameters] = None,
        **kwargs,
    ) -> UnifiedResponse:
        """
        Send a chat request to Coze Bot API.

        Parameters
        ----------
        model : str
            The bot_id to use (passed as model alias in config)
        messages : list[dict]
            OpenAI-style message list
        api_key : str
            Coze Personal Access Token
        response_model : Optional[Type[BaseModel]]
            Not directly supported by Coze, but we can parse JSON response
        params : Optional[ChatParameters]
            Additional parameters (temperature etc. not used by Coze)
        **kwargs
            Additional Coze-specific options:
            - user_id: User identifier (default: "default_user")
            - conversation_id: For multi-turn conversations
        """
        p = params or ChatParameters()
        bot_id = model  # In Coze, model = bot_id
        user_id = kwargs.pop("user_id", "default_user")
        conversation_id = kwargs.pop("conversation_id", None)

        # Build the last user message (Coze doesn't support full conversation history)
        # We concatenate all messages for context
        user_message = self._build_user_message(messages)

        # Build request body
        request_body = {
            "bot_id": bot_id,
            "user_id": user_id,
            "stream": False,
            "auto_save_history": True,
            "additional_messages": [
                {
                    "role": "user",
                    "content": user_message,
                    "content_type": "text"
                }
            ]
        }

        if conversation_id:
            request_body["conversation_id"] = conversation_id

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        # Step 1: Create chat
        chat_url = f"{self.BASE_URL}/v3/chat"
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                chat_url,
                headers=headers,
                json=request_body
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    raise RuntimeError(f"Coze API error ({response.status}): {error_text}")

                result = await response.json()

        # Check for errors
        code = result.get("code", 0)
        if code != 0:
            raise RuntimeError(f"Coze API returned error: {result.get('msg', 'Unknown error')}")

        data = result.get("data", {})
        chat_id = data.get("id")
        conversation_id = data.get("conversation_id")
        
        if not chat_id:
            raise RuntimeError(f"No chat_id in response: {result}")

        # Step 2: Poll for completion
        content = await self._poll_for_response(
            session=aiohttp.ClientSession(),
            bot_id=bot_id,
            chat_id=chat_id,
            conversation_id=conversation_id,
            headers=headers
        )

        # Parse structured output if requested
        parsed = None
        if response_model and content:
            try:
                json_content = self._extract_json(content)
                if json_content:
                    parsed = response_model.model_validate(json_content)
            except Exception as e:
                logger.warning(f"Failed to parse structured output: {e}")

        return UnifiedResponse(
            provider="coze",
            model=model,
            content=content,
            usage=UsageInfo(),
            stop_reason="stop",
            model_id=chat_id,
            parsed=parsed,
        )

    async def _poll_for_response(
        self,
        session: aiohttp.ClientSession,
        bot_id: str,
        chat_id: str,
        conversation_id: str,
        headers: dict,
        max_wait: int = 60,
        poll_interval: float = 1.0,
    ) -> str:
        """Poll for chat completion and return the response content."""
        retrieve_url = f"{self.BASE_URL}/v3/chat/retrieve"
        
        try:
            elapsed = 0
            while elapsed < max_wait:
                params = {
                    "conversation_id": conversation_id,
                    "chat_id": chat_id,
                }
                
                async with session.get(retrieve_url, headers=headers, params=params) as response:
                    if response.status != 200:
                        error_text = await response.text()
                        raise RuntimeError(f"Coze retrieve error ({response.status}): {error_text}")
                    
                    result = await response.json()
                
                data = result.get("data", {})
                status = data.get("status", "")
                
                if status == "completed":
                    # Get the messages
                    return await self._get_messages(session, conversation_id, chat_id, headers)
                
                elif status == "failed":
                    error = data.get("last_error", {})
                    raise RuntimeError(f"Chat failed: {error.get('msg', 'Unknown error')}")
                
                # Still in progress, wait and retry
                await asyncio.sleep(poll_interval)
                elapsed += poll_interval
            
            raise RuntimeError(f"Chat timed out after {max_wait}s")
        
        finally:
            await session.close()

    async def _get_messages(
        self,
        session: aiohttp.ClientSession,
        conversation_id: str,
        chat_id: str,
        headers: dict,
    ) -> str:
        """Get messages from completed chat."""
        messages_url = f"{self.BASE_URL}/v3/chat/message/list"
        
        params = {
            "conversation_id": conversation_id,
            "chat_id": chat_id,
        }
        
        async with session.get(messages_url, headers=headers, params=params) as response:
            if response.status != 200:
                error_text = await response.text()
                raise RuntimeError(f"Coze messages error ({response.status}): {error_text}")
            
            result = await response.json()
        
        data = result.get("data", [])
        
        # Find the assistant's answer
        for msg in data:
            if msg.get("role") == "assistant" and msg.get("type") == "answer":
                return msg.get("content", "")
        
        return ""

    def _build_user_message(self, messages: list[dict]) -> str:
        """Build a single user message from conversation history."""
        parts = []
        for msg in messages:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role == "system":
                parts.append(f"[系统指令]\n{content}\n")
            elif role == "user":
                parts.append(f"[用户]\n{content}\n")
            elif role == "assistant":
                parts.append(f"[助手]\n{content}\n")
        return "\n".join(parts)

    def _extract_json(self, content: str) -> Optional[dict]:
        """Try to extract JSON from the response content."""
        # Try direct JSON parse first
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            pass

        # Try to find JSON in code blocks
        import re
        json_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', content)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        # Try to find JSON object in text
        json_match = re.search(r'\{[\s\S]*\}', content)
        if json_match:
            try:
                return json.loads(json_match.group(0))
            except json.JSONDecodeError:
                pass

        return None

    async def list_models(self, api_key: str, **kwargs) -> list[str]:
        """Coze doesn't have a model list endpoint, return bot_id if configured."""
        bot_id = kwargs.get("bot_id")
        if bot_id:
            return [bot_id]
        return []
