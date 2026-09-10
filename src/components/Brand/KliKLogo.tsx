import React from "react";
import Link from "next/link";
import Image from "next/image";

interface KliKLogoProps {
  variant?: "full" | "compact" | "badge" | "emblem";
  className?: string;
  priority?: boolean;
}

export const KliKLogo: React.FC<KliKLogoProps> = ({
  variant = "full",
  className = "",
  priority = false,
}) => {
  if (variant === "compact") {
    return (
      <Link
        href="/"
        className={`group inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-festival rounded-full transition-transform active:scale-95 ${className}`}
        aria-label="KliK Kunstefees 2026 Home"
      >
        <div className="relative w-11 h-11 shrink-0 drop-shadow-xs transition-transform group-hover:scale-105">
          <Image
            src="/assets/klik-round-logo-128.png"
            alt="KliK Kunstefees 2026 Official Logo"
            width={44}
            height={44}
            className="w-full h-full object-contain"
            priority={priority}
          />
        </div>
      </Link>
    );
  }

  if (variant === "emblem") {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <Image
          src="/assets/klik-round-logo-128.png"
          alt="KliK Kunstefees 2026 Logo"
          width={80}
          height={80}
          className="w-full h-full object-contain drop-shadow-sm"
          priority={priority}
        />
      </div>
    );
  }

  if (variant === "badge") {
    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-parchment-100 border border-parchment-300 shadow-sm ${className}`}
      >
        <Image
          src="/assets/klik-round-logo-64.png"
          alt="KliK Logo Badge"
          width={28}
          height={28}
          className="w-7 h-7 object-contain"
        />
        <div className="flex items-center gap-1.5">
          <span className="font-serif font-bold text-sm text-teal-festival">
            Kl<span className="text-terracotta-festival">i</span>k
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-terracotta-festival">
            Kunstefees
          </span>
        </div>
      </div>
    );
  }

  // Full variant: Official round logo
  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className="relative w-44 h-44 sm:w-52 sm:h-52 mx-auto filter drop-shadow-md transition-transform hover:scale-[1.02]">
        <Image
          src="/assets/klik-round-logo-512.png"
          alt="KliK - Kleinmond Inniebos Kunstefees 2026: Stories, Poetry, Music, Art, Community"
          width={208}
          height={208}
          priority={priority}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
};
