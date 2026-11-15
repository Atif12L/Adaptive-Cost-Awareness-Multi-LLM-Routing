'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Zap,
  TrendingDown,
  Clock,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  AlertTriangle,
  HelpCircle,
  BarChart3,
  Filter,
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';

interface SampleDecision {
  id: string;
  name: string;
  category: string;
  complexity: string;
  query: string;
  tokens: number;
  objective: string;
  selectedModel: string;
  confidence: number;
  cost: number;
  latency: number;
  baselineCost: number;
  baselineLatency: number;
  rationale: string;
  topFeatures: { name: string; weight: number; direction: 'pro' | 'con' }[];
}

const PRESET_DECISIONS: SampleDecision[] = [
  {
    id: 'dec-1',
    name: 'Algorithmic Optimization Query',
    category: 'Coding & Debugging',
    complexity: 'High',
    query: 'Implement an O(V + E log V) Dijkstra shortest-path algorithm in C++ using a Fibonacci Heap with thread-safe edge relaxations.',
    tokens: 420,
    objective: 'balanced',
    selectedModel: 'DeepSeek',
    confidence: 0.742,
    cost: 0.00034,
    latency: 1120,
    baselineCost: 0.0063,
    baselineLatency: 1850,
    rationale: 'DeepSeek selected due to high coding density, strong algorithmic reasoning benchmarks, and 85% lower token pricing compared to frontier generalist models.',
    topFeatures: [
      { name: 'category == Coding', weight: 0.38, direction: 'pro' },
      { name: 'code_block_count > 0', weight: 0.24, direction: 'pro' },
      { name: 'reasoning_depth == High', weight: 0.19, direction: 'pro' },
      { name: 'cost_sensitive == True', weight: 0.12, direction: 'pro' },
    ],
  },
  {
    id: 'dec-2',
    name: 'Customer Support Triage',
    category: 'Customer Support',
    complexity: 'Low',
    query: 'How do I reset my password on the billing dashboard and change my linked recovery email address?',
    tokens: 95,
    objective: 'cost',
    selectedModel: 'Llama',
    confidence: 0.865,
    cost: 0.00004,
    latency: 410,
    baselineCost: 0.00142,
    baselineLatency: 1420,
    rationale: 'Llama 3 8B selected as low complexity, high conversational template pattern, yielding sub-cent routing with ultra-fast latency.',
    topFeatures: [
      { name: 'complexity == Low', weight: 0.44, direction: 'pro' },
      { name: 'category == Customer Support', weight: 0.31, direction: 'pro' },
      { name: 'token_count < 150', weight: 0.16, direction: 'pro' },
      { name: 'target_latency_priority == True', weight: 0.09, direction: 'pro' },
    ],
  },
  {
    id: 'dec-3',
    name: 'Multistep Constitutional Law Analysis',
    category: 'Legal Analysis',
    complexity: 'Very High',
    query: 'Analyze the jurisdictional interplay between EU GDPR Chapter V cross-border transfer rules and the US CLOUD Act executive agreements, citing relevant CJEU precedent.',
    tokens: 780,
    objective: 'quality',
    selectedModel: 'Claude',
    confidence: 0.791,
    cost: 0.0117,
    latency: 2240,
    baselineCost: 0.0117,
    baselineLatency: 2240,
    rationale: 'Claude 3.5 Sonnet selected because the query requires nuanced legal jurisprudence, zero tolerance for synthetic hallucinations, and strict precision constraints.',
    topFeatures: [
      { name: 'domain == Legal', weight: 0.41, direction: 'pro' },
      { name: 'complexity == Very High', weight: 0.28, direction: 'pro' },
      { name: 'objective == quality', weight: 0.22, direction: 'pro' },
      { name: 'requires_citations == True', weight: 0.15, direction: 'pro' },
    ],
  },
  {
    id: 'dec-4',
    name: 'Multi-modal Synthetic Chemistry Synthesis',
    category: 'STEM & Math',
    complexity: 'High',
    query: 'Detail the retrosynthetic pathway for stereoselective synthesis of Oseltamivir phosphate starting from shikimic acid, including reagent stoichiometry.',
    tokens: 540,
    objective: 'balanced',
    selectedModel: 'GPT',
    confidence: 0.684,
    cost: 0.00405,
    latency: 1680,
    baselineCost: 0.0081,
    baselineLatency: 1950,
    rationale: 'GPT-4o selected balancing complex chemical notation comprehension, high synthesis accuracy, and structured multi-step reaction explanations.',
    topFeatures: [
      { name: 'domain == Academic/STEM', weight: 0.35, direction: 'pro' },
      { name: 'reasoning_steps > 3', weight: 0.27, direction: 'pro' },
      { name: 'scientific_terms > 10', weight: 0.21, direction: 'pro' },
      { name: 'objective == balanced', weight: 0.14, direction: 'pro' },
    ],
  },
];

const PARETO_MODELS = [
  { name: 'Llama 3 8B', cost: 0.3, latency: 450, quality: 78.4, family: 'Llama', color: '#10b981' },
  { name: 'DeepSeek V3', cost: 0.85, latency: 980, quality: 88.2, family: 'DeepSeek', color: '#06b6d4' },
  { name: 'Gemini 1.5 Flash', cost: 0.5, latency: 620, quality: 82.5, family: 'Gemini', color: '#3b82f6' },
  { name: 'GPT-4o', cost: 7.5, latency: 1650, quality: 92.1, family: 'GPT', color: '#8b5cf6' },
  { name: 'Claude 3.5 Sonnet', cost: 9.0, latency: 1820, quality: 94.3, family: 'Claude', color: '#f59e0b' },
];

export default function AnalysisPage() {
  const [selectedPreset, setSelectedPreset] = useState<SampleDecision>(PRESET_DECISIONS[0]);

  const costSavingsPct = (
    ((selectedPreset.baselineCost - selectedPreset.cost) / selectedPreset.baselineCost) *
    100
  ).toFixed(1);

  const latencySavingsPct = (
    ((selectedPreset.baselineLatency - selectedPreset.latency) / selectedPreset.baselineLatency) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Inference Rationale & Trade-offs
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Leakage-Free Engine
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Routing Analysis & Decision Rationale
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Inspect how the multi-objective XGBoost routing engine transforms incoming query metadata
            into calibrated model recommendations, evaluating Pareto efficiency between cost, latency, and quality.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/playground"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            Live Query Playground
          </Link>
        </div>
      </div>

      {/* Preset Selector */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span>Select Routing Decision Scenario:</span>
          </div>
          <span className="text-xs text-slate-400">
            Click to inspect real-time feature contributions & trade-off curves
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {PRESET_DECISIONS.map((p) => {
            const isSelected = p.id === selectedPreset.id;
            return (
              <button
                key={p.id}
                onClick={() => setSelectedPreset(p)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/30 ring-1 ring-cyan-500/50'
                    : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-medium mb-1">
                  <span className="text-slate-200 truncate">{p.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] ${
                      p.selectedModel === 'GPT'
                        ? 'bg-purple-500/10 text-purple-400'
                        : p.selectedModel === 'Claude'
                        ? 'bg-amber-500/10 text-amber-400'
                        : p.selectedModel === 'Gemini'
                        ? 'bg-blue-500/10 text-blue-400'
                        : p.selectedModel === 'Llama'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-cyan-500/10 text-cyan-400'
                    }`}
                  >
                    {p.selectedModel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{p.category}</span>
                  <span className="font-mono text-emerald-400">{(p.confidence * 100).toFixed(0)}% conf</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Decision Summary & Top Features */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Selected Decision Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Active Scenario Inspection
                </span>
                <h3 className="text-xl font-bold text-white mt-0.5">{selectedPreset.name}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300">
                    Category: {selectedPreset.category}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded bg-slate-800 text-slate-300">
                    Complexity: {selectedPreset.complexity}
                  </span>
                  <span className="px-2 py-0.5 text-xs rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                    Objective: {selectedPreset.objective}
                  </span>
                </div>
              </div>
              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                <span className="text-xs text-slate-400 block">Assigned Provider</span>
                <span className="text-2xl font-black text-cyan-400">{selectedPreset.selectedModel}</span>
                <span className="text-xs block text-slate-400 font-mono mt-0.5">
                  {(selectedPreset.confidence * 100).toFixed(1)}% softmax prob
                </span>
              </div>
            </div>

            {/* Query Preview */}
            <div className="mt-4 p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
              <span className="text-xs text-slate-400 block mb-1 font-mono uppercase tracking-wider">
                Raw Query Text
              </span>
              <p className="text-sm text-slate-200 italic font-serif">
                &ldquo;{selectedPreset.query}&rdquo;
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                <span>Tokens: ~{selectedPreset.tokens}</span>
                <span>Language: En / CJK / Code</span>
                <span>Security Profile: Standard</span>
              </div>
            </div>

            {/* Performance Impact Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800/80">
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-400 block">Router Cost</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  ${selectedPreset.cost.toFixed(5)}
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">per call</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-400 block">Cost Reduction</span>
                <span className="text-base font-bold font-mono text-cyan-400">
                  -{costSavingsPct}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">vs $0.012 frontier</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-400 block">Router Latency</span>
                <span className="text-base font-bold font-mono text-emerald-400">
                  {selectedPreset.latency} ms
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">time-to-first-token</span>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-lg">
                <span className="text-[11px] text-slate-400 block">Latency Delta</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  -{latencySavingsPct}%
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">vs baseline</span>
              </div>
            </div>

            {/* Rationale Narrative */}
            <div className="mt-5 p-4 bg-cyan-950/20 border border-cyan-800/30 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Compass className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                  Model Selection Explanation
                </h4>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{selectedPreset.rationale}</p>
            </div>
          </div>

          {/* Card: Arrival-time Feature Contributions */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  Primary Feature Attribution (Arrival-Time)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Normalized relative influence of top query attributes leading to this routing recommendation.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-400 px-2 py-0.5 bg-slate-800 rounded">
                Leakage-Free Features
              </span>
            </div>

            <div className="space-y-3">
              {selectedPreset.topFeatures.map((feat, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-300">{feat.name}</span>
                    <span className="font-mono text-cyan-400 font-semibold">
                      +{(feat.weight * 100).toFixed(0)}% contribution
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${feat.weight * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Methodology Assurance:</strong> All weights reflect strictly arrival-time query metadata
                (word count, domain, complexity, priority weights). Post-inference fields such as
                <code className="text-red-400 bg-red-950/40 px-1 mx-1 rounded">best_quality_model</code> and
                <code className="text-red-400 bg-red-950/40 px-1 mx-1 rounded">routing_score</code> were completely
                excluded during model training to prevent data leakage.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Pareto Frontier & Decision Flow */}
        <div className="space-y-6">
          {/* Card: Pareto Trade-off Frontier */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Cost vs. Quality Trade-off</h3>
                <p className="text-xs text-slate-400">Pareto Frontier of LLM families</p>
              </div>
              <span className="text-xs text-cyan-400 font-mono">2026 Tiers</span>
            </div>

            {/* Scatter / Trade-off chart */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <XAxis
                    type="number"
                    dataKey="cost"
                    name="Cost ($/M tok)"
                    unit="$"
                    stroke="#64748b"
                    fontSize={10}
                    label={{ value: 'Cost ($ / M tokens)', position: 'insideBottom', offset: -12, fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="quality"
                    name="Quality Score"
                    stroke="#64748b"
                    fontSize={10}
                    domain={[70, 100]}
                    label={{ value: 'Quality (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10 }}
                  />
                  <ZAxis range={[120, 240]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-slate-700 p-2 rounded shadow-lg text-xs">
                            <p className="font-bold text-white">{data.name}</p>
                            <p className="text-cyan-400">Quality: {data.quality}%</p>
                            <p className="text-emerald-400">Cost: ${data.cost} / M tok</p>
                            <p className="text-amber-400">Latency: {data.latency} ms</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter name="Models" data={PARETO_MODELS}>
                    {PARETO_MODELS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Model legend */}
            <div className="grid grid-cols-2 gap-1.5 mt-2 pt-2 border-t border-slate-800 text-[11px]">
              {PARETO_MODELS.map((m) => (
                <div key={m.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-slate-300 truncate">{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: 5-Stage Routing Pipeline */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-semibold text-white mb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Routing Decision Pipeline
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Execution stages applied to each incoming query in production:
            </p>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800">
              <div className="flex items-start gap-3 relative">
                <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <div>
                  <h5 className="text-xs font-semibold text-slate-200">Query Ingestion & Validation</h5>
                  <p className="text-[11px] text-slate-400">
                    Input length, token estimation, language detection, and schema validation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <div>
                  <h5 className="text-xs font-semibold text-slate-200">Arrival-Time Feature Extraction</h5>
                  <p className="text-[11px] text-slate-400">
                    54 numeric, ordinal, and one-hot categorical vectors generated without outcome bias.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <div>
                  <h5 className="text-xs font-semibold text-slate-200">XGBoost Sub-Millisecond Inference</h5>
                  <p className="text-[11px] text-slate-400">
                    Evaluation via native Universal Binary JSON model with 100 boosted trees in ~0.8ms.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">
                  4
                </span>
                <div>
                  <h5 className="text-xs font-semibold text-slate-200">Objective-Weighted Utility Scoring</h5>
                  <p className="text-[11px] text-slate-400">
                    Adjusts softmax probabilities with user objective (cost-saving vs latency vs quality).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-500/50 text-cyan-400 text-xs font-bold flex items-center justify-center shrink-0">
                  5
                </span>
                <div>
                  <h5 className="text-xs font-semibold text-slate-200">Adapter Dispatch & Telemetry</h5>
                  <p className="text-[11px] text-slate-400">
                    Simulation response returned or forwarded to target provider adapter with token logs.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Research Caveats & Limitations */}
          <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl p-4 text-xs text-amber-300 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Assumptions & Research Caveats</span>
            </div>
            <p className="text-amber-200/80 leading-relaxed text-[11px]">
              • Costs and latencies in simulation mode are calibrated against official 2026 list prices and typical network RTTs.<br />
              • The 97.70% accuracy reported in the original thesis utilized post-inference target columns. The live validated model operates strictly at 58.62% without data leakage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
