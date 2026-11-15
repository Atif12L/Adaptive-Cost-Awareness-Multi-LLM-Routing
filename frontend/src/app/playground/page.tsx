"use client";

import React, { useState } from "react";
import {
  Play,
  Sparkles,
  Zap,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sliders,
  DollarSign,
  ChevronDown,
} from "lucide-react";
import { routeQuery } from "@/lib/api";
import { RoutingRequest, RoutingResponse } from "@/lib/types";
import { formatCurrency, formatPercent, formatMs } from "@/lib/utils";

const PRESETS = [
  {
    title: "Code Generation & Architecture",
    query: "Design a fault-tolerant distributed rate-limiter in Python using Redis and sliding-window counter algorithm with unit tests.",
    category: "Code Generation",
    domain: "Software Engineering",
    complexity: "Hard",
    reasoning_level: "High",
    requires_code: true,
    requires_math: false,
    requires_reasoning: true,
    quality_priority: "High",
    budget_priority: "Low",
    latency_priority: "Low",
  },
  {
    title: "Mathematical Proof & Calculus",
    query: "Compute the closed-form eigenvalues and eigenvectors of a 3x3 symmetric matrix A and verify orthogonality.",
    category: "Problem Solving",
    domain: "Mathematics",
    complexity: "Hard",
    reasoning_level: "High",
    requires_code: false,
    requires_math: true,
    requires_reasoning: true,
    quality_priority: "High",
    budget_priority: "High",
    latency_priority: "Low",
  },
  {
    title: "Low-Latency Quick Utility",
    query: "Check if this phone number format is valid for E.164 standard: +14155552671 and return JSON.",
    category: "General Question Answering",
    domain: "Networking",
    complexity: "Easy",
    reasoning_level: "Low",
    requires_code: false,
    requires_math: false,
    requires_reasoning: false,
    quality_priority: "Medium",
    budget_priority: "High",
    latency_priority: "High",
  },
  {
    title: "Document Summarization",
    query: "Synthesize the core clinical recommendations from this multi-page medical treatment guideline into 5 bullet points.",
    category: "Summarization Task",
    domain: "Medical",
    complexity: "Medium",
    reasoning_level: "Medium",
    requires_code: false,
    requires_math: false,
    requires_reasoning: true,
    quality_priority: "High",
    budget_priority: "Medium",
    latency_priority: "Medium",
  },
];

const CATEGORIES = [
  "Code Generation",
  "Conceptual Question",
  "Explanation",
  "Debugging",
  "Mathematics",
  "How-To Tutorial",
  "Summarization Task",
  "Problem Solving",
  "Research Assistance",
  "Translation Task",
  "Content Creation",
  "Code Review",
  "Optimization Task",
  "Comparative Analysis",
  "General Question Answering",
];

const DOMAINS = [
  "Programming",
  "Data Science",
  "Software Engineering",
  "Machine Learning",
  "Cyber Security",
  "Cloud Computing",
  "DevOps",
  "Finance",
  "Legal",
  "Medical",
  "Mathematics",
  "Physics",
  "Economics",
  "Marketing",
  "Education",
];

export default function PlaygroundPage() {
  const [query, setQuery] = useState(
    "Design a distributed rate-limiter in Python using Redis with unit tests."
  );
  const [category, setCategory] = useState("Code Generation");
  const [domain, setDomain] = useState("Programming");
  const [complexity, setComplexity] = useState("Hard");
  const [reasoningLevel, setReasoningLevel] = useState("High");
  const [qualityPriority, setQualityPriority] = useState("High");
  const [budgetPriority, setBudgetPriority] = useState("Medium");
  const [latencyPriority, setLatencyPriority] = useState("Low");
  const [requiresCode, setRequiresCode] = useState(true);
  const [requiresMath, setRequiresMath] = useState(false);
  const [requiresReasoning, setRequiresReasoning] = useState(true);
  const [requiresCreativity, setRequiresCreativity] = useState(false);
  const [multilingual, setMultilingual] = useState(false);
  const [routingMode, setRoutingMode] = useState<"simulation" | "live">("simulation");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RoutingResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const handleApplyPreset = (p: (typeof PRESETS)[0]) => {
    setQuery(p.query);
    setCategory(p.category);
    setDomain(p.domain);
    setComplexity(p.complexity);
    setReasoningLevel(p.reasoning_level);
    setQualityPriority(p.quality_priority);
    setBudgetPriority(p.budget_priority);
    setLatencyPriority(p.latency_priority);
    setRequiresCode(p.requires_code);
    setRequiresMath(p.requires_math);
    setRequiresReasoning(p.requires_reasoning);
  };

  const handleRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const payload: RoutingRequest = {
        query,
        category,
        domain,
        complexity,
        reasoning_level: reasoningLevel,
        quality_priority: qualityPriority,
        budget_priority: budgetPriority,
        latency_priority: latencyPriority,
        requires_code: requiresCode,
        requires_math: requiresMath,
        requires_reasoning: requiresReasoning,
        requires_creativity: requiresCreativity,
        multilingual,
        routing_mode: routingMode,
      };
      const res = await routeQuery(payload);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = () => {
    if (!result?.response_text) return;
    navigator.clipboard.writeText(result.response_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <Play className="h-7 w-7 text-primary" />
          Smart Query Routing Playground
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Simulate incoming prompt evaluation, test feature vectors, and observe real-time model selection, probability distributions, and cost-latency savings.
        </p>
      </div>

      {/* Presets Bar */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Quick Task Presets:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-primary/50 hover:bg-muted"
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Form Left, Result Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Input Configuration Form */}
        <form
          onSubmit={handleRoute}
          className="lg:col-span-7 rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-6"
        >
          {/* Query Textarea */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Query Prompt
              </label>
              <span className="text-[11px] text-muted-foreground">
                {query.length} chars • ~{Math.max(10, Math.round(query.length / 4))} tokens
              </span>
            </div>
            <textarea
              rows={4}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your prompt here..."
              className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Categorical Metadata Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Task Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Subject Domain</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                {DOMAINS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ordinal Sliders / Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Complexity Level</label>
              <div className="grid grid-cols-4 gap-1">
                {["Easy", "Medium", "Hard", "Expert"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setComplexity(lvl)}
                    className={`py-1.5 text-xs rounded-md font-medium transition ${
                      complexity === lvl
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Reasoning Depth</label>
              <div className="grid grid-cols-3 gap-1">
                {["Low", "Medium", "High"].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setReasoningLevel(lvl)}
                    className={`py-1.5 text-xs rounded-md font-medium transition ${
                      reasoningLevel === lvl
                        ? "bg-primary text-primary-foreground"
                        : "border border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User Priorities (Quality, Budget, Latency) */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              User Optimization Priorities
            </label>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Quality Priority</span>
                <select
                  value={qualityPriority}
                  onChange={(e) => setQualityPriority(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Budget Sensitivity</span>
                <select
                  value={budgetPriority}
                  onChange={(e) => setBudgetPriority(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[11px] text-muted-foreground">Latency Priority</span>
                <select
                  value={latencyPriority}
                  onChange={(e) => setLatencyPriority(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Boolean Requirement Flags */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="text-xs font-bold uppercase tracking-wider text-foreground">
              Requirement Flags
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Code", state: requiresCode, set: setRequiresCode },
                { label: "Math", state: requiresMath, set: setRequiresMath },
                { label: "Reasoning", state: requiresReasoning, set: setRequiresReasoning },
                { label: "Creativity", state: requiresCreativity, set: setRequiresCreativity },
                { label: "Multilingual", state: multilingual, set: setMultilingual },
              ].map((flag) => (
                <button
                  key={flag.label}
                  type="button"
                  onClick={() => flag.set(!flag.state)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                    flag.state
                      ? "bg-blue-500/10 text-blue-500 border-blue-500/30"
                      : "bg-muted/40 text-muted-foreground border-border"
                  }`}
                >
                  {flag.state ? "✓ " : "+ "}
                  {flag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Execution Mode & Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-medium">Mode:</span>
              <div className="inline-flex rounded-lg border border-border p-0.5 bg-muted/40 text-xs">
                <button
                  type="button"
                  onClick={() => setRoutingMode("simulation")}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    routingMode === "simulation"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  Simulation (Free)
                </button>
                <button
                  type="button"
                  onClick={() => setRoutingMode("live")}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    routingMode === "live"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  Live Provider
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Routing Query...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Route Query Now
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Output Card */}
        <div className="lg:col-span-5 space-y-6">
          {result ? (
            <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
              {/* Top Selected Model Banner */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Selected Model
                  </span>
                  <span className="text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5">
                    {(result.confidence * 100).toFixed(1)}% Confidence
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xl shadow-md">
                    {result.model_family.substring(0, 1)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      {result.display_name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Endpoint: {result.selected_model} • Mode: {result.routing_mode}
                    </p>
                  </div>
                </div>
              </div>

              {/* Confidence Distribution Bar */}
              <div className="space-y-1.5 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">Candidate Probabilities</span>
                </div>
                <div className="space-y-1.5">
                  {result.probabilities.map((p) => (
                    <div key={p.model} className="space-y-0.5">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{p.model}</span>
                        <span className="font-medium text-foreground">{(p.probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            p.model === result.model_family ? "bg-primary" : "bg-muted-foreground/30"
                          }`}
                          style={{ width: `${p.probability * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Economic & Latency Comparison Stats */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                      Cost Saving
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                      {formatPercent(result.cost_savings_percent)}
                    </span>
                  </div>
                  <div className="text-lg font-black text-foreground">
                    {formatCurrency(result.estimated_cost)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Baseline: {formatCurrency(result.baseline_cost)}
                  </div>
                </div>

                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-purple-500" />
                      Latency Cut
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-bold">
                      {formatPercent(result.latency_savings_percent)}
                    </span>
                  </div>
                  <div className="text-lg font-black text-foreground">
                    {formatMs(result.estimated_latency_ms)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Baseline: {formatMs(result.baseline_latency_ms)}
                  </div>
                </div>
              </div>

              {/* Rationale Bullet Points */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Routing Rationale
                </span>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  {result.reasons.map((r, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Response Preview Box */}
              {result.response_text && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                      Execution Output Preview
                    </span>
                    <button
                      type="button"
                      onClick={copyResponse}
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <pre className="text-xs bg-muted/50 rounded-xl p-3 max-h-48 overflow-y-auto whitespace-pre-wrap font-mono text-muted-foreground border border-border">
                    {result.response_text}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-foreground">Ready to Route</h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
                Configure your query on the left or select a preset and click "Route Query Now" to evaluate routing decisions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
