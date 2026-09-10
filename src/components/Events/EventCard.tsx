"use client";

import React, { useState } from "react";
import { FestivalEvent } from "@/lib/types";
import { Clock, MapPin, Ticket, Heart, ChevronRight, AlertTriangle, Users } from "lucide-react";

interface EventCardProps {
  event: FestivalEvent;
  isSaved: boolean;
  onToggleSave: (eventId: string) => void;
  onOpenDetails: (event: FestivalEvent) => void;
  showConflictWarning?: boolean;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  isSaved,
  onToggleSave,
  onOpenDetails,
  showConflictWarning = false,
}) => {
  const [animatingHeart, setAnimatingHeart] = useState(false);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimatingHeart(true);
    setTimeout(() => setAnimatingHeart(false), 300);
    onToggleSave(event.id);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "music":
        return "bg-teal-festival text-white";
      case "poetry":
      case "stories":
        return "bg-terracotta-festival text-white";
      case "workshop":
        return "bg-mustard-festival text-ink-festival";
      case "art":
        return "bg-eucalyptus-festival text-white";
      case "youth":
        return "bg-mustard-light text-ink-festival";
      case "market":
        return "bg-amber-700 text-white";
      default:
        return "bg-parchment-300 text-ink-festival";
    }
  };

  const isLive = event.scheduleStatus === "happening_now";
  const isCancelled = event.scheduleStatus === "cancelled";
  const isMoved = event.scheduleStatus === "moved";

  return (
    <article
      onClick={() => onOpenDetails(event)}
      className={`relative bg-parchment-50 rounded-2xl border transition-all duration-200 cursor-pointer p-4 shadow-subtle hover:shadow-card active:scale-[0.99] ${
        isLive
          ? "border-terracotta-festival ring-1 ring-terracotta-festival/40"
          : isCancelled
          ? "border-red-300 opacity-75"
          : "border-parchment-200 hover:border-parchment-400"
      }`}
      aria-label={`${event.title}, ${event.startTime} to ${event.endTime} at ${event.venueName}`}
    >
      {/* Top badges bar */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${getCategoryColor(
              event.category
            )}`}
          >
            {event.category}
          </span>

          {event.isTicketed ? (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-terracotta-festival/10 text-terracotta-festival border border-terracotta-festival/20 flex items-center gap-1">
              <Ticket className="w-3 h-3" aria-hidden="true" />
              <span>{event.ticketPrice || "Ticketed"}</span>
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide bg-[#009A44] text-white shadow-xs">
              FREE ZONE
            </span>
          )}

          {isLive && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-terracotta-festival text-white flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>Happening Now</span>
            </span>
          )}

          {isCancelled && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
              Cancelled
            </span>
          )}

          {isMoved && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
              Venue Moved
            </span>
          )}
        </div>

        {/* Save button */}
        <button
          onClick={handleSaveClick}
          className={`p-2.5 -mr-1 -mt-1 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-festival ${
            isSaved
              ? "text-terracotta-festival bg-terracotta-festival/10"
              : "text-ink-muted hover:text-terracotta-festival hover:bg-parchment-200"
          }`}
          aria-label={isSaved ? `Remove ${event.title} from My Festival` : `Save ${event.title} to My Festival`}
        >
          <Heart
            className={`w-5 h-5 transition-transform ${
              isSaved ? "fill-terracotta-festival stroke-terracotta-festival" : "stroke-current"
            } ${animatingHeart ? "scale-125" : "scale-100"}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Title */}
      <h3 className={`font-serif font-bold text-lg leading-snug text-teal-festival mb-1.5 ${isCancelled ? "line-through text-ink-muted" : ""}`}>
        {event.title}
      </h3>

      {/* Conflict warning */}
      {showConflictWarning && (
        <div className="mb-2 p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>Schedule conflict with another saved event!</span>
        </div>
      )}

      {/* Time & Venue */}
      <div className="flex flex-col gap-1 text-xs text-ink-muted mb-2.5">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-terracotta-festival shrink-0" aria-hidden="true" />
          <span className="font-semibold text-ink-festival">
            {event.startTime} – {event.endTime}
          </span>
          <span className="text-parchment-400">•</span>
          <span className="capitalize">{event.language === "bilingual" ? "Afrikaans & English" : event.language}</span>
        </div>

        {event.venueName && (
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-teal-festival shrink-0" aria-hidden="true" />
            <span className="truncate">{event.venueName}</span>
          </div>
        )}
      </div>

      {/* Featured Artists preview */}
      {event.artists && event.artists.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-ink-muted mb-2 truncate">
          <Users className="w-3.5 h-3.5 text-eucalyptus-festival shrink-0" aria-hidden="true" />
          <span className="truncate">
            {event.artists.map((a) => a.name).join(", ")}
          </span>
        </div>
      )}

      {/* Bottom info link */}
      <div className="pt-2 border-t border-parchment-200 flex items-center justify-between text-xs font-semibold text-teal-festival">
        <span>View full details & venue</span>
        <ChevronRight className="w-4 h-4 text-parchment-400" aria-hidden="true" />
      </div>
    </article>
  );
};
