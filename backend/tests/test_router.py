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


def test_auto_detect_simple_factual_prompt():
    req = RoutingRequest(
        query="What is the capital of France?",
        auto_detect=True,
    )
    res = router_engine.route_query_sync(req)
    assert res.detected_features is not None
    assert res.detected_features["source"] == "automatic_detection"
    assert res.detected_features["complexity"] == "Easy"
    assert res.detected_features["reasoning_level"] == "Low"
    assert len(res.detected_features["signals"]) > 0


def test_auto_detect_coding_task():
    req = RoutingRequest(
        query="Write a Python script to sort a list of dictionaries by key.",
        auto_detect=True,
    )
    res = router_engine.route_query_sync(req)
    assert res.detected_features is not None
    assert res.detected_features["requires_code"] is True
    assert res.detected_features["complexity"] in ["Medium", "Hard"]


def test_auto_detect_mathematical_problem():
    req = RoutingRequest(
        query="Calculate the eigenvalues of a 2x2 matrix [[2, 1], [1, 2]] and prove orthogonality.",
        auto_detect=True,
    )
    res = router_engine.route_query_sync(req)
    assert res.detected_features is not None
    assert res.detected_features["requires_math"] is True
    assert res.detected_features["complexity"] in ["Hard", "Expert"]
    assert res.detected_features["reasoning_level"] in ["High", "Medium"]


def test_auto_detect_multistep_reasoning():
    req = RoutingRequest(
        query="Analyze the trade-offs between Paxos and Raft consensus algorithms step-by-step for a distributed database under network partitions.",
        auto_detect=True,
    )
    res = router_engine.route_query_sync(req)
    assert res.detected_features is not None
    assert res.detected_features["requires_reasoning"] is True
    assert res.detected_features["complexity"] in ["Hard", "Expert"]
    assert res.detected_features["reasoning_level"] == "High"


def test_manual_override_respected():
    # Prompt is simple factual, but user explicitly overrides to Expert / High
    req = RoutingRequest(
        query="What is the capital of France?",
        auto_detect=False,
        complexity="Expert",
        reasoning_level="High",
    )
    res = router_engine.route_query_sync(req)
    assert res.detected_features is not None
    assert res.detected_features["source"] == "manual_override"
    assert res.detected_features["complexity"] == "Expert"
    assert res.detected_features["reasoning_level"] == "High"
    assert res.feature_contributions["complexity"] == "Expert"
    assert res.feature_contributions["reasoning_level"] == "High"


def test_backward_compatibility_legacy_client():
    # Legacy client without auto_detect field
    req = RoutingRequest(
        query="Evaluate the quadratic formula x = (-b +- sqrt(b^2-4ac)) / (2a).",
        complexity="Medium",
        reasoning_level="Medium",
    )
    res = router_engine.route_query_sync(req)
    assert res.detected_features is not None
    assert res.detected_features["source"] == "manual_override"
    assert res.detected_features["complexity"] == "Medium"
    assert res.detected_features["reasoning_level"] == "Medium"


def test_exact_54_feature_schema_alignment():
    """Strict regression test verifying exact feature names, ordering, and counts

    against the trained model's preprocessor_config.json.
    """
    import json
    from app.core.router_engine import CONFIG_PATH

    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        config = json.load(f)

    categories = config["categories"]
    domains = config["domains"]
    expected_features = config["feature_names"]

    # Verify breakdown
    assert len(categories) == 15, f"Expected 15 categories, got {len(categories)}"
    assert len(domains) == 25, f"Expected 25 domains, got {len(domains)}"
    assert len(expected_features) == 54, f"Expected 54 feature names, got {len(expected_features)}"

    # Reconstruct feature names produced by transform_request
    generated_names = [
        "token_count", "context_length", "char_length",
        "complexity_ord", "reasoning_level_ord", "urgency_ord",
        "budget_priority_ord", "quality_priority_ord", "latency_priority_ord",
        "requires_code", "requires_math", "requires_reasoning",
        "requires_creativity", "multilingual",
    ]
    for cat in categories:
        generated_names.append(f"category_{cat}")
    for dom in domains:
        generated_names.append(f"domain_{dom}")

    assert generated_names == expected_features, "Feature names or order do not match preprocessor_config.json"

    # Verify vector output shape and type
    req = RoutingRequest(
        query="Unit test query for feature schema verification",
        category="Code Generation",
        domain="Software Engineering",
    )
    vec = router_engine.transform_request(req)
    assert vec.shape == (1, 54)
