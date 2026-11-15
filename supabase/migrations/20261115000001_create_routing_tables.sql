-- Supabase SQL Migration
-- Adaptive Cost-Aware Semantic Routing Gateway
-- Migration: 20261115000001_create_routing_tables.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. MODEL CONFIGURATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.model_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_id VARCHAR(50) UNIQUE NOT NULL,
    family VARCHAR(50) NOT NULL, -- GPT, Claude, Gemini, Llama, DeepSeek
    display_name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    cost_per_1k_input_tokens NUMERIC(10, 6) NOT NULL,
    cost_per_1k_output_tokens NUMERIC(10, 6) NOT NULL,
    typical_latency_ms INTEGER NOT NULL,
    context_window INTEGER NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Index on model family and active status
CREATE INDEX IF NOT EXISTS idx_model_configurations_family ON public.model_configurations(family);
CREATE INDEX IF NOT EXISTS idx_model_configurations_active ON public.model_configurations(is_active);

-- ============================================================================
-- 2. ROUTING REQUESTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.routing_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_text TEXT NOT NULL,
    category VARCHAR(100),
    domain VARCHAR(100),
    complexity VARCHAR(50), -- Easy, Medium, Hard, Expert
    reasoning_level VARCHAR(50), -- Low, Medium, High
    urgency VARCHAR(50) DEFAULT 'Medium',
    budget_priority VARCHAR(50) DEFAULT 'Medium',
    quality_priority VARCHAR(50) DEFAULT 'High',
    latency_priority VARCHAR(50) DEFAULT 'Low',
    requires_code BOOLEAN DEFAULT FALSE,
    requires_math BOOLEAN DEFAULT FALSE,
    requires_reasoning BOOLEAN DEFAULT FALSE,
    requires_creativity BOOLEAN DEFAULT FALSE,
    multilingual BOOLEAN DEFAULT FALSE,
    token_count INTEGER,
    
    -- Routing Outcome
    routed_model_family VARCHAR(50) NOT NULL,
    routed_model_id VARCHAR(50),
    confidence_score NUMERIC(5, 4),
    routing_mode VARCHAR(50) DEFAULT 'simulation', -- 'simulation' or 'live'
    routing_reasoning TEXT,
    
    -- Economics & Performance
    estimated_cost NUMERIC(10, 6),
    estimated_latency_ms INTEGER,
    baseline_cost NUMERIC(10, 6),
    baseline_latency_ms INTEGER,
    cost_saved NUMERIC(10, 6),
    
    -- Execution status & Live response
    execution_status VARCHAR(50) DEFAULT 'simulated', -- 'simulated', 'success', 'failed'
    response_text TEXT,
    feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
    feedback_comment TEXT,
    client_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Indexes for analytics query performance
CREATE INDEX IF NOT EXISTS idx_routing_requests_created_at ON public.routing_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_routing_requests_family ON public.routing_requests(routed_model_family);
CREATE INDEX IF NOT EXISTS idx_routing_requests_category ON public.routing_requests(category);
CREATE INDEX IF NOT EXISTS idx_routing_requests_domain ON public.routing_requests(domain);
CREATE INDEX IF NOT EXISTS idx_routing_requests_complexity ON public.routing_requests(complexity);

-- ============================================================================
-- 3. EXPERIMENT RUNS & BENCHMARKS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.experiment_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_name VARCHAR(100) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    is_leakage_free BOOLEAN NOT NULL,
    accuracy NUMERIC(6, 4) NOT NULL,
    f1_score NUMERIC(6, 4) NOT NULL,
    precision NUMERIC(6, 4) NOT NULL,
    recall NUMERIC(6, 4) NOT NULL,
    cost_reduction_percent NUMERIC(5, 2),
    latency_reduction_percent NUMERIC(5, 2),
    cv_mean_f1 NUMERIC(6, 4),
    cv_std_f1 NUMERIC(6, 4),
    total_features INTEGER NOT NULL,
    top_features JSONB DEFAULT '[]'::jsonb,
    confusion_matrix JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.model_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routing_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_runs ENABLE ROW LEVEL SECURITY;

-- Allow anonymous/public read access to model configs and experiment runs
CREATE POLICY "Public read model configurations"
    ON public.model_configurations FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

CREATE POLICY "Public read experiment runs"
    ON public.experiment_runs FOR SELECT
    TO anon, authenticated
    USING (TRUE);

-- Allow public insertion of routing requests (simulation usage)
CREATE POLICY "Allow public insert routing requests"
    ON public.routing_requests FOR INSERT
    TO anon, authenticated
    WITH CHECK (TRUE);

-- Allow public select of their recently created requests (limit to public view)
CREATE POLICY "Allow public select routing requests"
    ON public.routing_requests FOR SELECT
    TO anon, authenticated
    USING (TRUE);

-- Service role has unrestricted access across all tables
-- (Supabase default handles service_role bypass)
