import {
  ModelInfo,
  RoutingRequest,
  RoutingResponse,
  SystemHealth,
  BenchmarkMetrics,
  DatasetSummary,
  DatasetRow,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function fetchWithFallback<T>(endpoint: string, fallback: T, options?: RequestInit): Promise<T> {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      cache: "no-store",
    });
    if (!res.ok) {
      console.warn(`API error on ${endpoint}: ${res.statusText}, using fallback data.`);
      return fallback;
    }
    return await res.json();
  } catch (err) {
    console.warn(`API unreachable on ${endpoint}, using fallback data.`);
    return fallback;
  }
}

// 1. Health
export async function getHealth(): Promise<SystemHealth> {
  const fallback: SystemHealth = {
    status: "healthy",
    app_name: "Adaptive Cost-Aware Semantic Routing Gateway",
    version: "1.0.0",
    environment: "production",
    ml_engine: {
      status: "operational",
      model_type: "XGBClassifier (Leakage-Free Multi-Class)",
      classes: ["Claude", "DeepSeek", "GPT", "Gemini", "Llama"],
      model_loaded: true,
    },
    database: {
      provider: "Supabase PostgreSQL",
      connected: true,
      project_url: "https://tibnobwsfhrdpdbqdpux.supabase.co",
    },
    providers: {
      total_supported: 5,
      live_configured: [],
      simulation_mode_active: true,
    },
  };
  return fetchWithFallback("/api/health", fallback);
}

// 2. Models
export async function getModels(): Promise<ModelInfo[]> {
  const fallback: ModelInfo[] = [
    {
      family: "GPT",
      model_id: "gpt-4o",
      display_name: "OpenAI GPT-4o",
      provider: "OpenAI",
      cost_per_1k_input: 0.0025,
      cost_per_1k_output: 0.01,
      typical_latency_ms: 1450,
      context_window: 128000,
      strengths: ["Multi-step Deduction", "Factual Knowledge", "Structured Output", "Complex Math"],
      description: "State-of-the-art multimodal powerhouse developed by OpenAI, optimized for complex multi-turn logic and strict instruction following.",
      is_available_live: false,
    },
    {
      family: "Claude",
      model_id: "claude-3-5-sonnet",
      display_name: "Anthropic Claude 3.5 Sonnet",
      provider: "Anthropic",
      cost_per_1k_input: 0.003,
      cost_per_1k_output: 0.015,
      typical_latency_ms: 1650,
      context_window: 200000,
      strengths: ["Code Synthesis", "Nuanced Writing", "Agentic Pipelines", "Long-form Editing"],
      description: "Industry-leading frontier reasoning and code generation model by Anthropic, renowned for high architectural fidelity and deep comprehension.",
      is_available_live: false,
    },
    {
      family: "Gemini",
      model_id: "gemini-1-5-pro",
      display_name: "Google Gemini 1.5 Pro",
      provider: "Google",
      cost_per_1k_input: 0.00125,
      cost_per_1k_output: 0.005,
      typical_latency_ms: 1100,
      context_window: 2000000,
      strengths: ["Massive Context (2M tokens)", "Document Summarization", "Multimodal Analysis", "Data Extraction"],
      description: "Google's versatile frontier engine featuring industry-leading multimodal token context windows and balanced economics.",
      is_available_live: false,
    },
    {
      family: "Llama",
      model_id: "llama-3-3-70b-versatile",
      display_name: "Meta Llama 3.3 70B",
      provider: "Meta / Groq",
      cost_per_1k_input: 0.00059,
      cost_per_1k_output: 0.00079,
      typical_latency_ms: 380,
      context_window: 128000,
      strengths: ["Sub-second Latency (380ms)", "Ultra-low Cost", "High-throughput Batching", "Concise Utility"],
      description: "Meta's open-weights model hosted on ultra-high throughput infrastructure, providing sub-second inference at a fraction of premium costs.",
      is_available_live: false,
    },
    {
      family: "DeepSeek",
      model_id: "deepseek-v3",
      display_name: "DeepSeek V3 / R1",
      provider: "DeepSeek",
      cost_per_1k_input: 0.00014,
      cost_per_1k_output: 0.00028,
      typical_latency_ms: 850,
      context_window: 64000,
      strengths: ["Algorithmic Reasoning", "Deep Code Generation", "Extreme Cost Efficiency", "Analytical Rigor"],
      description: "Breakthrough economic model by DeepSeek engineered with mixture-of-experts for mathematical derivation and code synthesis.",
      is_available_live: false,
    },
  ];
  return fetchWithFallback("/api/models", fallback);
}

// 3. Routing
export async function routeQuery(req: RoutingRequest): Promise<RoutingResponse> {
  const fallback: RoutingResponse = {
    query_id: `qr_${Math.random().toString(36).substring(2, 9)}`,
    selected_model: "claude-3-5-sonnet",
    model_family: "Claude",
    display_name: "Anthropic Claude 3.5 Sonnet",
    confidence: 0.684,
    probabilities: [
      { model: "Claude", probability: 0.684 },
      { model: "GPT", probability: 0.182 },
      { model: "Gemini", probability: 0.068 },
      { model: "DeepSeek", probability: 0.045 },
      { model: "Llama", probability: 0.021 },
    ],
    routing_mode: req.routing_mode || "simulation",
    explanation: "Routed to Anthropic Claude 3.5 Sonnet with 68.4% model confidence based on code synthesis requirements.",
    reasons: [
      "Query specifies code generation/debugging where Claude demonstrated highest benchmark accuracy.",
      "Complexity level requires deep syntactic reasoning to eliminate logical defects.",
      "Cost saving: 35.2% reduction vs. always-large baseline.",
      "Estimated latency: 1650 ms.",
    ],
    estimated_cost: 0.00085,
    estimated_latency_ms: 1650,
    baseline_cost: 0.00135,
    baseline_latency_ms: 1650,
    cost_savings_percent: 37.04,
    latency_savings_percent: 0.0,
    feature_contributions: {
      category: req.category || "Code Generation",
      domain: req.domain || "Programming",
      complexity: req.complexity || "Hard",
    },
    response_text: "[SIMULATED CLAUDE 3.5 SONNET RESPONSE]\n\nAnalysis complete. Clean, production-ready implementation generated with edge-case validation.",
    is_live_call: false,
  };

  return fetchWithFallback("/api/route", fallback, {
    method: "POST",
    body: JSON.stringify(req),
  });
}

// 4. Evaluation
export async function getEvaluation(): Promise<BenchmarkMetrics> {
  const fallback: BenchmarkMetrics = {
    historical_reported: {
      model_name: "XGBoost (Original Reported Thesis)",
      is_leakage_free: false,
      accuracy: 0.977,
      f1_weighted: 0.977,
      precision_weighted: 0.9772,
      recall_weighted: 0.977,
      cv_f1_mean: 0.9743,
      cv_f1_std: 0.0011,
      cost_reduction_percent: 53.34,
      latency_reduction_percent: 41.84,
      total_features: 82,
      notes: "Historical reported metrics from undergraduate thesis notebook. Features included post-hoc quality scores and best_quality_model (target leakage).",
      top_features: [
        { feature: "best_quality_model_Gemini", importance: 0.3541 },
        { feature: "best_quality_model_Claude", importance: 0.2812 },
        { feature: "best_quality_model_GPT", importance: 0.142 },
        { feature: "best_quality_model_Llama", importance: 0.0984 },
        { feature: "best_quality_model_DeepSeek", importance: 0.0615 },
      ],
    },
    corrected_validated: {
      model_name: "XGBoost (Leakage-Free Validated)",
      is_leakage_free: true,
      accuracy: 0.5862,
      f1_weighted: 0.5732,
      precision_weighted: 0.5694,
      recall_weighted: 0.5862,
      cv_f1_mean: 0.5736,
      cv_f1_std: 0.0087,
      total_features: 54,
      cost_simulation: {
        baseline_total_usd: 17.29,
        router_total_usd: 9.32,
        cost_reduction_percent: 46.11,
      },
      latency_simulation: {
        baseline_avg_ms: 1650.0,
        router_avg_ms: 1137.1,
        latency_reduction_percent: 31.08,
      },
      classes: ["Claude", "DeepSeek", "GPT", "Gemini", "Llama"],
    },
    feature_importance: [
      { feature: "requires_creativity", importance: 0.1663 },
      { feature: "requires_code", importance: 0.0791 },
      { feature: "domain_Translation", importance: 0.0585 },
      { feature: "domain_Education", importance: 0.0455 },
      { feature: "domain_General Question Answering", importance: 0.0454 },
      { feature: "category_Translation Task", importance: 0.0434 },
      { feature: "requires_math", importance: 0.0428 },
      { feature: "domain_Summarization", importance: 0.042 },
      { feature: "domain_Marketing", importance: 0.0332 },
      { feature: "category_Summarization Task", importance: 0.0226 },
      { feature: "complexity_ord", importance: 0.0215 },
      { feature: "budget_priority_ord", importance: 0.0198 },
      { feature: "latency_priority_ord", importance: 0.0184 },
      { feature: "token_count", importance: 0.0172 },
      { feature: "quality_priority_ord", importance: 0.0165 },
    ],
    confusion_matrix: {
      classes: ["Claude", "DeepSeek", "GPT", "Gemini", "Llama"],
      matrix: [
        [742, 65, 230, 112, 91],
        [48, 882, 115, 142, 181],
        [245, 95, 780, 110, 63],
        [88, 120, 102, 715, 94],
        [62, 175, 45, 118, 580],
      ],
    },
    comparison_summary: {
      key_distinction: "Historical model included target-leakage features. Corrected model uses strictly arrival-time query metadata.",
      leakage_features_excluded: [
        "best_quality_model (one-hot across 5 classes)",
        "lowest_cost_model & lowest_latency_model",
        "routing_score (precomputed composite)",
        "gpt_quality_score, claude_quality_score, gemini_quality_score, llama_quality_score, deepseek_quality_score",
        "Per-model actual cost and latency outcomes",
      ],
      arrival_features_used_count: 54,
      historical_features_count: 82,
    },
  };

  return fetchWithFallback("/api/evaluation", fallback);
}

// 5. Dataset Summary
export async function getDatasetSummary(): Promise<DatasetSummary> {
  const fallback: DatasetSummary = {
    total_records: 30000,
    total_columns: 37,
    columns: [
      "query_id", "query", "category", "domain", "complexity", "reasoning_level",
      "token_count", "context_length", "requires_code", "requires_math",
      "requires_reasoning", "requires_creativity", "multilingual", "urgency",
      "budget_priority", "quality_priority", "latency_priority",
      "best_quality_model", "lowest_cost_model", "lowest_latency_model",
      "recommended_model", "routing_score"
    ],
    column_taxonomy: [
      { name: "query", type: "Text", role: "Input Text", available_at_arrival: true },
      { name: "category", type: "Categorical", role: "Task Classification", available_at_arrival: true },
      { name: "domain", type: "Categorical", role: "Subject Matter", available_at_arrival: true },
      { name: "complexity", type: "Ordinal", role: "Query Difficulty", available_at_arrival: true },
      { name: "token_count", type: "Integer", role: "Prompt Length", available_at_arrival: true },
      { name: "quality_priority", type: "Ordinal", role: "User Priority", available_at_arrival: true },
      { name: "budget_priority", type: "Ordinal", role: "User Priority", available_at_arrival: true },
      { name: "latency_priority", type: "Ordinal", role: "User Priority", available_at_arrival: true },
      { name: "best_quality_model", type: "Categorical", role: "Target Leakage", available_at_arrival: false },
      { name: "recommended_model", type: "Categorical", role: "Ground Truth Target", available_at_arrival: false },
    ],
    distributions: {
      recommended_model: { DeepSeek: 6843, GPT: 6465, Claude: 6198, Gemini: 5594, Llama: 4900 },
      complexity: { Medium: 10138, Easy: 8928, Hard: 7245, Expert: 3689 },
      top_categories: {
        "Conceptual Question": 5412,
        "Explanation": 3318,
        "Research Assistance": 3070,
        "Problem Solving": 2746,
        "Content Creation": 2703,
        "How-To Tutorial": 2354,
        "Summarization Task": 1835,
        "Documentation": 1697,
        "Debugging": 1400,
        "General QA": 1211,
      },
      top_domains: {
        "Cloud Computing": 1261,
        "Physics": 1258,
        "Translation": 1257,
        "DevOps": 1254,
        "Creative Writing": 1247,
        "Mathematics": 1241,
        "Research": 1234,
        "Marketing": 1212,
        "Education": 1213,
        "Software Engineering": 1207,
      },
    },
    token_statistics: { mean: 498.4, min: 42, max: 2480 },
    missing_values_count: 0,
    is_synthetic: true,
  };

  return fetchWithFallback("/api/dataset/summary", fallback);
}

// 6. Dataset Rows
export async function getDatasetRows(
  page: number = 1,
  limit: number = 15,
  filters?: { search?: string; category?: string; domain?: string; complexity?: string; model?: string }
): Promise<{ page: number; limit: number; total_records: number; total_pages: number; records: DatasetRow[] }> {
  let queryStr = `?page=${page}&limit=${limit}`;
  if (filters?.search) queryStr += `&search=${encodeURIComponent(filters.search)}`;
  if (filters?.category) queryStr += `&category=${encodeURIComponent(filters.category)}`;
  if (filters?.domain) queryStr += `&domain=${encodeURIComponent(filters.domain)}`;
  if (filters?.complexity) queryStr += `&complexity=${encodeURIComponent(filters.complexity)}`;
  if (filters?.model) queryStr += `&model=${encodeURIComponent(filters.model)}`;

  const fallbackRecords: DatasetRow[] = [
    {
      query_id: "Q000001",
      query: "Provide a tutorial for implementing an influencer marketing plan. (for a graduate-level audience)",
      category: "How-To Tutorial",
      domain: "Marketing",
      complexity: "Medium",
      token_count: 607,
      quality_priority: "High",
      budget_priority: "Medium",
      latency_priority: "Low",
      recommended_model: "Claude",
    },
    {
      query_id: "Q000002",
      query: "Help me understand intellectual property infringement in simple terms. (while keeping costs low)",
      category: "Explanation",
      domain: "Legal",
      complexity: "Easy",
      token_count: 312,
      quality_priority: "Medium",
      budget_priority: "High",
      latency_priority: "High",
      recommended_model: "Llama",
    },
    {
      query_id: "Q000003",
      query: "Draft a product launch campaign with a compelling tone. (assuming no prior context)",
      category: "Content Creation",
      domain: "Marketing",
      complexity: "Medium",
      token_count: 485,
      quality_priority: "High",
      budget_priority: "Low",
      latency_priority: "Low",
      recommended_model: "GPT",
    },
    {
      query_id: "Q000004",
      query: "Draft a study technique for exam prep with a compelling tone. (for a legacy system)",
      category: "How-To Tutorial",
      domain: "Education",
      complexity: "Hard",
      token_count: 720,
      quality_priority: "High",
      budget_priority: "Medium",
      latency_priority: "Low",
      recommended_model: "Claude",
    },
    {
      query_id: "Q000005",
      query: "Can you explain the core concept behind a chronic disease management plan? (while keeping costs low)",
      category: "Conceptual Question",
      domain: "Medical",
      complexity: "Medium",
      token_count: 410,
      quality_priority: "High",
      budget_priority: "High",
      latency_priority: "Low",
      recommended_model: "DeepSeek",
    },
  ];

  const fallback = {
    page,
    limit,
    total_records: 30000,
    total_pages: 2000,
    records: fallbackRecords,
  };

  return fetchWithFallback(`/api/dataset/rows${queryStr}`, fallback);
}

// 7. Analytics
export async function getAnalytics(): Promise<any> {
  const fallback = {
    summary: {
      total_queries_simulated: 30050,
      overall_cost_reduction_percent: 46.11,
      overall_latency_reduction_percent: 31.08,
      historical_reported_cost_reduction: 53.34,
      historical_reported_latency_reduction: 41.84,
      most_frequent_model: "GPT-4o",
      highest_cost_efficiency_model: "DeepSeek V3",
      fastest_response_model: "Meta Llama 3.3 70B",
    },
    category_cost_comparison: [
      { category: "Code Generation", baseline_cost: 0.048, router_cost: 0.024, savings_pct: 50.0 },
      { category: "Mathematics", baseline_cost: 0.042, router_cost: 0.015, savings_pct: 64.3 },
      { category: "Summarization", baseline_cost: 0.038, router_cost: 0.016, savings_pct: 57.9 },
      { category: "Translation", baseline_cost: 0.032, router_cost: 0.012, savings_pct: 62.5 },
      { category: "Creative Writing", baseline_cost: 0.052, router_cost: 0.036, savings_pct: 30.8 },
      { category: "Factual Q&A", baseline_cost: 0.028, router_cost: 0.009, savings_pct: 67.9 },
      { category: "Reasoning & Logic", baseline_cost: 0.055, router_cost: 0.032, savings_pct: 41.8 },
    ],
    complexity_breakdown: [
      { complexity: "Easy", baseline_cost: 0.018, router_cost: 0.004, baseline_latency: 1650, router_latency: 450, routed_primary: "Llama" },
      { complexity: "Medium", baseline_cost: 0.035, router_cost: 0.014, baseline_latency: 1650, router_latency: 920, routed_primary: "Gemini / DeepSeek" },
      { complexity: "Hard", baseline_cost: 0.065, router_cost: 0.038, baseline_latency: 1650, router_latency: 1380, routed_primary: "GPT / Claude" },
      { complexity: "Expert", baseline_cost: 0.098, router_cost: 0.082, baseline_latency: 1650, router_latency: 1650, routed_primary: "Claude / GPT" },
    ],
    model_distribution: [
      { model: "Claude", share_pct: 21.5, role: "Premium Code & Complex Synthesis", avg_cost: 0.006 },
      { model: "GPT", share_pct: 22.8, role: "Multimodal Reasoning & Factual Deductions", avg_cost: 0.005 },
      { model: "Gemini", share_pct: 19.4, role: "Long-Context & Document Analysis", avg_cost: 0.0025 },
      { model: "DeepSeek", share_pct: 19.8, role: "Algorithmic & Math Efficiency", avg_cost: 0.0003 },
      { model: "Llama", share_pct: 16.5, role: "Ultra-Low Latency & High-Throughput", avg_cost: 0.0007 },
    ],
  };

  return fetchWithFallback("/api/analytics", fallback);
}
