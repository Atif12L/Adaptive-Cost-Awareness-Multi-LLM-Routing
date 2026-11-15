"""
Adaptive Cost-Aware Semantic Routing Gateway
Feature Preprocessing and Leakage Prevention Module

This module isolates features available strictly at query arrival time
and strips all post-inference/outcome features to prevent target leakage.
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from typing import Tuple, List, Dict, Any

TARGET_COL = "recommended_model"

# Features AVAILABLE at query arrival time
ARRIVAL_NUMERIC_COLS = ["token_count", "context_length", "char_length"]
ARRIVAL_ORDINAL_COLS = [
    "complexity",
    "reasoning_level",
    "urgency",
    "budget_priority",
    "quality_priority",
    "latency_priority",
]
ARRIVAL_BOOLEAN_COLS = [
    "requires_code",
    "requires_math",
    "requires_reasoning",
    "requires_creativity",
    "multilingual",
]
ARRIVAL_CATEGORICAL_COLS = ["category", "domain"]

# Features EXCLUDED to prevent data/target leakage
LEAKAGE_COLS = [
    "best_quality_model",
    "lowest_cost_model",
    "lowest_latency_model",
    "routing_score",
    "gpt_quality_score",
    "claude_quality_score",
    "gemini_quality_score",
    "llama_quality_score",
    "deepseek_quality_score",
    "gpt_cost",
    "claude_cost",
    "gemini_cost",
    "llama_cost",
    "deepseek_cost",
    "gpt_latency",
    "claude_latency",
    "gemini_latency",
    "llama_latency",
    "deepseek_latency",
]

# Explicit ordinal mappings
ORDINAL_MAPPINGS = {
    "complexity": {"Easy": 0, "Medium": 1, "Hard": 2, "Expert": 3},
    "reasoning_level": {"Low": 0, "Medium": 1, "High": 2},
    "urgency": {"Low": 0, "Medium": 1, "High": 2},
    "budget_priority": {"Low": 0, "Medium": 1, "High": 2},
    "quality_priority": {"Low": 0, "Medium": 1, "High": 2},
    "latency_priority": {"Low": 0, "Medium": 1, "High": 2},
}


class LeakageFreePreprocessor:
    """Preprocessor that transforms query metadata into ML feature vectors

    using strictly arrival-time signals.
    """

    def __init__(self):
        self.target_encoder = LabelEncoder()
        self.categories_ = {}
        self.domains_ = {}
        self.feature_names_ = []
        self.is_fitted = False

    def _normalize_booleans(self, val):
        if isinstance(val, bool):
            return 1 if val else 0
        if isinstance(val, (int, float)):
            return 1 if val > 0 else 0
        s = str(val).strip().upper()
        return 1 if s in ["TRUE", "1", "YES", "T", "Y"] else 0

    def fit(self, df: pd.DataFrame) -> "LeakageFreePreprocessor":
        # Fit target encoder
        if TARGET_COL in df.columns:
            self.target_encoder.fit(df[TARGET_COL].astype(str))

        # Store unique categories and domains for one-hot encoding
        self.categories_ = sorted(df["category"].dropna().unique().tolist())
        self.domains_ = sorted(df["domain"].dropna().unique().tolist())

        # Construct deterministic feature names
        feature_names = []
        feature_names.extend(ARRIVAL_NUMERIC_COLS)
        feature_names.extend([f"{c}_ord" for c in ARRIVAL_ORDINAL_COLS])
        feature_names.extend(ARRIVAL_BOOLEAN_COLS)
        feature_names.extend([f"category_{cat}" for cat in self.categories_])
        feature_names.extend([f"domain_{dom}" for dom in self.domains_])

        self.feature_names_ = feature_names
        self.is_fitted = True
        return self

    def transform(self, df: pd.DataFrame) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Preprocessor has not been fitted.")

        df_work = df.copy()

        # Compute char_length if missing
        if "char_length" not in df_work.columns:
            if "query" in df_work.columns:
                df_work["char_length"] = df_work["query"].astype(str).str.len()
            else:
                df_work["char_length"] = df_work.get("token_count", 100) * 4

        # Token count fallback
        if "token_count" not in df_work.columns:
            df_work["token_count"] = df_work["char_length"] // 4
        if "context_length" not in df_work.columns:
            df_work["context_length"] = 0

        rows = []
        for _, row in df_work.iterrows():
            row_features = []

            # 1. Numeric
            for col in ARRIVAL_NUMERIC_COLS:
                row_features.append(float(row.get(col, 0)))

            # 2. Ordinal
            for col in ARRIVAL_ORDINAL_COLS:
                mapping = ORDINAL_MAPPINGS[col]
                val = str(row.get(col, "Medium")).capitalize()
                row_features.append(float(mapping.get(val, 1)))

            # 3. Boolean
            for col in ARRIVAL_BOOLEAN_COLS:
                val = self._normalize_booleans(row.get(col, 0))
                row_features.append(float(val))

            # 4. One-hot categories
            cat_val = str(row.get("category", "")).strip()
            for cat in self.categories_:
                row_features.append(1.0 if cat_val == cat else 0.0)

            # 5. One-hot domains
            dom_val = str(row.get("domain", "")).strip()
            for dom in self.domains_:
                row_features.append(1.0 if dom_val == dom else 0.0)

            rows.append(row_features)

        return np.array(rows, dtype=np.float32)

    def fit_transform(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        self.fit(df)
        X = self.transform(df)
        y = self.target_encoder.transform(df[TARGET_COL].astype(str))
        return X, y


def load_and_preprocess_dataset(csv_path: str):
    df = pd.read_csv(csv_path)
    df["char_length"] = df["query"].astype(str).str.len()

    preprocessor = LeakageFreePreprocessor()
    X, y = preprocessor.fit_transform(df)

    return df, X, y, preprocessor
