"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Cpu,
  Layers,
  Activity,
  Play,
  BarChart3,
  FileCheck2,
  Database,
  Settings,
  Github,
  Zap,
} from "lucide-react";
import { getHealth } from "@/lib/api";
import { SystemHealth } from "@/lib/types";

export function Navbar() {
  const pathname = usePathname();
  const [health, setHealth] = useState<SystemHealth | null>(null);

  useEffect(() => {
    getHealth().then(setHealth).catch(() => {});
  }, []);

  const navItems = [
    { href: "/", label: "Overview", icon: Layers },
    { href: "/playground", label: "Router Playground", icon: Play },
    { href: "/analysis", label: "Routing Analysis", icon: Activity },
    { href: "/models", label: "LLM Profiles", icon: Cpu },
    { href: "/analytics", label: "Cost & Latency", icon: BarChart3 },
    { href: "/evaluation", label: "Model Evaluation", icon: FileCheck2 },
    { href: "/dataset", label: "Dataset Explorer", icon: Database },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-md shadow-blue-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-foreground">
                  Adaptive Router
                </span>
                <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Thesis Gateway
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block">
                Multi-LLM Semantic & Cost Optimization
              </p>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/70"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Status & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-border/80 bg-card px-3 py-1 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                health?.ml_engine.model_loaded ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="text-[11px] font-medium text-muted-foreground">
              {health?.ml_engine.model_loaded ? "ML Router Online" : "Simulation Mode"}
            </span>
          </div>

          {/* GitHub Link */}
          <a
            href="https://github.com/Atif12L/Adaptive-Cost-Awareness-Multi-LLM-Routing"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:text-foreground hover:bg-muted"
            title="View on GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-border/60 bg-muted/30">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3 w-3" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
