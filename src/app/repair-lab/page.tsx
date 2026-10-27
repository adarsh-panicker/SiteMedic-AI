"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import RepairLabWorkspace from "@/components/RepairLabWorkspace";
import { ScanResult, ScanIssue } from "@/lib/types";
import { Loader2, Wrench, AlertTriangle } from "lucide-react";
import Link from "next/link";

function RepairLabContent() {
  const searchParams = useSearchParams();
  const issueId = searchParams.get("issueId");
  const scanId = searchParams.get("scanId");

  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<ScanIssue | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (issueId && scanId) {
      // Load from sessionStorage
      try {
        const storedResult = sessionStorage.getItem("sitemedic_scan_result");
        const storedIssue = sessionStorage.getItem("sitemedic_selected_issue");
        if (storedResult) setScanResult(JSON.parse(storedResult));
        if (storedIssue) setSelectedIssue(JSON.parse(storedIssue));
      } catch {
        setError("Could not load scan data. Please run a scan first.");
      }
    }
  }, [issueId, scanId]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="card border-red-500/30 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-400 shrink-0" />
            <div>
              <div className="font-medium text-red-400 mb-1">Could not load Repair Lab</div>
              <p className="text-sm text-red-300/80">{error}</p>
              <Link href="/scan" className="btn-primary text-sm mt-3 inline-flex">
                Run a New Scan
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedIssue || !scanResult) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
          <Wrench size={28} className="text-cyan-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Repair Lab</h2>
        <p className="text-slate-400 mb-6">
          Select an issue from your scan results to open it in the Repair Lab.
        </p>
        <Link href="/scan" className="btn-primary">
          Run a Scan First
        </Link>
      </div>
    );
  }

  return (
    <RepairLabWorkspace
      issue={selectedIssue}
      scanResult={scanResult}
    />
  );
}

export default function RepairLabPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
        </div>
      }>
        <RepairLabContent />
      </Suspense>
    </AppShell>
  );
}
