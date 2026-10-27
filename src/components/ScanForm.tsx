"use client";

import { useState } from "react";
import { Globe, Upload, Play, Search, AlertTriangle, FileArchive } from "lucide-react";

interface Props {
  onUrlScan: (url: string) => void;
  onUploadScan: (file: File) => void;
  onDemoScan: () => void;
}

type Mode = "url" | "upload";

export default function ScanForm({ onUrlScan, onUploadScan, onDemoScan }: Props) {
  const [mode, setMode] = useState<Mode>("url");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [urlError, setUrlError] = useState("");
  const [fileError, setFileError] = useState("");
  const [dragging, setDragging] = useState(false);

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    setUrlError("");
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlError("Please enter a URL");
      return;
    }
    const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    try {
      new URL(normalized);
    } catch {
      setUrlError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }
    onUrlScan(normalized);
  }

  function handleFileSelect(selectedFile: File) {
    setFileError("");
    if (!selectedFile.name.endsWith(".zip")) {
      setFileError("Only ZIP archives are supported");
      return;
    }
    if (selectedFile.size > 50 * 1024 * 1024) {
      setFileError("File is too large. Maximum size is 50MB");
      return;
    }
    setFile(selectedFile);
  }

  function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setFileError("Please select a ZIP file");
      return;
    }
    onUploadScan(file);
  }

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex rounded-lg border border-[#1e293b] p-1 bg-[#0a1628] gap-1">
        {[
          { id: "url" as Mode, label: "Scan URL", icon: Globe },
          { id: "upload" as Mode, label: "Upload ZIP", icon: Upload },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
              mode === id
                ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      {mode === "url" && (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label htmlFor="scan-url" className="block text-sm font-medium text-slate-300 mb-2">
              Website URL
            </label>
            <div className="relative">
              <Globe size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                id="scan-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="input-field pl-10"
                autoComplete="url"
              />
            </div>
            {urlError && (
              <p className="mt-2 text-sm text-red-400 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                {urlError}
              </p>
            )}
          </div>

          <div className="card bg-[#0f1f38] border-[#1a3460]">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">What will be scanned</h4>
            <ul className="text-sm text-slate-400 space-y-1">
              {["Page title & meta description", "H1 and heading structure", "Image alt attributes", "Viewport & lang attributes", "Open Graph metadata", "Accessible link text", "Form input labels", "Up to 5 linked pages"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="severity-dot passed" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <button type="submit" className="btn-primary w-full justify-center py-3">
            <Search size={18} />
            Scan Website
          </button>
        </form>
      )}

      {mode === "upload" && (
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const dropped = e.dataTransfer.files[0];
              if (dropped) handleFileSelect(dropped);
            }}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
              dragging
                ? "border-cyan-400 bg-cyan-500/5"
                : file
                ? "border-emerald-500/50 bg-emerald-500/5"
                : "border-[#1e293b] hover:border-[#254a80]"
            }`}
            onClick={() => document.getElementById("zip-upload")?.click()}
          >
            <input
              id="zip-upload"
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            {file ? (
              <div>
                <FileArchive size={32} className="text-emerald-400 mx-auto mb-3" />
                <p className="font-medium text-white">{file.name}</p>
                <p className="text-sm text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB — Click to change</p>
              </div>
            ) : (
              <div>
                <Upload size={32} className="text-slate-500 mx-auto mb-3" />
                <p className="font-medium text-slate-300">Drop your ZIP here, or click to browse</p>
                <p className="text-sm text-slate-500 mt-1">ZIP archives up to 50MB · HTML, CSS, JS, TS supported</p>
              </div>
            )}
          </div>

          {fileError && (
            <p className="text-sm text-red-400 flex items-center gap-1.5">
              <AlertTriangle size={14} />
              {fileError}
            </p>
          )}

          <div className="card bg-[#0f1f38] border-[#1a3460] text-sm text-slate-400">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Security</p>
            <p>Uploaded files are analyzed in memory and never executed or stored. Archives are validated against path traversal and size limits before extraction.</p>
          </div>

          <button type="submit" disabled={!file} className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed">
            <Upload size={18} />
            Scan ZIP Project
          </button>
        </form>
      )}

      {/* Demo divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#1e293b]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#060b18] px-3 text-xs text-slate-600">or</span>
        </div>
      </div>

      <button
        onClick={onDemoScan}
        className="btn-secondary w-full justify-center py-3"
      >
        <Play size={18} className="text-cyan-400" />
        Try Demo — Scan Sample Website
        <span className="ml-auto text-xs bg-cyan-500/10 text-cyan-500 px-2 py-0.5 rounded-full">No API key needed</span>
      </button>
    </div>
  );
}
