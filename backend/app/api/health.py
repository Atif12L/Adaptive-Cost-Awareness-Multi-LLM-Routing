"""
Health Check and System Status Endpoint
"""

import os
from fastapi import APIRouter
from ..config import settings
from ..core.router_engine import router_engine
from ..db.supabase_client import supabase_client
from ..providers.factory import provider_factory

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health")
def get_health():
    """Returns comprehensive system health status and configuration."""
    providers = provider_factory.get_all_providers()
    configured_providers = [k for k, p in providers.items() if p.is_configured]

    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "ml_engine": {
            "status": "operational" if router_engine.is_ml_loaded else "heuristic_fallback",
            "model_type": "XGBClassifier (Leakage-Free Multi-Class)",
            "classes": ["Claude", "DeepSeek", "GPT", "Gemini", "Llama"],
            "model_loaded": router_engine.is_ml_loaded,
        },
        "database": {
            "provider": "Supabase PostgreSQL",
            "connected": supabase_client.is_configured,
            "project_url": settings.SUPABASE_URL,
        },
        "providers": {
            "total_supported": len(providers),
            "live_configured": configured_providers,
            "simulation_mode_active": True,
        },
    }
