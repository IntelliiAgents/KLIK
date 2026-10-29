"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Artist, FestivalEvent, VenueLocation } from "@/lib/types";
import { FestivalStripe } from "@/components/Brand/FestivalStripe";
import { ArtistProfileModal } from "@/components/Artists/ArtistProfileModal";
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
  Map as MapIcon,
  Users,
  ChevronRight,
  Award,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface EventDetailsModalProps {
  event: FestivalEvent | null;
  venue?: VenueLocation | null;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (eventId: string) => void;
  allEvents?: FestivalEvent[];
  onSelectEvent?: (event: FestivalEvent) => void;
}

const formatDisplayDate = (isoDate: string): string => {
  if (isoDate === "2026-11-27") return "Friday, 27 November 2026";
  if (isoDate === "2026-11-28") return "Saturday, 28 November 2026";
  if (isoDate === "2026-11-29") return "Sunday, 29 November 2026";
  return isoDate;
};

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  venue,
  isSaved,
  onClose,
  onToggleSave,
  allEvents = [],
  onSelectEvent,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !selectedArtist) onClose();
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
  }, [event, onClose, selectedArtist]);

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
    const shareUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://klik2026.netlify.app";
    const shareText = `KliK 2026\n\n${event.title}\n${formatDisplayDate(event.date)}\n${event.startTime}–${event.endTime}\n${
      event.subVenue ? `${event.subVenue}, ` : ""
    }${event.venueName || "Kleinmond, Western Cape"}\n\n${shareUrl}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `KliK 2026: ${event.title}`,
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
    <>
      <div
        className="fixed inset-0 z-50 bg-teal-dark/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-event-title"
      >
        <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

        <div className="relative bg-parchment-50 w-full max-w-lg max-h-[90vh] sm:rounded-3xl rounded-t-3xl shadow-raised flex flex-col overflow-hidden border border-parchment-300 z-10 animate-in slide-in-from-bottom-6 duration-200">
          <FestivalStripe height="h-1" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-parchment-200 flex items-start justify-between gap-3 bg-[#FCFBF7]">
            <div className="space-y-1.5 flex-1 pr-2">
              <div className="flex items-center gap-2 flex-wrap">
                {event.scheduleStatus === "happening_now" && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-terracotta-festival text-white uppercase tracking-wider">
                    Live Now
                  </span>
                )}

                {!event.isTicketed ? (
                  <span className="badge-free-zone">Free Zone</span>
                ) : isWritersCafe ? (
                  <span className="badge-ticket">Writers Café Access — R100</span>
                ) : (
                  <span className="badge-ticket">{event.ticketPrice || "R100"}</span>
                )}

                {event.ageGroup && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-accent/10 text-teal-festival border border-teal-accent/20">
                    Ages {event.ageGroup}
                  </span>
                )}

                {event.affiliation && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-mustard-festival/15 text-mustard-dark border border-mustard-festival/25">
                    {event.affiliation}
                  </span>
                )}
              </div>

              <h2
                id="modal-event-title"
                className="font-serif font-bold text-xl sm:text-2xl text-teal-festival leading-snug"
              >
                {event.title}
              </h2>

              {event.capacityNote && (
                <p className="text-xs text-ink-muted inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-festival/70 shrink-0" />
                  <span>{event.capacityNote} (informational)</span>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-full text-ink-muted hover:text-teal-festival hover:bg-parchment-200 transition-colors shrink-0 flex items-center justify-center -mr-2 -mt-2"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-ink-festival">
            {/* Date, Time & Venue Box */}
            <div className="p-4 rounded-2xl bg-parchment-100 border border-parchment-300 space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-teal-festival font-semibold flex-wrap tabular-time">
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-terracotta-festival shrink-0" />
                  <span>{formatDisplayDate(event.date)}</span>
                </span>
                <span className="text-parchment-400">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-terracotta-festival shrink-0" />
                  <span>
                    {event.startTime} – {event.endTime}
                  </span>
                </span>
              </div>

              <div className="flex items-start justify-between gap-3 pt-2 border-t border-parchment-200">
                <div className="flex items-start gap-2 min-w-0">
                  <MapPin className="w-4 h-4 text-teal-festival shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    {event.subVenue && (
                      <strong className="block text-terracotta-festival font-semibold text-xs uppercase tracking-wide">
                        {event.subVenue}
                      </strong>
                    )}
                    <strong className="text-teal-festival font-semibold block">
                      {venue ? venue.name : event.venueName || "Kleinmond"}
                    </strong>
                    {venue?.address && (
                      <p className="text-xs text-ink-muted mt-0.5">{venue.address}</p>
                    )}
                  </div>
                </div>

                {event.venueId && (
                  <Link
                    href={`/map?venue=${event.venueId}`}
                    onClick={onClose}
                    className="shrink-0 px-2.5 py-1.5 rounded-lg bg-[#FCFBF7] hover:bg-parchment-200 text-teal-festival text-[11px] font-semibold border border-parchment-300 inline-flex items-center gap-1 transition-colors"
                  >
                    <MapIcon className="w-3 h-3 text-terracotta-festival" />
                    <span>Map</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Writers Café Special Notice */}
            {isWritersCafe && (
              <div className="p-3.5 rounded-2xl bg-mustard-festival/12 border border-mustard-festival/30 text-xs text-ink-festival space-y-1">
                <strong className="font-bold text-teal-festival block">
                  Writers Café Day Access — R100
                </strong>
                <p className="text-ink-muted leading-relaxed">
                  Includes access to all six Saturday Writers Café author conversations at Kleinmond Central Café. A valid 2-day or 3-day festival pass also provides full access.
                </p>
              </div>
            )}

            {/* Description */}
            {event.description && (
              <div className="space-y-1.5 pt-0.5">
                <h3 className="font-serif font-bold text-sm text-teal-festival">
                  About this session
                </h3>
                <p className="text-xs sm:text-sm leading-relaxed text-ink-festival/95">
                  {event.description}
                </p>
              </div>
            )}

            {/* Facilitator / MCs / Event Highlights */}
            {(event.facilitatorDisplay ||
              (event.hosts && event.hosts.length > 0) ||
              (event.highlights && event.highlights.length > 0)) && (
              <div className="p-3.5 rounded-2xl bg-[#FCFBF7] border border-parchment-300 space-y-2 text-xs">
                {event.facilitatorDisplay && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                      Facilitator
                    </span>
                    <span className="font-semibold text-teal-festival">
                      {event.facilitatorDisplay}
                      {event.affiliation ? ` (${event.affiliation})` : ""}
                    </span>
                  </div>
                )}

                {event.hosts && event.hosts.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted block">
                      Masters of Ceremonies (MCs)
                    </span>
                    <span className="font-semibold text-teal-festival">
                      {event.hosts.join(" • ")}
                    </span>
                  </div>
                )}

                {event.highlights && event.highlights.length > 0 && (
                  <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                    {event.highlights.map((item) => (
                      <span
                        key={item}
                        className="px-2.5 py-1 rounded-lg bg-parchment-100 border border-parchment-300 text-[11px] font-semibold text-teal-festival inline-flex items-center gap-1"
                      >
                        <Award className="w-3 h-3 text-terracotta-festival" />
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sub-sessions (e.g. Our Stories, Sunset Session) */}
            {event.subSessions && event.subSessions.length > 0 && (
              <div className="space-y-2 pt-1">
                <h3 className="font-serif font-bold text-sm text-teal-festival">
                  Session Schedule &amp; Line-up
                </h3>
                <div className="space-y-1.5">
                  {event.subSessions.map((sub, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-parchment-100 border border-parchment-300 text-xs flex items-start justify-between gap-3"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-teal-festival block">
                          {sub.title}
                        </span>
                        {sub.artists && sub.artists.length > 1 && (
                          <span className="text-[11px] text-ink-muted block">
                            {sub.artists.join(", ")}
                          </span>
                        )}
                      </div>
                      <span className="tabular-time font-semibold text-teal-festival text-[11px] shrink-0 bg-parchment-200/90 px-2 py-0.5 rounded-md">
                        {sub.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Artists / Presenters with Click-to-Read Full Biography */}
            {event.artists && event.artists.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-teal-festival">
                    Featured Profiles
                  </h3>
                  <span className="text-[11px] text-ink-muted">
                    Tap for full biography
                  </span>
                </div>

                <div className="space-y-2">
                  {event.artists.map((artist) => (
                    <button
                      key={artist.id}
                      type="button"
                      onClick={() => setSelectedArtist(artist)}
                      className="w-full text-left p-3.5 rounded-xl bg-[#FCFBF7] hover:bg-parchment-100 border border-parchment-300 text-xs space-y-1.5 transition-colors group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <strong className="font-serif font-bold text-sm text-teal-festival group-hover:text-terracotta-festival transition-colors block truncate">
                            {artist.name}
                          </strong>
                          <span className="text-[11px] text-ink-muted block truncate">
                            {artist.discipline}
                          </span>
                        </div>

                        <span className="text-[11px] font-semibold text-terracotta-festival inline-flex items-center gap-0.5 shrink-0">
                          <span>Bio</span>
                          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>

                      {artist.bio && (
                        <p className="text-ink-muted leading-relaxed text-[11px] line-clamp-2">
                          {artist.bio.replace(/\n+/g, " ")}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Draft / Subject to Change Note */}
            {event.isDraft && (
              <p className="text-[11px] italic text-ink-muted pt-1 border-t border-parchment-200">
                Draft programme — session details remain subject to change.
              </p>
            )}
          </div>

          {/* Primary CTA Footer */}
          <div className="p-4 sm:p-5 border-t border-parchment-200 bg-[#FCFBF7] space-y-2.5">
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onToggleSave(event.id)}
                className={`min-h-[44px] py-2.5 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 border transition-all ${
                  isSaved
                    ? "bg-terracotta-festival text-white border-terracotta-festival shadow-xs"
                    : "bg-parchment-100 hover:bg-parchment-200 text-teal-festival border-parchment-300"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isSaved ? "fill-white stroke-white" : "stroke-current"
                  }`}
                />
                <span>{isSaved ? "Saved" : "Save"}</span>
              </button>

              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("directions_click", { eventId: event.id })}
                className="min-h-[44px] py-2.5 px-3 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-semibold flex items-center justify-center gap-1.5 border border-parchment-300 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Directions</span>
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="min-h-[44px] py-2.5 px-3 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-semibold flex items-center justify-center gap-1.5 border border-parchment-300 transition-colors"
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

            {event.isTicketed && (
              <a
                href={quicketUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("ticket_click", { eventId: event.id, title: event.title })
                }
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-teal-festival hover:bg-teal-light text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Ticket className="w-4 h-4" />
                <span>Buy Tickets on Quicket</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Nested Artist Biography Modal */}
      <ArtistProfileModal
        artist={selectedArtist}
        events={allEvents}
        onClose={() => setSelectedArtist(null)}
        onSelectEvent={
          onSelectEvent
            ? (evt) => {
                setSelectedArtist(null);
                onSelectEvent(evt);
              }
            : undefined
        }
      />
    </>
  );
};
