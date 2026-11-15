"""
FastAPI End-to-End Endpoint Tests using AsyncClient
"""

import os
import sys
import asyncio
import httpx
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from app.main import app


async def run_all_tests():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as client:
        # 1. Root
        res = await client.get("/")
        assert res.status_code == 200
        assert "name" in res.json()
        print("  ✓ Root endpoint passed", flush=True)

        # 2. Health
        res = await client.get("/api/health")
        assert res.status_code == 200
        assert res.json()["status"] == "healthy"
        print("  ✓ Health endpoint passed", flush=True)

        # 3. Models
        res = await client.get("/api/models")
        assert res.status_code == 200
        models = res.json()
        assert len(models) == 5
        print("  ✓ Models endpoint passed (5 LLMs verified)", flush=True)

        # 4. Routing
        payload = {
            "query": "Develop an end-to-end sentiment classification model in PyTorch with transformer embeddings.",
            "category": "Machine Learning",
            "domain": "Data Science",
            "complexity": "Hard",
            "reasoning_level": "High",
            "requires_code": True,
            "requires_math": False,
            "quality_priority": "High",
            "budget_priority": "Medium",
            "latency_priority": "Low",
            "routing_mode": "simulation",
        }
        res = await client.post("/api/route", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["model_family"] in ["GPT", "Claude", "Gemini", "Llama", "DeepSeek"]
        assert data["estimated_cost"] > 0
        assert len(data["reasons"]) > 0
        print(f"  ✓ Route endpoint passed (Routed to {data['display_name']} with {data['confidence']*100:.1f}% confidence)", flush=True)

        # 5. Evaluation
        res = await client.get("/api/evaluation")
        assert res.status_code == 200
        eval_data = res.json()
        assert eval_data["historical_reported"]["accuracy"] == 0.9770
        assert eval_data["corrected_validated"]["accuracy"] > 0.50
        print(f"  ✓ Evaluation endpoint passed (Historical: 97.70% vs Corrected: {eval_data['corrected_validated']['accuracy']*100:.2f}%)", flush=True)

        # 6. Dataset Summary
        res = await client.get("/api/dataset/summary")
        assert res.status_code == 200
        assert res.json()["total_records"] == 30000
        print("  ✓ Dataset summary endpoint passed (30,000 records verified)", flush=True)

        # 7. Dataset Rows
        res = await client.get("/api/dataset/rows?page=1&limit=5")
        assert res.status_code == 200
        assert len(res.json()["records"]) == 5
        print("  ✓ Dataset rows pagination endpoint passed", flush=True)

        # 8. Analytics
        res = await client.get("/api/analytics")
        assert res.status_code == 200
        assert "summary" in res.json()
        print("  ✓ Analytics endpoint passed", flush=True)


if __name__ == "__main__":
    print("Starting FastAPI ASGI Test Suite...", flush=True)
    asyncio.run(run_all_tests())
    print("\n=== ALL FASTAPI API ENDPOINTS VERIFIED & WORKING 100%! ===", flush=True)
