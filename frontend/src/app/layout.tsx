import type { Metadata } from "next";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adaptive Cost-Aware Semantic Routing Gateway | Multi-LLM System",
  description:
    "Production-quality research demonstration application for intelligent, cost-aware multi-LLM semantic routing across GPT, Claude, Gemini, Llama, and DeepSeek.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased text-foreground">
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 pb-16">{children}</main>
          <footer className="border-t border-border/60 py-6 px-4 sm:px-8 text-center text-xs text-muted-foreground bg-card/40">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>
                © 2026 Adaptive Multi-LLM Routing Gateway • City University Undergraduate Thesis Research
              </p>
              <div className="flex items-center gap-4">
                <span className="text-[11px] bg-muted px-2 py-0.5 rounded border border-border">
                  FastAPI + XGBoost + Next.js + Supabase
                </span>
                <a
                  href="https://github.com/Atif12L/Adaptive-Cost-Awareness-Multi-LLM-Routing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-foreground"
                >
                  GitHub Repository
                </a>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
