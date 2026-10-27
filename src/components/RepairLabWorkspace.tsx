"use client";

import { useState } from "react";
import { ScanIssue, ScanResult, RepairReport, WorkflowStep, ValidationResult } from "@/lib/types";
import SeverityBadge from "./SeverityBadge";
import DiffViewer from "./DiffViewer";
import {
  Wrench,
  RefreshCw,
  Copy,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  ChevronRight,
  Play,
  FileText,
  Code2,
  Cpu,
} from "lucide-react";
import { cn, formatDuration } from "@/lib/utils";

interface Props {
  issue: ScanIssue;
  scanResult: ScanResult;
}

type ActivePanel = "original" | "proposed" | "diff" | "workflow";

export default function RepairLabWorkspace({ issue, scanResult }: Props) {
  const [activePanel, setActivePanel] = useState<ActivePanel>("original");
  const [report, setReport] = useState<RepairReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Find source code for the issue's file
  const sourceCode = getSourceCode(issue, scanResult);

  async function generateFix() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/repair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issueId: issue.id,
          scanId: scanResult.id,
          issue,
          sourceCode,
          additionalContext: `Scan mode: ${scanResult.mode}. Health score: ${scanResult.healthScore}/100.`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.report);
        setActivePanel("diff");
      } else if (data.requiresApiKey) {
        setError(data.error ?? "AI repair requires a Nebius API key. See .env.example for setup.");
      } else {
        setError(data.error ?? "Repair generation failed");
      }
    } catch {
      setError("Network error — could not connect to the repair service");
    } finally {
      setLoading(false);
    }
  }

  async function copyCode() {
    const code = report?.patch?.changedFiles?.[0]?.patchedContent ?? "";
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadPatch() {
    if (!report?.patch) return;
    const patch = report.patch.changedFiles.map((f) => {
      const diff = f.diff.map((line) => {
        const prefix = line.type === "added" ? "+" : line.type === "removed" ? "-" : " ";
        return `${prefix}${line.content}`;
      }).join("\n");
      return `--- a/${f.path}\n+++ b/${f.path}\n${diff}`;
    }).join("\n\n");

    const blob = new Blob([patch], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `sitemedic-patch-${issue.ruleId.toLowerCase()}.diff`;
    a.click();
  }

  function downloadFixed() {
    if (!report?.patch?.changedFiles?.[0]) return;
    const f = report.patch.changedFiles[0];
    const blob = new Blob([f.patchedContent], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = f.path.split("/").pop() ?? "fixed.html";
    a.click();
  }

  const panelTabs: { id: ActivePanel; label: string; icon: React.ReactNode }[] = [
    { id: "original", label: "Original", icon: <FileText size={14} /> },
    { id: "proposed", label: "Proposed Fix", icon: <Code2 size={14} /> },
    { id: "diff", label: "Diff", icon: <ChevronRight size={14} /> },
    { id: "workflow", label: "Workflow", icon: <Cpu size={14} /> },
  ];

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wrench size={18} className="text-cyan-400" />
            <h1 className="text-xl font-bold text-white">Repair Lab</h1>
          </div>
          <p className="text-slate-400 text-sm">
            AI-powered repair workspace — NVIDIA Nemotron through Nebius
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {!report && (
            <button onClick={generateFix} disabled={loading} className="btn-primary">
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Generate Fix
                </>
              )}
            </button>
          )}
          {report && (
            <>
              <button onClick={generateFix} disabled={loading} className="btn-secondary text-sm">
                <RefreshCw size={14} />
                Regenerate
              </button>
              <button onClick={copyCode} className="btn-secondary text-sm">
                <Copy size={14} />
                {copied ? "Copied!" : "Copy Code"}
              </button>
              <button onClick={downloadPatch} className="btn-secondary text-sm">
                <Download size={14} />
                Download Patch
              </button>
              <button onClick={downloadFixed} className="btn-primary text-sm">
                <Download size={14} />
                Export Fixed File
              </button>
            </>
          )}
        </div>
      </div>

      {/* Issue summary */}
      <div className="card mb-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h2 className="font-semibold text-white">{issue.title}</h2>
              <SeverityBadge severity={issue.severity} />
              <span className="text-xs text-slate-600 font-mono">{issue.ruleId}</span>
            </div>
            {(issue.affectedFile || issue.affectedUrl) && (
              <p className="text-sm text-slate-400 mb-2">
                {issue.affectedFile ?? issue.affectedUrl}
                {issue.lineNumber ? ` :${issue.lineNumber}` : ""}
              </p>
            )}
            <p className="text-sm text-slate-400">{issue.evidence}</p>
          </div>
          {report && (
            <StatusBadge status={report.finalStatus} />
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card border-amber-500/30 bg-amber-500/5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-amber-400 mb-1">
                {error.includes("API key") ? "Nebius API Key Required" : "Repair Failed"}
              </div>
              <p className="text-sm text-amber-300/80">{error}</p>
              {error.includes("API key") && (
                <div className="mt-3 text-sm bg-[#0f2042] rounded-lg p-3 border border-[#1a3460] font-mono">
                  <div className="text-slate-400 mb-1"># .env.local</div>
                  <div className="text-cyan-300">NEBIUS_API_KEY=<span className="text-slate-400">your-key-here</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Panel tabs */}
      <div className="flex border-b border-[#1e293b] mb-6 gap-1">
        {panelTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActivePanel(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px",
              activePanel === tab.id
                ? "text-cyan-400 border-cyan-400"
                : "text-slate-500 border-transparent hover:text-slate-300"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      {activePanel === "original" && (
        <OriginalPanel issue={issue} sourceCode={sourceCode} />
      )}

      {activePanel === "proposed" && report?.patch && (
        <ProposedPanel patch={report.patch} />
      )}

      {activePanel === "proposed" && !report?.patch && (
        <div className="card text-center py-12">
          <Code2 size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">No fix generated yet.</p>
          <button onClick={generateFix} disabled={loading} className="btn-primary">
            <Play size={16} />
            Generate Fix
          </button>
        </div>
      )}

      {activePanel === "diff" && report?.patch && (
        <DiffViewer changedFiles={report.patch.changedFiles} />
      )}

      {activePanel === "diff" && !report?.patch && (
        <div className="card text-center py-12">
          <p className="text-slate-400">Generate a fix to see the diff.</p>
        </div>
      )}

      {activePanel === "workflow" && report && (
        <WorkflowPanel report={report} />
      )}

      {activePanel === "workflow" && !report && !loading && (
        <div className="card text-center py-12">
          <p className="text-slate-400">Run the repair workflow to see its stages.</p>
        </div>
      )}

      {loading && (
        <div className="card">
          <div className="space-y-3">
            {["Inspect", "Diagnose", "Plan", "Patch", "Validate", "Report"].map((stage, i) => (
              <div key={stage} className="flex items-center gap-3">
                <div className="loading-shimmer w-4 h-4 rounded-full" style={{ animationDelay: `${i * 0.15}s` }} />
                <div className="loading-shimmer h-4 flex-1 rounded" style={{ animationDelay: `${i * 0.15}s` }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OriginalPanel({ issue, sourceCode }: { issue: ScanIssue; sourceCode: string }) {
  return (
    <div className="space-y-4">
      <div className="card">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Why this was detected</div>
        <p className="text-sm text-slate-300">{issue.impact}</p>
      </div>

      {issue.element && (
        <div className="card">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Affected Element</div>
          <pre className="overflow-x-auto">
            <code className="diff-removed code-line">{issue.element}</code>
          </pre>
        </div>
      )}

      {sourceCode && (
        <div className="card">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Source Code
            {issue.affectedFile && <span className="ml-2 text-slate-600 normal-case font-mono">{issue.affectedFile}</span>}
          </div>
          <pre className="overflow-x-auto max-h-96 text-xs">
            <code className="text-slate-300">
              {sourceCode.split("\n").slice(0, 100).map((line, i) => (
                <span key={i} className="code-line">
                  <span className="text-slate-700 select-none w-8 inline-block text-right pr-3">{i + 1}</span>
                  {line}
                </span>
              ))}
            </code>
          </pre>
        </div>
      )}
    </div>
  );
}

function ProposedPanel({ patch }: { patch: { issueSummary: string; rootCause: string; explanation: string; possibleRisks: string[]; verificationPlan: string[]; confidence: string; changedFiles: { path: string; patchedContent: string }[] } }) {
  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex-1">AI Analysis</div>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full font-medium",
            patch.confidence === "high" ? "bg-emerald-500/15 text-emerald-400" :
            patch.confidence === "medium" ? "bg-amber-500/15 text-amber-400" :
            "bg-red-500/15 text-red-400"
          )}>
            {patch.confidence} confidence
          </span>
        </div>
        <p className="text-sm text-slate-300 mb-3">{patch.explanation}</p>
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Root Cause</div>
        <p className="text-sm text-slate-400">{patch.rootCause}</p>
      </div>

      {patch.changedFiles[0] && (
        <div className="card">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Proposed Code — <span className="font-mono text-slate-600">{patch.changedFiles[0].path}</span>
          </div>
          <pre className="overflow-x-auto max-h-96 text-xs">
            <code className="text-slate-300">
              {patch.changedFiles[0].patchedContent.split("\n").slice(0, 100).map((line, i) => (
                <span key={i} className="code-line">
                  <span className="text-slate-700 select-none w-8 inline-block text-right pr-3">{i + 1}</span>
                  {line}
                </span>
              ))}
            </code>
          </pre>
        </div>
      )}

      {patch.possibleRisks.length > 0 && (
        <div className="card border-amber-500/20">
          <div className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle size={12} />
            Possible Risks
          </div>
          <ul className="space-y-1">
            {patch.possibleRisks.map((risk, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                {risk}
              </li>
            ))}
          </ul>
        </div>
      )}

      {patch.verificationPlan.length > 0 && (
        <div className="card">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle size={12} />
            Verification Plan
          </div>
          <ul className="space-y-1">
            {patch.verificationPlan.map((step, i) => (
              <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                <span className="text-slate-600 mt-0.5">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card border-amber-500/20 bg-amber-500/5">
        <p className="text-sm text-amber-300 flex items-start gap-2">
          <AlertTriangle size={14} className="shrink-0 mt-0.5" />
          This is a proposed fix, not an applied change. Review the diff, validate, and export when satisfied. Do not apply without manual review.
        </p>
      </div>
    </div>
  );
}

function WorkflowPanel({ report }: { report: RepairReport }) {
  const stageIcons: Record<string, React.ReactNode> = {
    inspect: <FileText size={14} />,
    diagnose: <Info size={14} />,
    plan: <Clock size={14} />,
    patch: <Code2 size={14} />,
    validate: <CheckCircle size={14} />,
    revise: <RefreshCw size={14} />,
    report: <FileText size={14} />,
  };

  return (
    <div className="space-y-4">
      {/* Status overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-white">Repair Workflow</div>
          <StatusBadge status={report.finalStatus} />
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{report.iterationsUsed}</div>
            <div className="text-xs text-slate-500">Iterations</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{formatDuration(report.totalDurationMs)}</div>
            <div className="text-xs text-slate-500">Duration</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">
              {report.validationResults.filter((r) => r.status === "passed").length}/
              {report.validationResults.length}
            </div>
            <div className="text-xs text-slate-500">Checks Passed</div>
          </div>
        </div>
      </div>

      {/* Workflow steps */}
      <div className="space-y-2">
        {report.workflowSteps.map((step, i) => (
          <WorkflowStepCard key={i} step={step} icon={stageIcons[step.stage]} />
        ))}
      </div>

      {/* Validation results */}
      {report.validationResults.length > 0 && (
        <div className="card">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Validation Results</div>
          <div className="space-y-2">
            {report.validationResults.map((result, i) => (
              <ValidationResultCard key={i} result={result} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkflowStepCard({ step, icon }: { step: WorkflowStep; icon: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  const statusColors: Record<string, string> = {
    passed: "text-emerald-400",
    failed: "text-red-400",
    running: "text-cyan-400",
    pending: "text-slate-500",
    skipped: "text-slate-600",
  };

  const StatusIcon = {
    passed: <CheckCircle size={16} className="text-emerald-400" />,
    failed: <XCircle size={16} className="text-red-400" />,
    running: <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />,
    pending: <Clock size={16} className="text-slate-500" />,
    skipped: <ChevronRight size={16} className="text-slate-600" />,
  }[step.status] ?? <Clock size={16} className="text-slate-500" />;

  return (
    <div className="card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 text-left"
      >
        <div className="shrink-0">{StatusIcon}</div>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-slate-400">{icon}</span>
          <span className="text-sm font-medium text-white capitalize">{step.label}</span>
        </div>
        <span className={cn("text-xs font-medium capitalize", statusColors[step.status])}>
          {step.status}
        </span>
      </button>
      {expanded && (step.output || step.error) && (
        <div className="mt-3 pl-7">
          {step.output && (
            <pre className="text-xs text-slate-400 bg-[#0f2042] rounded p-2 whitespace-pre-wrap border border-[#1a3460]">
              {step.output}
            </pre>
          )}
          {step.error && (
            <pre className="text-xs text-red-400 bg-red-500/5 rounded p-2 whitespace-pre-wrap border border-red-500/20">
              {step.error}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

function ValidationResultCard({ result }: { result: ValidationResult }) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border text-sm",
      result.status === "passed" ? "bg-emerald-500/5 border-emerald-500/20" :
      result.status === "failed" ? "bg-red-500/5 border-red-500/20" :
      "bg-[#0f2042] border-[#1a3460]"
    )}>
      {result.status === "passed" ? <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" /> :
       result.status === "failed" ? <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" /> :
       <ChevronRight size={16} className="text-slate-500 shrink-0 mt-0.5" />}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white mb-0.5">{result.checkName}</div>
        {result.output && <p className="text-slate-400 text-xs">{result.output}</p>}
        {result.error && <p className="text-red-400 text-xs">{result.error}</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    detected: { label: "Issue Detected", className: "bg-slate-500/15 text-slate-400 border-slate-500/30" },
    "fix-proposed": { label: "Fix Proposed", className: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
    "validation-passed": { label: "Validation Passed", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    "validation-failed": { label: "Validation Failed", className: "bg-red-500/15 text-red-400 border-red-500/30" },
    "needs-review": { label: "Needs Manual Review", className: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    approved: { label: "Approved", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
    exported: { label: "Exported", className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30" },
  };
  const cfg = configs[status] ?? configs.detected;
  return (
    <span className={cn("text-xs px-2 py-1 rounded-full border font-medium", cfg.className)}>
      {cfg.label}
    </span>
  );
}

function getSourceCode(issue: ScanIssue, scanResult: ScanResult): string {
  // For demo scans, try to get from sessionStorage demo files
  if (scanResult.mode === "demo") {
    try {
      const stored = sessionStorage.getItem("sitemedic_scan_result");
      if (stored) {
        const sr = JSON.parse(stored);
        if (sr.demoFiles) {
          const file = sr.demoFiles.find((f: { path: string }) =>
            f.path === issue.affectedFile
          );
          if (file) return file.content;
        }
      }
    } catch { /* ignore */ }
  }
  return issue.element ?? issue.evidence ?? "";
}
