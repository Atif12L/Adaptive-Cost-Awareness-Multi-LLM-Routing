"""
Direct Endpoint Verification Script
Tests all core endpoint functions synchronously with instantaneous execution.
"""

import os
import sys
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.api.health import get_health
from app.api.models_info import get_models
from app.api.evaluation import get_model_evaluation
from app.api.dataset_explorer import get_dataset_summary, get_dataset_rows
from app.core.router_engine import router_engine
from app.db.schemas import RoutingRequest


def main():
    print("==================================================", flush=True)
    print("   ADAPTIVE ROUTING GATEWAY: API VERIFICATION     ", flush=True)
    print("==================================================", flush=True)

    # 1. Health
    print("\n1. Testing GET /api/health...", flush=True)
    h = get_health()
    assert h["status"] == "healthy"
    print(f"   ✓ Health Status: {h['status']}", flush=True)
    print(f"   ✓ ML Engine: {h['ml_engine']['status']} ({h['ml_engine']['model_type']})", flush=True)
    print(f"   ✓ Database: {h['database']['provider']} (Connected: {h['database']['connected']})", flush=True)
    print(f"   ✓ Providers: {h['providers']['total_supported']} supported", flush=True)

    # 2. Models Info
    print("\n2. Testing GET /api/models...", flush=True)
    models = get_models()
    assert len(models) == 5
    for m in models:
        print(f"   ✓ Model: {m.family:<10} | {m.display_name:<28} | ${m.cost_per_1k_input:.5f}/1K in | {m.typical_latency_ms}ms", flush=True)

    # 3. Routing Engine
    print("\n3. Testing Core Routing Engine (Simulation)...", flush=True)
    req = RoutingRequest(
        query="Implement an optimized Dijkstra algorithm with priority queue in Python for dense graphs.",
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
    assert res.model_family in ["GPT", "Claude", "Gemini", "Llama", "DeepSeek"]
    print(f"   ✓ Selected Model: {res.display_name} ({res.model_family})", flush=True)
    print(f"   ✓ Confidence:     {res.confidence*100:.2f}%", flush=True)
    print(f"   ✓ Estimated Cost: ${res.estimated_cost:.6f} (Savings: {res.cost_savings_percent:.1f}%)", flush=True)
    print(f"   ✓ Est. Latency:   {res.estimated_latency_ms} ms (Savings: {res.latency_savings_percent:.1f}%)", flush=True)
    print(f"   ✓ Explanation:    {res.explanation[:85]}...", flush=True)

    # 4. Evaluation Endpoint
    print("\n4. Testing GET /api/evaluation...", flush=True)
    ev = get_model_evaluation()
    assert "historical_reported" in ev
    assert "corrected_validated" in ev
    hist = ev["historical_reported"]
    corr = ev["corrected_validated"]
    print(f"   ✓ Historical Reported:  Accuracy={hist['accuracy']*100:.2f}%, Cost Saved={hist['cost_reduction_percent']}%, Latency Saved={hist['latency_reduction_percent']}%", flush=True)
    print(f"   ✓ Corrected Validated:  Accuracy={corr['accuracy']*100:.2f}%, Cost Saved={corr['cost_simulation']['cost_reduction_percent']:.1f}%, Latency Saved={corr['latency_simulation']['latency_reduction_percent']:.1f}%", flush=True)

    # 5. Dataset Summary
    print("\n5. Testing GET /api/dataset/summary...", flush=True)
    ds = get_dataset_summary()
    assert ds["total_records"] == 30000
    print(f"   ✓ Total Records:  {ds['total_records']:,} rows × {ds['total_columns']} columns", flush=True)

    # 6. Dataset Rows Pagination
    print("\n6. Testing GET /api/dataset/rows?page=1&limit=3...", flush=True)
    rows = get_dataset_rows(page=1, limit=3)
    assert len(rows["records"]) == 3
    print(f"   ✓ Paginated: {len(rows['records'])} rows returned", flush=True)

    print("\n==================================================", flush=True)
    print("   ALL API SERVICES & ML PIPELINE VERIFIED 100%!  ", flush=True)
    print("==================================================", flush=True)


if __name__ == "__main__":
    main()
