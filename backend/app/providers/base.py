"""
Base Provider Interface for LLM execution and simulation
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from pydantic import BaseModel


class ProviderExecutionResult(BaseModel):
    model_name: str
    provider: str
    response_text: str
    input_tokens: int
    output_tokens: int
    total_tokens: int
    cost_usd: float
    latency_ms: int
    is_simulated: bool
    status: str
    error_message: Optional[str] = None


class BaseLLMProvider(ABC):
    """Abstract base class for LLM provider adapters."""

    def __init__(self, model_id: str, family: str, display_name: str, api_key: Optional[str] = None):
        self.model_id = model_id
        self.family = family
        self.display_name = display_name
        self.api_key = api_key

    @property
    def is_configured(self) -> bool:
        """Returns True if the provider has valid API credentials configured."""
        return bool(self.api_key and len(self.api_key.strip()) > 5)

    @abstractmethod
    async def generate_response(self, prompt: str, system_prompt: Optional[str] = None) -> ProviderExecutionResult:
        """Executes a real generation request to the provider API."""
        pass

    @abstractmethod
    def simulate_response(self, prompt: str, token_estimate: int) -> ProviderExecutionResult:
        """Generates a realistic simulated response without invoking external APIs."""
        pass
