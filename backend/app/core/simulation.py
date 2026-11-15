"""
Cost & Latency Simulation Engine

Defines standard commercial pricing models and calculates economic
and latency metrics for baseline vs routed queries.
"""

from typing import Dict, Any, Tuple

# Commercial 2026 pricing benchmarks (USD per 1,000 tokens)
PROVIDER_PRICING = {
    "GPT": {
        "model_id": "gpt-4o",
        "display_name": "OpenAI GPT-4o",
        "input_per_1k": 0.002500,
        "output_per_1k": 0.010000,
        "blended_per_1k": 0.005000,
        "typical_latency_ms": 1450,
        "tier": "Premium",
    },
    "Claude": {
        "model_id": "claude-3-5-sonnet",
        "display_name": "Anthropic Claude 3.5 Sonnet",
        "input_per_1k": 0.003000,
        "output_per_1k": 0.015000,
        "blended_per_1k": 0.006000,
        "typical_latency_ms": 1650,
        "tier": "Premium",
    },
    "Gemini": {
        "model_id": "gemini-1-5-pro",
        "display_name": "Google Gemini 1.5 Pro",
        "input_per_1k": 0.001250,
        "output_per_1k": 0.005000,
        "blended_per_1k": 0.002500,
        "typical_latency_ms": 1100,
        "tier": "Standard",
    },
    "Llama": {
        "model_id": "llama-3-3-70b-versatile",
        "display_name": "Meta Llama 3.3 70B",
        "input_per_1k": 0.000590,
        "output_per_1k": 0.000790,
        "blended_per_1k": 0.000700,
        "typical_latency_ms": 380,
        "tier": "Economy",
    },
    "DeepSeek": {
        "model_id": "deepseek-v3",
        "display_name": "DeepSeek V3 / R1",
        "input_per_1k": 0.000140,
        "output_per_1k": 0.000280,
        "blended_per_1k": 0.000200,
        "typical_latency_ms": 850,
        "tier": "Economy",
    },
}

# The baseline model against which savings are measured
BASELINE_FAMILY = "Claude"  # Default premium model


def estimate_tokens(query_text: str) -> Tuple[int, int]:
    """Estimates input and output tokens from raw query text."""
    words = len(query_text.strip().split())
    char_len = len(query_text.strip())
    # Standard rule of thumb: ~4 characters or ~0.75 words per token
    in_tokens = max(10, int(max(words * 1.33, char_len / 4.0)))
    # Output tokens scaled based on query complexity/length
    out_tokens = max(60, int(in_tokens * 1.5))
    return in_tokens, out_tokens


def calculate_simulation_metrics(
    routed_family: str,
    query_text: str,
    token_count: int = None,
) -> Dict[str, Any]:
    """Calculates estimated costs, latencies, and savings comparing

    the routed model to the always-large baseline.
    """
    if token_count and token_count > 0:
        in_tokens = token_count
        out_tokens = max(50, int(token_count * 1.2))
    else:
        in_tokens, out_tokens = estimate_tokens(query_text)

    clean_family = routed_family.capitalize()
    if clean_family not in PROVIDER_PRICING:
        clean_family = "GPT"

    routed_meta = PROVIDER_PRICING[clean_family]
    baseline_meta = PROVIDER_PRICING[BASELINE_FAMILY]

    # Calculate monetary costs
    routed_cost = (in_tokens / 1000.0) * routed_meta["input_per_1k"] + (out_tokens / 1000.0) * routed_meta["output_per_1k"]
    baseline_cost = (in_tokens / 1000.0) * baseline_meta["input_per_1k"] + (out_tokens / 1000.0) * baseline_meta["output_per_1k"]

    # Latencies
    routed_latency = routed_meta["typical_latency_ms"]
    baseline_latency = baseline_meta["typical_latency_ms"]

    # Cost savings
    cost_saved = max(0.0, baseline_cost - routed_cost)
    cost_savings_pct = ((baseline_cost - routed_cost) / baseline_cost) * 100.0 if baseline_cost > 0 else 0.0

    # Latency savings
    latency_reduction_ms = max(0, baseline_latency - routed_latency)
    latency_savings_pct = ((baseline_latency - routed_latency) / baseline_latency) * 100.0 if baseline_latency > 0 else 0.0

    return {
        "input_tokens": in_tokens,
        "output_tokens": out_tokens,
        "total_tokens": in_tokens + out_tokens,
        "routed_family": clean_family,
        "routed_model_id": routed_meta["model_id"],
        "routed_display_name": routed_meta["display_name"],
        "estimated_cost_usd": round(routed_cost, 6),
        "baseline_cost_usd": round(baseline_cost, 6),
        "cost_saved_usd": round(cost_saved, 6),
        "cost_savings_percent": round(cost_savings_pct, 2),
        "estimated_latency_ms": routed_latency,
        "baseline_latency_ms": baseline_latency,
        "latency_reduction_ms": latency_reduction_ms,
        "latency_savings_percent": round(latency_savings_pct, 2),
        "routed_tier": routed_meta["tier"],
    }
