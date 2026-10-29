"use client";

import React, { useEffect } from "react";
import { Artist, FestivalEvent } from "@/lib/types";
import { FestivalStripe } from "@/components/Brand/FestivalStripe";
import { X, Calendar, Clock, MapPin, ChevronRight, Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface ArtistProfileModalProps {
  artist: Artist | null;
  events?: FestivalEvent[];
  onClose: () => void;
  onSelectEvent?: (event: FestivalEvent) => void;
}

const formatFestivalDay = (isoDate: string): string => {
  if (isoDate === "2026-11-27") return "Fri, 27 Nov";
  if (isoDate === "2026-11-28") return "Sat, 28 Nov";
  if (isoDate === "2026-11-29") return "Sun, 29 Nov";
  return isoDate;
};

export const ArtistProfileModal: React.FC<ArtistProfileModalProps> = ({
  artist,
  events = [],
  onClose,
  onSelectEvent,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (artist) {
      trackEvent("artist_profile_view", { artistId: artist.id, artistName: artist.name });
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [artist, onClose]);

  if (!artist) return null;

  const paragraphs = artist.bio
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  const artistEvents = events
    .filter((evt) => evt.artists?.some((a) => a.id === artist.id))
    .sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return a.startTime.localeCompare(b.startTime);
    });

  // Initials monogram for refined editorial avatar
  const initials = artist.name
    .replace(/^Dr\.\s+/i, "")
    .split(/[\s&]+/)
    .filter((part) => part && !part.startsWith("("))
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");

  return (
    <div
      className="fixed inset-0 z-[60] bg-teal-dark/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="artist-modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-parchment-50 w-full max-w-lg max-h-[88vh] sm:rounded-3xl rounded-t-3xl shadow-raised flex flex-col overflow-hidden border border-parchment-300 z-10 animate-in slide-in-from-bottom-6 duration-200">
        <FestivalStripe height="h-1" />

        {/* Editorial Header */}
        <div className="p-5 sm:p-6 border-b border-parchment-200 flex items-start justify-between gap-3 bg-[#FCFBF7]">
          <div className="flex items-start gap-3.5 min-w-0 pr-2">
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-teal-festival text-parchment-50 font-serif font-bold text-base sm:text-lg flex items-center justify-center shrink-0 shadow-subtle border border-teal-light/30"
              aria-hidden="true"
            >
              {initials || "K"}
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="editorial-kicker">Featured Profile</span>
                {artist.affiliation && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-mustard-festival/15 text-mustard-dark border border-mustard-festival/25">
                    {artist.affiliation}
                  </span>
                )}
              </div>

              <h2
                id="artist-modal-title"
                className="font-serif font-bold text-xl sm:text-2xl text-teal-festival leading-tight"
              >
                {artist.name}
              </h2>

              <p className="text-xs font-medium text-ink-muted">{artist.discipline}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-full text-ink-muted hover:text-teal-festival hover:bg-parchment-200 transition-colors shrink-0 flex items-center justify-center -mr-2 -mt-2"
            aria-label="Close artist biography"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Biography & Sessions */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-ink-festival">
          {/* Literary Biography */}
          <div className="space-y-3.5">
            {paragraphs.map((para, idx) => (
              <p
                key={idx}
                className="text-sm leading-[1.7] text-ink-festival/95"
              >
                {para}
              </p>
            ))}
          </div>

          {/* Connected Festival Appearances */}
          {artistEvents.length > 0 && (
            <div className="pt-4 border-t border-parchment-300/80 space-y-2.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-terracotta-festival" aria-hidden="true" />
                <h3 className="font-serif font-bold text-sm text-teal-festival">
                  Festival Appearances ({artistEvents.length})
                </h3>
              </div>

              <div className="space-y-2">
                {artistEvents.map((evt) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => {
                      if (onSelectEvent) {
                        onClose();
                        onSelectEvent(evt);
                      }
                    }}
                    disabled={!onSelectEvent}
                    className={`w-full text-left p-3.5 rounded-xl bg-parchment-100 border border-parchment-300 flex items-center justify-between gap-3 transition-colors ${
                      onSelectEvent ? "hover:bg-parchment-200/80 cursor-pointer group" : ""
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-ink-muted tabular-time flex-wrap">
                        <span className="inline-flex items-center gap-1 text-teal-festival">
                          <Calendar className="w-3 h-3 text-terracotta-festival shrink-0" />
                          {formatFestivalDay(evt.date)}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          {evt.startTime} – {evt.endTime}
                        </span>
                        {!evt.isTicketed && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-olive-festival text-white">
                            Free Zone
                          </span>
                        )}
                      </div>

                      <p className="font-serif font-bold text-sm text-teal-festival leading-snug group-hover:text-terracotta-festival transition-colors">
                        {evt.title}
                      </p>

                      {(evt.subVenue || evt.venueName) && (
                        <p className="text-[11px] text-ink-muted flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-teal-festival/60 shrink-0" />
                          <span className="truncate">
                            {evt.subVenue
                              ? `${evt.subVenue} • ${evt.venueName || "Mthimkhulu Village Centre"}`
                              : evt.venueName}
                          </span>
                        </p>
                      )}
                    </div>

                    {onSelectEvent && (
                      <ChevronRight className="w-4 h-4 text-ink-light group-hover:text-terracotta-festival shrink-0 transition-colors" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer close button */}
        <div className="p-4 border-t border-parchment-200 bg-[#FCFBF7]">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-teal-festival font-semibold text-xs transition-colors"
          >
            Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};
