"""
Routing Endpoint (POST /api/route)
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from ..db.schemas import RoutingRequest, RoutingResponse
from ..core.router_engine import router_engine
from ..db.supabase_client import supabase_client

router = APIRouter(prefix="/api", tags=["Routing"])


@router.post("/route", response_model=RoutingResponse)
async def route_query_endpoint(request: RoutingRequest, background_tasks: BackgroundTasks):
    """Evaluates query attributes, selects optimal candidate LLM,

    calculates cost and latency trade-offs, and returns decision explanation.
    """
    if not request.query or not request.query.strip():
        raise HTTPException(status_code=400, detail="Query text cannot be empty.")

    try:
        response = await router_engine.route_query(request)

        # Log asynchronously to Supabase
        db_payload = {
            "query_text": request.query[:500],
            "category": response.feature_contributions.get("category", request.category),
            "domain": response.feature_contributions.get("domain", request.domain),
            "complexity": response.feature_contributions.get("complexity", request.complexity),
            "reasoning_level": response.feature_contributions.get("reasoning_level", request.reasoning_level),
            "urgency": request.urgency,
            "budget_priority": request.budget_priority,
            "quality_priority": request.quality_priority,
            "latency_priority": request.latency_priority,
            "requires_code": request.requires_code,
            "requires_math": request.requires_math,
            "requires_reasoning": request.requires_reasoning,
            "requires_creativity": request.requires_creativity,
            "multilingual": request.multilingual,
            "routed_model_family": response.model_family,
            "routed_model_id": response.selected_model,
            "confidence_score": response.confidence,
            "routing_mode": response.routing_mode,
            "routing_reasoning": response.explanation,
            "estimated_cost": response.estimated_cost,
            "estimated_latency_ms": response.estimated_latency_ms,
            "baseline_cost": response.baseline_cost,
            "baseline_latency_ms": response.baseline_latency_ms,
            "cost_saved": round(max(0.0, response.baseline_cost - response.estimated_cost), 6),
            "execution_status": "success" if response.is_live_call else "simulated",
            "response_text": (response.response_text or "")[:1000],
        }
        background_tasks.add_task(supabase_client.log_routing_request, db_payload)

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Routing execution error: {str(e)}")
