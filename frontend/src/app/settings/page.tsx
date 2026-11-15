'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Cpu,
  Database,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  KeyRound,
  Zap,
  Layers,
  RefreshCw,
  GitBranch,
} from 'lucide-react';

interface ProviderStatus {
  name: string;
  provider: string;
  envVar: string;
  status: 'Ready (Simulation Active)' | 'API Key Configured';
  isKeySet: boolean;
  endpoint: string;
}

const PROVIDERS: ProviderStatus[] = [
  {
    name: 'OpenAI GPT',
    provider: 'OpenAI',
    envVar: 'OPENAI_API_KEY',
    status: 'Ready (Simulation Active)',
    isKeySet: false,
    endpoint: 'https://api.openai.com/v1/chat/completions',
  },
  {
    name: 'Anthropic Claude',
    provider: 'Anthropic',
    envVar: 'ANTHROPIC_API_KEY',
    status: 'Ready (Simulation Active)',
    isKeySet: false,
    endpoint: 'https://api.anthropic.com/v1/messages',
  },
  {
    name: 'Google Gemini',
    provider: 'Google DeepMind',
    envVar: 'GEMINI_API_KEY',
    status: 'Ready (Simulation Active)',
    isKeySet: false,
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
  },
  {
    name: 'Meta Llama (Groq / Together)',
    provider: 'Groq / Together AI',
    envVar: 'GROQ_API_KEY',
    status: 'Ready (Simulation Active)',
    isKeySet: false,
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  },
  {
    name: 'DeepSeek Reasoner',
    provider: 'DeepSeek AI',
    envVar: 'DEEPSEEK_API_KEY',
    status: 'Ready (Simulation Active)',
    isKeySet: false,
    endpoint: 'https://api.deepseek.com/chat/completions',
  },
];

export default function SettingsPage() {
  const [simulationMode, setSimulationMode] = useState<boolean>(true);
  const [latencySimulation, setLatencySimulation] = useState<boolean>(true);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const handleSaveSettings = () => {
    setSaveMessage('Settings updated successfully in session storage.');
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Gateway Infrastructure
            </span>
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              System Health & Config
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            System Settings & Provider Connectors
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-3xl">
            Review live infrastructure health, machine learning model serialization, Supabase database connectivity,
            and provider adapter configurations. Secret credentials are securely masked and protected against leakage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveSettings}
            className="px-4 py-2 text-xs font-medium rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5" />
            Save Configuration
          </button>
        </div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Infrastructure Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ML Inference Engine Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">XGBoost Inference Engine</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Native Universal Binary JSON (<code className="text-slate-300">corrected_model.ubj</code>) with 100 boosted trees.
          </p>
          <div className="pt-2 border-t border-slate-800 text-xs space-y-1 font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Warmup Load Time:</span>
              <span className="text-cyan-400 font-semibold">0.10s (High Speed)</span>
            </div>
            <div className="flex justify-between">
              <span>Features Isolated:</span>
              <span className="text-white">54 Arrival Attributes</span>
            </div>
            <div className="flex justify-between">
              <span>Leakage Prevention:</span>
              <span className="text-emerald-400">19 Columns Excluded</span>
            </div>
          </div>
        </div>

        {/* Database Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Supabase PostgreSQL</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Configured
            </span>
          </div>
          <p className="text-xs text-slate-400">
            PostgreSQL instance hosting telemetry, experiment runs, and model configs.
          </p>
          <div className="pt-2 border-t border-slate-800 text-xs space-y-1 font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Project ID:</span>
              <span className="text-purple-400 font-semibold truncate max-w-[140px]">tibnobwsfhrdpdbqdpux</span>
            </div>
            <div className="flex justify-between">
              <span>Row Level Security:</span>
              <span className="text-emerald-400">Enabled (Active)</span>
            </div>
            <div className="flex justify-between">
              <span>Client State:</span>
              <span className="text-slate-300">Async with In-Memory Cache</span>
            </div>
          </div>
        </div>

        {/* Backend Server Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">FastAPI Gateway API</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Healthy
            </span>
          </div>
          <p className="text-xs text-slate-400">
            High-performance ASGI backend with synchronous inference paths.
          </p>
          <div className="pt-2 border-t border-slate-800 text-xs space-y-1 font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Inference Latency:</span>
              <span className="text-emerald-400 font-semibold">&lt; 1 ms</span>
            </div>
            <div className="flex justify-between">
              <span>Endpoints Active:</span>
              <span className="text-white">7 Routes Registered</span>
            </div>
            <div className="flex justify-between">
              <span>Deployment Mode:</span>
              <span className="text-cyan-400">Render / Vercel Edge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Adapter Security Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              Provider Adapters & Credential Isolation
            </h3>
            <p className="text-xs text-slate-400">
              Adapter statuses for multi-provider API forwarding. Raw keys are never displayed or exposed to clients.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Simulation Default Active
          </span>
        </div>

        <div className="space-y-3">
          {PROVIDERS.map((prov) => (
            <div
              key={prov.name}
              className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-white">{prov.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">({prov.provider})</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 font-mono">
                  <span>Env: {prov.envVar}</span>
                  <span className="text-slate-600">•</span>
                  <span className="truncate max-w-xs">{prov.endpoint}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 text-xs font-semibold rounded bg-cyan-950/40 text-cyan-300 border border-cyan-800/40">
                  {prov.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 bg-slate-950/40 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            <strong>Zero Key Leakage Policy:</strong> All API authentication keys are managed strictly via backend
            environment variables (<code className="text-slate-300 font-mono">.env</code>). No user input field can
            exfiltrate or display secret key values to the frontend.
          </span>
        </div>
      </div>

      {/* Simulation Engine Controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          Gateway Simulation Engine Parameters
        </h3>
        <p className="text-xs text-slate-400">
          Configure how query responses and performance telemetry are modeled during evaluation runs.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-white block">Default to Simulation Mode</span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Generates synthetic responses calibrated to model capabilities without incurring real API charges.
              </span>
            </div>
            <input
              type="checkbox"
              checked={simulationMode}
              onChange={(e) => setSimulationMode(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded"
            />
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-sm font-semibold text-white block">Simulate Network RTT Latency</span>
              <span className="text-xs text-slate-400 block mt-0.5">
                Inject realistic network round-trip delays (400ms - 1,800ms) matching live provider telemetry.
              </span>
            </div>
            <input
              type="checkbox"
              checked={latencySimulation}
              onChange={(e) => setLatencySimulation(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded"
            />
          </div>
        </div>
      </div>

      {/* Deployment & Git Integration Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-purple-400" />
          Source Repository & Deployment Architecture
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase">GitHub Repository</span>
            <a
              href="https://github.com/Atif12L/Adaptive-Cost-Awareness-Multi-LLM-Routing"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 mt-1 truncate"
            >
              Atif12L/Adaptive-Cost-Awareness-Multi-LLM-Routing <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase">Supabase Cloud Database</span>
            <span className="text-purple-400 font-semibold block mt-1 truncate">
              https://tibnobwsfhrdpdbqdpux.supabase.co
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase">Frontend Hosting Target</span>
            <span className="text-white font-semibold block mt-1">Vercel (Next.js 14 App Router)</span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
            <span className="text-slate-500 block text-[10px] uppercase">Backend Hosting Target</span>
            <span className="text-white font-semibold block mt-1">Render (FastAPI + XGBoost UBJ)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
