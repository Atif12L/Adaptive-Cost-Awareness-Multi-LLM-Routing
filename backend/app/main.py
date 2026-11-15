"""
FastAPI Application Entry Point
Adaptive Cost-Aware Semantic Routing Gateway
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from .config import settings
from .core.router_engine import router_engine
from .api.health import router as health_router
from .api.routing import router as routing_router
from .api.models_info import router as models_router
from .api.analytics import router as analytics_router
from .api.dataset_explorer import router as dataset_router
from .api.evaluation import router as evaluation_router


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Intelligent multi-LLM routing gateway balancing query semantics, operational cost, and latency.",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include API Routers
app.include_router(health_router)
app.include_router(routing_router)
app.include_router(models_router)
app.include_router(analytics_router)
app.include_router(dataset_router)
app.include_router(evaluation_router)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs_url": "/docs",
        "health_url": "/api/health",
        "description": "Production research gateway for adaptive multi-LLM semantic routing.",
    }
