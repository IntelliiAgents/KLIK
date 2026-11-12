"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Sparkles,
  Calendar,
  ChevronDown,
  ChevronUp,
  Layers,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface PosterGalleryProps {
  compact?: boolean;
  onSelectEventId?: (eventId: string) => void;
  defaultShowAdditional?: boolean;
}

export const PosterGallery: React.FC<PosterGalleryProps> = ({
  compact = false,
  onSelectEventId,
  defaultShowAdditional = false,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [showAdditional, setShowAdditional] = useState<boolean>(
    defaultShowAdditional
  );

  // Primary posters: first 3 in exact order (Page 1, Page 2, Youth Festival)
  const primaryPosters = OFFICIAL_POSTERS.filter((p) => p.isPrimary);
  // Remaining 7 event-specific posters
  const additionalPosters = OFFICIAL_POSTERS.filter((p) => !p.isPrimary);

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

  const openPosterById = (posterId: string) => {
    const idx = OFFICIAL_POSTERS.findIndex((p) => p.id === posterId);
    if (idx === -1) return;
    setZoomLevel(1);
    setActiveIndex(idx);
    const p = OFFICIAL_POSTERS[idx];
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
    const fullUrl = `${origin}${encodeURI(poster.imageUrl)}`;

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

  const renderPosterCard = (
    poster: OfficialPoster,
    isFeaturedPrimary: boolean
  ) => {
    const canOpenModalDirectly =
      Boolean(onSelectEventId) && Boolean(poster.linkedEventId);

    return (
      <div
        key={poster.id}
        className={`group editorial-surface rounded-2xl overflow-hidden flex flex-col justify-between transition-all hover:shadow-card ${
          isFeaturedPrimary
            ? "border-teal-festival/35 ring-1 ring-teal-festival/15"
            : "border-parchment-300"
        }`}
      >
        <button
          type="button"
          onClick={() => openPosterById(poster.id)}
          className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-festival flex-1 flex flex-col"
          aria-label={`View full size: ${poster.title}`}
        >
          {/* Uncropped A4/A3 Poster Preview Container (724:1024 aspect ratio with object-contain) */}
          <div
            className="relative aspect-[724/1024] w-full bg-[#FAF6EE] overflow-hidden border-b border-parchment-200"
            style={{ position: "relative", overflow: "hidden" }}
          >
            <Image
              src={poster.imageUrl}
              alt={poster.title}
              fill
              sizes={
                isFeaturedPrimary
                  ? "(max-width: 640px) 92vw, 33vw"
                  : "(max-width: 640px) 48vw, 30vw"
              }
              loading={isFeaturedPrimary ? "eager" : "lazy"}
              className="object-contain p-1 transition-transform duration-300 group-hover:scale-[1.02]"
            />

            {isFeaturedPrimary && (
              <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-teal-festival/92 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs backdrop-blur-xs">
                Featured
              </span>
            )}

            <span
              className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-teal-dark/85 text-white text-[10px] font-semibold flex items-center gap-1 shadow-xs backdrop-blur-xs group-hover:bg-terracotta-festival transition-colors"
              aria-hidden="true"
            >
              <Maximize2 className="w-3 h-3" />
              <span>Full Size</span>
            </span>
          </div>

          <div className="p-3 sm:p-3.5 space-y-1 flex-1 flex flex-col justify-between">
            <div className="space-y-1">
              <h3
                className={`font-serif font-bold text-teal-festival leading-snug group-hover:text-terracotta-festival transition-colors ${
                  isFeaturedPrimary
                    ? "text-sm sm:text-[15px]"
                    : "text-xs sm:text-[13.5px]"
                }`}
              >
                {poster.title}
              </h3>
              <p className="text-[11px] text-ink-muted leading-snug">
                {poster.subtitle}
              </p>
            </div>
          </div>
        </button>

        {/* Linked Programme Event Action */}
        {(poster.programmeUrl || canOpenModalDirectly) && (
          <div className="px-3 pb-3 pt-1">
            {canOpenModalDirectly && poster.linkedEventId ? (
              <button
                type="button"
                onClick={() => onSelectEventId?.(poster.linkedEventId!)}
                className="w-full min-h-[34px] px-2.5 py-1.5 rounded-xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-teal-festival text-[11px] font-semibold inline-flex items-center justify-between gap-1.5 transition-colors"
              >
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Calendar className="w-3 h-3 text-terracotta-festival shrink-0" />
                  <span className="truncate">
                    {poster.programmeLinkLabel || "View Event Details"}
                  </span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-terracotta-festival shrink-0" />
              </button>
            ) : poster.programmeUrl ? (
              <Link
                href={poster.programmeUrl}
                className="w-full min-h-[34px] px-2.5 py-1.5 rounded-xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-teal-festival text-[11px] font-semibold inline-flex items-center justify-between gap-1.5 transition-colors"
              >
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Calendar className="w-3 h-3 text-terracotta-festival shrink-0" />
                  <span className="truncate">
                    {poster.programmeLinkLabel || "View in Programme"}
                  </span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-terracotta-festival shrink-0" />
              </Link>
            ) : null}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. FEATURED SECTION: 3 PRIMARY POSTERS (Displayed First in Exact Order) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-terracotta-festival">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Primary Programme &amp; Youth Festival Posters</span>
          </span>
          <span className="text-[11px] text-ink-muted">
            Tap any poster to view full-size &amp; zoom
          </span>
        </div>

        <div
          className={
            compact
              ? "grid grid-cols-1 sm:grid-cols-3 gap-3"
              : "grid grid-cols-1 sm:grid-cols-3 gap-3.5"
          }
        >
          {primaryPosters.map((poster) => renderPosterCard(poster, true))}
        </div>
      </div>

      {/* 2. BROWSE ADDITIONAL EVENT POSTERS LINK / TOGGLE + EXPANDABLE GALLERY */}
      {additionalPosters.length > 0 && (
        <div className="space-y-3.5 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-parchment-100/90 border border-parchment-300">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-teal-festival/10 text-teal-festival flex items-center justify-center shrink-0">
                <Layers className="w-4 h-4 text-terracotta-festival" />
              </div>
              <div className="min-w-0">
                <span className="font-serif font-bold text-xs sm:text-sm text-teal-festival block leading-tight">
                  Additional Official Event Posters ({additionalPosters.length})
                </span>
                <span className="text-[11px] text-ink-muted block truncate">
                  Official Opening, Writers Café, Our Stories, Grail Centre, Sip &amp; Paint &amp; Sunset Session
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAdditional((prev) => !prev)}
              aria-expanded={showAdditional}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-teal-festival hover:bg-teal-light text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors shrink-0"
            >
              <span>
                {showAdditional
                  ? "Hide Additional Event Posters"
                  : `Browse ${additionalPosters.length} Additional Event Posters`}
              </span>
              {showAdditional ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>

          {showAdditional && (
            <div className="space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-serif font-bold text-sm sm:text-base text-teal-festival">
                  Event-Specific Festival Posters
                </h3>
                <span className="text-[11px] text-ink-muted">
                  All 10 official posters available in full-screen viewer
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                {additionalPosters.map((poster) =>
                  renderPosterCard(poster, false)
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full-Screen Poster Lightbox Viewer */}
      {activePoster && activeIndex !== null && (
        <div
          className="fixed inset-0 z-[70] bg-teal-dark/94 backdrop-blur-sm flex flex-col animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label={activePoster.title}
        >
          {/* Top Toolbar */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3 bg-teal-dark/90 text-white shrink-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {activePoster.isPrimary && (
                  <span className="px-1.5 py-0.5 rounded bg-terracotta-festival text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
                    Primary
                  </span>
                )}
                <h3 className="font-serif font-bold text-sm sm:text-base text-white truncate">
                  {activePoster.title}
                </h3>
              </div>
              <p className="text-[11px] text-parchment-200/85 truncate mt-0.5">
                {activePoster.subtitle}
                {OFFICIAL_POSTERS.length > 1
                  ? ` • Poster ${activeIndex + 1} of ${OFFICIAL_POSTERS.length}`
                  : ""}
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
                    ? "min(100%, 724px)"
                    : `${Math.round(zoomLevel * 100)}%`,
                maxWidth:
                  zoomLevel === 1
                    ? "724px"
                    : `${Math.round(zoomLevel * 724)}px`,
              }}
              className="transition-[width] duration-200 mx-auto my-auto"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePoster.imageUrl}
                alt={activePoster.title}
                className="w-full h-auto rounded-xl shadow-2xl bg-parchment-50 select-none"
              />
            </div>
          </div>

          {/* Bottom Prev / Next + Linked Programme Bar */}
          <div className="px-4 py-3 border-t border-white/10 bg-teal-dark/90 flex flex-wrap items-center justify-between gap-2 shrink-0 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => {
                setZoomLevel(1);
                setActiveIndex(
                  (activeIndex - 1 + OFFICIAL_POSTERS.length) %
                    OFFICIAL_POSTERS.length
                );
              }}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-2">
              {activePoster.linkedEventId && onSelectEventId ? (
                <button
                  type="button"
                  onClick={() => {
                    const id = activePoster.linkedEventId!;
                    setActiveIndex(null);
                    setZoomLevel(1);
                    onSelectEventId(id);
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-terracotta-festival hover:bg-terracotta-light text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {activePoster.programmeLinkLabel || "View Event Details"}
                  </span>
                </button>
              ) : activePoster.programmeUrl ? (
                <Link
                  href={activePoster.programmeUrl}
                  onClick={() => {
                    setActiveIndex(null);
                    setZoomLevel(1);
                  }}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-terracotta-festival hover:bg-terracotta-light text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {activePoster.programmeLinkLabel || "View in Programme"}
                  </span>
                </Link>
              ) : (
                <span className="text-[11px] text-parchment-200/75 text-center hidden sm:inline">
                  Tap zoom ({zoomLevel}×) to inspect full poster details
                </span>
              )}
            </div>

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
    </div>
  );
};
