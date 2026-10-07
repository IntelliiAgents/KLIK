"use client";

import React, { useState } from "react";
import { FestivalEvent } from "@/lib/types";
import { Clock, MapPin, Heart, AlertTriangle } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface EventCardProps {
  event: FestivalEvent;
  isSaved: boolean;
  onToggleSave: (eventId: string) => void;
  onOpenDetails: (event: FestivalEvent) => void;
  showConflictWarning?: boolean;
  variant?: "timeline" | "card";
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isSaved,
  onToggleSave,
  onOpenDetails,
  showConflictWarning = false,
  variant = "timeline",
}) => {
  const [animatingHeart, setAnimatingHeart] = useState(false);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimatingHeart(true);
    setTimeout(() => setAnimatingHeart(false), 280);
    if (!isSaved) {
      trackEvent("event_save", { eventId: event.id, title: event.title });
    } else {
      trackEvent("event_unsave", { eventId: event.id, title: event.title });
    }
    onToggleSave(event.id);
  };

  const isLive = event.scheduleStatus === "happening_now";
  const isCancelled = event.scheduleStatus === "cancelled";
  const isMoved = event.scheduleStatus === "moved";

  // Check if Writer's Café session
  const isWritersCafe = event.id.startsWith("evt-sat-cafe");

  // Editorial short descriptor (e.g. main artist or brief note)
  const descriptor =
    event.artists && event.artists.length > 0
      ? event.artists.map((a) => a.name).join(", ")
      : undefined;

  return (
    <article
      onClick={() => onOpenDetails(event)}
      className={`group relative text-left transition-all cursor-pointer ${
        variant === "timeline"
          ? "py-3 px-3.5 -mx-2 rounded-2xl hover:bg-parchment-200/60 border-b border-parchment-300/70 last:border-b-0"
          : "p-4 rounded-2xl bg-parchment-50 border border-parchment-300 shadow-subtle hover:shadow-card"
      } ${isLive ? "bg-terracotta-festival/[0.04] ring-1 ring-terracotta-festival/30" : ""} ${
        isCancelled ? "opacity-60" : ""
      }`}
      aria-label={`${event.title}, ${event.startTime} at ${event.venueName || "Kleinmond"}`}
    >
      {/* Conflict warning */}
      {showConflictWarning && (
        <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
          <span>These events overlap.</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          {/* Top metadata line: Time + Live / Free / Price */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-teal-festival flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-teal-festival/70 shrink-0" />
              <span>{event.startTime} – {event.endTime}</span>
            </span>

            {/* Happening now: small terracotta accent: NOW */}
            {isLive && (
              <span className="px-1.5 py-0.2 rounded font-black text-[10px] tracking-wide bg-terracotta-festival text-white uppercase">
                NOW
              </span>
            )}

            {isMoved && (
              <span className="px-1.5 py-0.2 rounded font-bold text-[10px] bg-amber-200 text-amber-900 uppercase">
                MOVED
              </span>
            )}

            {isCancelled && (
              <span className="px-1.5 py-0.2 rounded font-bold text-[10px] bg-red-100 text-red-700 uppercase">
                CANCELLED
              </span>
            )}

            {/* Free vs Price */}
            {!event.isTicketed ? (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-black tracking-wide bg-olive-festival text-white">
                FREE
              </span>
            ) : isWritersCafe ? (
              <span className="text-[11px] font-semibold text-terracotta-festival">
                Writer&apos;s Café (R100)
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-terracotta-festival">
                {event.ticketPrice || "R100"}
              </span>
            )}
          </div>

          {/* Event Title */}
          <h3
            className={`font-serif font-bold text-base sm:text-lg text-teal-festival leading-snug group-hover:text-terracotta-festival transition-colors ${
              isCancelled ? "line-through text-ink-muted" : ""
            }`}
          >
            {event.title}
          </h3>

          {/* Optional short descriptor */}
          {descriptor && (
            <p className="text-xs text-ink-muted truncate">
              {descriptor}
            </p>
          )}

          {/* Venue */}
          {event.venueName && (
            <p className="text-xs text-ink-muted flex items-center gap-1 pt-0.5">
              <MapPin className="w-3 h-3 text-teal-festival/60 shrink-0" />
              <span className="truncate">{event.venueName}</span>
            </p>
          )}
        </div>

        {/* Save Heart Button - 44px min touch target */}
        <button
          onClick={handleSaveClick}
          className={`min-w-[44px] min-h-[44px] -mr-1.5 -mt-1 p-2.5 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-festival shrink-0 ${
            isSaved
              ? "text-terracotta-festival"
              : "text-ink-muted/50 hover:text-terracotta-festival"
          }`}
          aria-label={isSaved ? `Remove ${event.title} from My Festival` : `Save ${event.title} to My Festival`}
        >
          <Heart
            className={`w-5 h-5 transition-transform duration-200 ${
              isSaved
                ? "fill-terracotta-festival stroke-terracotta-festival"
                : "stroke-current"
            } ${animatingHeart ? "scale-125" : "scale-100"}`}
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  );
};
