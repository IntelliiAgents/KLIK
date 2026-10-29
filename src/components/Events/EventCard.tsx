"use client";

import React, { useState } from "react";
import { FestivalEvent, EventCategory } from "@/lib/types";
import { Clock, MapPin, Heart, AlertTriangle, Users } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface EventCardProps {
  event: FestivalEvent;
  isSaved: boolean;
  onToggleSave: (eventId: string) => void;
  onOpenDetails: (event: FestivalEvent) => void;
  showConflictWarning?: boolean;
  variant?: "timeline" | "card";
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
  music: "Music",
  poetry: "Poetry",
  theatre: "Theatre",
  stories: "Stories & Talks",
  workshop: "Workshop",
  art: "Visual Art",
  market: "Market",
  youth: "Children & Youth",
  community: "Community",
  outdoor: "Coastal Walk",
  competition: "Competition",
};

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
    setTimeout(() => setAnimatingHeart(false), 260);
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
  const isWritersCafe = event.id.startsWith("evt-sat-cafe");

  // Presenter / Facilitator / MC summary line
  const presenterLine = event.facilitatorDisplay
    ? `Facilitator: ${event.facilitatorDisplay}${
        event.affiliation ? ` (${event.affiliation})` : ""
      }`
    : event.hosts && event.hosts.length > 0
      ? `MCs: ${event.hosts.join(", ")}`
      : event.artists && event.artists.length > 0
        ? event.artists.length > 4
          ? `${event.artists
              .slice(0, 3)
              .map((a) => a.name)
              .join(", ")} + ${event.artists.length - 3} more`
          : event.artists.map((a) => a.name).join(", ")
        : undefined;

  const venueLine = event.subVenue
    ? `${event.subVenue} • ${event.venueName || "Mthimkhulu Village Centre"}`
    : event.venueName;

  return (
    <article
      onClick={() => onOpenDetails(event)}
      className={`group relative text-left transition-all cursor-pointer ${
        variant === "timeline"
          ? "py-3.5 px-3.5 -mx-1.5 rounded-xl hover:bg-parchment-200/50 border-b border-parchment-300/70 last:border-b-0"
          : "p-4 sm:p-5 rounded-2xl editorial-surface hover:shadow-card hover:border-parchment-400/80"
      } ${isLive ? "bg-terracotta-festival/[0.04] ring-1 ring-terracotta-festival/35" : ""} ${
        isCancelled ? "opacity-60" : ""
      }`}
      aria-label={`${event.title}, ${event.startTime} to ${event.endTime} at ${venueLine || "Kleinmond"}`}
    >
      {/* Saved Overlap Warning */}
      {showConflictWarning && (
        <div className="mb-2.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200/90 text-amber-900 text-[11px] font-medium flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" aria-hidden="true" />
          <span>Overlaps with another saved session</span>
        </div>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Top metadata row: Time + Category + Admission */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="font-semibold text-teal-festival tabular-time inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-terracotta-festival/85 shrink-0" aria-hidden="true" />
              <span>
                {event.startTime} – {event.endTime}
              </span>
            </span>

            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase bg-parchment-200/85 text-teal-muted">
              {CATEGORY_LABELS[event.category] || event.category}
            </span>

            {isLive && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider bg-terracotta-festival text-white uppercase">
                Live Now
              </span>
            )}

            {isMoved && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-950 uppercase">
                Moved
              </span>
            )}

            {isCancelled && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 uppercase">
                Cancelled
              </span>
            )}

            {!event.isTicketed ? (
              <span className="badge-free-zone">Free Zone</span>
            ) : isWritersCafe ? (
              <span className="badge-ticket">Writers Café • R100</span>
            ) : (
              <span className="badge-ticket">{event.ticketPrice || "R100"}</span>
            )}
          </div>

          {/* Title */}
          <h3
            className={`font-serif font-bold text-base sm:text-[17px] text-teal-festival leading-snug group-hover:text-terracotta-festival transition-colors ${
              isCancelled ? "line-through text-ink-muted" : ""
            }`}
          >
            {event.title}
          </h3>

          {/* Presenter / Facilitator / MCs */}
          {presenterLine && (
            <p className="text-xs text-ink-festival/85 leading-snug line-clamp-1">
              {presenterLine}
            </p>
          )}

          {/* Age Group / Capacity / Highlights pills */}
          {(event.ageGroup || event.capacityNote || (event.highlights && event.highlights.length > 0)) && (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {event.ageGroup && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-accent/10 text-teal-festival border border-teal-accent/20">
                  Ages {event.ageGroup}
                </span>
              )}
              {event.capacityNote && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-parchment-200/70 text-ink-muted inline-flex items-center gap-1">
                  <Users className="w-2.5 h-2.5" aria-hidden="true" />
                  {event.capacityNote}
                </span>
              )}
              {event.highlights && event.highlights.length > 0 && (
                <span className="text-[11px] text-ink-muted">
                  {event.highlights.join(" • ")}
                </span>
              )}
            </div>
          )}

          {/* Venue */}
          {venueLine && (
            <p className="text-xs text-ink-muted flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-teal-festival/65 shrink-0" aria-hidden="true" />
              <span className="truncate">{venueLine}</span>
            </p>
          )}
        </div>

        {/* Save Heart Button - 44px touch target */}
        <button
          type="button"
          onClick={handleSaveClick}
          className={`min-w-[44px] min-h-[44px] -mr-1.5 -mt-1 p-2.5 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-festival shrink-0 ${
            isSaved
              ? "text-terracotta-festival"
              : "text-ink-light hover:text-terracotta-festival hover:bg-parchment-200/60"
          }`}
          aria-label={
            isSaved
              ? `Remove ${event.title} from My Festival`
              : `Save ${event.title} to My Festival`
          }
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
