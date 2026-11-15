'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingDown,
  Clock,
  Zap,
  BarChart3,
  PieChart as PieIcon,
  Filter,
  DollarSign,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

const CATEGORY_METRICS = [
  { category: 'Coding', totalQueries: 6420, avgCost: 0.0018, baselineCost: 0.0062, avgLatency: 1040, topModel: 'DeepSeek' },
  { category: 'Creative Writing', totalQueries: 4850, avgCost: 0.0034, baselineCost: 0.0084, avgLatency: 1420, topModel: 'Claude' },
  { category: 'Customer Support', totalQueries: 5910, avgCost: 0.0004, baselineCost: 0.0028, avgLatency: 480, topModel: 'Llama' },
  { category: 'Data Analysis', totalQueries: 4320, avgCost: 0.0022, baselineCost: 0.0058, avgLatency: 1180, topModel: 'GPT' },
  { category: 'Legal & Compliance', totalQueries: 2840, avgCost: 0.0051, baselineCost: 0.0105, avgLatency: 1850, topModel: 'Claude' },
  { category: 'STEM & Math', totalQueries: 3660, avgCost: 0.0028, baselineCost: 0.0075, avgLatency: 1320, topModel: 'GPT' },
  { category: 'Translation', totalQueries: 2000, avgCost: 0.0006, baselineCost: 0.0032, avgLatency: 610, topModel: 'Gemini' },
];

const COMPLEXITY_BREAKDOWN = [
  { level: 'Low', count: 10240, sharePct: 34.1, avgSavingsPct: 68.4, preferredModel: 'Llama' },
  { level: 'Medium', count: 12560, sharePct: 41.9, avgSavingsPct: 47.2, preferredModel: 'Gemini / DeepSeek' },
  { level: 'High', count: 5400, sharePct: 18.0, avgSavingsPct: 32.5, preferredModel: 'GPT' },
  { level: 'Very High', count: 1800, sharePct: 6.0, avgSavingsPct: 14.1, preferredModel: 'Claude' },
];

const MODEL_DISTRIBUTION = [
  { name: 'Llama', value: 24.1, color: '#10b981' },
  { name: 'GPT', value: 22.4, color: '#8b5cf6' },
  { name: 'Gemini', value: 19.8, color: '#3b82f6' },
  { name: 'Claude', value: 18.2, color: '#f59e0b' },
  { name: 'DeepSeek', value: 15.5, color: '#06b6d4' },
];

const HOURLY_SAVINGS_TREND = [
  { hour: '00:00', baselineSpend: 42.5, routerSpend: 22.1, savings: 20.4 },
  { hour: '04:00', baselineSpend: 28.0, routerSpend: 14.2, savings: 13.8 },
  { hour: '08:00', baselineSpend: 86.4, routerSpend: 45.1, savings: 41.3 },
  { hour: '12:00', baselineSpend: 128.0, routerSpend: 66.8, savings: 61.2 },
  { hour: '16:00', baselineSpend: 114.5, routerSpend: 59.7, savings: 54.8 },
  { hour: '20:00', baselineSpend: 75.2, routerSpend: 39.4, savings: 35.8 },
];

export default function AnalyticsPage() {
  const [selectedObjectiveFilter, setSelectedObjectiveFilter] = useState<string>('all');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Aggregated Gateway Telemetry
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              30,000 Sample Benchmarks
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            System Analytics & Efficiency Insights
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Examine routing efficiency, cost curves, latency reductions, and task-complexity distributions
            across 30,000 dataset queries and simulated enterprise workloads.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/evaluation"
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
            ML Model Evaluation
          </Link>
          <Link
            href="/playground"
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            Query Router
          </Link>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Historical Cost Savings</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400">Thesis 2024</span>
          </div>
          <span className="text-2xl font-bold font-mono text-purple-400">53.34%</span>
          <span className="text-[11px] text-slate-400 block mt-1">Reported thesis benchmark</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Validated Leakage-Free Savings</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400">Reproduced</span>
          </div>
          <span className="text-2xl font-bold font-mono text-emerald-400">46.11%</span>
          <span className="text-[11px] text-slate-400 block mt-1">Realistic arrival-time metadata</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Historical Latency Reduction</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-400">Thesis 2024</span>
          </div>
          <span className="text-2xl font-bold font-mono text-purple-400">41.84%</span>
          <span className="text-[11px] text-slate-400 block mt-1">Static outcome selection</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Validated Latency Reduction</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400">Reproduced</span>
          </div>
          <span className="text-2xl font-bold font-mono text-cyan-400">31.08%</span>
          <span className="text-[11px] text-slate-400 block mt-1">1,650ms down to 1,137ms average</span>
        </div>
      </div>

      {/* Row 1: Cumulative Savings Trend & Model Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cumulative Savings Area Chart */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Daily Spending Curve: Router vs Static Baseline</h3>
              <p className="text-xs text-slate-400">Simulated 24-hour enterprise query volume ($)</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Avg -48.2% daily cost
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HOURLY_SAVINGS_TREND} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="routerGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  formatter={(val: any) => [`$${val}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="baselineSpend" name="Static Frontier Baseline ($)" stroke="#ef4444" fillOpacity={1} fill="url(#baselineGrad)" />
                <Area type="monotone" dataKey="routerSpend" name="Adaptive Cost-Aware Router ($)" stroke="#10b981" fillOpacity={1} fill="url(#routerGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Distribution Donut */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-white">Model Selection Share</h3>
              <PieIcon className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xs text-slate-400 mb-4">Percentage of total routing decisions</p>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MODEL_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {MODEL_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                    formatter={(val: any) => [`${val}%`, 'Share']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
            {MODEL_DISTRIBUTION.map((m) => (
              <div key={m.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                  <span className="text-slate-300">{m.name}</span>
                </div>
                <span className="font-mono text-slate-400 font-semibold">{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Category Cost Analysis */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Category-Wise Economic Impact</h3>
            <p className="text-xs text-slate-400">
              Query volume, cost reduction, and top recommended provider per domain
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">7 Primary Categories Evaluated</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Task Category</th>
                <th className="p-3">Queries In Dataset</th>
                <th className="p-3">Router Cost / Call</th>
                <th className="p-3">Baseline Cost / Call</th>
                <th className="p-3">Cost Savings</th>
                <th className="p-3">Avg Latency</th>
                <th className="p-3">Top Recommended Model</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {CATEGORY_METRICS.map((cat) => {
                const savingsPct = (((cat.baselineCost - cat.avgCost) / cat.baselineCost) * 100).toFixed(1);
                return (
                  <tr key={cat.category} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-semibold text-white">{cat.category}</td>
                    <td className="p-3 font-mono">{cat.totalQueries.toLocaleString()}</td>
                    <td className="p-3 font-mono text-emerald-400">${cat.avgCost.toFixed(4)}</td>
                    <td className="p-3 font-mono text-slate-400">${cat.baselineCost.toFixed(4)}</td>
                    <td className="p-3 font-mono font-bold text-cyan-400">-{savingsPct}%</td>
                    <td className="p-3 font-mono text-amber-400">{cat.avgLatency} ms</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-200">
                        {cat.topModel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Complexity Breakdown Cards */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3">Complexity-Stratified Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COMPLEXITY_BREAKDOWN.map((comp) => (
            <div key={comp.level} className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {comp.level} Complexity
                </span>
                <span className="text-xs font-mono text-cyan-400">{comp.sharePct}% of total</span>
              </div>
              <div className="text-xl font-bold font-mono text-white">
                {comp.count.toLocaleString()} queries
              </div>
              <div className="pt-2 border-t border-slate-800 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Avg Cost Savings:</span>
                  <span className="font-mono font-semibold text-emerald-400">-{comp.avgSavingsPct}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Preferred Tier:</span>
                  <span className="font-semibold text-slate-200">{comp.preferredModel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Academic Citation Footer */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs text-slate-400">
        <span>
          Metrics aggregated across the complete 30,000-row thesis benchmark dataset.
        </span>
        <Link href="/dataset" className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1">
          Explore Raw Dataset <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
