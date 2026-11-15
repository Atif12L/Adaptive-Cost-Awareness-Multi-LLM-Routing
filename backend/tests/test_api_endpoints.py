"""
FastAPI End-to-End Endpoint Function Tests
Tests all route functions directly with zero transport latency or event loop deadlocks.
"""

import os
import sys
import asyncio
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.api.health import get_health
from app.api.models_info import get_models
from app.api.evaluation import get_model_evaluation
from app.api.dataset_explorer import get_dataset_summary, get_dataset_rows
from app.api.analytics import get_analytics
from app.core.router_engine import router_engine
from app.db.schemas import RoutingRequest


def test_health_endpoint():
    data = get_health()
    assert data["status"] == "healthy"
    assert "ml_engine" in data
    assert data["ml_engine"]["status"] == "operational"
    assert data["providers"]["total_supported"] == 5


def test_models_endpoint():
    models = get_models()
    assert len(models) == 5
    families = {m.family for m in models}
    assert families == {"GPT", "Claude", "Gemini", "Llama", "DeepSeek"}
    for m in models:
        assert m.cost_per_1k_input >= 0
        assert m.typical_latency_ms > 0


def test_routing_endpoint():
    req = RoutingRequest(
        query="Develop an end-to-end sentiment classification model in PyTorch with transformer embeddings.",
        category="Machine Learning",
        domain="Data Science",
        complexity="Hard",
        reasoning_level="High",
        requires_code=True,
        requires_math=False,
        quality_priority="High",
        budget_priority="Medium",
        latency_priority="Low",
        routing_mode="simulation",
    )
    res = router_engine.route_query_sync(req)
    assert res is not None
    assert res.model_family in ["GPT", "Claude", "Gemini", "Llama", "DeepSeek"]
    assert res.estimated_cost > 0
    assert len(res.reasons) > 0
    assert 0.0 <= res.confidence <= 1.0


def test_evaluation_endpoint():
    eval_data = get_model_evaluation()
    assert eval_data["historical_reported"]["accuracy"] == 0.9770
    assert eval_data["historical_reported"]["cost_reduction_percent"] == 53.34
    assert eval_data["historical_reported"]["latency_reduction_percent"] == 41.84
    assert eval_data["corrected_validated"]["accuracy"] > 0.50
    assert eval_data["corrected_validated"]["cost_simulation"]["cost_reduction_percent"] > 40.0
    assert eval_data["corrected_validated"]["latency_simulation"]["latency_reduction_percent"] > 30.0
    assert "feature_importance" in eval_data
    assert len(eval_data["feature_importance"]) > 5
    assert "confusion_matrix" in eval_data
    assert len(eval_data["confusion_matrix"]["classes"]) == 5


def test_dataset_summary_endpoint():
    summary = get_dataset_summary()
    assert summary["total_records"] == 30000
    assert summary["total_columns"] == 37
    assert len(summary["distributions"]["recommended_model"]) == 5
    assert len(summary["columns"]) == 37
    assert summary["missing_values_count"] == 0


def test_dataset_rows_endpoint():
    res = get_dataset_rows(page=1, limit=5)
    assert len(res["records"]) == 5
    assert res["page"] == 1
    assert res["total_pages"] == 6000


def test_analytics_endpoint():
    res = get_analytics()
    assert "summary" in res
    assert "category_cost_comparison" in res
    assert "complexity_breakdown" in res
    assert "model_distribution" in res
