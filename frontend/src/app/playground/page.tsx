"use client";

import React, { useState, useMemo, useEffect } from "react";
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
  Brain,
  Cpu,
  Info,
} from "lucide-react";
import { routeQuery } from "@/lib/api";
import { RoutingRequest, RoutingResponse } from "@/lib/types";
import { formatCurrency, formatPercent, formatMs } from "@/lib/utils";

interface PromptAnalysis {
  complexity: "Easy" | "Medium" | "Hard" | "Expert";
  reasoningLevel: "Low" | "Medium" | "High";
  requiresCode: boolean;
  requiresMath: boolean;
  requiresReasoning: boolean;
  signals: string[];
}

function analyzePromptText(query: string): PromptAnalysis {
  const text = (query || "").trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const tokenEstimate = Math.max(10, Math.round(wordCount * 1.33));
  const signals: string[] = [];

  const expertHardPatterns = [
    /\b(?:fault-tolerant|distributed|high-throughput|microservices|consensus|paxos|raft|idempotent|idempotency)\b/i,
    /\b(?:circuit\s*breaker|zero\s*data\s*loss|disaster\s*recovery|concurrency|race\s*condition|deadlock|mutex|semaphore)\b/i,
    /\b(?:sliding-window|rate-limiter|sharding|replication|load\s*balancer|dynamic\s*programming|shortest\s*path)\b/i,
    /\b(?:compiler|abstract\s*syntax\s*tree|ast|bytecode|kernel|memory\s*leak|buffer\s*overflow|cryptographic|zero-knowledge)\b/i,
    /\b(?:closed-form|eigenvalue|eigenvalues|eigenvector|eigenvectors|orthogonality|orthonormal|diagonaliz\w+)\b/i,
    /\b(?:differential\s*equation|navier-stokes|fourier\s*transform|stochastic\s*calculus|markov\s*chain|topology)\b/i,
    /\b(?:formal\s*proof|proof\s*by\s*contradiction|prove\s+that|induction\s*step|axiom|theorem\s*proving)\b/i,
  ];

  const codePatterns = [
    /```/,
    /\b(?:def|class|interface|struct|impl|func|function)\s+[a-zA-Z_]\w*/i,
    /\b(?:import|from\s+[a-zA-Z_]\w*\s+import|require\(|include\s*<)/i,
    /\b(?:return|async|await|const|let|var|public\s+static\s+void)\b/i,
    /\b(?:SELECT|INSERT\s+INTO|UPDATE|DELETE\s+FROM)\b.*\b(?:FROM|WHERE|JOIN|SET)\b/i,
    /[{}[\];]{3,}/,
    /\b(?:unit\s*test|pytest|jest|junit|test\s*case|mocking|tdd|assertion)\b/i,
    /\b(?:refactor|debugging|debug|traceback|syntaxerror|nullpointer|segfault|profiling)\b/i,
    /\b(?:python|javascript|typescript|c\+\+|rust|golang|docker|kubernetes|redis|postgresql)\b/i,
  ];

  const mathPatterns = [
    /\\[a-zA-Z]+/,
    /\b(?:matrix|matrices|determinant|integral|derivative|calculus|algebra|polynomial|quadratic)\b/i,
    /\b(?:theorem|lemma|corollary|proof|qed|equation|formula|solve\s+for|limits?|cosine|sine|vector)\b/i,
    /[+\-*/=^><]{2,}/,
  ];

  const reasoningPatterns = [
    /\b(?:step-by-step|step\s*by\s*step)\b/i,
    /\b(?:compare\s+and\s+contrast|trade-offs|tradeoffs|pros\s+and\s+cons|comparative\s+analysis)\b/i,
    /\b(?:root\s*cause|causal|counterfactual|under\s+what\s+conditions|implications\s+of)\b/i,
    /\b(?:first\s*principles|deduce|deductive|inductive|critique|synthesize|edge\s*cases)\b/i,
    /\b(?:why\s+does|explain\s+the\s+mechanism|how\s+does.*work\s+internally)\b/i,
    /\b(?:worst-case|time\s*complexity|space\s*complexity|big-o|o\(n\w*\))\b/i,
  ];

  const simplicityPatterns = [
    /^(?:what|who|where|when)\s+is\s+(?:the\s+)?(?:capital|president|founder|author|currency|meaning|definition|name)\b/i,
    /^(?:what|who|where|when)\s+(?:was|did)\b/i,
    /\b(?:translate\s+(?:this|the\s+following)?\s+(?:to|into))\b/i,
    /\b(?:fix\s+(?:the\s+)?spelling|correct\s+(?:the\s+)?typo|proofread\s+this)\b/i,
    /\b(?:summarize\s+in\s+\d+\s+(?:words|sentences|bullet\s*points))\b/i,
    /^(?:hello|hi|hey|good\s+(?:morning|afternoon|evening)|how\s+are\s+you)\b/i,
    /\b(?:synonym\s+for|antonym\s+for|define\s+[a-zA-Z]+$)\b/i,
    /\b(?:yes\s+or\s+no|true\s+or\s+false)\b/i,
  ];

  const expertMatches = expertHardPatterns.filter((p) => p.test(text)).length;
  const codeMatches = codePatterns.filter((p) => p.test(text)).length;
  const mathMatches = mathPatterns.filter((p) => p.test(text)).length;
  const reasoningMatches = reasoningPatterns.filter((p) => p.test(text)).length;
  const simplicityMatches = simplicityPatterns.filter((p) => p.test(text)).length;

  const requiresCode = codeMatches >= 1;
  const requiresMath = mathMatches >= 1;
  const requiresReasoning = reasoningMatches >= 1 || expertMatches >= 1 || mathMatches >= 2;

  if (expertMatches > 0) signals.push(`Systems/theoretical depth (${expertMatches} matches)`);
  if (codeMatches > 0) signals.push(`Code syntax markers (${codeMatches} matches)`);
  if (mathMatches > 0) signals.push(`Mathematical/symbolic structures (${mathMatches} matches)`);
  if (reasoningMatches > 0) signals.push(`Multi-step deductive reasoning (${reasoningMatches} matches)`);
  if (simplicityMatches > 0) signals.push("Direct factual lookup template");

  let complexity: "Easy" | "Medium" | "Hard" | "Expert" = "Medium";
  let reasoningLevel: "Low" | "Medium" | "High" = "Medium";

  if (simplicityMatches >= 1 && expertMatches === 0 && codeMatches === 0 && mathMatches === 0 && wordCount <= 25) {
    complexity = "Easy";
    reasoningLevel = "Low";
    signals.push(`Concise prompt (${wordCount} words)`);
  } else if (expertMatches >= 2 || (expertMatches >= 1 && (tokenEstimate >= 150 || reasoningMatches >= 2))) {
    if (tokenEstimate >= 350 || expertMatches >= 3 || (expertMatches >= 2 && reasoningMatches >= 2)) {
      complexity = "Expert";
      reasoningLevel = "High";
      signals.push("Architecture-level specifications and constraints");
    } else {
      complexity = "Hard";
      reasoningLevel = "High";
      signals.push("Algorithmic & systems engineering decomposition");
    }
  } else if (expertMatches >= 1 || (codeMatches >= 2 && wordCount >= 15) || (mathMatches >= 2 && wordCount >= 12) || (reasoningMatches >= 1 && wordCount >= 20)) {
    complexity = "Hard";
    reasoningLevel = "High";
    signals.push("Rigorous domain-specific deduction");
  } else if (requiresCode || requiresMath || requiresReasoning || tokenEstimate >= 70) {
    complexity = "Medium";
    reasoningLevel = "Medium";
    signals.push("Structured domain inquiry");
  } else if (tokenEstimate >= 250) {
    complexity = "Hard";
    reasoningLevel = "Medium";
    signals.push(`Extended context (~${tokenEstimate} tokens)`);
  } else {
    complexity = "Easy";
    reasoningLevel = "Low";
    signals.push(`Direct, low-overhead prompt (~${tokenEstimate} tokens)`);
  }

  return {
    complexity,
    reasoningLevel,
    requiresCode,
    requiresMath,
    requiresReasoning,
    signals,
  };
}

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
  const [autoDetect, setAutoDetect] = useState(true);
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

  // Real-time arrival-time prompt analyzer
  const promptAnalysis = useMemo(() => analyzePromptText(query), [query]);

  // Synchronize detected complexity & reasoning depth when auto-detect is enabled
  useEffect(() => {
    if (autoDetect) {
      setComplexity(promptAnalysis.complexity);
      setReasoningLevel(promptAnalysis.reasoningLevel);
      setRequiresCode(promptAnalysis.requiresCode);
      setRequiresMath(promptAnalysis.requiresMath);
      setRequiresReasoning(promptAnalysis.requiresReasoning);
    }
  }, [autoDetect, promptAnalysis]);

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
    setAutoDetect(false);
  };

  const handleRoute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const payload: RoutingRequest = {
        query,
        auto_detect: autoDetect,
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

          {/* Auto-Detection Status & Override Controls */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Complexity & Reasoning
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    autoDetect
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  }`}
                >
                  {autoDetect ? "✨ Auto-Detect Active" : "⚙️ Manual Override"}
                </span>
              </div>

              <div>
                {autoDetect ? (
                  <button
                    type="button"
                    onClick={() => setAutoDetect(false)}
                    className="text-[11px] font-medium text-muted-foreground hover:text-foreground underline"
                  >
                    Customize
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAutoDetect(true);
                      setComplexity(promptAnalysis.complexity);
                      setReasoningLevel(promptAnalysis.reasoningLevel);
                    }}
                    className="text-[11px] font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset to Auto-Detect
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-medium text-foreground">
                <span className="text-muted-foreground text-[11px]">Prompt Signals:</span>
                <span className="px-2 py-0.5 rounded-md bg-background border border-border font-semibold text-primary">
                  {promptAnalysis.complexity} Complexity
                </span>
                <span className="px-2 py-0.5 rounded-md bg-background border border-border font-semibold text-primary">
                  {promptAnalysis.reasoningLevel} Reasoning
                </span>
              </div>
              {promptAnalysis.signals.slice(0, 2).map((sig, i) => (
                <span
                  key={i}
                  className="text-[10px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full border border-border/50"
                >
                  • {sig}
                </span>
              ))}
            </div>
          </div>

          {/* Ordinal Buttons with Auto Indicator */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Complexity Level</label>
                {autoDetect && (
                  <span className="text-[10px] text-primary font-medium">Auto-derived</span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1">
                {["Easy", "Medium", "Hard", "Expert"].map((lvl) => {
                  const isSelected = complexity === lvl;
                  const isDetected = promptAnalysis.complexity === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setAutoDetect(false);
                        setComplexity(lvl);
                      }}
                      className={`relative py-1.5 text-xs rounded-md font-medium transition ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {lvl}
                      {autoDetect && isDetected && (
                        <span className="block text-[8px] opacity-80 font-normal">Auto</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground">Reasoning Depth</label>
                {autoDetect && (
                  <span className="text-[10px] text-primary font-medium">Auto-derived</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-1">
                {["Low", "Medium", "High"].map((lvl) => {
                  const isSelected = reasoningLevel === lvl;
                  const isDetected = promptAnalysis.reasoningLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => {
                        setAutoDetect(false);
                        setReasoningLevel(lvl);
                      }}
                      className={`relative py-1.5 text-xs rounded-md font-medium transition ${
                        isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "border border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {lvl}
                      {autoDetect && isDetected && (
                        <span className="block text-[8px] opacity-80 font-normal">Auto</span>
                      )}
                    </button>
                  );
                })}
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

              {/* Evaluated Query Features & Detection Source */}
              {result.detected_features && (
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Evaluated Query Signals
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        result.detected_features.source === "automatic_detection"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {result.detected_features.source === "automatic_detection"
                        ? "✨ Auto-Detected"
                        : "⚙️ Manual Override"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-muted/40 p-2.5 border border-border">
                      <span className="text-[10px] text-muted-foreground block font-medium">Complexity</span>
                      <span className="font-bold text-foreground">{result.detected_features.complexity}</span>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-2.5 border border-border">
                      <span className="text-[10px] text-muted-foreground block font-medium">Reasoning Depth</span>
                      <span className="font-bold text-foreground">{result.detected_features.reasoning_level}</span>
                    </div>
                  </div>

                  {result.detected_features.signals && result.detected_features.signals.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Arrival-Time Heuristic Signals:
                      </span>
                      <ul className="space-y-1 text-[11px] text-muted-foreground">
                        {result.detected_features.signals.map((s, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-primary mt-0.5">•</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

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
