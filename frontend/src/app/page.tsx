"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Cpu,
  Layers,
  ArrowRight,
  TrendingDown,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Play,
  BarChart3,
  FileText,
} from "lucide-react";
import { getHealth, getModels, getEvaluation } from "@/lib/api";
import { ModelInfo, BenchmarkMetrics, SystemHealth } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function OverviewPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [evalData, setEvalData] = useState<BenchmarkMetrics | null>(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => {});
    getModels().then(setModels).catch(() => {});
    getEvaluation().then(setEvalData).catch(() => {});
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-b from-card via-card/90 to-background p-6 sm:p-10 shadow-lg">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-500">
            <Sparkles className="h-3.5 w-3.5" />
            Undergraduate Thesis Research Demonstration
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground">
            Adaptive Cost-Aware <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Semantic Routing Gateway
            </span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            A production-quality multi-LLM orchestration gateway that intelligently directs incoming queries to the optimal model based on query semantics, task complexity, user priorities, and real-time economics—balancing performance across OpenAI, Anthropic, Google, Meta, and DeepSeek.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/playground"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
            >
              <Play className="h-4 w-4" />
              Test Router Playground
            </Link>
            <Link
              href="/evaluation"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
            >
              <FileText className="h-4 w-4" />
              Inspect Research Metrics
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>

      {/* Dual Metric Juxtaposition Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Historical Reported Research */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Historical Thesis Benchmark (Reported)
            </span>
            <span className="text-[10px] rounded bg-blue-500/10 px-2 py-0.5 font-medium text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Original Colab Run
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="rounded-lg bg-card/60 p-2.5 border border-border/50">
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400">97.70%</div>
              <div className="text-[11px] text-muted-foreground font-medium">Reported Accuracy</div>
            </div>
            <div className="rounded-lg bg-card/60 p-2.5 border border-border/50">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">53.34%</div>
              <div className="text-[11px] text-muted-foreground font-medium">Cost Savings</div>
            </div>
            <div className="rounded-lg bg-card/60 p-2.5 border border-border/50">
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">41.84%</div>
              <div className="text-[11px] text-muted-foreground font-medium">Latency Cut</div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-normal">
            *Includes target-correlated post-hoc outcome features (data leakage) identified in our thesis audit. Preserved for academic reproducibility.
          </p>
        </div>

        {/* Validated Leakage-Free System */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Corrected Leakage-Free Model (Production)
            </span>
            <span className="text-[10px] rounded bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Validated On Test Set
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="rounded-lg bg-card/60 p-2.5 border border-border/50">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">58.62%</div>
              <div className="text-[11px] text-muted-foreground font-medium">Validated Accuracy</div>
            </div>
            <div className="rounded-lg bg-card/60 p-2.5 border border-border/50">
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">46.11%</div>
              <div className="text-[11px] text-muted-foreground font-medium">Live Cost Savings</div>
            </div>
            <div className="rounded-lg bg-card/60 p-2.5 border border-border/50">
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400">31.08%</div>
              <div className="text-[11px] text-muted-foreground font-medium">Live Latency Cut</div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-normal">
            *Trained strictly on arrival-time metadata (complexity, domain, flags). Achieves ~3x random chance (20%) while delivering substantial cost reduction.
          </p>
        </div>
      </div>

      {/* 5 Candidate LLM Families */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Candidate LLM Families
            </h2>
            <p className="text-xs text-muted-foreground">
              Integrated frontier models dynamically evaluated across cost, speed, and capabilities.
            </p>
          </div>
          <Link
            href="/models"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            Compare All Models <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {models.map((m) => (
            <div
              key={m.family}
              className="flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-foreground">{m.family}</span>
                  <span className="text-[10px] font-medium rounded-full bg-muted px-2 py-0.5 text-muted-foreground">
                    {m.provider}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground font-medium">
                  {m.display_name}
                </div>

                <div className="space-y-1.5 pt-1 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Input / 1K:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(m.cost_per_1k_input)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Typical Latency:</span>
                    <span className="font-semibold text-foreground">{m.typical_latency_ms} ms</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Context Window:</span>
                    <span className="font-semibold text-foreground">{(m.context_window / 1000).toFixed(0)}K</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 mt-4">
                <div className="flex flex-wrap gap-1">
                  {m.strengths.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="text-[10px] rounded bg-muted/80 px-1.5 py-0.5 text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gateway Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-border bg-card p-5 space-y-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Intelligent Semantic Routing</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Evaluates syntax, subject matter, reasoning depth, and user constraints at prompt arrival, choosing the ideal model in under 10 milliseconds.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <TrendingDown className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">46.11% Empirical Cost Reduction</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Routes straightforward and high-throughput queries to budget models (Llama 3.3, DeepSeek V3) while reserving premium models (Claude 3.5, GPT-4o) for high-complexity tasks.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 space-y-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Transparent Explainability</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every routing decision returns a confidence score across all candidate models, detailed economic savings metrics, and specific rationale bullets.
          </p>
        </div>
      </div>
    </div>
  );
}
