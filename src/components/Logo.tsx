import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 40,
    xl: 56,
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-2xl",
  };

  const px = iconSizes[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Precision Vector Emblem */}
      <div
        className="relative flex items-center justify-center shrink-0 rounded-xl overflow-hidden shadow-lg shadow-cyan-500/10 border border-cyan-500/30 bg-gradient-to-b from-[#0f2444] to-[#071326]"
        style={{ width: px, height: px }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[78%] h-[78%]"
        >
          {/* Subtle background glow */}
          <circle cx="24" cy="24" r="18" fill="url(#emblemGlow)" opacity="0.35" />

          {/* Left code bracket '<' */}
          <path
            d="M15 17L9 24L15 31"
            stroke="#22d3ee"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right code bracket '>' */}
          <path
            d="M33 17L39 24L33 31"
            stroke="#22d3ee"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Central Medical Cross + Pulse Node */}
          {/* Vertical Cross Bar */}
          <rect
            x="22"
            y="13"
            width="4"
            height="22"
            rx="2"
            fill="url(#crossGrad)"
          />

          {/* Horizontal Cross Bar */}
          <rect
            x="13"
            y="22"
            width="22"
            height="4"
            rx="2"
            fill="url(#crossGrad)"
          />

          {/* Core diagnostic spark / pulse point */}
          <circle cx="24" cy="24" r="2.2" fill="#ffffff" />
          <circle cx="24" cy="24" r="4" stroke="#67e8f9" strokeWidth="1" opacity="0.8" />

          {/* Gradients */}
          <defs>
            <radialGradient
              id="emblemGlow"
              cx="0"
              cy="0"
              r="1"
              gradientUnits="userSpaceOnUse"
              gradientTransform="translate(24 24) rotate(90) scale(18)"
            >
              <stop stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="1" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id="crossGrad"
              x1="13"
              y1="13"
              x2="35"
              y2="35"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#38bdf8" />
              <stop offset="0.5" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#10b981" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className={`font-bold tracking-tight text-white ${textSizes[size]}`}>
              SiteMedic
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-cyan-400/10 text-cyan-400 border border-cyan-400/30">
              AI
            </span>
          </div>
          {size !== "sm" && (
            <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-0.5">
              Autonomous Web Doctor
            </span>
          )}
        </div>
      )}
    </div>
  );
}
