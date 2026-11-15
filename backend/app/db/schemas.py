"""
Pydantic Schemas for Routing API Requests and Responses
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class RoutingRequest(BaseModel):
    query: str = Field(..., description="The user prompt or query text to route")
    category: Optional[str] = Field("Conceptual Question", description="Task category")
    domain: Optional[str] = Field("General", description="Subject domain")
    complexity: Optional[str] = Field("Medium", description="Complexity level: Easy, Medium, Hard, Expert")
    reasoning_level: Optional[str] = Field("Medium", description="Reasoning required: Low, Medium, High")
    urgency: Optional[str] = Field("Medium", description="Urgency priority: Low, Medium, High")
    budget_priority: Optional[str] = Field("Medium", description="Budget sensitivity: Low, Medium, High")
    quality_priority: Optional[str] = Field("High", description="Quality priority: Low, Medium, High")
    latency_priority: Optional[str] = Field("Low", description="Latency priority: Low, Medium, High")
    requires_code: Optional[bool] = Field(False, description="Whether query requires code synthesis/debugging")
    requires_math: Optional[bool] = Field(False, description="Whether query requires math calculation")
    requires_reasoning: Optional[bool] = Field(False, description="Whether query requires multi-step deduction")
    requires_creativity: Optional[bool] = Field(False, description="Whether query requires creative generation")
    multilingual: Optional[bool] = Field(False, description="Whether query involves multiple languages")
    routing_mode: Optional[str] = Field("simulation", description="'simulation' (default) or 'live'")


class ModelConfidence(BaseModel):
    model: str
    probability: float


class RoutingResponse(BaseModel):
    query_id: str
    selected_model: str
    model_family: str
    display_name: str
    confidence: float
    probabilities: List[ModelConfidence]
    routing_mode: str
    explanation: str
    reasons: List[str]
    estimated_cost: float
    estimated_latency_ms: int
    baseline_cost: float
    baseline_latency_ms: int
    cost_savings_percent: float
    latency_savings_percent: float
    feature_contributions: Dict[str, Any]
    response_text: Optional[str] = None
    is_live_call: bool = False
    warning: Optional[str] = None


class ModelInfo(BaseModel):
    family: str
    model_id: str
    display_name: str
    provider: str
    cost_per_1k_input: float
    cost_per_1k_output: float
    typical_latency_ms: int
    context_window: int
    strengths: List[str]
    description: str
    is_available_live: bool


class BenchmarkMetrics(BaseModel):
    model_name: str
    is_leakage_free: bool
    accuracy: float
    f1_weighted: float
    precision_weighted: float
    recall_weighted: float
    cv_f1_mean: Optional[float] = None
    cv_f1_std: Optional[float] = None
    cost_reduction_percent: float
    latency_reduction_percent: float
    total_features: int
    notes: str
    top_features: List[Dict[str, Any]]
