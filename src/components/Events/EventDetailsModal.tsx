"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { FestivalEvent, VenueLocation } from "@/lib/types";
import {
  X,
  Clock,
  MapPin,
  Ticket,
  Heart,
  ExternalLink,
  Navigation,
  QrCode,
  ShieldAlert,
  Info,
  Sparkles,
} from "lucide-react";

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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (event) {
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

  // Map directions url
  const directionsUrl = venue
    ? `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${event.venueName || "Kleinmond"}, Western Cape`
      )}`;

  const checkInUrl = venue
    ? `/check-in/${venue.id}?token=${venue.qrCodeToken}`
    : `/check-in/${event.venueId}?token=seed-token-2026`;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-event-title"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-parchment-50 w-full max-w-lg max-h-[85vh] sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col overflow-hidden border border-parchment-300 z-10 animate-in slide-in-from-bottom-6 duration-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-parchment-200 bg-parchment/60 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-festival text-white">
                {event.category}
              </span>
              {event.isTicketed ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-terracotta-festival/15 text-terracotta-festival border border-terracotta-festival/20">
                  {event.ticketPrice || "Ticketed"}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-eucalyptus-festival/15 text-eucalyptus-dark">
                  Free Event
                </span>
              )}
            </div>
            <h2
              id="modal-event-title"
              className="font-serif font-black text-xl sm:text-2xl text-teal-festival leading-tight"
            >
              {event.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-ink-muted hover:text-ink-festival hover:bg-parchment-200 transition-colors shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-6 h-6" aria-hidden="true" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-ink-festival">
          {/* Status Notice if moved or cancelled */}
          {event.statusNotice && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Important Schedule Update:</strong>
                {event.statusNotice}
              </div>
            </div>
          )}

          {/* Date, Time & Venue */}
          <div className="bg-parchment-100 p-4 rounded-2xl border border-parchment-200 space-y-2.5 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-terracotta-festival shrink-0" />
              <span>
                <strong>Date & Time:</strong> {event.date}, {event.startTime} – {event.endTime}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-teal-festival shrink-0 mt-0.5" />
              <div>
                <strong>Venue:</strong> {venue ? venue.name : event.venueName}
                {venue && (
                  <p className="text-xs text-ink-muted mt-0.5">{venue.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div>
            <h3 className="font-serif font-bold text-base text-teal-festival mb-1.5">
              About this session
            </h3>
            <p className="text-sm leading-relaxed text-ink-festival">
              {event.description}
            </p>
          </div>

          {/* Artists / Performers */}
          {event.artists && event.artists.length > 0 && (
            <div>
              <h3 className="font-serif font-bold text-base text-teal-festival mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-mustard-festival" />
                <span>Featured Artists & Facilitators</span>
              </h3>
              <div className="space-y-2.5">
                {event.artists.map((artist) => (
                  <div
                    key={artist.id}
                    className="p-3 rounded-xl bg-parchment-100 border border-parchment-200"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-sm text-teal-festival">
                        {artist.name}
                      </span>
                      <span className="text-[11px] font-medium text-ink-muted bg-parchment-200 px-2 py-0.5 rounded-full">
                        {artist.discipline}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">
                      {artist.bio}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accessibility & Language */}
          <div className="p-3.5 rounded-xl bg-parchment-100 border border-parchment-200 space-y-1.5 text-xs text-ink-muted">
            <div>
              <strong className="text-ink-festival">Language:</strong>{" "}
              {event.language === "bilingual"
                ? "Afrikaans & English"
                : event.language === "multilingual"
                ? "Multilingual (Kaaps, Afrikaans, English, Xhosa)"
                : event.language}
            </div>
            <div>
              <strong className="text-ink-festival">Accessibility:</strong>{" "}
              {event.accessibilityInfo}
            </div>
          </div>
        </div>

        {/* Modal Sticky Actions Footer */}
        <div className="p-4 border-t border-parchment-200 bg-parchment-50 flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            {/* Quicket Link (Complements Quicket, does not recreate ticket sale) */}
            <a
              href={quicketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 rounded-xl bg-teal-festival hover:bg-teal-light text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Ticket className="w-4 h-4" />
              <span>{event.isTicketed ? "Book on Quicket" : "Official Quicket Info"}</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>

            {/* Save to My Festival Toggle */}
            <button
              onClick={() => onToggleSave(event.id)}
              className={`py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 border transition-colors ${
                isSaved
                  ? "bg-terracotta-festival text-white border-terracotta-festival shadow-sm"
                  : "bg-parchment-100 hover:bg-parchment-200 text-teal-festival border-parchment-300"
              }`}
            >
              <Heart
                className={`w-4 h-4 ${isSaved ? "fill-white stroke-white" : "stroke-current"}`}
              />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {/* Directions Link */}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 rounded-lg bg-parchment-100 hover:bg-parchment-200 text-ink-festival font-medium flex items-center justify-center gap-1.5 border border-parchment-300 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-teal-festival" />
              <span>Get Directions</span>
            </a>

            {/* QR Check In Button */}
            <Link
              href={checkInUrl}
              onClick={onClose}
              className="flex-1 py-2 px-3 rounded-lg bg-parchment-100 hover:bg-parchment-200 text-ink-festival font-medium flex items-center justify-center gap-1.5 border border-parchment-300 transition-colors"
            >
              <QrCode className="w-3.5 h-3.5 text-terracotta-festival" />
              <span>Venue Check-In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
