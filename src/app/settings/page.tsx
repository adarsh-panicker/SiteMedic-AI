"use client";

import AppShell from "@/components/AppShell";
import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, ExternalLink, Cpu, Settings } from "lucide-react";

export default function SettingsPage() {
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model: string; baseUrl: string } | null>(null);

  useEffect(() => {
    fetch("/api/ai-status")
      .then((r) => r.json())
      .then(setAiStatus)
      .catch(() => {});
  }, []);

  return (
    <AppShell>
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Settings</h1>
          <p className="text-slate-400 text-sm">Configuration and integration status</p>
        </div>

        {/* AI Integration */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Cpu size={14} />
            AI Integration — NVIDIA Nemotron × Nebius
          </h2>

          <div className="card">
            {aiStatus ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {aiStatus.configured ? (
                    <CheckCircle size={20} className="text-emerald-400" />
                  ) : (
                    <AlertTriangle size={20} className="text-amber-400" />
                  )}
                  <div>
                    <div className={`font-medium ${aiStatus.configured ? "text-emerald-400" : "text-amber-400"}`}>
                      {aiStatus.configured ? "Connected and ready" : "API key not configured"}
                    </div>
                    <div className="text-sm text-slate-500">
                      {aiStatus.configured
                        ? "AI-powered repairs are available"
                        : "Deterministic scanning works without a key"}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f2042] rounded-lg p-4 border border-[#1a3460] space-y-2 text-sm font-mono">
                  <div>
                    <span className="text-slate-500">Model: </span>
                    <span className="text-cyan-300">{aiStatus.model}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Base URL: </span>
                    <span className="text-cyan-300">{aiStatus.baseUrl}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Protocol: </span>
                    <span className="text-cyan-300">OpenAI-compatible</span>
                  </div>
                </div>

                {!aiStatus.configured && (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-400 font-semibold">Setup instructions:</div>
                    <ol className="space-y-2 text-sm text-slate-400 list-decimal list-inside">
                      <li>
                        Sign up at{" "}
                        <a href="https://studio.nebius.com" target="_blank" rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline inline-flex items-center gap-1">
                          studio.nebius.com <ExternalLink size={12} />
                        </a>
                      </li>
                      <li>Create an API key in your account settings</li>
                      <li>Copy <code className="text-cyan-300">.env.example</code> to <code className="text-cyan-300">.env.local</code></li>
                      <li>Set <code className="text-cyan-300">NEBIUS_API_KEY=your-key-here</code></li>
                      <li>Restart the development server</li>
                    </ol>
                    <div className="bg-[#0f2042] rounded-lg p-3 border border-[#1a3460] font-mono text-xs">
                      <div className="text-slate-500 mb-1"># .env.local</div>
                      <div className="text-cyan-300">NEBIUS_API_KEY=<span className="text-slate-500">your-nebius-api-key</span></div>
                      <div className="text-cyan-300">NEBIUS_MODEL=<span className="text-slate-500">nvidia/Nemotron-3.5-Super</span></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-400 text-sm">Loading AI status...</div>
            )}
          </div>
        </section>

        {/* Scan settings */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Settings size={14} />
            Scan Configuration
          </h2>
          <div className="card space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Max pages per scan</div>
                <div className="text-slate-500">SCAN_MAX_PAGES environment variable</div>
              </div>
              <div className="text-cyan-300 font-mono">10</div>
            </div>
            <div className="border-t border-[#1e293b]" />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">Max upload size</div>
                <div className="text-slate-500">UPLOAD_MAX_BYTES environment variable</div>
              </div>
              <div className="text-cyan-300 font-mono">50 MB</div>
            </div>
            <div className="border-t border-[#1e293b]" />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-white">AI repair iterations</div>
                <div className="text-slate-500">Max auto-retries on validation failure</div>
              </div>
              <div className="text-cyan-300 font-mono">2</div>
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">About</h2>
          <div className="card text-sm text-slate-400 space-y-2">
            <div className="flex justify-between"><span>Application</span><span className="text-white">SiteMedic AI</span></div>
            <div className="flex justify-between"><span>Creator</span><span className="text-cyan-300 font-medium">Adarsh Panicker</span></div>
            <div className="flex justify-between"><span>Track</span><span className="text-white">Nebius × NVIDIA Hackathon — Best Apps & Agents</span></div>
            <div className="flex justify-between"><span>AI Provider</span><span className="text-white">Nebius Token Factory</span></div>
            <div className="flex justify-between"><span>AI Model</span><span className="text-white">NVIDIA Nemotron</span></div>
            <div className="flex justify-between"><span>Framework</span><span className="text-white">Next.js 15 + TypeScript</span></div>
            <div className="flex justify-between"><span>License</span><span className="text-white">MIT</span></div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
