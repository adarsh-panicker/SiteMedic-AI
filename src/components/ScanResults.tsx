"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ScanResult, ScanIssue, Severity, IssueCategory } from "@/lib/types";
import SeverityBadge from "./SeverityBadge";
import HealthScore from "./HealthScore";
import {
  Search,
  Filter,
  RefreshCw,
  Wrench,
  ExternalLink,
  FileText,
  ChevronDown,
  ChevronUp,
  Clock,
  Globe,
  FileArchive,
} from "lucide-react";
import { formatDuration, formatTimestamp, extractDomain } from "@/lib/utils";

interface Props {
  result: ScanResult;
  demoFiles?: unknown[];
  onRescan: () => void;
}

const CATEGORY_LABELS: Record<IssueCategory, string> = {
  accessibility: "Accessibility",
  seo: "SEO",
  "broken-links": "Broken Links",
  "html-structure": "HTML Structure",
  "css-layout": "CSS / Layout",
  javascript: "JavaScript",
  performance: "Performance",
  security: "Security",
  images: "Images",
  assets: "Assets",
};

export default function ScanResults({ result, demoFiles, onRescan }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<Severity | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | "all">("all");
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"severity" | "category">("severity");

  const severityOrder: Record<Severity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };

  const filtered = result.issues
    .filter((issue) => {
      if (severityFilter !== "all" && issue.severity !== severityFilter) return false;
      if (categoryFilter !== "all" && issue.category !== categoryFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          issue.title.toLowerCase().includes(q) ||
          issue.evidence.toLowerCase().includes(q) ||
          issue.ruleId.toLowerCase().includes(q) ||
          (issue.affectedFile ?? "").toLowerCase().includes(q) ||
          (issue.affectedUrl ?? "").toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "severity") {
        return (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9);
      }
      return a.category.localeCompare(b.category);
    });

  const categories = [...new Set(result.issues.map((i) => i.category))];

  function openInRepairLab(issue: ScanIssue) {
    // Store scan result and issue in sessionStorage for repair lab
    sessionStorage.setItem("sitemedic_scan_result", JSON.stringify(result));
    sessionStorage.setItem("sitemedic_selected_issue", JSON.stringify(issue));
    router.push(`/repair-lab?issueId=${issue.id}&scanId=${result.id}`);
  }

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Scan Results</h1>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            {result.url ? (
              <span className="flex items-center gap-1.5">
                <Globe size={14} />
                {extractDomain(result.url)}
              </span>
            ) : result.filename ? (
              <span className="flex items-center gap-1.5">
                <FileArchive size={14} />
                {result.filename}
              </span>
            ) : (
              <span>Demo website</span>
            )}
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1.5">
              <Clock size={14} />
              {formatDuration(result.durationMs)}
            </span>
            <span className="text-slate-600">·</span>
            <span>{result.pagesScanned} page{result.pagesScanned !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <button onClick={onRescan} className="btn-secondary">
          <RefreshCw size={16} />
          New Scan
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="card text-center">
          <HealthScore score={result.healthScore} size="lg" />
          <div className="text-xs text-slate-500 mt-2">Health Score</div>
        </div>
        <div className="card">
          <div className="text-3xl font-bold text-white">{result.summary.total}</div>
          <div className="text-xs text-slate-500 mt-1">Total Issues</div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            {result.summary.critical > 0 && <span className="badge-critical">{result.summary.critical}</span>}
            {result.summary.high > 0 && <span className="badge-high">{result.summary.high}</span>}
            {result.summary.medium > 0 && <span className="badge-medium">{result.summary.medium}</span>}
            {result.summary.low > 0 && <span className="badge-low">{result.summary.low}</span>}
          </div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-white">{result.summary.accessibility}</div>
          <div className="text-xs text-slate-500 mt-1">Accessibility</div>
          <div className="text-2xl font-bold text-white mt-2">{result.summary.seo}</div>
          <div className="text-xs text-slate-500 mt-1">SEO</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-white">{result.summary.brokenLinks}</div>
          <div className="text-xs text-slate-500 mt-1">Broken Links</div>
          <div className="text-2xl font-bold text-white mt-2">{result.pagesScanned}</div>
          <div className="text-xs text-slate-500 mt-1">Pages Scanned</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search issues..."
            className="input-field pl-9"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value as Severity | "all")}
          className="input-field w-auto"
          aria-label="Filter by severity"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as IssueCategory | "all")}
          className="input-field w-auto"
          aria-label="Filter by category"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "severity" | "category")}
          className="input-field w-auto"
          aria-label="Sort by"
        >
          <option value="severity">Sort: Severity</option>
          <option value="category">Sort: Category</option>
        </select>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-400 mb-4">
        Showing {filtered.length} of {result.issues.length} issues
      </div>

      {/* Issues list */}
      {filtered.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-slate-500 mb-2">No issues match your filters</div>
          <button onClick={() => { setSearch(""); setSeverityFilter("all"); setCategoryFilter("all"); }} className="btn-secondary text-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((issue) => (
            <IssueCard
              key={issue.id}
              issue={issue}
              expanded={expandedIssue === issue.id}
              onToggle={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
              onOpenRepairLab={() => openInRepairLab(issue)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function IssueCard({
  issue,
  expanded,
  onToggle,
  onOpenRepairLab,
}: {
  issue: ScanIssue;
  expanded: boolean;
  onToggle: () => void;
  onOpenRepairLab: () => void;
}) {
  const CATEGORY_LABELS: Record<string, string> = {
    accessibility: "A11Y",
    seo: "SEO",
    "broken-links": "Links",
    "html-structure": "HTML",
    "css-layout": "CSS",
    javascript: "JS",
    performance: "Perf",
    security: "Security",
    images: "Images",
    assets: "Assets",
  };

  return (
    <div className="card hover:border-[#254a80] transition-colors">
      {/* Collapsed view */}
      <button
        onClick={onToggle}
        className="w-full text-left flex items-start gap-3"
        aria-expanded={expanded}
      >
        <span className={`severity-dot mt-1.5 shrink-0 ${issue.severity}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-white text-sm">{issue.title}</span>
            <span className="text-xs text-slate-600 font-mono">{issue.ruleId}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <SeverityBadge severity={issue.severity} />
            <span className="text-xs px-2 py-0.5 rounded bg-[#0f2042] text-slate-400 border border-[#1a3460]">
              {CATEGORY_LABELS[issue.category] ?? issue.category}
            </span>
            {(issue.affectedFile || issue.affectedUrl) && (
              <span className="text-xs text-slate-500 truncate max-w-[200px]">
                {issue.affectedFile ?? issue.affectedUrl}
                {issue.lineNumber ? ` :${issue.lineNumber}` : ""}
              </span>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp size={16} className="text-slate-500 shrink-0 mt-0.5" />
        ) : (
          <ChevronDown size={16} className="text-slate-500 shrink-0 mt-0.5" />
        )}
      </button>

      {/* Expanded view */}
      {expanded && (
        <div className="mt-4 pl-5 space-y-4 border-t border-[#1e293b] pt-4">
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Evidence</div>
            <div className="text-sm text-slate-300 bg-[#0f2042] rounded-lg p-3 font-mono leading-relaxed border border-[#1a3460]">
              {issue.evidence}
            </div>
          </div>

          {issue.element && (
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Affected Element</div>
              <pre className="text-sm bg-[#0f2042] rounded-lg p-3 border border-[#1a3460] overflow-x-auto">
                <code className="text-cyan-300">{issue.element}</code>
              </pre>
            </div>
          )}

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Impact</div>
            <p className="text-sm text-slate-400">{issue.impact}</p>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Suggested Repair</div>
            <p className="text-sm text-slate-400">{issue.suggestedRepair}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-2">
            <button onClick={onOpenRepairLab} className="btn-primary text-sm">
              <Wrench size={14} />
              Open in Repair Lab
            </button>
            <span className={`text-xs px-2 py-1 rounded-full border ${
              issue.verificationStatus === "confirmed"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : issue.verificationStatus === "potential"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-slate-500/10 text-slate-400 border-slate-500/30"
            }`}>
              {issue.verificationStatus === "confirmed" ? "✓ Confirmed" : issue.verificationStatus === "potential" ? "~ Potential" : "? Could not verify"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
