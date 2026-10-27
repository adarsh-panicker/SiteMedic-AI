import AppShell from "@/components/AppShell";
import Link from "next/link";
import { History, Plus } from "lucide-react";

export default function HistoryPage() {
  return (
    <AppShell>
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Scan History</h1>
            <p className="text-slate-400 text-sm">Previous scan results and reports</p>
          </div>
          <Link href="/scan" className="btn-primary">
            <Plus size={16} />
            New Scan
          </Link>
        </div>

        <div className="card text-center py-16">
          <History size={40} className="text-slate-600 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">No scan history yet</h2>
          <p className="text-slate-400 mb-6 max-w-sm mx-auto">
            Scan history is stored in your active browser session. Run your first scan to see results here.
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/scan?demo=true" className="btn-primary">
              Try Demo Scan
            </Link>
            <Link href="/scan" className="btn-secondary">
              Scan a Website
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
