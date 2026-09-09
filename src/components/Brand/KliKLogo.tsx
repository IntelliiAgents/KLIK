import React from "react";
import Link from "next/link";

interface KliKLogoProps {
  variant?: "full" | "compact" | "badge";
  className?: string;
}

export const KliKLogo: React.FC<KliKLogoProps> = ({ variant = "full", className = "" }) => {
  if (variant === "compact") {
    return (
      <Link
        href="/"
        className={`inline-flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-festival rounded-md ${className}`}
        aria-label="KliK 2026 Home"
      >
        <span className="font-serif font-black text-2xl tracking-tight text-teal-festival">
          Kl<span className="text-terracotta-festival">i</span>k
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-ink-muted border-l border-parchment-300 pl-2">
          2026
        </span>
      </Link>
    );
  }

  if (variant === "badge") {
    return (
      <div className={`inline-flex flex-col items-center justify-center p-2 rounded-lg bg-teal-festival text-parchment-50 shadow-sm ${className}`}>
        <span className="font-serif font-black text-xl leading-none tracking-tight">
          Kl<span className="text-terracotta-festival">i</span>k
        </span>
        <span className="text-[9px] font-bold tracking-widest uppercase text-mustard-light mt-0.5">
          2026
        </span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      {/* Visual Header Motif */}
      <div className="w-16 h-16 mb-2">
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-sm" aria-hidden="true">
          {/* Circular frame accent */}
          <circle cx="100" cy="100" r="92" fill="none" stroke="#133D4B" strokeWidth="2.5" strokeOpacity="0.3" />
          
          {/* Mountains */}
          <path d="M40,115 L75,75 L95,95 L125,55 L165,115 Z" fill="none" stroke="#6F5B47" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round"/>
          
          {/* Protea */}
          <g transform="translate(68, 38) scale(0.65)">
            <path d="M40,75 C20,50 20,25 40,5 C60,25 60,50 40,75 Z" fill="#D33E36" />
            <path d="M22,75 C5,55 8,30 22,12 C32,32 32,55 24,75 Z" fill="#C8522C" />
            <path d="M58,75 C75,55 72,30 58,12 C48,32 48,55 56,75 Z" fill="#C8522C" />
            <path d="M40,75 L40,105" stroke="#4B6354" strokeWidth="6" strokeLinecap="round" />
            <path d="M40,85 C20,95 10,110 -2,120 C10,105 25,95 40,90 Z" fill="#4B6354" />
            <path d="M40,85 C60,95 70,110 82,120 C70,105 55,95 40,90 Z" fill="#4B6354" />
          </g>

          {/* Sea waves */}
          <path d="M35,135 C65,120 100,140 135,125 C150,118 160,125 165,130 C155,150 120,160 85,155 C55,150 42,142 35,135 Z" fill="#1B5E74" />
          <path d="M45,145 C75,165 125,168 155,148 C130,170 80,170 45,145 Z" fill="#DE9E36" />
        </svg>
      </div>

      {/* Primary Logotype */}
      <h1 className="font-serif font-black text-5xl tracking-tight text-teal-festival leading-tight">
        Kl<span className="text-terracotta-festival">i</span>k
      </h1>
      
      {/* Subtitles as in official festival banner */}
      <div className="w-full flex items-center justify-center gap-3 my-1">
        <span className="h-[1px] w-8 bg-parchment-300"></span>
        <span className="font-sans font-bold text-xs uppercase tracking-[0.25em] text-terracotta-festival">
          Kleinmond Inniebos
        </span>
        <span className="h-[1px] w-8 bg-parchment-300"></span>
      </div>
      
      <div className="font-serif font-bold text-lg tracking-[0.18em] uppercase text-teal-festival">
        Kunstefees
      </div>

      <div className="mt-1 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-ink-muted">
        <span>Stories</span>
        <span>•</span>
        <span>Poetry</span>
        <span>•</span>
        <span>Music</span>
        <span>•</span>
        <span>Art</span>
        <span>•</span>
        <span>Community</span>
      </div>
    </div>
  );
};
