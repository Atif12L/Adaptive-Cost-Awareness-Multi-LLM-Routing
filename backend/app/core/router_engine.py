"""
Intelligent Routing Engine

Loads the trained leakage-free XGBoost model, prepares arrival-time feature
vectors using preprocessor_config.json, generates model probability distributions,
and constructs human-interpretable decision explanations.
"""

import os
import sys
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
import uuid
import json
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
import joblib

from ..db.schemas import RoutingRequest, RoutingResponse, ModelConfidence
from ..providers.factory import provider_factory
from .simulation import calculate_simulation_metrics, PROVIDER_PRICING
from .prompt_analyzer import prompt_analyzer

ARTIFACTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "..", "ml_pipeline", "artifacts")
)
MODEL_PATH = os.path.join(ARTIFACTS_DIR, "corrected_model.joblib")
MODEL_UBJ_PATH = os.path.join(ARTIFACTS_DIR, "corrected_model.ubj")
CONFIG_PATH = os.path.join(ARTIFACTS_DIR, "preprocessor_config.json")

ORDINAL_MAPPINGS = {
    "complexity": {"Easy": 0, "Medium": 1, "Hard": 2, "Expert": 3},
    "reasoning_level": {"Low": 0, "Medium": 1, "High": 2},
    "urgency": {"Low": 0, "Medium": 1, "High": 2},
    "budget_priority": {"Low": 0, "Medium": 1, "High": 2},
    "quality_priority": {"Low": 0, "Medium": 1, "High": 2},
    "latency_priority": {"Low": 0, "Medium": 1, "High": 2},
}


class RouterEngine:
    def __init__(self):
        self.model = None
        self.config = None
        self.is_ml_loaded = False
        self._load_artifacts()

    def _load_artifacts(self):
        if os.path.exists(CONFIG_PATH):
            try:
                with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                    self.config = json.load(f)
            except Exception as e:
                print(f"RouterEngine: Failed to read preprocessor config: {e}")

        if os.path.exists(MODEL_UBJ_PATH) and self.config:
            try:
                from xgboost import XGBClassifier
                self.model = XGBClassifier()
                self.model.load_model(MODEL_UBJ_PATH)
                self.is_ml_loaded = True
                print("RouterEngine: Successfully loaded trained XGBoost model (UBJ format).")
            except Exception as e:
                print(f"RouterEngine Warning: Failed to load UBJ model: {e}")
                if os.path.exists(MODEL_PATH):
                    try:
                        self.model = joblib.load(MODEL_PATH)
                        self.is_ml_loaded = True
                    except Exception:
                        self.is_ml_loaded = False
        elif os.path.exists(MODEL_PATH) and self.config:
            try:
                self.model = joblib.load(MODEL_PATH)
                self.is_ml_loaded = True
                print("RouterEngine: Successfully loaded trained XGBoost model (joblib).")
            except Exception as e:
                print(f"RouterEngine Warning: Failed to load model artifact: {e}")
                self.is_ml_loaded = False
        else:
            print("RouterEngine: Model artifacts not found yet; will use heuristic fallback.")

    def reload_model(self):
        self._load_artifacts()

    def transform_request(self, req: RoutingRequest) -> np.ndarray:
        """Transforms incoming RoutingRequest into 54-dimensional feature array."""
        char_len = len(req.query.strip())
        words = len(req.query.strip().split())
        token_count = max(10, int(words * 1.33))
        context_len = 0

        row = []
        # 1. Numeric
        row.extend([float(token_count), float(context_len), float(char_len)])

        # 2. Ordinals
        comp_val = ORDINAL_MAPPINGS["complexity"].get(str(req.complexity).capitalize(), 1)
        reas_val = ORDINAL_MAPPINGS["reasoning_level"].get(str(req.reasoning_level).capitalize(), 1)
        urg_val = ORDINAL_MAPPINGS["urgency"].get(str(req.urgency).capitalize(), 1)
        bud_val = ORDINAL_MAPPINGS["budget_priority"].get(str(req.budget_priority).capitalize(), 1)
        qual_val = ORDINAL_MAPPINGS["quality_priority"].get(str(req.quality_priority).capitalize(), 2)
        lat_val = ORDINAL_MAPPINGS["latency_priority"].get(str(req.latency_priority).capitalize(), 1)
        row.extend([float(comp_val), float(reas_val), float(urg_val), float(bud_val), float(qual_val), float(lat_val)])

        # 3. Booleans
        row.append(1.0 if req.requires_code else 0.0)
        row.append(1.0 if req.requires_math else 0.0)
        row.append(1.0 if req.requires_reasoning else 0.0)
        row.append(1.0 if req.requires_creativity else 0.0)
        row.append(1.0 if req.multilingual else 0.0)

        # 4. One-hot categories
        categories = self.config.get("categories", [])
        cat_req = str(req.category or "").strip()
        for cat in categories:
            row.append(1.0 if cat_req == cat else 0.0)

        # 5. One-hot domains
        domains = self.config.get("domains", [])
        dom_req = str(req.domain or "").strip()
        for dom in domains:
            row.append(1.0 if dom_req == dom else 0.0)

        return np.array([row], dtype=np.float32)

    def _generate_explanation(
        self,
        family: str,
        confidence: float,
        req: RoutingRequest,
        sim_metrics: Dict[str, Any],
        detected_info: Optional[Dict[str, Any]] = None,
    ) -> Tuple[str, List[str]]:
        reasons = []

        if detected_info and detected_info.get("source") == "automatic_detection":
            signals_summary = "; ".join(detected_info.get("signals", [])[:2])
            reasons.append(f"Auto-detected {req.complexity} complexity ({req.reasoning_level} reasoning): {signals_summary}.")
        elif detected_info and detected_info.get("source") == "manual_override":
            reasons.append(f"Manual user override applied: Complexity '{req.complexity}', Reasoning Level '{req.reasoning_level}'.")

        if req.requires_code and family == "Claude":
            reasons.append("Query specifies code generation/debugging where Claude demonstrated highest benchmark accuracy.")
        elif req.requires_math and family in ["DeepSeek", "GPT"]:
            reasons.append(f"Mathematical problem-solving requires {family}'s specialized deductive reasoning strengths.")
        elif req.requires_creativity and family in ["Claude", "GPT"]:
            reasons.append(f"Creative nuance and tone calibration align with {family}'s expressive generation profile.")

        if req.complexity == "Expert":
            reasons.append(f"Expert-level complexity demands top-tier capability ({family}), preventing hallucinations.")
        elif req.complexity in ["Easy", "Medium"] and family in ["Llama", "DeepSeek", "Gemini"]:
            reasons.append(f"Query complexity is {req.complexity}; routing to {family} minimizes token cost without sacrificing quality.")

        if req.budget_priority == "High" and family in ["Llama", "DeepSeek"]:
            reasons.append(f"User set High Budget Sensitivity: {family} delivers ultra-low inference costs (~${sim_metrics['estimated_cost_usd']:.5f}).")
        elif req.latency_priority == "High" and family == "Llama":
            reasons.append(f"User set High Latency Priority: {family} executes with fast typical response times ({sim_metrics['estimated_latency_ms']} ms).")
        elif req.quality_priority == "High" and family in ["GPT", "Claude"]:
            reasons.append(f"User set High Quality Priority: routed to premium tier ({family}) to maximize answer completeness.")

        if not reasons:
            reasons.append(f"Query aligns with {req.domain or 'General'} / {req.category or 'General'} task distribution.")

        reasons.append(f"Cost saving: {sim_metrics['cost_savings_percent']:.1f}% reduction vs. always-large baseline.")
        reasons.append(f"Estimated latency: {sim_metrics['estimated_latency_ms']} ms ({sim_metrics['latency_savings_percent']:.1f}% reduction).")

        summary = (
            f"Routed to {PROVIDER_PRICING[family]['display_name']} with {confidence*100:.1f}% model confidence. "
            f"Balances requested {req.quality_priority or 'High'} quality with {sim_metrics['cost_savings_percent']:.1f}% cost savings."
        )

        return summary, reasons

    def _fallback_heuristic_route(self, req: RoutingRequest) -> Tuple[str, float, List[ModelConfidence]]:
        scores = {"Claude": 0.20, "GPT": 0.20, "Gemini": 0.20, "Llama": 0.20, "DeepSeek": 0.20}

        if req.requires_code:
            scores["Claude"] += 0.35
        if req.requires_math:
            scores["DeepSeek"] += 0.30
            scores["GPT"] += 0.20
        if req.requires_reasoning or req.complexity in ["Hard", "Expert"]:
            scores["GPT"] += 0.25
            scores["Claude"] += 0.20
        if req.latency_priority == "High":
            scores["Llama"] += 0.40
        if req.budget_priority == "High":
            scores["DeepSeek"] += 0.30
            scores["Llama"] += 0.30
        if req.quality_priority == "High":
            scores["GPT"] += 0.20
            scores["Claude"] += 0.20

        total = sum(scores.values())
        probs = [ModelConfidence(model=k, probability=round(v / total, 4)) for k, v in scores.items()]
        probs.sort(key=lambda x: x.probability, reverse=True)

        chosen = probs[0].model
        confidence = probs[0].probability
        return chosen, confidence, probs

    def route_query_sync(self, request: RoutingRequest) -> RoutingResponse:
        """Synchronous core routing pipeline for instant simulation execution."""
        query_id = f"qr_{uuid.uuid4().hex[:10]}"

        # 1. Determine whether to auto-detect complexity and reasoning depth
        # Default behavior: auto-detection is enabled unless explicitly disabled (auto_detect=False)
        # or when both complexity and reasoning_level are provided by a legacy client without auto_detect flag.
        is_auto = request.auto_detect is True or (
            request.auto_detect is None and (
                request.complexity in [None, "auto", "Auto", ""] or
                request.reasoning_level in [None, "auto", "Auto", ""]
            )
        )

        if is_auto:
            analysis = prompt_analyzer.analyze(request.query)
            effective_complexity = analysis["complexity"]
            effective_reasoning = analysis["reasoning_level"]
            effective_requires_code = request.requires_code if request.requires_code is not None else analysis["requires_code"]
            effective_requires_math = request.requires_math if request.requires_math is not None else analysis["requires_math"]
            effective_requires_reasoning = request.requires_reasoning if request.requires_reasoning is not None else analysis["requires_reasoning"]
            detected_info = {
                "complexity": effective_complexity,
                "reasoning_level": effective_reasoning,
                "source": "automatic_detection",
                "confidence": analysis["confidence"],
                "signals": analysis["signals"],
                "requires_code": analysis["requires_code"],
                "requires_math": analysis["requires_math"],
                "requires_reasoning": analysis["requires_reasoning"],
                "token_estimate": analysis["token_estimate"],
            }
        else:
            effective_complexity = str(request.complexity or "Medium").capitalize()
            effective_reasoning = str(request.reasoning_level or "Medium").capitalize()
            effective_requires_code = bool(request.requires_code)
            effective_requires_math = bool(request.requires_math)
            effective_requires_reasoning = bool(request.requires_reasoning)
            detected_info = {
                "complexity": effective_complexity,
                "reasoning_level": effective_reasoning,
                "source": "manual_override",
                "confidence": 1.0,
                "signals": [f"User manually specified complexity='{effective_complexity}', reasoning_level='{effective_reasoning}'"],
                "requires_code": effective_requires_code,
                "requires_math": effective_requires_math,
                "requires_reasoning": effective_requires_reasoning,
                "token_estimate": max(10, int(len(request.query.split()) * 1.33)),
            }

        # Create resolved request with effective attributes for feature vector construction
        resolved_req = request.model_copy(update={
            "complexity": effective_complexity,
            "reasoning_level": effective_reasoning,
            "requires_code": effective_requires_code,
            "requires_math": effective_requires_math,
            "requires_reasoning": effective_requires_reasoning,
        })

        if self.is_ml_loaded and self.model and self.config:
            try:
                X_single = self.transform_request(resolved_req)
                proba = self.model.predict_proba(X_single)[0]
                classes = self.config.get("target_classes", ["Claude", "DeepSeek", "GPT", "Gemini", "Llama"])

                probs_list = [
                    ModelConfidence(model=classes[i], probability=round(float(proba[i]), 4))
                    for i in range(len(classes))
                ]
                probs_list.sort(key=lambda x: x.probability, reverse=True)

                selected_family = probs_list[0].model
                confidence = probs_list[0].probability
            except Exception as e:
                print(f"ML prediction error: {e}, using heuristic fallback.")
                selected_family, confidence, probs_list = self._fallback_heuristic_route(resolved_req)
        else:
            selected_family, confidence, probs_list = self._fallback_heuristic_route(resolved_req)

        sim_metrics = calculate_simulation_metrics(
            routed_family=selected_family,
            query_text=resolved_req.query,
        )

        explanation, reasons = self._generate_explanation(
            family=selected_family,
            confidence=confidence,
            req=resolved_req,
            sim_metrics=sim_metrics,
            detected_info=detected_info,
        )

        feature_contributions = {
            "category": resolved_req.category,
            "domain": resolved_req.domain,
            "complexity": effective_complexity,
            "reasoning_level": effective_reasoning,
            "detection_source": detected_info["source"],
            "priorities": {
                "quality": resolved_req.quality_priority,
                "budget": resolved_req.budget_priority,
                "latency": resolved_req.latency_priority,
            },
            "requirements": {
                "code": resolved_req.requires_code,
                "math": resolved_req.requires_math,
                "reasoning": resolved_req.requires_reasoning,
                "creativity": resolved_req.requires_creativity,
                "multilingual": resolved_req.multilingual,
            },
        }

        provider = provider_factory.get_provider(selected_family)
        sim_res = provider.simulate_response(resolved_req.query, sim_metrics["input_tokens"])

        return RoutingResponse(
            query_id=query_id,
            selected_model=sim_metrics["routed_model_id"],
            model_family=selected_family,
            display_name=sim_metrics["routed_display_name"],
            confidence=confidence,
            probabilities=probs_list,
            routing_mode=resolved_req.routing_mode or "simulation",
            explanation=explanation,
            reasons=reasons,
            estimated_cost=sim_metrics["estimated_cost_usd"],
            estimated_latency_ms=sim_metrics["estimated_latency_ms"],
            baseline_cost=sim_metrics["baseline_cost_usd"],
            baseline_latency_ms=sim_metrics["baseline_latency_ms"],
            cost_savings_percent=sim_metrics["cost_savings_percent"],
            latency_savings_percent=sim_metrics["latency_savings_percent"],
            feature_contributions=feature_contributions,
            detected_features=detected_info,
            response_text=sim_res.response_text,
            is_live_call=False,
            warning=None,
        )

    async def route_query(self, request: RoutingRequest) -> RoutingResponse:
        """Main routing pipeline execution supporting both simulation and live execution."""
        if request.routing_mode != "live":
            return self.route_query_sync(request)

        # For live calls, use base sync routing then execute live provider
        res = self.route_query_sync(request)
        provider = provider_factory.get_provider(res.model_family)

        if provider.is_configured:
            live_res = await provider.generate_response(request.query)
            res.response_text = live_res.response_text
            res.is_live_call = not live_res.is_simulated
            if not res.is_live_call:
                res.warning = "Live provider failed or returned simulation."
        else:
            res.warning = f"Live API key for {res.model_family} not configured; executed simulated inference."
        return res


router_engine = RouterEngine()
