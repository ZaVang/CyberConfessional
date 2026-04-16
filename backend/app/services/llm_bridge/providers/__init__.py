"""
LLM Bridge — Provider registry.

Import and register all available provider adapters here.
"""

from .anthropic_provider import AnthropicProvider
from .base import BaseProvider
from .coze_provider import CozeProvider
from .google_provider import GoogleProvider
from .openai_provider import OpenAIProvider

# Maps lowercase provider identifiers to their adapter class.
PROVIDER_REGISTRY: dict[str, type[BaseProvider]] = {
    "openai": OpenAIProvider,
    "anthropic": AnthropicProvider,
    "google": GoogleProvider,
    "vertexai": GoogleProvider,  # same adapter, different init params
    "coze": CozeProvider,  # Coze Bot API provider
}

__all__ = [
    "BaseProvider",
    "OpenAIProvider",
    "AnthropicProvider",
    "GoogleProvider",
    "CozeProvider",
    "PROVIDER_REGISTRY",
]
