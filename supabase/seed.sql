-- Supabase Seed Data
-- Default Model Configurations and Historical Benchmark Metrics

INSERT INTO public.model_configurations (
    model_id, family, display_name, provider, cost_per_1k_input_tokens, cost_per_1k_output_tokens, typical_latency_ms, context_window, strengths, is_active
) VALUES
(
    'gpt-4o',
    'GPT',
    'OpenAI GPT-4o',
    'OpenAI',
    0.002500,
    0.010000,
    1450,
    128000,
    ARRAY['Complex Reasoning', 'Multi-step Problem Solving', 'Mathematics', 'General Knowledge'],
    TRUE
),
(
    'claude-3-5-sonnet',
    'Claude',
    'Anthropic Claude 3.5 Sonnet',
    'Anthropic',
    0.003000,
    0.015000,
    1650,
    200000,
    ARRAY['Advanced Coding', 'Nuanced Writing', 'Agentic Workflows', 'Long Context Analysis'],
    TRUE
),
(
    'gemini-1-5-pro',
    'Gemini',
    'Google Gemini 1.5 Pro',
    'Google',
    0.001250,
    0.005000,
    1100,
    2000000,
    ARRAY['Multimodal Reasoning', 'Massive Context Retrieval', 'Summarization', 'Data Analysis'],
    TRUE
),
(
    'llama-3-3-70b-versatile',
    'Llama',
    'Meta Llama 3.3 70B',
    'Meta / Groq',
    0.000590,
    0.000790,
    380,
    128000,
    ARRAY['Cost Efficiency', 'Ultra-low Latency', 'Structured Output', 'High-throughput Utility'],
    TRUE
),
(
    'deepseek-v3',
    'DeepSeek',
    'DeepSeek V3 / R1',
    'DeepSeek',
    0.000140,
    0.000280,
    850,
    64000,
    ARRAY['Mathematical Reasoning', 'Code Synthesis', 'Algorithmic Puzzles', 'Economic Efficiency'],
    TRUE
)
ON CONFLICT (model_id) DO NOTHING;

-- Seed Historical Research Metrics vs Leakage-Free Validated Baseline
INSERT INTO public.experiment_runs (
    run_name, model_name, is_leakage_free, accuracy, f1_score, precision, recall, cost_reduction_percent, latency_reduction_percent, cv_mean_f1, cv_std_f1, total_features, notes
) VALUES
(
    'Historical Thesis Benchmark',
    'XGBoost (Original Reported)',
    FALSE,
    0.9770,
    0.9770,
    0.9772,
    0.9770,
    53.34,
    41.84,
    0.9743,
    0.0011,
    82,
    'Historical reported metrics from undergraduate thesis notebook. Note: Features included post-hoc quality scores and best_quality_model (target leakage).'
)
ON CONFLICT DO NOTHING;
