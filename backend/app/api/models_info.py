"""
Model Profiles and Capabilities Endpoint
"""

from fastapi import APIRouter
from typing import List
from ..db.schemas import ModelInfo
from ..core.simulation import PROVIDER_PRICING
from ..providers.factory import provider_factory

router = APIRouter(prefix="/api", tags=["Models"])

DESCRIPTIONS = {
    "GPT": "State-of-the-art multimodal powerhouse developed by OpenAI, optimized for complex multi-turn logic and strict instruction following.",
    "Claude": "Industry-leading frontier reasoning and code generation model by Anthropic, renowned for high architectural fidelity and deep comprehension.",
    "Gemini": "Google's versatile frontier engine featuring industry-leading multimodal token context windows and balanced economics.",
    "Llama": "Meta's open-weights model hosted on ultra-high throughput infrastructure, providing sub-second inference at a fraction of premium costs.",
    "DeepSeek": "Breakthrough economic model by DeepSeek engineered with mixture-of-experts for mathematical derivation and code synthesis.",
}

STRENGTHS = {
    "GPT": ["Multi-step Deduction", "Factual Knowledge", "Structured Output", "Complex Math"],
    "Claude": ["Code Synthesis", "Nuanced Writing", "Agentic Pipelines", "Long-form Editing"],
    "Gemini": ["Massive Context (2M tokens)", "Document Summarization", "Multimodal Analysis", "Data Extraction"],
    "Llama": ["Sub-second Latency (380ms)", "Ultra-low Cost", "High-throughput Batching", "Concise Utility"],
    "DeepSeek": ["Algorithmic Reasoning", "Deep Code Generation", "Extreme Cost Efficiency", "Analytical Rigor"],
}

CONTEXT_WINDOWS = {
    "GPT": 128000,
    "Claude": 200000,
    "Gemini": 2000000,
    "Llama": 128000,
    "DeepSeek": 64000,
}

PROVIDERS = {
    "GPT": "OpenAI",
    "Claude": "Anthropic",
    "Gemini": "Google",
    "Llama": "Meta / Groq",
    "DeepSeek": "DeepSeek",
}


@router.get("/models", response_model=List[ModelInfo])
def get_models():
    """Returns profiles, pricing, latency, and capability profiles of all 5 supported LLM families."""
    models = []
    providers = provider_factory.get_all_providers()

    for family, meta in PROVIDER_PRICING.items():
        is_live = providers[family].is_configured if family in providers else False
        models.append(
            ModelInfo(
                family=family,
                model_id=meta["model_id"],
                display_name=meta["display_name"],
                provider=PROVIDERS.get(family, "Unknown"),
                cost_per_1k_input=meta["input_per_1k"],
                cost_per_1k_output=meta["output_per_1k"],
                typical_latency_ms=meta["typical_latency_ms"],
                context_window=CONTEXT_WINDOWS.get(family, 128000),
                strengths=STRENGTHS.get(family, []),
                description=DESCRIPTIONS.get(family, ""),
                is_available_live=is_live,
            )
        )
    return models
