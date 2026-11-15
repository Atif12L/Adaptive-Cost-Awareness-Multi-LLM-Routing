"""
Provider Adapter Factory
"""

from typing import Dict, Optional
from ..config import settings
from .base import BaseLLMProvider
from .openai_provider import OpenAIProvider
from .anthropic_provider import AnthropicProvider
from .gemini_provider import GeminiProvider
from .llama_provider import LlamaProvider
from .deepseek_provider import DeepSeekProvider


class ProviderFactory:
    """Factory for initializing and retrieving provider adapters."""

    def __init__(self):
        self._providers: Dict[str, BaseLLMProvider] = {
            "GPT": OpenAIProvider(api_key=settings.OPENAI_API_KEY),
            "Claude": AnthropicProvider(api_key=settings.ANTHROPIC_API_KEY),
            "Gemini": GeminiProvider(api_key=settings.GOOGLE_API_KEY),
            "Llama": LlamaProvider(api_key=settings.GROQ_API_KEY),
            "DeepSeek": DeepSeekProvider(api_key=settings.DEEPSEEK_API_KEY),
        }

    def get_provider(self, family: str) -> BaseLLMProvider:
        clean_key = family.strip().capitalize()
        if clean_key not in self._providers:
            # Fallback matching
            for k in self._providers:
                if k.lower() in family.lower():
                    return self._providers[k]
            return self._providers["GPT"]
        return self._providers[clean_key]

    def get_all_providers(self) -> Dict[str, BaseLLMProvider]:
        return self._providers


provider_factory = ProviderFactory()
