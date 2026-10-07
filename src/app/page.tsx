"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { FestivalStripe } from "@/components/Brand/FestivalStripe";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import { TicketsModal } from "@/components/UI/TicketsModal";
import { repository } from "@/lib/db/repository";
import { isEventSaved, saveEvent, removeSavedEvent, getSavedEvents, getCheckIns } from "@/lib/db/idb";
import { FestivalEvent, VenueLocation, FestivalNotice } from "@/lib/types";
import { FESTIVAL_CONFIG } from "@/lib/config";
import { trackEvent } from "@/lib/analytics";
import { SEED_PARTNERS } from "@/lib/data/seed";
import {
  Calendar,
  MapPin,
  Heart,
  Navigation,
  Car,
  Ticket,
  ExternalLink,
  ChevronRight,
  Clock,
  Compass,
} from "lucide-react";

export default function HomePage() {
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [notices, setNotices] = useState<FestivalNotice[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [checkInCount, setCheckInCount] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<FestivalEvent | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<VenueLocation | null>(null);
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent("app_open", { screen: "home" });
    trackEvent("home_view");

    const loadData = async () => {
      try {
        const [allEvents, allVenues, allNotices, savedList, checkIns] = await Promise.all([
          repository.getEvents(),
          repository.getVenues(),
          repository.getNotices(),
          getSavedEvents(),
          getCheckIns(),
        ]);
        setEvents(allEvents);
        setVenues(allVenues);
        setNotices(allNotices);
        setSavedEventIds(savedList.map((s) => s.eventId));
        setCheckInCount(checkIns.length);
      } catch (err) {
        console.error("Home load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggleSave = async (eventId: string) => {
    const isCurrentlySaved = savedEventIds.includes(eventId);
    if (isCurrentlySaved) {
      trackEvent("event_unsave", { eventId });
      await removeSavedEvent(eventId);
      setSavedEventIds((prev) => prev.filter((id) => id !== eventId));
    } else {
      trackEvent("event_save", { eventId });
      await saveEvent(eventId);
      setSavedEventIds((prev) => [...prev, eventId]);
    }
  };

  const handleOpenDetails = (event: FestivalEvent) => {
    const venue = venues.find((v) => v.id === event.venueId) || null;
    setSelectedVenue(venue);
    setSelectedEvent(event);
  };

  // Sort events chronologically
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [events]);

  // Happening Now events (up to 2)
  const happeningNowEvents = useMemo(() => {
    return sortedEvents.filter((e) => e.scheduleStatus === "happening_now").slice(0, 2);
  }, [sortedEvents]);

  // Coming Up Next events (next 2-3 chronologically)
  const comingUpEvents = useMemo(() => {
    const activeIds = new Set(happeningNowEvents.map((e) => e.id));
    return sortedEvents
      .filter((e) => !activeIds.has(e.id) && e.scheduleStatus !== "cancelled")
      .slice(0, 3);
  }, [sortedEvents, happeningNowEvents]);

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* 2. Small Festival Identity Section */}
      <section className="bg-parchment-50 rounded-3xl p-5 border border-parchment-300/80 shadow-subtle text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0">
            <Image
              src="/assets/klik-round-logo-128.png"
              alt="KLiK 2026 Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div className="text-left">
            <span className="font-serif font-black text-xl sm:text-2xl text-teal-festival leading-tight block">
              KLiK
            </span>
            <span className="text-xs sm:text-sm font-bold text-ink-festival block">
              Kleinmond Inniebos Kunstefees
            </span>
          </div>
        </div>

        <p className="text-xs font-semibold text-terracotta-festival">
          27–29 November 2026 • Kleinmond
        </p>

        <div className="max-w-[140px] mx-auto mt-2.5">
          <FestivalStripe height="h-0.5" />
        </div>
      </section>

      {/* 3. WHAT IS HAPPENING NOW */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-sm sm:text-base text-teal-festival tracking-tight flex items-center gap-2">
            {happeningNowEvents.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-terracotta-festival animate-pulse" />
            )}
            <span>HAPPENING NOW</span>
          </h2>
        </div>

        {happeningNowEvents.length > 0 ? (
          <div className="space-y-2.5">
            {happeningNowEvents.map((evt) => {
              const isSaved = savedEventIds.includes(evt.id);
              const venue = venues.find((v) => v.id === evt.venueId);
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue?.latitude || -34.3415},${venue?.longitude || 19.0278}`;

              return (
                <div
                  key={evt.id}
                  onClick={() => handleOpenDetails(evt)}
                  className="bg-parchment-50 rounded-2xl border border-terracotta-festival/40 p-4 shadow-subtle hover:shadow-card transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-teal-festival flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-teal-festival/70" />
                          <span>{evt.startTime} – {evt.endTime}</span>
                        </span>
                        {!evt.isTicketed ? (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-olive-festival text-white">
                            FREE
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-terracotta-festival">
                            {evt.ticketPrice || "R100"}
                          </span>
                        )}
                        <span className="px-1.5 py-0.2 rounded font-black text-[10px] bg-terracotta-festival text-white uppercase">
                          NOW
                        </span>
                      </div>

                      <h3 className="font-serif font-bold text-base sm:text-lg text-teal-festival leading-snug">
                        {evt.title}
                      </h3>

                      {evt.venueName && (
                        <p className="text-xs text-ink-muted flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-festival/60 shrink-0" />
                          <span className="truncate">{evt.venueName}</span>
                        </p>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSave(evt.id);
                      }}
                      className="min-w-[44px] min-h-[44px] -mr-1.5 -mt-1 p-2.5 rounded-full flex items-center justify-center text-ink-muted/50 hover:text-terracotta-festival"
                      aria-label={isSaved ? "Remove from saved" : "Save event"}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isSaved ? "fill-terracotta-festival stroke-terracotta-festival" : "stroke-current"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Actions: Details & Directions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-parchment-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(evt);
                      }}
                      className="min-h-[42px] py-2 px-3 rounded-xl bg-teal-festival hover:bg-teal-light text-white text-xs font-bold flex items-center justify-center transition-colors"
                    >
                      Details
                    </button>

                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        trackEvent("directions_click", { eventId: evt.id });
                      }}
                      className="min-h-[42px] py-2 px-3 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-bold flex items-center justify-center gap-1.5 border border-parchment-300 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Directions</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-parchment-50 rounded-2xl p-3.5 border border-parchment-200/80 text-center">
            <p className="text-xs font-medium text-ink-muted">
              Nothing is happening right now.
            </p>
          </div>
        )}
      </section>

      {/* 4. COMING UP NEXT */}
      <section className="space-y-3">
        <h2 className="font-serif font-bold text-sm sm:text-base text-teal-festival tracking-tight">
          COMING UP NEXT
        </h2>

        <div className="space-y-2.5">
          {comingUpEvents.map((evt) => {
            const isSaved = savedEventIds.includes(evt.id);
            const venue = venues.find((v) => v.id === evt.venueId);
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue?.latitude || -34.3415},${venue?.longitude || 19.0278}`;

            return (
              <div
                key={evt.id}
                onClick={() => handleOpenDetails(evt)}
                className="bg-parchment-50 rounded-2xl border border-parchment-300/80 p-4 shadow-subtle hover:shadow-card transition-all cursor-pointer space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-teal-festival flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-teal-festival/70" />
                        <span>{evt.startTime} – {evt.endTime}</span>
                        <span className="text-parchment-400">•</span>
                        <span>{evt.date}</span>
                      </span>

                      {!evt.isTicketed ? (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-black bg-olive-festival text-white">
                          FREE
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-terracotta-festival">
                          {evt.ticketPrice || "R100"}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-base text-teal-festival leading-snug">
                      {evt.title}
                    </h3>

                    {evt.venueName && (
                      <p className="text-xs text-ink-muted flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-teal-festival/60 shrink-0" />
                        <span className="truncate">{evt.venueName}</span>
                      </p>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSave(evt.id);
                    }}
                    className="min-w-[44px] min-h-[44px] -mr-1.5 -mt-1 p-2.5 rounded-full flex items-center justify-center text-ink-muted/50 hover:text-terracotta-festival"
                    aria-label={isSaved ? "Remove from saved" : "Save event"}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isSaved ? "fill-terracotta-festival stroke-terracotta-festival" : "stroke-current"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-parchment-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetails(evt);
                    }}
                    className="min-h-[40px] py-1.5 px-3 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-bold flex items-center justify-center border border-parchment-300"
                  >
                    Details
                  </button>

                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      trackEvent("directions_click", { eventId: evt.id });
                    }}
                    className="min-h-[40px] py-1.5 px-3 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-bold flex items-center justify-center gap-1.5 border border-parchment-300"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Directions</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. PRIMARY ACTION GRID (Four Highly Obvious Buttons) */}
      <section className="grid grid-cols-2 gap-3 pt-1">
        {/* Programme */}
        <Link
          href="/programme"
          onClick={() => trackEvent("programme_view")}
          className="min-h-[72px] p-4 rounded-2xl bg-teal-festival hover:bg-teal-light text-white font-bold flex flex-col justify-center items-start shadow-card active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Calendar className="w-5 h-5 text-mustard-light" />
            <ChevronRight className="w-4 h-4 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-sm sm:text-base leading-tight font-serif">Programme</span>
        </Link>

        {/* Festival Map */}
        <Link
          href="/map"
          onClick={() => trackEvent("map_view")}
          className="min-h-[72px] p-4 rounded-2xl bg-parchment-50 hover:bg-parchment-100 text-teal-festival border border-parchment-300 font-bold flex flex-col justify-center items-start shadow-subtle active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <MapPin className="w-5 h-5 text-terracotta-festival" />
            <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-sm sm:text-base leading-tight font-serif">Festival Map</span>
        </Link>

        {/* My Festival */}
        <Link
          href="/my-festival"
          className="min-h-[72px] p-4 rounded-2xl bg-parchment-50 hover:bg-parchment-100 text-teal-festival border border-parchment-300 font-bold flex flex-col justify-center items-start shadow-subtle active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Heart className="w-5 h-5 text-terracotta-festival" />
            <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base leading-tight font-serif">My Festival</span>
            {savedEventIds.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-terracotta-festival text-white text-[10px]">
                {savedEventIds.length}
              </span>
            )}
          </div>
        </Link>

        {/* Get a Ride */}
        <Link
          href="/ride"
          className="min-h-[72px] p-4 rounded-2xl bg-parchment-50 hover:bg-parchment-100 text-teal-festival border border-parchment-300 font-bold flex flex-col justify-center items-start shadow-subtle active:scale-[0.98] transition-all group"
        >
          <div className="flex items-center justify-between w-full mb-1">
            <Car className="w-5 h-5 text-olive-festival" />
            <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <span className="text-sm sm:text-base leading-tight font-serif">Get a Ride</span>
        </Link>
      </section>

      {/* 6. TICKETS (One Clear Button: Buy Festival Tickets) */}
      <section>
        <button
          onClick={() => {
            trackEvent("ticket_click", { location: "home_buy_tickets_button" });
            setIsTicketsOpen(true);
          }}
          className="w-full min-h-[50px] py-3.5 px-5 rounded-2xl bg-terracotta-festival hover:bg-terracotta-dark text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-card active:scale-[0.98] transition-all"
        >
          <Ticket className="w-5 h-5" />
          <span>Buy Festival Tickets</span>
          <ChevronRight className="w-4 h-4 opacity-80" />
        </button>
      </section>

      {/* 7. OPTIONAL CULTURE TRAIL PROMOTION (Restrained Banner) */}
      <section className="bg-parchment-50 p-4 rounded-2xl border border-parchment-300 flex items-center justify-between gap-3 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-olive-festival/15 text-olive-dark flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-olive-festival" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-teal-festival leading-tight">
              Explore the KLiK Culture Trail
            </h3>
            <p className="text-xs text-ink-muted">
              {checkInCount > 0
                ? `${checkInCount} of 5 locations visited`
                : "Check in at participating festival venues"}
            </p>
          </div>
        </div>
        <Link
          href="/culture-trail"
          onClick={() => trackEvent("culture_trail_open")}
          className="px-3.5 py-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-bold shrink-0 border border-parchment-300 transition-colors"
        >
          View Trail
        </Link>
      </section>

      {/* 8. Festival Information / Secondary Content */}
      <section className="p-4 rounded-2xl bg-parchment-100 border border-parchment-300 text-xs text-ink-festival space-y-1.5 leading-relaxed">
        <strong className="font-bold text-teal-festival block">
          About KLiK 2026
        </strong>
        <p className="text-ink-muted">
          A weekend of stories, poetry, acoustic music, visual art, and community across Kleinmond in the Overstrand Biosphere.
        </p>
        <p className="text-[11px] text-ink-light pt-1">
          Official KLiK 2026 Festival Programme • Programme subject to change.
        </p>
      </section>

      {/* 9. Partners Near the Bottom */}
      <footer className="pt-3 border-t border-parchment-300/80 text-center space-y-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-ink-muted block">
          Festival &amp; Media Partners
        </span>
        <div className="flex items-center justify-center flex-wrap gap-2 text-xs text-ink-muted">
          {SEED_PARTNERS.slice(0, 5).map((p) => (
            <span
              key={p.name}
              className="px-2.5 py-1 rounded-lg bg-parchment-50 border border-parchment-200 text-[11px]"
            >
              {p.name}
            </span>
          ))}
        </div>
      </footer>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        venue={selectedVenue}
        isSaved={selectedEvent ? savedEventIds.includes(selectedEvent.id) : false}
        onClose={() => setSelectedEvent(null)}
        onToggleSave={handleToggleSave}
      />

      {/* Tickets Modal */}
      <TicketsModal
        isOpen={isTicketsOpen}
        onClose={() => setIsTicketsOpen(false)}
      />
    </div>
  );
}
