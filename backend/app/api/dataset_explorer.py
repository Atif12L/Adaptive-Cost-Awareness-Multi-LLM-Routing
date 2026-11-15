"""
Dataset Explorer API Endpoint

Provides dataset metadata, column classification, distributions, and
paginated query inspection.
"""

import os
import pandas as pd
from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any

router = APIRouter(prefix="/api/dataset", tags=["Dataset"])

DATASET_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "research", "llm_routing_dataset.csv")
)

# Global cached dataframe for fast query filtering
_cached_df = None


def get_df() -> pd.DataFrame:
    global _cached_df
    if _cached_df is None:
        if os.path.exists(DATASET_PATH):
            _cached_df = pd.read_csv(DATASET_PATH)
        else:
            raise HTTPException(status_code=404, detail="Dataset file not found.")
    return _cached_df


@router.get("/summary")
def get_dataset_summary():
    """Returns dataset summary metrics, distributions, and column taxonomy."""
    df = get_df()

    model_counts = df["recommended_model"].value_counts().to_dict()
    complexity_counts = df["complexity"].value_counts().to_dict()
    category_counts = df["category"].value_counts().head(10).to_dict()
    domain_counts = df["domain"].value_counts().head(10).to_dict()

    avg_tokens = float(df["token_count"].mean())
    max_tokens = int(df["token_count"].max())
    min_tokens = int(df["token_count"].min())

    column_definitions = [
        {"name": "query_id", "type": "ID", "role": "Identifier", "available_at_arrival": True},
        {"name": "query", "type": "Text", "role": "Input Text", "available_at_arrival": True},
        {"name": "category", "type": "Categorical", "role": "Task Classification", "available_at_arrival": True},
        {"name": "domain", "type": "Categorical", "role": "Subject Matter", "available_at_arrival": True},
        {"name": "complexity", "type": "Ordinal", "role": "Query Difficulty", "available_at_arrival": True},
        {"name": "reasoning_level", "type": "Ordinal", "role": "Reasoning Depth", "available_at_arrival": True},
        {"name": "token_count", "type": "Integer", "role": "Prompt Length", "available_at_arrival": True},
        {"name": "context_length", "type": "Integer", "role": "Context Size", "available_at_arrival": True},
        {"name": "requires_code", "type": "Boolean", "role": "Requirement Flag", "available_at_arrival": True},
        {"name": "requires_math", "type": "Boolean", "role": "Requirement Flag", "available_at_arrival": True},
        {"name": "requires_reasoning", "type": "Boolean", "role": "Requirement Flag", "available_at_arrival": True},
        {"name": "requires_creativity", "type": "Boolean", "role": "Requirement Flag", "available_at_arrival": True},
        {"name": "multilingual", "type": "Boolean", "role": "Requirement Flag", "available_at_arrival": True},
        {"name": "urgency", "type": "Ordinal", "role": "User Constraint", "available_at_arrival": True},
        {"name": "budget_priority", "type": "Ordinal", "role": "User Constraint", "available_at_arrival": True},
        {"name": "quality_priority", "type": "Ordinal", "role": "User Constraint", "available_at_arrival": True},
        {"name": "latency_priority", "type": "Ordinal", "role": "User Constraint", "available_at_arrival": True},
        {"name": "best_quality_model", "type": "Categorical", "role": "Target Leakage", "available_at_arrival": False},
        {"name": "lowest_cost_model", "type": "Categorical", "role": "Target Leakage", "available_at_arrival": False},
        {"name": "lowest_latency_model", "type": "Categorical", "role": "Target Leakage", "available_at_arrival": False},
        {"name": "routing_score", "type": "Float", "role": "Target Leakage", "available_at_arrival": False},
        {"name": "recommended_model", "type": "Categorical", "role": "Ground Truth Target", "available_at_arrival": False},
    ]

    return {
        "total_records": len(df),
        "total_columns": len(df.columns),
        "columns": list(df.columns),
        "column_taxonomy": column_definitions,
        "distributions": {
            "recommended_model": model_counts,
            "complexity": complexity_counts,
            "top_categories": category_counts,
            "top_domains": domain_counts,
        },
        "token_statistics": {
            "mean": round(avg_tokens, 1),
            "min": min_tokens,
            "max": max_tokens,
        },
        "missing_values_count": int(df.isnull().sum().sum()),
        "is_synthetic": True,
    }


@router.get("/rows")
def get_dataset_rows(
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=100),
    search: Optional[str] = None,
    category: Optional[str] = None,
    domain: Optional[str] = None,
    complexity: Optional[str] = None,
    model: Optional[str] = None,
):
    """Returns filtered and paginated records from the research dataset."""
    df = get_df()
    filtered = df

    if search:
        filtered = filtered[filtered["query"].astype(str).str.contains(search, case=False, na=False)]
    if category:
        filtered = filtered[filtered["category"] == category]
    if domain:
        filtered = filtered[filtered["domain"] == domain]
    if complexity:
        filtered = filtered[filtered["complexity"] == complexity]
    if model:
        filtered = filtered[filtered["recommended_model"] == model]

    total_matches = len(filtered)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit

    selected_cols = [
        "query_id",
        "query",
        "category",
        "domain",
        "complexity",
        "token_count",
        "quality_priority",
        "budget_priority",
        "latency_priority",
        "recommended_model",
    ]

    records = filtered.iloc[start_idx:end_idx][selected_cols].to_dict(orient="records")

    return {
        "page": page,
        "limit": limit,
        "total_records": total_matches,
        "total_pages": max(1, (total_matches + limit - 1) // limit),
        "records": records,
    }
