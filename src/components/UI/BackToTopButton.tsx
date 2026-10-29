"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

interface BackToTopButtonProps {
  threshold?: number;
}

export const BackToTopButton: React.FC<BackToTopButtonProps> = ({
  threshold = 320,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      className="fixed right-4 sm:right-6 bottom-[calc(4.85rem+env(safe-area-inset-bottom,0px))] z-30 min-h-[44px] px-3.5 py-2.5 rounded-full bg-teal-festival/95 hover:bg-teal-dark text-parchment-50 shadow-raised border border-parchment-200/20 backdrop-blur-sm flex items-center gap-1.5 text-xs font-semibold tracking-wide active:scale-95 transition-all animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <ArrowUp className="w-4 h-4 text-mustard-light shrink-0" aria-hidden="true" />
      <span className="pr-0.5">Top</span>
    </button>
  );
};
