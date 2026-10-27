"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import {
  Search,
  Upload,
  Play,
  CheckCircle,
  AlertTriangle,
  Link2,
  Code2,
  Shield,
  Zap,
  ArrowRight,
  Globe,
  FileText,
  ChevronRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "Accessibility Audit",
    description: "Detect WCAG violations: missing alt text, unlabelled forms, contrast issues, and more.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Search,
    title: "SEO Analysis",
    description: "Find missing titles, meta descriptions, H1 problems, and Open Graph metadata gaps.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    icon: Link2,
    title: "Broken Link Detection",
    description: "Verify all internal links and flag missing files, pages, and assets.",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    icon: Code2,
    title: "AI Code Repair",
    description: "NVIDIA Nemotron through Nebius generates minimal, precise code fixes with full explanations.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: CheckCircle,
    title: "Fix Validation",
    description: "Every proposed repair is validated: HTML checks, rule re-audits, and iteration if needed.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Zap,
    title: "Before/After Preview",
    description: "Compare original and fixed code side-by-side. Export the corrected files when satisfied.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
];

const PROCESS_STEPS = [
  { number: "01", title: "Scan", desc: "Enter a URL or upload a ZIP. The scanner checks real HTML, CSS, and structure." },
  { number: "02", title: "Detect", desc: "Issues are categorized by severity with evidence and impact explanations." },
  { number: "03", title: "Repair", desc: "NVIDIA Nemotron generates a minimal, context-aware code fix." },
  { number: "04", title: "Validate", desc: "The fix is automatically validated. Failed checks trigger a revision." },
  { number: "05", title: "Export", desc: "Download the corrected file or patch after your approval." },
];

export default function LandingPage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setError("");
    setLoading(true);

    // Validate URL format client-side
    try {
      new URL(url.startsWith("http") ? url : `https://${url}`);
    } catch {
      setError("Please enter a valid URL (e.g. https://example.com)");
      setLoading(false);
      return;
    }

    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    router.push(`/scan?url=${encodeURIComponent(normalizedUrl)}`);
  }

  async function handleDemo() {
    router.push("/scan?demo=true");
  }

  return (
    <div className="min-h-screen" style={{ background: "#060b18" }}>
      {/* Header */}
      <header className="border-b border-[#1e293b] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="transition-opacity hover:opacity-90">
              <Logo size="md" />
            </Link>
            <span className="hidden sm:inline-block text-[11px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-semibold">
              NEBIUS × NVIDIA
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/scan" className="nav-link">New Scan</Link>
            <Link href="/repair-lab" className="nav-link">Repair Lab</Link>
          </nav>
          <Link href="/scan" className="btn-primary text-sm">
            Start Scanning <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative px-6 py-24 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full px-4 py-1.5 text-cyan-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            Powered by NVIDIA Nemotron × Nebius AI
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Find Website Problems.<br />
            <span className="text-cyan-400">Fix Them with AI.</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Scan your website, investigate real issues, generate intelligent repairs,
            and verify your fixes before applying them.
          </p>

          {/* URL input */}
          <form onSubmit={handleScan} className="max-w-2xl mx-auto mb-4">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Globe size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-website.com"
                  className="input-field pl-10"
                  disabled={loading}
                />
              </div>
              <button type="submit" className="btn-primary whitespace-nowrap" disabled={loading}>
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    Scan Website
                  </>
                )}
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-2 text-left flex items-center gap-1.5">
                <AlertTriangle size={14} />
                {error}
              </p>
            )}
          </form>

          <div className="flex items-center justify-center gap-4">
            <label className="btn-secondary cursor-pointer text-sm">
              <Upload size={16} />
              Upload Project ZIP
              <input
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    router.push("/scan?upload=true");
                  }
                }}
              />
            </label>

            <button onClick={handleDemo} className="btn-secondary text-sm">
              <Play size={16} className="text-cyan-400" />
              Try Demo
            </button>
          </div>

          <p className="text-xs text-slate-600 mt-4">
            Demo works without an API key. AI repair requires a{" "}
            <a href="https://studio.nebius.com" target="_blank" rel="noopener noreferrer" className="text-cyan-600 hover:text-cyan-400">
              Nebius API key
            </a>.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="px-6 py-16 border-t border-[#1e293b]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {PROCESS_STEPS.map((step, i) => (
              <div key={step.number} className="relative">
                <div className="card h-full">
                  <div className="text-3xl font-bold text-cyan-500/30 mb-2">{step.number}</div>
                  <div className="font-semibold text-white mb-1">{step.title}</div>
                  <div className="text-sm text-slate-400 leading-relaxed">{step.desc}</div>
                </div>
                {i < PROCESS_STEPS.length - 1 && (
                  <ChevronRight size={16} className="hidden md:block absolute top-1/2 -right-3 -translate-y-1/2 text-slate-700 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16 border-t border-[#1e293b]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-3">What SiteMedic Checks</h2>
          <p className="text-slate-400 text-center mb-12 max-w-xl mx-auto">
            Every finding is backed by evidence. No fabricated metrics.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="card hover:border-[#254a80] transition-colors">
                <div className={`w-10 h-10 ${feature.bg} rounded-lg flex items-center justify-center mb-4`}>
                  <feature.icon size={20} className={feature.color} />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample preview */}
      <section className="px-6 py-16 border-t border-[#1e293b]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-3">Repair Lab Preview</h2>
          <p className="text-slate-400 text-center mb-12">Before and after, side by side.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-critical">Original</span>
                <span className="text-xs text-slate-500 ml-auto">index.html : line 12</span>
              </div>
              <pre className="text-sm">
                <code className="diff-removed code-line">{`<img src="/images/team.jpg">`}</code>
                <code className="code-line text-slate-500">{`<h2>Welcome to Acme Corp</h2>`}</code>
              </pre>
            </div>
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <span className="badge-passed">Proposed Fix</span>
                <span className="text-xs text-slate-500 ml-auto">Confidence: medium</span>
              </div>
              <pre className="text-sm">
                <code className="diff-added code-line">{`<img src="/images/team.jpg" alt="[Describe the team photo]">`}</code>
                <code className="code-line text-slate-500">{`<h2>Welcome to Acme Corp</h2>`}</code>
              </pre>
              <p className="text-xs text-amber-400 mt-3 flex items-center gap-1.5">
                <AlertTriangle size={12} />
                Replace [Describe the team photo] with an accurate description.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20 border-t border-[#1e293b] text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to diagnose your website?</h2>
          <p className="text-slate-400 mb-8">
            Start with the demo — no account or API key required.
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleDemo} className="btn-primary">
              <Play size={18} />
              Try the Demo
            </button>
            <Link href="/scan" className="btn-secondary">
              Scan My Website <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1e293b] px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <div className="text-sm">
              <span className="font-semibold text-white">SiteMedic AI</span>
              <span className="text-slate-600 mx-2">·</span>
              <span className="text-cyan-400 font-medium">By Adarsh Panicker</span>
              <span className="text-slate-600 mx-2">·</span>
              <span className="text-slate-500">Nebius × NVIDIA Hackathon</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">GitHub</a>
            <a href="https://studio.nebius.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">Nebius AI</a>
            <a href="https://www.nvidia.com/en-us/ai/" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">NVIDIA</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
