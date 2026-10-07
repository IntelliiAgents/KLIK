"use client";

import React, { useEffect, useState } from "react";
import { FestivalEvent, VenueLocation } from "@/lib/types";
import { FestivalStripe } from "@/components/Brand/FestivalStripe";
import {
  X,
  Clock,
  MapPin,
  Ticket,
  Heart,
  Navigation,
  Share2,
  ExternalLink,
  Check,
  Calendar,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface EventDetailsModalProps {
  event: FestivalEvent | null;
  venue?: VenueLocation | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (eventId: string) => void;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  venue,
  isSaved,
  onClose,
  onToggleSave,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (event) {
      trackEvent("event_view", { eventId: event.id, title: event.title });
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [event, onClose]);

  if (!event) return null;

  const quicketUrl =
    event.quicketUrl ||
    "https://www.quicket.co.za/events/339579-kleinmond-inniebos-kunstefees-klik/";

  const venueLat = venue?.latitude ?? -34.3415;
  const venueLng = venue?.longitude ?? 19.0278;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venueLat},${venueLng}`;

  const isWritersCafe = event.id.startsWith("evt-sat-cafe");

  const handleShare = async () => {
    trackEvent("event_share", { eventId: event.id, title: event.title });
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://klik2026.netlify.app";
    const shareText = `KLiK 2026\n\n${event.title}\n${event.date}\n${event.startTime}–${event.endTime}\n${event.venueName || "Kleinmond, Western Cape"}\n\n${shareUrl}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `KLiK 2026: ${event.title}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      } catch {
        // silent
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-event-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-parchment-50 w-full max-w-lg max-h-[90vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border border-parchment-300 z-10 animate-in slide-in-from-bottom-6 duration-200">
        <FestivalStripe height="h-1" />

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-parchment-200 flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1 pr-2">
            <div className="flex items-center gap-2 flex-wrap">
              {event.scheduleStatus === "happening_now" && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-terracotta-festival text-white uppercase">
                  NOW
                </span>
              )}

              {!event.isTicketed ? (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black tracking-wide bg-olive-festival text-white">
                  FREE
                </span>
              ) : isWritersCafe ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-terracotta-festival/10 text-terracotta-festival border border-terracotta-festival/20">
                  Writer&apos;s Café Access — R100
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-terracotta-festival/10 text-terracotta-festival border border-terracotta-festival/20">
                  {event.ticketPrice || "R100"}
                </span>
              )}

              {event.capacityNote && (
                <span className="text-[11px] text-ink-muted">
                  • {event.capacityNote}
                </span>
              )}
            </div>

            <h2
              id="modal-event-title"
              className="font-serif font-black text-xl sm:text-2xl text-teal-festival leading-snug"
            >
              {event.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-full text-ink-muted hover:text-teal-festival hover:bg-parchment-200 transition-colors shrink-0 flex items-center justify-center -mr-2 -mt-2"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-ink-festival">
          {/* Date, Time & Venue */}
          <div className="p-4 rounded-2xl bg-parchment-100 border border-parchment-300 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-teal-festival font-semibold">
              <Calendar className="w-4 h-4 text-terracotta-festival shrink-0" />
              <span>{event.date}</span>
              <span className="text-parchment-400">•</span>
              <Clock className="w-4 h-4 text-terracotta-festival shrink-0 ml-1" />
              <span>{event.startTime} – {event.endTime}</span>
            </div>

            <div className="flex items-start gap-2 pt-1 border-t border-parchment-200">
              <MapPin className="w-4 h-4 text-teal-festival shrink-0 mt-0.5" />
              <div>
                <strong className="text-teal-festival font-semibold">
                  {venue ? venue.name : event.venueName || "Kleinmond"}
                </strong>
                {venue?.address && (
                  <p className="text-xs text-ink-muted mt-0.5">{venue.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Writer's Café Special Notice */}
          {isWritersCafe && (
            <div className="p-3.5 rounded-2xl bg-mustard-festival/15 border border-mustard-festival/30 text-xs text-ink-festival space-y-1">
              <strong className="font-bold text-teal-festival block">
                Writer&apos;s Café Day Access — R100
              </strong>
              <p className="text-ink-muted leading-relaxed">
                Includes access to the Saturday Writer&apos;s Café sessions. A valid 2-day or 3-day festival pass also provides full access.
              </p>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <div className="space-y-1 pt-1">
              <h3 className="font-serif font-bold text-sm text-teal-festival">
                About this event
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-ink-festival">
                {event.description}
              </p>
            </div>
          )}

          {/* Sub-sessions (e.g. Our Stories, Sunset Session) */}
          {event.subSessions && event.subSessions.length > 0 && (
            <div className="space-y-2 pt-1">
              <h3 className="font-serif font-bold text-sm text-teal-festival">
                Schedule &amp; Line-up
              </h3>
              <div className="space-y-1.5">
                {event.subSessions.map((sub, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-parchment-100 border border-parchment-300 text-xs flex items-center justify-between gap-3"
                  >
                    <span className="font-bold text-teal-festival">{sub.title}</span>
                    <span className="font-mono text-ink-muted text-[11px] shrink-0 bg-parchment-200 px-2 py-0.5 rounded-md">
                      {sub.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Artists / Presenters */}
          {event.artists && event.artists.length > 0 && (
            <div className="space-y-2 pt-1">
              <h3 className="font-serif font-bold text-sm text-teal-festival">
                Artists &amp; Presenters
              </h3>
              <div className="space-y-2">
                {event.artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="p-3 rounded-xl bg-parchment-100 border border-parchment-300 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <strong className="font-bold text-teal-festival">{artist.name}</strong>
                      <span className="text-[10px] text-ink-muted bg-parchment-200 px-2 py-0.5 rounded-full">
                        {artist.discipline}
                      </span>
                    </div>
                    {artist.bio && (
                      <p className="text-ink-muted leading-relaxed text-[11px]">{artist.bio}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Primary CTA Area */}
        <div className="p-4 sm:p-5 border-t border-parchment-200 bg-parchment-50 space-y-2.5">
          {/* Row 1: Save & Directions & Share */}
          <div className="grid grid-cols-3 gap-2">
            {/* Save */}
            <button
              onClick={() => onToggleSave(event.id)}
              className={`min-h-[44px] py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                isSaved
                  ? "bg-terracotta-festival text-white border-terracotta-festival shadow-xs"
                  : "bg-parchment-100 hover:bg-parchment-200 text-teal-festival border-parchment-300"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isSaved ? "fill-white stroke-white" : "stroke-current"}`}
              />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>

            {/* Directions */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("directions_click", { eventId: event.id })}
              className="min-h-[44px] py-2.5 px-3 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-bold flex items-center justify-center gap-1.5 border border-parchment-300 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>Directions</span>
            </a>

            {/* Share */}
            <button
              onClick={handleShare}
              className="min-h-[44px] py-2.5 px-3 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-bold flex items-center justify-center gap-1.5 border border-parchment-300 transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-olive-festival" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-teal-festival" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>

          {/* Row 2: Buy Tickets - ONLY when ticketed! If FREE, do NOT show disabled button */}
          {event.isTicketed && (
            <a
              href={quicketUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("ticket_click", { eventId: event.id, title: event.title })}
              className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-teal-festival hover:bg-teal-light text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Ticket className="w-4 h-4" />
              <span>Buy Tickets on Quicket</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
