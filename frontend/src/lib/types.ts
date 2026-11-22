export interface ModelInfo {
  family: string;
  model_id: string;
  display_name: string;
  provider: string;
  cost_per_1k_input: number;
  cost_per_1k_output: number;
  typical_latency_ms: number;
  context_window: number;
  strengths: string[];
  description: string;
  is_available_live: boolean;
}

export interface ModelConfidence {
  model: string;
  probability: number;
}

export interface RoutingRequest {
  query: string;
  auto_detect?: boolean;
  category?: string;
  domain?: string;
  complexity?: string;
  reasoning_level?: string;
  urgency?: string;
  budget_priority?: string;
  quality_priority?: string;
  latency_priority?: string;
  requires_code?: boolean;
  requires_math?: boolean;
  requires_reasoning?: boolean;
  requires_creativity?: boolean;
  multilingual?: boolean;
  routing_mode?: "simulation" | "live";
}

export interface DetectedFeatures {
  category?: string;
  domain?: string;
  complexity: string;
  reasoning_level: string;
  source: "automatic_detection" | "manual_override";
  confidence: number;
  signals: string[];
  requires_code?: boolean;
  requires_math?: boolean;
  requires_reasoning?: boolean;
  token_estimate?: number;
}

export interface RoutingResponse {
  query_id: string;
  selected_model: string;
  model_family: string;
  display_name: string;
  confidence: number;
  probabilities: ModelConfidence[];
  routing_mode: string;
  explanation: string;
  reasons: string[];
  estimated_cost: number;
  estimated_latency_ms: number;
  baseline_cost: number;
  baseline_latency_ms: number;
  cost_savings_percent: number;
  latency_savings_percent: number;
  feature_contributions: Record<string, any>;
  detected_features?: DetectedFeatures;
  response_text?: string;
  is_live_call?: boolean;
  warning?: string;
}

export interface SystemHealth {
  status: string;
  app_name: string;
  version: string;
  environment: string;
  ml_engine: {
    status: string;
    model_type: string;
    classes: string[];
    model_loaded: boolean;
  };
  database: {
    provider: string;
    connected: boolean;
    project_url: string;
  };
  providers: {
    total_supported: number;
    live_configured: string[];
    simulation_mode_active: boolean;
  };
}

export interface BenchmarkMetrics {
  historical_reported: {
    model_name: string;
    is_leakage_free: boolean;
    accuracy: number;
    f1_weighted: number;
    precision_weighted: number;
    recall_weighted: number;
    cv_f1_mean?: number;
    cv_f1_std?: number;
    cost_reduction_percent: number;
    latency_reduction_percent: number;
    total_features: number;
    notes?: string;
    top_features?: Array<{ feature: string; importance: number }>;
  };
  corrected_validated: {
    model_name: string;
    is_leakage_free: boolean;
    accuracy: number;
    f1_weighted: number;
    precision_weighted: number;
    recall_weighted: number;
    cv_f1_mean?: number;
    cv_f1_std?: number;
    total_features: number;
    cost_simulation: {
      baseline_total_usd: number;
      router_total_usd: number;
      cost_reduction_percent: number;
    };
    latency_simulation: {
      baseline_avg_ms: number;
      router_avg_ms: number;
      latency_reduction_percent: number;
    };
    classification_report?: Record<string, any>;
    classes?: string[];
  };
  feature_importance: Array<{ feature: string; importance: number }>;
  confusion_matrix: {
    matrix: number[][];
    classes: string[];
  };
  comparison_summary: {
    key_distinction: string;
    leakage_features_excluded: string[];
    arrival_features_used_count: number;
    historical_features_count: number;
  };
}

export interface DatasetSummary {
  total_records: number;
  total_columns: number;
  columns: string[];
  column_taxonomy: Array<{
    name: string;
    type: string;
    role: string;
    available_at_arrival: boolean;
  }>;
  distributions: {
    recommended_model: Record<string, number>;
    complexity: Record<string, number>;
    top_categories: Record<string, number>;
    top_domains: Record<string, number>;
  };
  token_statistics: {
    mean: number;
    min: number;
    max: number;
  };
  missing_values_count: number;
  is_synthetic: boolean;
}

export interface DatasetRow {
  query_id: string;
  query: string;
  category: string;
  domain: string;
  complexity: string;
  token_count: number;
  quality_priority: string;
  budget_priority: string;
  latency_priority: string;
  recommended_model: string;
}
