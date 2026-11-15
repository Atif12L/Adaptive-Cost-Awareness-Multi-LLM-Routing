"""
Adaptive Cost-Aware Semantic Routing Gateway
Leakage-Free XGBoost Model Training and Validation Pipeline

Trains a strictly leakage-free routing classifier using features available
at query arrival time, evaluates 5-fold CV, calculates cost/latency simulations,
and serializes artifacts.
"""

import os
import sys
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
from xgboost import XGBClassifier
import joblib

# Import local preprocessor
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from preprocess import LeakageFreePreprocessor, TARGET_COL

RANDOM_STATE = 42
DATASET_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "research", "llm_routing_dataset.csv"))
ARTIFACTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "artifacts"))


def run_training_pipeline():
    print(f"=== Starting Leakage-Free Training Pipeline ===")
    print(f"Dataset path: {DATASET_PATH}")
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)

    df = pd.read_csv(DATASET_PATH)
    print(f"Loaded dataset: {df.shape[0]} rows, {df.shape[1]} columns")

    # Fit preprocessor strictly on arrival-time features
    preprocessor = LeakageFreePreprocessor()
    X, y = preprocessor.fit_transform(df)
    class_names = preprocessor.target_encoder.classes_.tolist()
    feature_names = preprocessor.feature_names_

    print(f"Extracted feature matrix: {X.shape[0]} samples, {X.shape[1]} features")
    print(f"Target classes ({len(class_names)}): {class_names}")

    # Stratified 80/20 train/test split
    X_train, X_test, y_train, y_test, idx_train, idx_test = train_test_split(
        X, y, df.index, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    print(f"Train samples: {X_train.shape[0]}, Test samples: {X_test.shape[0]}")

    # Initialize XGBoost Classifier
    model = XGBClassifier(
        n_estimators=250,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        objective="multi:softprob",
        num_class=len(class_names),
        random_state=RANDOM_STATE,
        n_jobs=-1,
        eval_metric="mlogloss",
    )

    print("\n--- Performing 5-Fold Stratified Cross-Validation ---")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)
    cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="f1_weighted", n_jobs=-1)
    cv_mean = float(np.mean(cv_scores))
    cv_std = float(np.std(cv_scores))
    print(f"5-Fold CV Weighted F1: {cv_mean:.4f} (+/- {cv_std:.4f})")

    # Train model on full training set
    print("\n--- Training Model on Full Train Partition ---")
    model.fit(X_train, y_train)

    # Evaluate on held-out test partition
    print("\n--- Evaluating on Held-Out Test Set ---")
    y_pred = model.predict(X_test)
    y_pred_proba = model.predict_proba(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    prec_weighted = float(precision_score(y_test, y_pred, average="weighted", zero_division=0))
    rec_weighted = float(recall_score(y_test, y_pred, average="weighted", zero_division=0))
    f1_weighted = float(f1_score(y_test, y_pred, average="weighted", zero_division=0))

    prec_macro = float(precision_score(y_test, y_pred, average="macro", zero_division=0))
    rec_macro = float(recall_score(y_test, y_pred, average="macro", zero_division=0))
    f1_macro = float(f1_score(y_test, y_pred, average="macro", zero_division=0))

    cm = confusion_matrix(y_test, y_pred).tolist()
    clf_report = classification_report(y_test, y_pred, target_names=class_names, output_dict=True)

    print(f"Accuracy:        {acc:.4f}")
    print(f"Weighted F1:     {f1_weighted:.4f}")
    print(f"Weighted Prec:   {prec_weighted:.4f}")
    print(f"Weighted Recall: {rec_weighted:.4f}")

    # Feature importances
    importances = model.feature_importances_
    sorted_idx = np.argsort(importances)[::-1]
    feature_importance_list = [
        {"feature": feature_names[i], "importance": float(importances[i])}
        for i in sorted_idx
    ]
    print("\nTop 10 Leakage-Free Features:")
    for item in feature_importance_list[:10]:
        print(f"  {item['feature']:<30}: {item['importance']:.4f}")

    # Cost and Latency Simulation on Test Set
    # Realistic 2026 commercial API pricing (per 1K tokens)
    PRICING = {
        "GPT": 0.0050,      # GPT-4o blended rate
        "Claude": 0.0060,   # Claude 3.5 Sonnet blended rate
        "Gemini": 0.0025,   # Gemini 1.5 Pro blended rate
        "Llama": 0.0007,    # Llama 3 70B hosted
        "DeepSeek": 0.0003, # DeepSeek V3 blended rate
    }
    LATENCIES_MS = {
        "GPT": 1450,
        "Claude": 1650,
        "Gemini": 1100,
        "Llama": 380,
        "DeepSeek": 850,
    }

    test_tokens = df.loc[idx_test, "token_count"].values
    test_actual_labels = [class_names[i] for i in y_test]
    test_pred_labels = [class_names[i] for i in y_pred]

    # Baseline: Default all queries to largest/premium model (Claude or GPT)
    baseline_costs = (test_tokens / 1000.0) * PRICING["Claude"]
    baseline_latencies = np.full_like(test_tokens, LATENCIES_MS["Claude"], dtype=float)

    # Router: Route according to prediction
    router_costs = np.array([(tok / 1000.0) * PRICING[lbl] for tok, lbl in zip(test_tokens, test_pred_labels)])
    router_latencies = np.array([LATENCIES_MS[lbl] for lbl in test_pred_labels], dtype=float)

    total_baseline_cost = float(np.sum(baseline_costs))
    total_router_cost = float(np.sum(router_costs))
    cost_reduction_pct = float(((total_baseline_cost - total_router_cost) / total_baseline_cost) * 100)

    avg_baseline_latency = float(np.mean(baseline_latencies))
    avg_router_latency = float(np.mean(router_latencies))
    latency_reduction_pct = float(((avg_baseline_latency - avg_router_latency) / avg_baseline_latency) * 100)

    print("\n--- Simulation Results (Held-Out Test Set) ---")
    print(f"Baseline Cost:      ${total_baseline_cost:.2f}")
    print(f"Router Cost:        ${total_router_cost:.2f}")
    print(f"Cost Reduction:     {cost_reduction_pct:.2f}%")
    print(f"Baseline Latency:   {avg_baseline_latency:.1f} ms")
    print(f"Router Latency:     {avg_router_latency:.1f} ms")
    print(f"Latency Reduction:  {latency_reduction_pct:.2f}%")

    # Serialize Artifacts
    model_path = os.path.join(ARTIFACTS_DIR, "corrected_model.joblib")
    preproc_path = os.path.join(ARTIFACTS_DIR, "feature_preprocessor.joblib")
    metrics_path = os.path.join(ARTIFACTS_DIR, "corrected_metrics.json")
    importance_path = os.path.join(ARTIFACTS_DIR, "feature_importance.json")
    cm_path = os.path.join(ARTIFACTS_DIR, "confusion_matrix.json")

    joblib.dump(model, model_path)
    joblib.dump(preprocessor, preproc_path)

    metrics_payload = {
        "model_name": "XGBoost (Leakage-Free Corrected)",
        "is_leakage_free": True,
        "accuracy": acc,
        "f1_weighted": f1_weighted,
        "f1_macro": f1_macro,
        "precision_weighted": prec_weighted,
        "precision_macro": prec_macro,
        "recall_weighted": rec_weighted,
        "recall_macro": rec_macro,
        "cv_f1_mean": cv_mean,
        "cv_f1_std": cv_std,
        "total_test_samples": len(y_test),
        "total_train_samples": len(y_train),
        "total_features": len(feature_names),
        "cost_simulation": {
            "baseline_total_usd": total_baseline_cost,
            "router_total_usd": total_router_cost,
            "cost_reduction_percent": cost_reduction_pct,
            "pricing_reference": PRICING,
        },
        "latency_simulation": {
            "baseline_avg_ms": avg_baseline_latency,
            "router_avg_ms": avg_router_latency,
            "latency_reduction_percent": latency_reduction_pct,
            "latency_reference_ms": LATENCIES_MS,
        },
        "classification_report": clf_report,
        "classes": class_names,
    }

    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_payload, f, indent=2)

    with open(importance_path, "w", encoding="utf-8") as f:
        json.dump(feature_importance_list, f, indent=2)

    with open(cm_path, "w", encoding="utf-8") as f:
        json.dump({"matrix": cm, "classes": class_names}, f, indent=2)

    # Also save historical benchmark record for direct side-by-side comparison
    historical_metrics_path = os.path.join(ARTIFACTS_DIR, "historical_metrics.json")
    historical_payload = {
        "model_name": "XGBoost (Original Reported Thesis)",
        "is_leakage_free": False,
        "accuracy": 0.9770,
        "f1_weighted": 0.9770,
        "precision_weighted": 0.9772,
        "recall_weighted": 0.9770,
        "cv_f1_mean": 0.9743,
        "cv_f1_std": 0.0011,
        "cost_reduction_percent": 53.34,
        "latency_reduction_percent": 41.84,
        "total_features": 82,
        "notes": "Historical thesis benchmark. Features included post-hoc scores and target-correlated leakage columns.",
        "top_features": [
            {"feature": "best_quality_model_Gemini", "importance": 0.3541},
            {"feature": "best_quality_model_Claude", "importance": 0.2812},
            {"feature": "best_quality_model_GPT", "importance": 0.1420},
            {"feature": "best_quality_model_Llama", "importance": 0.0984},
            {"feature": "best_quality_model_DeepSeek", "importance": 0.0615},
        ]
    }
    with open(historical_metrics_path, "w", encoding="utf-8") as f:
        json.dump(historical_payload, f, indent=2)

    print("\nArtifacts successfully written to ml_pipeline/artifacts/:")
    print(f" - {model_path}")
    print(f" - {preproc_path}")
    print(f" - {metrics_path}")
    print(f" - {importance_path}")
    print(f" - {cm_path}")
    print(f" - {historical_metrics_path}")
    print("=== Pipeline Complete ===")


if __name__ == "__main__":
    run_training_pipeline()
