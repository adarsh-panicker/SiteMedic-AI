"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import ScanForm from "@/components/ScanForm";
import ScanResults from "@/components/ScanResults";
import { ScanResult } from "@/lib/types";
import { AlertTriangle, Loader2 } from "lucide-react";

function ScanPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoFiles, setDemoFiles] = useState<unknown[]>([]);

  useEffect(() => {
    const url = searchParams.get("url");
    const demo = searchParams.get("demo");
    const upload = searchParams.get("upload");

    if (demo === "true") {
      runDemoScan();
    } else if (url) {
      runUrlScan(decodeURIComponent(url));
    }
  }, []);

  async function runDemoScan() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/scan/demo", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
        setDemoFiles(data.demoFiles ?? []);
      } else {
        setError(data.error ?? "Demo scan failed");
      }
    } catch (err) {
      setError("Network error — could not run demo scan");
    } finally {
      setLoading(false);
    }
  }

  async function runUrlScan(url: string) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/scan/url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, maxPages: 5 }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error ?? "Scan failed");
      }
    } catch (err) {
      setError("Network error — could not scan the URL");
    } finally {
      setLoading(false);
    }
  }

  async function runUploadScan(file: File) {
    setLoading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/scan/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.result);
      } else {
        setError(data.error ?? "Upload scan failed");
      }
    } catch (err) {
      setError("Network error — could not scan the uploaded file");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 border-t-cyan-500 animate-spin" />
        <div className="text-center">
          <div className="text-white font-semibold mb-1">Scanning website...</div>
          <div className="text-sm text-slate-400">Analyzing HTML, SEO, accessibility, and links</div>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <ScanResults
        result={result}
        demoFiles={demoFiles}
        onRescan={() => {
          setResult(null);
          setError("");
        }}
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">New Scan</h1>
        <p className="text-slate-400">
          Enter a public URL or upload a website ZIP to begin the audit.
        </p>
      </div>

      {error && (
        <div className="card border-red-500/30 bg-red-500/5 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-red-400 mb-0.5">Scan failed</div>
              <div className="text-sm text-red-300/80">{error}</div>
            </div>
          </div>
        </div>
      )}

      <ScanForm
        onUrlScan={runUrlScan}
        onUploadScan={runUploadScan}
        onDemoScan={runDemoScan}
      />
    </div>
  );
}

export default function ScanPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="animate-spin text-cyan-400" size={32} />
        </div>
      }>
        <ScanPageContent />
      </Suspense>
    </AppShell>
  );
}
