"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Link from "next/link";
import {
  Activity,
  Plus,
  Wrench,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Globe,
  Cpu,
  Shield,
  Search,
} from "lucide-react";

interface QuickStat {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon: React.ReactNode;
}

export default function DashboardPage() {
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);
  const [aiModel, setAiModel] = useState("");

  useEffect(() => {
    fetch("/api/ai-status")
      .then((r) => r.json())
      .then((d) => {
        setAiConfigured(d.configured);
        setAiModel(d.model ?? "");
      })
      .catch(() => setAiConfigured(false));
  }, []);

  const stats: QuickStat[] = [
    {
      label: "Scans Run",
      value: "—",
      sub: "Run your first scan",
      icon: <Activity size={18} className="text-cyan-400" />,
    },
    {
      label: "Issues Found",
      value: "—",
      sub: "Across all scans",
      icon: <AlertTriangle size={18} className="text-amber-400" />,
    },
    {
      label: "Fixes Applied",
      value: "—",
      sub: "Via Repair Lab",
      icon: <CheckCircle size={18} className="text-emerald-400" />,
    },
    {
      label: "AI Status",
      value: aiConfigured === null ? "..." : aiConfigured ? "Ready" : "Not configured",
      sub: aiConfigured ? aiModel : "Add NEBIUS_API_KEY",
      icon: <Cpu size={18} className={aiConfigured ? "text-emerald-400" : "text-slate-500"} />,
    },
  ];

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-slate-400 text-sm">Website health overview and quick actions</p>
          </div>
          <Link href="/scan" className="btn-primary">
            <Plus size={16} />
            New Scan
          </Link>
        </div>

        {/* AI status banner */}
        {aiConfigured === false && (
          <div className="card border-amber-500/30 bg-amber-500/5 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-amber-400 mb-0.5">AI Repair not configured</div>
                <p className="text-sm text-amber-300/70">
                  Add your Nebius API key to enable NVIDIA Nemotron-powered repairs.
                  Deterministic scanning works without it.
                </p>
              </div>
              <Link href="/settings" className="btn-secondary text-xs whitespace-nowrap">
                Configure
              </Link>
            </div>
          </div>
        )}

        {aiConfigured === true && (
          <div className="card border-emerald-500/30 bg-emerald-500/5 mb-6">
            <div className="flex items-center gap-3">
              <Cpu size={18} className="text-emerald-400" />
              <div className="flex-1">
                <span className="font-medium text-emerald-400">NVIDIA Nemotron connected</span>
                <span className="text-sm text-emerald-300/70 ml-2">via Nebius Token Factory · {aiModel}</span>
              </div>
              <CheckCircle size={16} className="text-emerald-400" />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-[#0f2042] flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
              <div className="text-xs text-slate-500">{stat.label}</div>
              {stat.sub && <div className="text-xs text-slate-600 mt-0.5">{stat.sub}</div>}
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/scan?demo=true" className="card hover:border-cyan-500/40 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                  <Globe size={20} className="text-cyan-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Try Demo Scan</div>
                  <div className="text-xs text-slate-500">No API key needed</div>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Scan the Acme Corp sample website with intentional defects. See real findings instantly.
              </p>
            </Link>

            <Link href="/scan" className="card hover:border-blue-500/40 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <Search size={20} className="text-blue-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Scan a Website</div>
                  <div className="text-xs text-slate-500">Enter any public URL</div>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Audit a live website for accessibility, SEO, and HTML issues across multiple pages.
              </p>
            </Link>

            <Link href="/repair-lab" className="card hover:border-emerald-500/40 transition-colors group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                  <Wrench size={20} className="text-emerald-400" />
                </div>
                <div>
                  <div className="font-medium text-white">Repair Lab</div>
                  <div className="text-xs text-slate-500">AI-powered fixes</div>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                Open an issue in the Repair Lab to generate, validate, and export AI-proposed code fixes.
              </p>
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Architecture</h2>
          <div className="card">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={14} className="text-cyan-400" />
                  <span className="font-medium text-white">Security</span>
                </div>
                <ul className="space-y-1 text-slate-400">
                  <li>SSRF protection on URL scans</li>
                  <li>Path traversal prevention on ZIPs</li>
                  <li>No server-side code execution</li>
                  <li>API keys never exposed to browser</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Cpu size={14} className="text-purple-400" />
                  <span className="font-medium text-white">AI Model</span>
                </div>
                <ul className="space-y-1 text-slate-400">
                  <li>NVIDIA Nemotron via Nebius</li>
                  <li>OpenAI-compatible API</li>
                  <li>Structured JSON output</li>
                  <li>Zod schema validation</li>
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={14} className="text-emerald-400" />
                  <span className="font-medium text-white">Workflow</span>
                </div>
                <ul className="space-y-1 text-slate-400">
                  <li>Inspect → Diagnose → Plan</li>
                  <li>Patch → Validate → Revise</li>
                  <li>Up to 2 auto-iterations</li>
                  <li>Manual review required</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
