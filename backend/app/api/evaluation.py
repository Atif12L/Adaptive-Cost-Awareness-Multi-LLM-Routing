"""
Model Evaluation and Benchmark Comparison Endpoint
"""

import os
import json
from fastapi import APIRouter
from typing import Dict, Any

router = APIRouter(prefix="/api", tags=["Evaluation"])

ARTIFACTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml_pipeline", "artifacts")
)


@router.get("/evaluation")
def get_model_evaluation():
    """Returns side-by-side comparison of historical thesis reported results

    against the newly validated leakage-free implementation.
    """
    historical_path = os.path.join(ARTIFACTS_DIR, "historical_metrics.json")
    corrected_path = os.path.join(ARTIFACTS_DIR, "corrected_metrics.json")
    importance_path = os.path.join(ARTIFACTS_DIR, "feature_importance.json")
    cm_path = os.path.join(ARTIFACTS_DIR, "confusion_matrix.json")

    historical_data = {}
    if os.path.exists(historical_path):
        with open(historical_path, "r", encoding="utf-8") as f:
            historical_data = json.load(f)

    corrected_data = {}
    if os.path.exists(corrected_path):
        with open(corrected_path, "r", encoding="utf-8") as f:
            corrected_data = json.load(f)

    feature_importance = []
    if os.path.exists(importance_path):
        with open(importance_path, "r", encoding="utf-8") as f:
            feature_importance = json.load(f)

    confusion_matrix_data = {}
    if os.path.exists(cm_path):
        with open(cm_path, "r", encoding="utf-8") as f:
            confusion_matrix_data = json.load(f)

    return {
        "historical_reported": historical_data,
        "corrected_validated": corrected_data,
        "feature_importance": feature_importance[:15],
        "confusion_matrix": confusion_matrix_data,
        "comparison_summary": {
            "key_distinction": "Historical model included target-leakage features (best_quality_model, routing_score). Corrected model uses strictly arrival-time metadata.",
            "leakage_features_excluded": [
                "best_quality_model (one-hot across 5 classes)",
                "lowest_cost_model",
                "lowest_latency_model",
                "routing_score",
                "gpt_quality_score, claude_quality_score, gemini_quality_score, llama_quality_score, deepseek_quality_score",
                "gpt_cost, claude_cost, gemini_cost, llama_cost, deepseek_cost",
                "gpt_latency, claude_latency, gemini_latency, llama_latency, deepseek_latency",
            ],
            "arrival_features_used_count": corrected_data.get("total_features", 54),
            "historical_features_count": historical_data.get("total_features", 82),
        },
    }
