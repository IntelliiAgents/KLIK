"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { FestivalStripe } from "@/components/Brand/FestivalStripe";
import { PosterGallery } from "@/components/Brand/PosterGallery";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import { TicketsModal } from "@/components/UI/TicketsModal";
import { BackToTopButton } from "@/components/UI/BackToTopButton";
import { repository } from "@/lib/db/repository";
import {
  saveEvent,
  removeSavedEvent,
  getSavedEvents,
  getCheckIns,
} from "@/lib/db/idb";
import { FestivalEvent, VenueLocation } from "@/lib/types";
import { trackEvent } from "@/lib/analytics";
import {
  SEED_PARTNERS,
  ABOUT_KLIK_2026,
  YOUTH_PROGRAMME_INFO,
} from "@/lib/data/seed";
import {
  Calendar,
  MapPin,
  Heart,
  Navigation,
  Car,
  Ticket,
  ChevronRight,
  Clock,
  Compass,
  Sparkles,
  Users,
  ArrowRight,
} from "lucide-react";

const formatShortDay = (isoDate: string): string => {
  if (isoDate === "2026-11-27") return "Fri 27 Nov";
  if (isoDate === "2026-11-28") return "Sat 28 Nov";
  if (isoDate === "2026-11-29") return "Sun 29 Nov";
  return isoDate;
};

export default function HomePage() {
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [checkInCount, setCheckInCount] = useState<number>(0);
  const [selectedEvent, setSelectedEvent] = useState<FestivalEvent | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<VenueLocation | null>(null);
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);

  useEffect(() => {
    trackEvent("app_open", { screen: "home" });
    trackEvent("home_view");

    const loadData = async () => {
      try {
        const [allEvents, allVenues, savedList, checkIns] = await Promise.all([
          repository.getEvents(),
          repository.getVenues(),
          getSavedEvents(),
          getCheckIns(),
        ]);
        setEvents(allEvents);
        setVenues(allVenues);
        setSavedEventIds(savedList.map((s) => s.eventId));
        setCheckInCount(checkIns.length);
      } catch (err) {
        console.error("Home load error:", err);
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

  // Determine live & upcoming sessions (respecting manual admin status AND festival clock)
  const { happeningNowEvents, comingUpEvents, isPreFestival } = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const todayIso = `${year}-${month}-${day}`;
    const currentHm = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const beforeFestival = todayIso < "2026-11-27";

    const live = sortedEvents.filter((e) => {
      if (e.scheduleStatus === "cancelled") return false;
      if (e.scheduleStatus === "happening_now") return true;
      if (e.date === todayIso && e.startTime <= currentHm && currentHm < e.endTime) {
        return true;
      }
      return false;
    });

    const activeIds = new Set(live.map((e) => e.id));
    const upcomingPool = sortedEvents.filter((e) => {
      if (activeIds.has(e.id) || e.scheduleStatus === "cancelled") return false;
      if (todayIso > "2026-11-29") return e.isFeatured;
      if (e.date < todayIso) return false;
      if (e.date === todayIso && e.endTime <= currentHm) return false;
      return true;
    });

    return {
      happeningNowEvents: live.slice(0, 3),
      comingUpEvents: (upcomingPool.length > 0 ? upcomingPool : sortedEvents).slice(
        0,
        3
      ),
      isPreFestival: beforeFestival,
    };
  }, [sortedEvents]);

  return (
    <div className="space-y-8 pb-8 animate-in fade-in duration-300">
      {/* 1. HERO + ABOUT KLiK 2026 (First on Home Page per Committee Brief) */}
      <section className="pt-2 space-y-5">
        {/* Official KliK Identity */}
        <div className="text-center space-y-3">
          <div className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-[380px] mx-auto">
            <Image
              src="/assets/klik-logo-hero.png"
              alt="KliK — Kleinmond inniebos Kunstefees"
              width={1192}
              height={724}
              priority
              quality={95}
              className="w-full h-auto object-contain mx-auto drop-shadow-xs"
            />
          </div>

          <div className="space-y-1">
            <p className="font-serif font-bold text-sm sm:text-base tracking-wide text-terracotta-festival">
              27–29 November 2026 • Kleinmond, Western Cape
            </p>
            <p className="text-[11px] sm:text-xs font-medium uppercase tracking-[0.16em] text-ink-muted">
              Stories • Poetry • Music • Art • Community
            </p>
          </div>
        </div>

        {/* Editorial About KliK 2026 Essay */}
        <article className="editorial-surface rounded-3xl overflow-hidden">
          <FestivalStripe height="h-1" />
          <div className="p-5 sm:p-7 space-y-3.5">
            <div className="space-y-1">
              <span className="editorial-kicker">Welcome to Overstrand</span>
              <h1 className="font-serif font-bold text-xl sm:text-2xl text-teal-festival leading-snug">
                {ABOUT_KLIK_2026.heading}
              </h1>
            </div>

            <div className="space-y-3 text-[13.5px] sm:text-[15px] leading-[1.68] text-ink-festival/90">
              {ABOUT_KLIK_2026.paragraphs.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
          </div>
        </article>
      </section>

      {/* 2. HAPPENING NOW (Immediately after About KliK 2026 per Committee Brief) */}
      <section aria-labelledby="happening-now-heading" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                happeningNowEvents.length > 0
                  ? "bg-terracotta-festival animate-pulse"
                  : "bg-olive-festival/60"
              }`}
              aria-hidden="true"
            />
            <h2
              id="happening-now-heading"
              className="font-serif font-bold text-base sm:text-lg text-teal-festival"
            >
              Happening Now
            </h2>
          </div>

          <Link
            href="/programme"
            className="text-xs font-semibold text-terracotta-festival hover:underline inline-flex items-center gap-0.5"
          >
            <span>Full schedule</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {happeningNowEvents.length > 0 ? (
          <div className="space-y-3">
            {happeningNowEvents.map((evt) => {
              const isSaved = savedEventIds.includes(evt.id);
              const venue = venues.find((v) => v.id === evt.venueId);
              const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${
                venue?.latitude || -34.3415
              },${venue?.longitude || 19.0278}`;

              return (
                <div
                  key={evt.id}
                  onClick={() => handleOpenDetails(evt)}
                  className="editorial-surface rounded-2xl border-terracotta-festival/40 p-4 sm:p-5 hover:shadow-card transition-all cursor-pointer space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs flex-wrap tabular-time">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-terracotta-festival text-white uppercase tracking-wider">
                          Live Now
                        </span>
                        <span className="font-semibold text-teal-festival inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-terracotta-festival shrink-0" />
                          <span>
                            {evt.startTime} – {evt.endTime}
                          </span>
                        </span>
                        {!evt.isTicketed ? (
                          <span className="badge-free-zone">Free Zone</span>
                        ) : (
                          <span className="badge-ticket">
                            {evt.ticketPrice || "R100"}
                          </span>
                        )}
                      </div>

                      <h3 className="font-serif font-bold text-base sm:text-lg text-teal-festival leading-snug">
                        {evt.title}
                      </h3>

                      {evt.venueName && (
                        <p className="text-xs text-ink-muted flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-teal-festival/65 shrink-0" />
                          <span className="truncate">{evt.venueName}</span>
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSave(evt.id);
                      }}
                      className="min-w-[44px] min-h-[44px] -mr-1.5 -mt-1 p-2.5 rounded-full flex items-center justify-center text-ink-light hover:text-terracotta-festival"
                      aria-label={isSaved ? "Remove from saved" : "Save event"}
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isSaved
                            ? "fill-terracotta-festival stroke-terracotta-festival"
                            : "stroke-current"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-parchment-200">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDetails(evt);
                      }}
                      className="min-h-[42px] py-2 px-3 rounded-xl bg-teal-festival hover:bg-teal-light text-white text-xs font-semibold flex items-center justify-center transition-colors"
                    >
                      Session Details
                    </button>

                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        e.stopPropagation();
                        trackEvent("directions_click", { eventId: evt.id });
                      }}
                      className="min-h-[42px] py-2 px-3 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-semibold flex items-center justify-center gap-1.5 border border-parchment-300 transition-colors"
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
          <div className="editorial-surface rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs sm:text-sm font-semibold text-teal-festival">
                {isPreFestival
                  ? "No live sessions right now — KliK 2026 opens Friday, 27 November at 16:00."
                  : "No sessions are running at this exact moment."}
              </p>
              <p className="text-xs text-ink-muted">
                Browse the daily programme and save your favourite talks, music, and walks ahead of time.
              </p>
            </div>

            <Link
              href="/programme"
              className="shrink-0 min-h-[40px] px-4 py-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-teal-festival text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5 text-terracotta-festival" />
              <span>Browse Programme</span>
            </Link>
          </div>
        )}
      </section>

      {/* 3. CHILDREN & YOUTH AT KLiK — PROMINENT FEATURE SHORTCUT */}
      <section aria-labelledby="youth-shortcut-heading">
        <div className="rounded-3xl bg-teal-festival text-parchment-50 p-5 sm:p-6 shadow-card border border-teal-light/40 relative overflow-hidden">
          <div
            className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-olive-light via-mustard-festival to-terracotta-festival"
            aria-hidden="true"
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-mustard-light">
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Youth Showcase</span>
              </span>

              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-olive-festival text-white">
                Free Zone
              </span>
            </div>

            <div className="space-y-1.5">
              <h2
                id="youth-shortcut-heading"
                className="font-serif font-bold text-xl sm:text-2xl text-white leading-tight"
              >
                {YOUTH_PROGRAMME_INFO.homeHeading}
              </h2>
              <p className="text-xs sm:text-sm text-parchment-100/90 leading-relaxed max-w-xl">
                {YOUTH_PROGRAMME_INFO.homeCopy}
              </p>
            </div>

            {/* Clear Date, Time & Venue Badges */}
            <div className="flex items-center gap-x-4 gap-y-1.5 flex-wrap text-xs text-parchment-100/95 pt-0.5 tabular-time">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Calendar className="w-3.5 h-3.5 text-mustard-light shrink-0" />
                <span>{YOUTH_PROGRAMME_INFO.dateShort}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Clock className="w-3.5 h-3.5 text-mustard-light shrink-0" />
                <span>{YOUTH_PROGRAMME_INFO.timeRange}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-mustard-light shrink-0" />
                <span>{YOUTH_PROGRAMME_INFO.venueName}</span>
              </span>
            </div>

            <div className="pt-1">
              <Link
                href="/youth"
                onClick={() => trackEvent("youth_programme_view", { source: "home_shortcut" })}
                className="inline-flex min-h-[46px] w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-terracotta-festival hover:bg-terracotta-light text-white font-semibold text-xs sm:text-sm shadow-subtle active:scale-[0.99] transition-all"
              >
                <span>Explore Activities</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ESSENTIAL NAVIGATION & TICKETS */}
      <section aria-label="Quick Festival Navigation" className="space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Festival Programme */}
          <Link
            href="/programme"
            onClick={() => trackEvent("programme_view")}
            className="min-h-[76px] p-4 rounded-2xl editorial-surface hover:border-teal-festival/40 hover:shadow-card flex flex-col justify-between transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <Calendar className="w-4 h-4 text-terracotta-festival" />
              <ChevronRight className="w-4 h-4 text-ink-light group-hover:translate-x-0.5 group-hover:text-teal-festival transition-all" />
            </div>
            <div className="pt-2">
              <span className="font-serif font-bold text-sm sm:text-[15px] text-teal-festival block leading-tight">
                Programme
              </span>
              <span className="text-[11px] text-ink-muted">Fri – Sun schedule</span>
            </div>
          </Link>

          {/* Interactive Map */}
          <Link
            href="/map"
            onClick={() => trackEvent("map_view")}
            className="min-h-[76px] p-4 rounded-2xl editorial-surface hover:border-teal-festival/40 hover:shadow-card flex flex-col justify-between transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <MapPin className="w-4 h-4 text-teal-accent" />
              <ChevronRight className="w-4 h-4 text-ink-light group-hover:translate-x-0.5 group-hover:text-teal-festival transition-all" />
            </div>
            <div className="pt-2">
              <span className="font-serif font-bold text-sm sm:text-[15px] text-teal-festival block leading-tight">
                Festival Map
              </span>
              <span className="text-[11px] text-ink-muted">8 Kleinmond venues</span>
            </div>
          </Link>

          {/* Artists & Biographies */}
          <Link
            href="/artists"
            onClick={() => trackEvent("artists_view")}
            className="min-h-[76px] p-4 rounded-2xl editorial-surface hover:border-teal-festival/40 hover:shadow-card flex flex-col justify-between transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <Users className="w-4 h-4 text-mustard-dark" />
              <ChevronRight className="w-4 h-4 text-ink-light group-hover:translate-x-0.5 group-hover:text-teal-festival transition-all" />
            </div>
            <div className="pt-2">
              <span className="font-serif font-bold text-sm sm:text-[15px] text-teal-festival block leading-tight">
                Artists &amp; Bios
              </span>
              <span className="text-[11px] text-ink-muted">Meet the presenters</span>
            </div>
          </Link>

          {/* Get a Ride Shuttle */}
          <Link
            href="/ride"
            className="min-h-[76px] p-4 rounded-2xl editorial-surface hover:border-teal-festival/40 hover:shadow-card flex flex-col justify-between transition-all group"
          >
            <div className="flex items-center justify-between w-full">
              <Car className="w-4 h-4 text-olive-festival" />
              <ChevronRight className="w-4 h-4 text-ink-light group-hover:translate-x-0.5 group-hover:text-teal-festival transition-all" />
            </div>
            <div className="pt-2">
              <span className="font-serif font-bold text-sm sm:text-[15px] text-teal-festival block leading-tight">
                Get a Ride
              </span>
              <span className="text-[11px] text-ink-muted">Festival shuttle</span>
            </div>
          </Link>
        </div>

        {/* Buy Festival Tickets Primary Action */}
        <button
          type="button"
          onClick={() => {
            trackEvent("ticket_click", { location: "home_buy_tickets_button" });
            setIsTicketsOpen(true);
          }}
          className="w-full min-h-[50px] py-3.5 px-5 rounded-2xl bg-terracotta-festival hover:bg-terracotta-dark text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-card active:scale-[0.99] transition-all"
        >
          <Ticket className="w-4 h-4" />
          <span>Festival Passes &amp; Quicket Tickets</span>
          <ChevronRight className="w-4 h-4 opacity-85" />
        </button>
      </section>

      {/* 5. OPENING HIGHLIGHTS / COMING UP NEXT */}
      <section aria-labelledby="upcoming-heading" className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <div>
            <span className="editorial-kicker block">
              {isPreFestival ? "Opening Weekend" : "Schedule"}
            </span>
            <h2
              id="upcoming-heading"
              className="font-serif font-bold text-lg sm:text-xl text-teal-festival"
            >
              {isPreFestival ? "Opening Highlights" : "Coming Up Next"}
            </h2>
          </div>

          <Link
            href="/programme"
            className="text-xs font-semibold text-terracotta-festival hover:underline inline-flex items-center gap-0.5 shrink-0"
          >
            <span>See all</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {comingUpEvents.map((evt) => {
            const isSaved = savedEventIds.includes(evt.id);
            const venue = venues.find((v) => v.id === evt.venueId);
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${
              venue?.latitude || -34.3415
            },${venue?.longitude || 19.0278}`;

            return (
              <article
                key={evt.id}
                onClick={() => handleOpenDetails(evt)}
                className="editorial-surface rounded-2xl p-4 sm:p-5 hover:shadow-card transition-all cursor-pointer space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-xs flex-wrap tabular-time">
                      <span className="font-semibold text-teal-festival inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-terracotta-festival/85 shrink-0" />
                        <span>{formatShortDay(evt.date)}</span>
                        <span className="text-parchment-400">•</span>
                        <span>
                          {evt.startTime} – {evt.endTime}
                        </span>
                      </span>

                      {!evt.isTicketed ? (
                        <span className="badge-free-zone">Free Zone</span>
                      ) : (
                        <span className="badge-ticket">
                          {evt.ticketPrice || "R100"}
                        </span>
                      )}
                    </div>

                    <h3 className="font-serif font-bold text-base sm:text-[17px] text-teal-festival leading-snug">
                      {evt.title}
                    </h3>

                    {evt.description && (
                      <p className="text-xs text-ink-muted line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>
                    )}

                    {evt.venueName && (
                      <p className="text-xs text-ink-muted flex items-center gap-1 pt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-festival/65 shrink-0" />
                        <span className="truncate">{evt.venueName}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSave(evt.id);
                    }}
                    className="min-w-[44px] min-h-[44px] -mr-1.5 -mt-1 p-2.5 rounded-full flex items-center justify-center text-ink-light hover:text-terracotta-festival"
                    aria-label={isSaved ? "Remove from saved" : "Save event"}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isSaved
                          ? "fill-terracotta-festival stroke-terracotta-festival"
                          : "stroke-current"
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-parchment-200/80">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDetails(evt);
                    }}
                    className="min-h-[40px] py-1.5 px-3 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-semibold flex items-center justify-center border border-parchment-300 transition-colors"
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
                    className="min-h-[40px] py-1.5 px-3 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-semibold flex items-center justify-center gap-1.5 border border-parchment-300 transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Directions</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 6. OFFICIAL PRINTABLE POSTERS */}
      <section aria-labelledby="posters-heading" className="space-y-3">
        <div className="space-y-0.5">
          <span className="editorial-kicker block">Print Editions</span>
          <h2
            id="posters-heading"
            className="font-serif font-bold text-lg sm:text-xl text-teal-festival"
          >
            Official Festival Posters
          </h2>
          <p className="text-xs text-ink-muted">
            Tap any poster to expand, zoom, download, or share. For the latest session updates, use the interactive Programme.
          </p>
        </div>

        <PosterGallery />
      </section>

      {/* 7. CULTURE TRAIL PROMOTION */}
      <section className="editorial-surface p-4 sm:p-5 rounded-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-olive-festival/15 text-olive-dark flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5 text-olive-festival" />
          </div>
          <div className="min-w-0">
            <h3 className="font-serif font-bold text-sm sm:text-base text-teal-festival leading-tight">
              The KliK Culture Trail
            </h3>
            <p className="text-xs text-ink-muted truncate">
              {checkInCount > 0
                ? `${checkInCount} of 5 venues visited`
                : "Scan QR checkpoints across Kleinmond venues"}
            </p>
          </div>
        </div>
        <Link
          href="/culture-trail"
          onClick={() => trackEvent("culture_trail_open")}
          className="min-h-[40px] px-3.5 py-2 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-semibold shrink-0 border border-parchment-300 inline-flex items-center transition-colors"
        >
          View Trail
        </Link>
      </section>

      {/* 8. FESTIVAL PARTNERS & SUPPORTERS */}
      <section className="space-y-4 pt-5 border-t border-parchment-300/80">
        <div className="text-center space-y-1">
          <span className="editorial-kicker block">Community Collaboration</span>
          <h2 className="font-serif font-bold text-lg sm:text-xl text-teal-festival">
            Festival Partners &amp; Supporters
          </h2>
          <p className="text-xs text-ink-muted max-w-md mx-auto">
            Brought to life through the shared vision of cultural organisations, venues, and partners across Kleinmond and the Overstrand.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SEED_PARTNERS.map((partner) => (
            <div
              key={partner.name}
              className="bg-white rounded-2xl p-3.5 border border-parchment-200 shadow-subtle flex flex-col items-center justify-between text-center gap-2.5 transition-all hover:shadow-card hover:border-parchment-300"
            >
              {partner.logoUrl ? (
                <div
                  className="w-full h-20 relative flex items-center justify-center p-1 bg-white rounded-xl overflow-hidden"
                  style={{ position: "relative", height: "80px", overflow: "hidden" }}
                >
                  <Image
                    src={partner.logoUrl}
                    alt={`${partner.name} Logo`}
                    fill
                    sizes="(max-width: 640px) 50vw, 33vw"
                    className="object-contain p-1"
                    style={{ objectFit: "contain" }}
                  />
                </div>
              ) : (
                <div className="w-full min-h-[72px] rounded-xl bg-parchment-100 flex items-center justify-center p-2 text-center border border-parchment-200">
                  <span className="font-serif font-bold text-xs text-teal-festival leading-snug">
                    {partner.name}
                  </span>
                </div>
              )}

              <div className="min-w-0 w-full pt-1.5 border-t border-parchment-200/60 flex flex-col justify-center">
                <strong className="block font-serif font-bold text-xs text-teal-festival leading-tight line-clamp-2 min-h-[2rem] flex items-center justify-center">
                  {partner.name}
                </strong>
                <span className="text-[10px] text-ink-muted block mt-0.5 leading-tight line-clamp-2 min-h-[1.5rem] flex items-center justify-center">
                  {partner.role}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-ink-muted pt-3 pb-1">
          Official KliK 2026 Festival Companion • Programme subject to change.
        </p>
      </section>

      <BackToTopButton />

      <EventDetailsModal
        event={selectedEvent}
        venue={selectedVenue}
        isSaved={selectedEvent ? savedEventIds.includes(selectedEvent.id) : false}
        onClose={() => setSelectedEvent(null)}
        onToggleSave={handleToggleSave}
        allEvents={events}
        onSelectEvent={(evt) => handleOpenDetails(evt)}
      />

      <TicketsModal
        isOpen={isTicketsOpen}
        onClose={() => setIsTicketsOpen(false)}
      />
    </div>
  );
}
