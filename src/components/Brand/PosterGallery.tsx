"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { OFFICIAL_POSTERS, OfficialPoster } from "@/lib/data/seed";
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Share2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Check,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface PosterGalleryProps {
  compact?: boolean;
}

export const PosterGallery: React.FC<PosterGalleryProps> = ({ compact = false }) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);

  const activePoster: OfficialPoster | null =
    activeIndex !== null ? OFFICIAL_POSTERS[activeIndex] || null : null;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeIndex === null) return;
      if (e.key === "Escape") {
        setActiveIndex(null);
        setZoomLevel(1);
      } else if (e.key === "ArrowRight") {
        setActiveIndex((prev) =>
          prev !== null ? (prev + 1) % OFFICIAL_POSTERS.length : null
        );
        setZoomLevel(1);
      } else if (e.key === "ArrowLeft") {
        setActiveIndex((prev) =>
          prev !== null
            ? (prev - 1 + OFFICIAL_POSTERS.length) % OFFICIAL_POSTERS.length
            : null
        );
        setZoomLevel(1);
      }
    };

    if (activeIndex !== null) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeIndex]);

  const openPoster = (index: number) => {
    setZoomLevel(1);
    setActiveIndex(index);
    const p = OFFICIAL_POSTERS[index];
    if (p) {
      trackEvent("poster_view", { posterId: p.id, title: p.title });
    }
  };

  const cycleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.75 : prev === 1.75 ? 2.5 : 1));
  };

  const handleSharePoster = async (poster: OfficialPoster) => {
    const origin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://klik2026.netlify.app";
    const fullUrl = `${origin}${poster.imageUrl}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `KliK 2026 — ${poster.title}`,
          text: `${poster.title} (${poster.subtitle}) • Kleinmond inniebos Kunstefees 2026`,
          url: fullUrl,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // silent
      }
    }
  };

  return (
    <>
      <div
        className={
          compact
            ? "flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1"
            : "grid grid-cols-2 sm:grid-cols-4 gap-3"
        }
      >
        {OFFICIAL_POSTERS.map((poster, index) => (
          <button
            key={poster.id}
            type="button"
            onClick={() => openPoster(index)}
            className={`group text-left editorial-surface rounded-2xl overflow-hidden transition-all hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-festival ${
              compact ? "w-40 sm:w-44 shrink-0" : "w-full"
            }`}
            aria-label={`View full size: ${poster.title}`}
          >
            <div
              className="relative aspect-[3/4] w-full bg-parchment-200 overflow-hidden"
              style={{ position: "relative", overflow: "hidden" }}
            >
              <Image
                src={poster.imageUrl}
                alt={poster.title}
                fill
                sizes="(max-width: 640px) 45vw, 25vw"
                loading="lazy"
                className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-dark/55 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />
              <span className="absolute bottom-2 right-2 w-7 h-7 rounded-lg bg-[#FCFBF7]/90 text-teal-festival flex items-center justify-center shadow-xs">
                <Maximize2 className="w-3.5 h-3.5" aria-hidden="true" />
              </span>
            </div>

            <div className="p-2.5 sm:p-3 space-y-0.5">
              <h4 className="font-serif font-bold text-xs sm:text-[13px] text-teal-festival leading-tight line-clamp-1 group-hover:text-terracotta-festival transition-colors">
                {poster.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-ink-muted leading-tight line-clamp-1">
                {poster.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Full-Screen Poster Lightbox Viewer */}
      {activePoster && activeIndex !== null && (
        <div
          className="fixed inset-0 z-[70] bg-teal-dark/92 backdrop-blur-sm flex flex-col animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label={activePoster.title}
        >
          {/* Top Toolbar */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3 bg-teal-dark/80 text-white shrink-0">
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-sm sm:text-base text-white truncate">
                {activePoster.title}
              </h3>
              <p className="text-[11px] text-parchment-200/80 truncate">
                {activePoster.subtitle} • {activeIndex + 1} of {OFFICIAL_POSTERS.length}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={cycleZoom}
                className="min-h-[40px] px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                aria-label={zoomLevel > 1 ? "Zoom out or cycle zoom" : "Zoom in"}
                title="Toggle zoom"
              >
                {zoomLevel >= 2.5 ? (
                  <ZoomOut className="w-4 h-4" />
                ) : (
                  <ZoomIn className="w-4 h-4" />
                )}
                <span className="tabular-time">{zoomLevel}×</span>
              </button>

              <a
                href={activePoster.imageUrl}
                download={activePoster.downloadName}
                className="min-w-[40px] min-h-[40px] p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label={`Download ${activePoster.title}`}
                title="Download poster"
              >
                <Download className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={() => handleSharePoster(activePoster)}
                className="min-w-[40px] min-h-[40px] p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                aria-label="Share poster"
                title="Share poster"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Share2 className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveIndex(null);
                  setZoomLevel(1);
                }}
                className="min-w-[40px] min-h-[40px] p-2 rounded-xl bg-white/15 hover:bg-terracotta-festival text-white flex items-center justify-center transition-colors ml-1"
                aria-label="Close artwork preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable / Zoomable Poster Canvas */}
          <div
            className="flex-1 overflow-auto p-3 sm:p-6 flex items-start sm:items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget && zoomLevel === 1) {
                setActiveIndex(null);
              }
            }}
          >
            <div
              onDoubleClick={cycleZoom}
              style={{
                width:
                  zoomLevel === 1
                    ? "min(100%, 720px)"
                    : `${Math.round(zoomLevel * 100)}%`,
                maxWidth: zoomLevel === 1 ? "720px" : `${Math.round(zoomLevel * 720)}px`,
              }}
              className="transition-[width] duration-200 mx-auto"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePoster.imageUrl}
                alt={activePoster.title}
                className="w-full h-auto rounded-xl shadow-2xl bg-parchment-50 select-none"
              />
            </div>
          </div>

          {/* Bottom Prev / Next Bar */}
          <div className="px-4 py-3 border-t border-white/10 bg-teal-dark/85 flex items-center justify-between gap-3 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => {
                setZoomLevel(1);
                setActiveIndex(
                  (activeIndex - 1 + OFFICIAL_POSTERS.length) % OFFICIAL_POSTERS.length
                );
              }}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-[11px] text-parchment-200/75 text-center hidden sm:inline">
              Tap zoom ({zoomLevel}×) to inspect schedule details
            </span>

            <button
              type="button"
              onClick={() => {
                setZoomLevel(1);
                setActiveIndex((activeIndex + 1) % OFFICIAL_POSTERS.length);
              }}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
