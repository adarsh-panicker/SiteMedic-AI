"use client";

import { ChangedFile, DiffLine } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  changedFiles: ChangedFile[];
}

export default function DiffViewer({ changedFiles }: Props) {
  if (changedFiles.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-slate-400">No changes to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {changedFiles.map((file, i) => (
        <FileDiff key={i} file={file} />
      ))}
    </div>
  );
}

function FileDiff({ file }: { file: ChangedFile }) {
  const [showUnchanged, setShowUnchanged] = useState(false);

  const added = file.diff.filter((l) => l.type === "added").length;
  const removed = file.diff.filter((l) => l.type === "removed").length;

  // Group diff lines — show context around changes
  const displayedLines = showUnchanged
    ? file.diff
    : filterWithContext(file.diff, 3);

  return (
    <div className="card overflow-hidden p-0">
      {/* File header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e293b] bg-[#0f2042]">
        <span className="text-sm font-mono text-slate-300">{file.path}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-emerald-400">+{added}</span>
          <span className="text-xs text-red-400">-{removed}</span>
          <button
            onClick={() => setShowUnchanged(!showUnchanged)}
            className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1"
          >
            {showUnchanged ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {showUnchanged ? "Hide unchanged" : "Show all"}
          </button>
        </div>
      </div>

      {/* Diff lines */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs font-mono">
          <tbody>
            {displayedLines.map((line, i) => (
              line === null ? (
                <tr key={i}>
                  <td colSpan={3} className="px-4 py-1 text-slate-600 text-center text-[11px]">
                    ··· unchanged lines hidden ···
                  </td>
                </tr>
              ) : (
                <tr
                  key={i}
                  className={cn(
                    line.type === "added" ? "bg-emerald-500/8" :
                    line.type === "removed" ? "bg-red-500/8" :
                    "hover:bg-white/2",
                  )}
                >
                  <td className="w-12 px-3 py-0.5 text-right text-slate-700 select-none border-r border-[#1e293b]">
                    {line.type !== "added" ? line.lineNumber : ""}
                  </td>
                  <td className="w-12 px-3 py-0.5 text-right text-slate-700 select-none border-r border-[#1e293b]">
                    {line.type !== "removed" ? line.lineNumber : ""}
                  </td>
                  <td className="px-1 py-0.5">
                    <span
                      className={cn(
                        "inline-block px-1",
                        line.type === "added" ? "text-emerald-400" :
                        line.type === "removed" ? "text-red-400" :
                        "text-slate-500"
                      )}
                    >
                      {line.type === "added" ? "+" : line.type === "removed" ? "-" : " "}
                    </span>
                    <span
                      className={cn(
                        line.type === "added" ? "text-emerald-200" :
                        line.type === "removed" ? "text-red-200" :
                        "text-slate-400"
                      )}
                    >
                      {line.content}
                    </span>
                  </td>
                </tr>
              )
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Return diff lines with context; insert null to indicate hidden sections
function filterWithContext(lines: DiffLine[], context: number): (DiffLine | null)[] {
  const important = new Set<number>();
  lines.forEach((line, i) => {
    if (line.type !== "unchanged") {
      for (let j = Math.max(0, i - context); j <= Math.min(lines.length - 1, i + context); j++) {
        important.add(j);
      }
    }
  });

  const result: (DiffLine | null)[] = [];
  let lastWasHidden = false;
  lines.forEach((line, i) => {
    if (important.has(i)) {
      result.push(line);
      lastWasHidden = false;
    } else if (!lastWasHidden) {
      result.push(null);
      lastWasHidden = true;
    }
  });
  return result;
}
