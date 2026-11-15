"""
Unit and Integration Tests for Router and Simulation Engine
"""

import pytest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.schemas import RoutingRequest
from app.core.router_engine import router_engine
from app.core.simulation import calculate_simulation_metrics, PROVIDER_PRICING


def test_router_engine_execution():
    req = RoutingRequest(
        query="Write an asynchronous web scraper in Python to extract product prices and store them in PostgreSQL.",
        category="Code Generation",
        domain="Programming",
        complexity="Hard",
        reasoning_level="High",
        requires_code=True,
        requires_math=False,
        requires_reasoning=True,
        quality_priority="High",
        budget_priority="Low",
        latency_priority="Low",
        routing_mode="simulation",
    )

    res = router_engine.route_query_sync(req)

    assert res is not None
    assert res.selected_model in [m["model_id"] for m in PROVIDER_PRICING.values()]
    assert res.model_family in ["GPT", "Claude", "Gemini", "Llama", "DeepSeek"]
    assert 0.0 <= res.confidence <= 1.0
    assert len(res.probabilities) == 5
    assert res.estimated_cost > 0
    assert res.baseline_cost > 0
    assert res.estimated_latency_ms > 0
    assert len(res.explanation) > 10
    assert len(res.reasons) >= 1


def test_simulation_metrics():
    metrics = calculate_simulation_metrics(
        routed_family="Llama",
        query_text="Summarize the key differences between monolithic and microservices architecture.",
    )

    assert metrics["input_tokens"] > 0
    assert metrics["output_tokens"] > 0
    assert metrics["estimated_cost_usd"] < metrics["baseline_cost_usd"]
    assert metrics["cost_savings_percent"] > 0
    assert metrics["estimated_latency_ms"] < metrics["baseline_latency_ms"]
    assert metrics["latency_savings_percent"] > 0


def test_budget_priority_shifts_to_economy_model():
    req = RoutingRequest(
        query="Quickly check if the string format is valid JSON.",
        category="Code Review",
        domain="Programming",
        complexity="Easy",
        budget_priority="High",
        latency_priority="High",
        quality_priority="Low",
        routing_mode="simulation",
    )

    res = router_engine.route_query_sync(req)
    assert res is not None
    assert res.model_family in ["GPT", "Claude", "Gemini", "Llama", "DeepSeek"]
    assert res.cost_savings_percent >= 0.0
