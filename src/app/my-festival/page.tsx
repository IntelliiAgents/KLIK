"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { repository } from "@/lib/db/repository";
import { getSavedEvents, removeSavedEvent } from "@/lib/db/idb";
import { FestivalEvent, SavedEvent, VenueLocation } from "@/lib/types";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import { trackEvent } from "@/lib/analytics";
import {
  Heart,
  Clock,
  MapPin,
  Navigation,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Download,
} from "lucide-react";

export default function MyFestivalPage() {
  const [allEvents, setAllEvents] = useState<FestivalEvent[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<FestivalEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent("app_open", { screen: "my_festival" });

    const init = async () => {
      try {
        const [evts, vns, saved] = await Promise.all([
          repository.getEvents(),
          repository.getVenues(),
          getSavedEvents(),
        ]);
        setAllEvents(evts);
        setVenues(vns);
        setSavedEvents(saved);
      } catch (e) {
        console.error("My Festival load error:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleRemove = async (eventId: string, title?: string) => {
    trackEvent("event_unsave", { eventId, title });
    await removeSavedEvent(eventId);
    setSavedEvents((prev) => prev.filter((s) => s.eventId !== eventId));
  };

  // Matched saved events, sorted chronologically
  const savedFestivalEvents = useMemo(() => {
    const savedIds = new Set(savedEvents.map((s) => s.eventId));
    const list = allEvents.filter((e) => savedIds.has(e.id));
    return list.sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [allEvents, savedEvents]);

  // Conflict detection
  const conflictingEventIds = useMemo(() => {
    const conflicts = new Set<string>();
    for (let i = 0; i < savedFestivalEvents.length; i++) {
      for (let j = i + 1; j < savedFestivalEvents.length; j++) {
        const a = savedFestivalEvents[i];
        const b = savedFestivalEvents[j];

        if (a.date === b.date) {
          const aStart = a.startTime;
          const aEnd = a.endTime;
          const bStart = b.startTime;
          const bEnd = b.endTime;

          const isOverlapping = aStart < bEnd && bStart < aEnd;
          if (isOverlapping) {
            conflicts.add(a.id);
            conflicts.add(b.id);
          }
        }
      }
    }
    return conflicts;
  }, [savedFestivalEvents]);

  // Group saved events by Friday, Saturday, Sunday
  const groupedByDay = useMemo(() => {
    const daysMap = new Map<string, { label: string; events: FestivalEvent[] }>();
    daysMap.set("2026-11-27", { label: "FRIDAY", events: [] });
    daysMap.set("2026-11-28", { label: "SATURDAY", events: [] });
    daysMap.set("2026-11-29", { label: "SUNDAY", events: [] });

    for (const evt of savedFestivalEvents) {
      if (daysMap.has(evt.date)) {
        daysMap.get(evt.date)!.events.push(evt);
      } else {
        daysMap.set(evt.date, { label: evt.date, events: [evt] });
      }
    }

    return Array.from(daysMap.values()).filter((g) => g.events.length > 0);
  }, [savedFestivalEvents]);

  // Helper to export an event as an .ics calendar file
  const handleAddToCalendar = (event: FestivalEvent) => {
    trackEvent("event_save", { action: "add_to_calendar", eventId: event.id });
    const cleanDate = event.date.replace(/-/g, "");
    const startTimeClean = event.startTime.replace(":", "") + "00";
    const endTimeClean = event.endTime.replace(":", "") + "00";

    const icsData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//KliK 2026//Festival Schedule//EN",
      "BEGIN:VEVENT",
      `SUMMARY:KliK 2026: ${event.title}`,
      `DESCRIPTION:${event.description || "Kleinmond Inniebos Kunstefees 2026"}`,
      `LOCATION:${event.venueName || "Kleinmond"}, Western Cape`,
      `DTSTART:${cleanDate}T${startTimeClean}`,
      `DTEND:${cleanDate}T${endTimeClean}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsData], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `klik-${event.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedVenueForModal = selectedEvent
    ? venues.find((v) => v.id === selectedEvent.venueId) || null
    : null;

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-teal-festival">
          My Festival
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
          Your saved events.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-ink-muted">Loading your saved events...</p>
        </div>
      ) : savedFestivalEvents.length === 0 ? (
        /* Empty State */
        <div className="bg-parchment-50 rounded-3xl p-8 border border-parchment-300 text-center space-y-4 shadow-subtle">
          <div className="w-14 h-14 rounded-2xl bg-parchment-200 text-terracotta-festival mx-auto flex items-center justify-center">
            <Heart className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif font-bold text-lg text-teal-festival">
              No saved events yet.
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted max-w-xs mx-auto">
              Tap the heart beside an event to add it to your festival.
            </p>
          </div>

          <Link
            href="/programme"
            className="inline-flex min-h-[48px] items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-teal-festival hover:bg-teal-light text-white font-bold text-sm shadow-card active:scale-[0.98] transition-all"
          >
            <span>Browse Programme</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        /* Saved Events Grouped by FRIDAY / SATURDAY / SUNDAY */
        <div className="space-y-6">
          {groupedByDay.map((group) => (
            <section key={group.label} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-parchment-300 pb-1.5">
                <h2 className="font-serif font-black text-base text-teal-festival tracking-wider">
                  {group.label}
                </h2>
                <span className="text-xs text-ink-muted">
                  ({group.events.length})
                </span>
              </div>

              <div className="space-y-2.5">
                {group.events.map((evt) => {
                  const hasConflict = conflictingEventIds.has(evt.id);
                  const venue = venues.find((v) => v.id === evt.venueId);
                  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue?.latitude || -34.3415},${venue?.longitude || 19.0278}`;

                  return (
                    <article
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className="bg-parchment-50 rounded-2xl border border-parchment-300 p-4 shadow-subtle hover:shadow-card transition-all cursor-pointer space-y-3"
                    >
                      {/* Conflict Warning */}
                      {hasConflict && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>These events overlap.</span>
                        </div>
                      )}

                      {/* Time, Event, Venue */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-festival">
                          <Clock className="w-3.5 h-3.5 text-teal-festival/70 shrink-0" />
                          <span>{evt.startTime} – {evt.endTime}</span>
                        </div>

                        <h3 className="font-serif font-bold text-base sm:text-lg text-teal-festival leading-snug">
                          {evt.title}
                        </h3>

                        {evt.venueName && (
                          <p className="text-xs text-ink-muted flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-teal-festival/60 shrink-0" />
                            <span>{evt.venueName}</span>
                          </p>
                        )}
                      </div>

                      {/* Buttons: Directions & Remove */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-parchment-200">
                        <a
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => {
                            e.stopPropagation();
                            trackEvent("directions_click", { eventId: evt.id });
                          }}
                          className="min-h-[44px] py-2 px-3 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-bold flex items-center justify-center gap-1.5 border border-parchment-300 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-teal-festival" />
                          <span>Directions</span>
                        </a>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(evt.id, evt.title);
                          }}
                          className="min-h-[44px] py-2 px-3 rounded-xl bg-parchment-100 hover:bg-red-50 text-red-700 text-xs font-semibold flex items-center justify-center gap-1.5 border border-parchment-300 hover:border-red-200 transition-colors"
                          aria-label={`Remove ${evt.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>

                      {/* Optional: Add to Calendar */}
                      <div className="text-right pt-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCalendar(evt);
                          }}
                          className="text-[11px] font-medium text-ink-muted hover:text-teal-festival inline-flex items-center gap-1 hover:underline"
                        >
                          <Download className="w-3 h-3" />
                          <span>Add to Calendar</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        venue={selectedVenueForModal}
        isSaved={selectedEvent ? true : false}
        onClose={() => setSelectedEvent(null)}
        onToggleSave={(id) => handleRemove(id)}
      />
    </div>
  );
}
