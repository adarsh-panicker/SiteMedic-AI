"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import {
  Activity,
  Plus,
  History,
  Wrench,
  FileText,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/scan", label: "New Scan", icon: Plus },
  { href: "/history", label: "Scan History", icon: History },
  { href: "/repair-lab", label: "Repair Lab", icon: Wrench },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-[#1e293b] bg-[#060b18] h-screen sticky top-0">
        {/* Logo */}
        <div className="flex items-center px-4 py-4 border-b border-[#1e293b]">
          <Link href="/dashboard" className="transition-opacity hover:opacity-90">
            <Logo size="md" />
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link w-full ${active ? "active" : ""}`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-[#1e293b]">
          <div className="text-[11px] text-slate-600 px-2">
            <div className="font-medium text-slate-500">SiteMedic AI</div>
            <div>Nebius × NVIDIA Hackathon</div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#1e293b] bg-[#060b18] sticky top-0 z-50">
        <Link href="/dashboard">
          <Logo size="sm" />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn-secondary p-2"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </header>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#060b18]/95">
          <div className="pt-16 p-4 space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link w-full py-3 text-base ${active ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon size={20} />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
