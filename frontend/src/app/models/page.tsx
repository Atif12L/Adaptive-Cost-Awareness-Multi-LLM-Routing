'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  Zap,
  TrendingDown,
  Clock,
  ShieldCheck,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface ModelProfile {
  id: string;
  name: string;
  family: string;
  provider: string;
  color: string;
  badgeColor: string;
  inputCostPerM: number;
  outputCostPerM: number;
  typicalLatencyMs: number;
  contextWindow: string;
  qualityScore: number;
  routingSharePct: number;
  historicalAccuracyScore: number;
  strengths: string[];
  weaknesses: string[];
  optimalRoutingTriggers: string[];
  architecture: string;
  pricingStatus: 'Simulated 2026 Commercial Pricing' | 'Historical Dataset Baseline';
}

const MODELS_DATA: ModelProfile[] = [
  {
    id: 'gpt',
    name: 'GPT-4o / GPT-4o-mini',
    family: 'GPT',
    provider: 'OpenAI',
    color: '#a855f7',
    badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
    inputCostPerM: 2.50,
    outputCostPerM: 10.00,
    typicalLatencyMs: 1650,
    contextWindow: '128k tokens',
    qualityScore: 92.1,
    routingSharePct: 22.4,
    historicalAccuracyScore: 94.8,
    strengths: [
      'Top-tier multi-turn instruction following',
      'Complex academic reasoning & synthesis',
      'Robust JSON schema and tool calling support',
      'Consistent multilingual fluency',
    ],
    weaknesses: [
      'Higher unit economics on long context queries',
      'Subject to periodic rate limits under enterprise peaks',
    ],
    optimalRoutingTriggers: [
      'Objective set to "quality"',
      'Complex reasoning depth > 3',
      'Multilingual or open-ended analytical synthesis',
    ],
    architecture: 'Dense Mixture of Experts (MoE) Frontier Model',
    pricingStatus: 'Simulated 2026 Commercial Pricing',
  },
  {
    id: 'claude',
    name: 'Claude 3.5 Sonnet / Haiku',
    family: 'Claude',
    provider: 'Anthropic',
    color: '#f59e0b',
    badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    inputCostPerM: 3.00,
    outputCostPerM: 15.00,
    typicalLatencyMs: 1820,
    contextWindow: '200k tokens',
    qualityScore: 94.3,
    routingSharePct: 18.2,
    historicalAccuracyScore: 95.2,
    strengths: [
      'Industry-leading nuanced prose & writing tone',
      'Complex legal and regulatory contract review',
      'Superior code architecture & refactoring fidelity',
      'Strict adherence to nuanced safety guardrails',
    ],
    weaknesses: [
      'Highest token pricing among generalist options',
      'Moderate latency overhead on complex system prompts',
    ],
    optimalRoutingTriggers: [
      'Legal & Contract review queries',
      'Strict factual citation requirements',
      'Zero-hallucination tolerance parameters',
    ],
    architecture: 'Frontier Autoregressive Transformer with Constitutional Alignment',
    pricingStatus: 'Simulated 2026 Commercial Pricing',
  },
  {
    id: 'gemini',
    name: 'Gemini 1.5 Pro / Flash',
    family: 'Gemini',
    provider: 'Google DeepMind',
    color: '#3b82f6',
    badgeColor: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    inputCostPerM: 0.35,
    outputCostPerM: 1.05,
    typicalLatencyMs: 620,
    contextWindow: '2M tokens',
    qualityScore: 84.5,
    routingSharePct: 19.8,
    historicalAccuracyScore: 91.4,
    strengths: [
      'Gigantic 2,000,000-token context window',
      'Ultra-fast audio, video, and multimodal digestion',
      'Unmatched price-to-speed ratio in Flash tier',
      'Deep integration with Google Knowledge Graph',
    ],
    weaknesses: [
      'Slightly lower dense algorithmic code generation than Claude/DeepSeek',
    ],
    optimalRoutingTriggers: [
      'Very large documents or long token context (>32k)',
      'High-throughput bulk ingestion requirements',
      'Latency-sensitive business queries',
    ],
    architecture: 'Multimodal MoE Transformer Architecture',
    pricingStatus: 'Simulated 2026 Commercial Pricing',
  },
  {
    id: 'llama',
    name: 'Llama 3 8B / 70B',
    family: 'Llama',
    provider: 'Meta (Groq / Together / Self-Hosted)',
    color: '#10b981',
    badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    inputCostPerM: 0.15,
    outputCostPerM: 0.60,
    typicalLatencyMs: 450,
    contextWindow: '8k - 128k tokens',
    qualityScore: 78.4,
    routingSharePct: 24.1,
    historicalAccuracyScore: 88.0,
    strengths: [
      'Extreme sub-cent economics on dedicated inference (Groq LPUs)',
      'Sub-500ms time to first token for rapid triage',
      'Open-weight deployment allows self-hosted data privacy',
      'Outstanding utility for standard summaries and customer support',
    ],
    weaknesses: [
      'Lower performance on ultra-complex multi-step symbolic logic',
      'Requires strict prompt templates to prevent drift',
    ],
    optimalRoutingTriggers: [
      'Cost minimization objective',
      'Low complexity or conversational FAQ queries',
      'Latency-sensitive SLA constraints (<500ms)',
    ],
    architecture: 'Dense Open-Weights Decoder-Only Architecture',
    pricingStatus: 'Simulated 2026 Commercial Pricing',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek V3 / R1 Reasoner',
    family: 'DeepSeek',
    provider: 'DeepSeek AI',
    color: '#06b6d4',
    badgeColor: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
    inputCostPerM: 0.27,
    outputCostPerM: 1.10,
    typicalLatencyMs: 980,
    contextWindow: '64k - 128k tokens',
    qualityScore: 88.2,
    routingSharePct: 15.5,
    historicalAccuracyScore: 92.6,
    strengths: [
      'Exceptional competitive programming & math reasoning',
      'State-of-the-art Multi-head Latent Attention (MLA) efficiency',
      'Remarkably low token costs rivaling open-source models',
      'Built-in chain-of-thought verification pathways',
    ],
    weaknesses: [
      'Higher latency during active chain-of-thought expansion',
      'Regional API gateway availability variations',
    ],
    optimalRoutingTriggers: [
      'Coding, algorithmic problems, and competitive math',
      'Balanced objective with strong reasoning requirement',
      'Syntax verification and software architecture tasks',
    ],
    architecture: 'DeepSeek MLA + DeepSeekMoE Sparse Architecture',
    pricingStatus: 'Simulated 2026 Commercial Pricing',
  },
];

const COMPARISON_CHART_DATA = [
  { name: 'GPT', costPerM: 6.25, latencyMs: 1650, quality: 92.1, routingShare: 22.4 },
  { name: 'Claude', costPerM: 9.00, latencyMs: 1820, quality: 94.3, routingShare: 18.2 },
  { name: 'Gemini', costPerM: 0.70, latencyMs: 620, quality: 84.5, routingShare: 19.8 },
  { name: 'Llama', costPerM: 0.38, latencyMs: 450, quality: 78.4, routingShare: 24.1 },
  { name: 'DeepSeek', costPerM: 0.68, latencyMs: 980, quality: 88.2, routingShare: 15.5 },
];

const RADAR_DATA = [
  { metric: 'Code & Math', GPT: 90, Claude: 93, Gemini: 82, Llama: 75, DeepSeek: 96 },
  { metric: 'Nuanced Prose', GPT: 91, Claude: 97, Gemini: 85, Llama: 76, DeepSeek: 84 },
  { metric: 'Cost Efficiency', GPT: 35, Claude: 25, Gemini: 85, Llama: 96, DeepSeek: 92 },
  { metric: 'Latency / Speed', GPT: 60, Claude: 55, Gemini: 88, Llama: 95, DeepSeek: 75 },
  { metric: 'Context Window', GPT: 75, Claude: 85, Gemini: 100, Llama: 65, DeepSeek: 70 },
  { metric: 'Instruction Adherence', GPT: 92, Claude: 95, Gemini: 84, Llama: 79, DeepSeek: 88 },
];

export default function ModelsPage() {
  const [activeTab, setActiveTab] = useState<'cards' | 'matrix'>('cards');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');

  const filteredModels =
    selectedFamily === 'all'
      ? MODELS_DATA
      : MODELS_DATA.filter((m) => m.family.toLowerCase() === selectedFamily.toLowerCase());

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              5 Supported LLM Families
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Multi-Provider Ecosystem
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Model Profiles & Comparative Matrix
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            In-depth evaluation of the 5 LLM families evaluated in the thesis (GPT, Claude, Gemini, Llama, DeepSeek).
            Inspect token economics, latency benchmarks, contextual capacities, and automated routing triggers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'cards'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Family Profiles
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'matrix'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Head-to-Head Matrix
          </button>
        </div>
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block">Total Evaluated Families</span>
          <span className="text-2xl font-bold text-white mt-1 block">5 Families</span>
          <span className="text-[11px] text-cyan-400 mt-1 block">GPT, Claude, Gemini, Llama, DeepSeek</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block">Cost Range (Blended / M tok)</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">$0.38 — $9.00</span>
          <span className="text-[11px] text-slate-400 mt-1 block">23.7x economic spread between tiers</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block">Typical Latency Spread</span>
          <span className="text-2xl font-bold font-mono text-amber-400 mt-1 block">450ms — 1,820ms</span>
          <span className="text-[11px] text-slate-400 mt-1 block">4x latency advantage for lightweight tiers</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block">Simulation Calibration</span>
          <span className="text-2xl font-bold text-cyan-400 mt-1 block">2026 Commercial</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Token pricing calibrated to market rates</span>
        </div>
      </div>

      {/* Visual Benchmarking Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost & Latency Benchmark Chart */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Blended Token Cost & Latency</h3>
              <p className="text-xs text-slate-400">Average cost ($/M) and response latency (ms)</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">Normalized Benchmarks</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMPARISON_CHART_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="left" stroke="#10b981" fontSize={11} label={{ value: 'Cost ($/M)', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 10 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#f59e0b" fontSize={11} label={{ value: 'Latency (ms)', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="costPerM" name="Blended Cost ($/M tok)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="latencyMs" name="Avg Latency (ms)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Capability Radar Chart */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Multidimensional Capability Matrix</h3>
              <p className="text-xs text-slate-400">Relative strength index across key evaluation axes</p>
            </div>
            <span className="text-xs font-mono text-purple-400">Normalized 0-100</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart outerRadius={90} data={RADAR_DATA}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" fontSize={10} />
                <PolarRadiusAxis stroke="#475569" angle={30} domain={[0, 100]} fontSize={9} />
                <Radar name="GPT" dataKey="GPT" stroke="#a855f7" fill="#a855f7" fillOpacity={0.15} />
                <Radar name="Claude" dataKey="Claude" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} />
                <Radar name="DeepSeek" dataKey="DeepSeek" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tab 1: Detailed Cards View */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">LLM Family Deep Dives</h2>
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setSelectedFamily('all')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedFamily === 'all' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All (5)
              </button>
              {MODELS_DATA.map((m) => (
                <button
                  key={m.family}
                  onClick={() => setSelectedFamily(m.family)}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    selectedFamily === m.family ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m.family}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredModels.map((model) => (
              <div
                key={model.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-5 flex flex-col justify-between transition-all"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded border ${model.badgeColor}`}>
                      {model.family}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {model.routingSharePct}% router share
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{model.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{model.provider}</p>

                  <p className="text-xs text-slate-400 font-mono mt-2 bg-slate-950/60 p-2 rounded border border-slate-800/80">
                    {model.architecture}
                  </p>

                  {/* Pricing and Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">Input / M tok</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ${model.inputCostPerM.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">Output / M tok</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ${model.outputCostPerM.toFixed(2)}
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">Avg Latency</span>
                      <span className="font-mono font-bold text-amber-400">
                        {model.typicalLatencyMs} ms
                      </span>
                    </div>
                    <div className="p-2 bg-slate-950/40 rounded border border-slate-800/60">
                      <span className="text-[10px] text-slate-400 block">Context Window</span>
                      <span className="font-mono font-bold text-cyan-400 truncate block">
                        {model.contextWindow}
                      </span>
                    </div>
                  </div>

                  {/* Strengths */}
                  <div className="mt-4">
                    <span className="text-[11px] font-semibold text-slate-300 block mb-1">
                      Key Strengths
                    </span>
                    <ul className="space-y-1">
                      {model.strengths.map((str, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Optimal Triggers */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <span className="text-[11px] font-semibold text-cyan-400 block mb-1">
                      Optimal Routing Triggers
                    </span>
                    <ul className="space-y-1">
                      {model.optimalRoutingTriggers.map((trig, idx) => (
                        <li key={idx} className="text-xs text-slate-400 flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{trig}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="italic">{model.pricingStatus}</span>
                  <Link
                    href={`/playground?model=${model.family}`}
                    className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                  >
                    Test <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Head-to-Head Comparison Table */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">Full Head-to-Head Specifications</h3>
            <span className="text-xs font-mono text-slate-400">5 Families × 11 Dimensions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Model Family</th>
                  <th className="p-3">Representative Model</th>
                  <th className="p-3">Provider</th>
                  <th className="p-3">Input Cost / M</th>
                  <th className="p-3">Output Cost / M</th>
                  <th className="p-3">Avg Latency</th>
                  <th className="p-3">Context Window</th>
                  <th className="p-3">Quality Score</th>
                  <th className="p-3">Historical Acc</th>
                  <th className="p-3">Router Share</th>
                  <th className="p-3">Pricing Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {MODELS_DATA.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                      {m.family}
                    </td>
                    <td className="p-3 text-slate-200">{m.name}</td>
                    <td className="p-3 text-slate-400">{m.provider}</td>
                    <td className="p-3 font-mono text-emerald-400">${m.inputCostPerM.toFixed(2)}</td>
                    <td className="p-3 font-mono text-emerald-400">${m.outputCostPerM.toFixed(2)}</td>
                    <td className="p-3 font-mono text-amber-400">{m.typicalLatencyMs} ms</td>
                    <td className="p-3 font-mono text-cyan-400">{m.contextWindow}</td>
                    <td className="p-3 font-mono">{m.qualityScore}%</td>
                    <td className="p-3 font-mono text-purple-400">{m.historicalAccuracyScore}%</td>
                    <td className="p-3 font-mono text-slate-200">{m.routingSharePct}%</td>
                    <td className="p-3 text-[11px] text-slate-400">{m.pricingStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Attribution and Research Integrity Callout */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-200">Data Source Clarification:</strong> The thesis evaluated performance across
          these five distinct LLM families. Historical accuracy scores reflect the reported experimental values from the thesis
          (Section 4.3). Commercial pricing and latency metrics are based on standard 2026 enterprise API pricing to provide
          actionable economic simulation for modern developer deployments.
        </div>
      </div>
    </div>
  );
}
