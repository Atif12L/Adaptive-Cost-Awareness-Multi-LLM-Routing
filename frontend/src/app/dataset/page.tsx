'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Database,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Table,
  Layers,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
} from 'lucide-react';

interface DatasetRow {
  id: number;
  query_text: string;
  category: string;
  complexity: string;
  domain: string;
  token_count: number;
  quality_priority: number;
  cost_priority: number;
  recommended_model: string;
  best_quality_model: string;
  lowest_cost_model: string;
  is_leakage_row: boolean;
}

const SAMPLE_ROWS: DatasetRow[] = [
  {
    id: 1,
    query_text: 'Explain quantum entanglement and Bell inequalities with mathematical formulation.',
    category: 'STEM & Math',
    complexity: 'High',
    domain: 'Physics',
    token_count: 420,
    quality_priority: 0.9,
    cost_priority: 0.2,
    recommended_model: 'GPT',
    best_quality_model: 'GPT',
    lowest_cost_model: 'Llama',
    is_leakage_row: false,
  },
  {
    id: 2,
    query_text: 'Write a bash script to rotate Apache logs older than 7 days and compress with gzip.',
    category: 'Coding',
    complexity: 'Medium',
    domain: 'DevOps',
    token_count: 180,
    quality_priority: 0.6,
    cost_priority: 0.7,
    recommended_model: 'DeepSeek',
    best_quality_model: 'DeepSeek',
    lowest_cost_model: 'Llama',
    is_leakage_row: false,
  },
  {
    id: 3,
    query_text: 'Draft a friendly refund policy disclaimer for an eCommerce checkout flow.',
    category: 'Customer Support',
    complexity: 'Low',
    domain: 'General',
    token_count: 85,
    quality_priority: 0.3,
    cost_priority: 0.9,
    recommended_model: 'Llama',
    best_quality_model: 'Claude',
    lowest_cost_model: 'Llama',
    is_leakage_row: false,
  },
  {
    id: 4,
    query_text: 'Review this non-disclosure agreement for reciprocal indemnification loopholes.',
    category: 'Legal',
    complexity: 'Very High',
    domain: 'Law',
    token_count: 820,
    quality_priority: 1.0,
    cost_priority: 0.1,
    recommended_model: 'Claude',
    best_quality_model: 'Claude',
    lowest_cost_model: 'Llama',
    is_leakage_row: false,
  },
  {
    id: 5,
    query_text: 'Summarize the 80-page financial quarterly SEC 10-K report highlighting gross margins.',
    category: 'Data Analysis',
    complexity: 'High',
    domain: 'Finance',
    token_count: 1450,
    quality_priority: 0.7,
    cost_priority: 0.6,
    recommended_model: 'Gemini',
    best_quality_model: 'GPT',
    lowest_cost_model: 'Gemini',
    is_leakage_row: false,
  },
  {
    id: 6,
    query_text: 'Design a distributed rate-limiter using Redis sliding window log algorithm in Go.',
    category: 'Coding',
    complexity: 'High',
    domain: 'Software Architecture',
    token_count: 510,
    quality_priority: 0.8,
    cost_priority: 0.5,
    recommended_model: 'DeepSeek',
    best_quality_model: 'Claude',
    lowest_cost_model: 'DeepSeek',
    is_leakage_row: false,
  },
  {
    id: 7,
    query_text: 'Translate technical user manual from English into Japanese with formal keigo phrasing.',
    category: 'Translation',
    complexity: 'Medium',
    domain: 'Localization',
    token_count: 320,
    quality_priority: 0.8,
    cost_priority: 0.5,
    recommended_model: 'GPT',
    best_quality_model: 'GPT',
    lowest_cost_model: 'Gemini',
    is_leakage_row: false,
  },
  {
    id: 8,
    query_text: 'What is the capital of Australia and what is its population?',
    category: 'General Knowledge',
    complexity: 'Low',
    domain: 'Geography',
    token_count: 45,
    quality_priority: 0.4,
    cost_priority: 0.9,
    recommended_model: 'Llama',
    best_quality_model: 'Llama',
    lowest_cost_model: 'Llama',
    is_leakage_row: false,
  },
  {
    id: 9,
    query_text: 'Synthesize literature on CRISPR-Cas9 off-target cleavage mitigation strategies.',
    category: 'STEM & Math',
    complexity: 'Very High',
    domain: 'Biology',
    token_count: 950,
    quality_priority: 0.95,
    cost_priority: 0.2,
    recommended_model: 'Claude',
    best_quality_model: 'Claude',
    lowest_cost_model: 'Llama',
    is_leakage_row: false,
  },
  {
    id: 10,
    query_text: 'Parse CSV files and calculate rolling moving averages in Python pandas.',
    category: 'Data Analysis',
    complexity: 'Low',
    domain: 'Data Science',
    token_count: 130,
    quality_priority: 0.5,
    cost_priority: 0.8,
    recommended_model: 'DeepSeek',
    best_quality_model: 'DeepSeek',
    lowest_cost_model: 'Llama',
    is_leakage_row: false,
  },
];

const COLUMN_TAXONOMY = [
  {
    name: 'recommended_model',
    type: 'Categorical Target (5 classes)',
    status: 'Ground Truth Target',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    description: 'The target model assigned by the thesis optimization formula.',
  },
  {
    name: 'query_text',
    type: 'Text',
    status: 'Metadata Source',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Raw prompt text used to compute length, token, and syntactic features.',
  },
  {
    name: 'task_category / domain / complexity',
    type: 'Categorical & Ordinal',
    status: 'Valid Arrival-Time Feature',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'Provided or inferred at query arrival time without outcome bias.',
  },
  {
    name: 'quality_weight / cost_weight / latency_weight',
    type: 'Continuous [0, 1]',
    status: 'Valid Arrival-Time Feature',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    description: 'User-specified routing priority constraints.',
  },
  {
    name: 'best_quality_model / lowest_cost_model',
    type: 'Categorical (5 classes)',
    status: 'EXCLUDED: Target Leakage',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    description: 'Computed post-inference. Matches recommended_model in 85.11% of rows.',
  },
  {
    name: 'routing_score',
    type: 'Continuous',
    status: 'EXCLUDED: Target Leakage',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    description: 'Continuous objective function score computed after running all 5 models.',
  },
  {
    name: '{model}_quality / {model}_cost / {model}_latency',
    type: 'Continuous (15 columns)',
    status: 'EXCLUDED: Post-Execution Telemetry',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    description: 'Actual measured execution metrics for all 5 models on that query.',
  },
];

export default function DatasetPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModel, setSelectedModel] = useState('all');
  const [activeTab, setActiveTab] = useState<'table' | 'taxonomy'>('table');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const filteredRows = useMemo(() => {
    return SAMPLE_ROWS.filter((row) => {
      const matchSearch =
        row.query_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.domain.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat =
        selectedCategory === 'all' || row.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchModel =
        selectedModel === 'all' || row.recommended_model.toLowerCase() === selectedModel.toLowerCase();
      return matchSearch && matchCat && matchModel;
    });
  }, [searchTerm, selectedCategory, selectedModel]);

  const totalPages = Math.ceil(filteredRows.length / pageSize) || 1;
  const pagedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              30,000 Records Benchmark
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
              37 Attributes Evaluated
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Dataset Explorer & Feature Taxonomy
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Inspect the underlying thesis routing dataset (<code className="text-slate-300">llm_routing_dataset.csv</code>).
            Explore sample queries, distribution splits, and the strict isolation boundary between valid arrival-time
            features and post-inference leakage columns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'table'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Sample Query Table
          </button>
          <button
            onClick={() => setActiveTab('taxonomy')}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'taxonomy'
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Feature Taxonomy (37 Columns)
          </button>
        </div>
      </div>

      {/* Dataset Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block">Total Query Records</span>
          <span className="text-2xl font-bold font-mono text-white mt-1 block">30,000</span>
          <span className="text-[11px] text-cyan-400 mt-1 block">100% complete; 0 missing values</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block">Total Columns</span>
          <span className="text-2xl font-bold font-mono text-purple-400 mt-1 block">37 Columns</span>
          <span className="text-[11px] text-slate-400 mt-1 block">54 encoded feature vectors</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block">Leakage Columns Excluded</span>
          <span className="text-2xl font-bold font-mono text-red-400 mt-1 block">19 Columns</span>
          <span className="text-[11px] text-slate-400 mt-1 block">Filtered out to preserve integrity</span>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block">Train / Test Split</span>
          <span className="text-2xl font-bold font-mono text-emerald-400 mt-1 block">24,000 / 6,000</span>
          <span className="text-[11px] text-slate-400 mt-1 block">80/20 Stratified Partitioning</span>
        </div>
      </div>

      {/* View 1: Interactive Table */}
      {activeTab === 'table' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search prompt text or domain..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full bg-slate-950 border border-slate-800 pl-9 pr-4 py-2 text-xs rounded-lg text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Categories</option>
                <option value="Coding">Coding</option>
                <option value="Customer Support">Customer Support</option>
                <option value="Data Analysis">Data Analysis</option>
                <option value="Legal">Legal</option>
                <option value="STEM">STEM & Math</option>
                <option value="Translation">Translation</option>
              </select>

              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">All Models</option>
                <option value="GPT">GPT</option>
                <option value="Claude">Claude</option>
                <option value="Gemini">Gemini</option>
                <option value="Llama">Llama</option>
                <option value="DeepSeek">DeepSeek</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-3 w-12">#</th>
                    <th className="p-3">Query Prompt Text</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Complexity</th>
                    <th className="p-3">Domain</th>
                    <th className="p-3">Tokens</th>
                    <th className="p-3">Target Model</th>
                    <th className="p-3 text-red-400">best_quality_model (Leakage)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {pagedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono text-slate-400">{row.id}</td>
                      <td className="p-3 font-mono text-slate-200 max-w-sm truncate">
                        &ldquo;{row.query_text}&rdquo;
                      </td>
                      <td className="p-3">{row.category}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            row.complexity === 'Low'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : row.complexity === 'Medium'
                              ? 'bg-blue-500/10 text-blue-400'
                              : 'bg-purple-500/10 text-purple-400'
                          }`}
                        >
                          {row.complexity}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{row.domain}</td>
                      <td className="p-3 font-mono">{row.token_count}</td>
                      <td className="p-3">
                        <span className="font-bold text-cyan-400">{row.recommended_model}</span>
                      </td>
                      <td className="p-3 font-mono text-red-400/90 bg-red-950/10">
                        {row.best_quality_model}
                      </td>
                    </tr>
                  ))}
                  {pagedRows.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400">
                        No records matched your search filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing {pagedRows.length} of {filteredRows.length} sample records (Page {page} of {totalPages})
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700"
                >
                  <ChevronLeft className="w-3.5 h-3.5 inline mr-1" /> Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700"
                >
                  Next <ChevronRight className="w-3.5 h-3.5 inline ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Feature Taxonomy */}
      {activeTab === 'taxonomy' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white">Feature Taxonomy & Leakage Exclusion Rules</h3>
              <p className="text-xs text-slate-400">
                Formal classification of all 37 raw dataset attributes into inference-safe vs excluded categories
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">Rigorous Integrity Standard</span>
          </div>

          <div className="space-y-3">
            {COLUMN_TAXONOMY.map((col, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{col.name}</span>
                    <span className="text-[11px] text-slate-400 font-mono">({col.type})</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">{col.description}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-semibold rounded border shrink-0 ${col.badge}`}>
                  {col.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note about embeddings vs categorical */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-400 leading-relaxed">
          <strong className="text-slate-200">Embeddings vs. Tabular Metadata Discovery:</strong> Although the defense presentation
          briefly referenced 384-dimensional sentence transformer embeddings, the thesis Section 3.6 acknowledged that
          text vectors were not generated in the experiment. The dataset operates purely on tabular metadata (query lengths,
          syntactic presence, categories, domains, and utility weights). Our pipeline faithfully adheres to the final thesis
          specification without fabricating non-existent embeddings.
        </div>
      </div>
    </div>
  );
}
