"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { repository } from "@/lib/db/repository";
import { getSavedEvents, saveEvent, removeSavedEvent } from "@/lib/db/idb";
import { Artist, FestivalEvent, VenueLocation } from "@/lib/types";
import { YOUTH_PROGRAMME_INFO } from "@/lib/data/seed";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import { ArtistProfileModal } from "@/components/Artists/ArtistProfileModal";
import { BackToTopButton } from "@/components/UI/BackToTopButton";
import { FestivalStripe } from "@/components/Brand/FestivalStripe";
import { trackEvent } from "@/lib/analytics";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Navigation,
  Map as MapIcon,
  Heart,
  Users,
  Utensils,
  Sparkles,
  ChevronRight,
  Info,
} from "lucide-react";

export default function YouthProgrammePage() {
  const [allEvents, setAllEvents] = useState<FestivalEvent[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<FestivalEvent | null>(null);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent("app_open", { screen: "youth_programme" });
    trackEvent("youth_programme_view");

    const load = async () => {
      try {
        const [evts, vns, saved] = await Promise.all([
          repository.getEvents(),
          repository.getVenues(),
          getSavedEvents(),
        ]);
        setAllEvents(evts);
        setVenues(vns);
        setSavedEventIds(saved.map((s) => s.eventId));
      } catch (err) {
        console.error("Youth programme load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
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

  const youthVenue = useMemo(
    () => venues.find((v) => v.id === YOUTH_PROGRAMME_INFO.venueId) || null,
    [venues]
  );

  const youthEvents = useMemo(
    () =>
      allEvents
        .filter((e) => e.category === "youth" && e.date === YOUTH_PROGRAMME_INFO.date)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [allEvents]
  );

  const morningActivities = useMemo(
    () => youthEvents.filter((e) => e.startTime < "12:00"),
    [youthEvents]
  );

  const afternoonActivities = useMemo(
    () => youthEvents.filter((e) => e.startTime >= "13:00"),
    [youthEvents]
  );

  const groupByStartTime = (list: FestivalEvent[]) => {
    const map = new Map<string, FestivalEvent[]>();
    for (const evt of list) {
      if (!map.has(evt.startTime)) map.set(evt.startTime, []);
      map.get(evt.startTime)!.push(evt);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  };

  const morningGroups = useMemo(
    () => groupByStartTime(morningActivities),
    [morningActivities]
  );
  const afternoonGroups = useMemo(
    () => groupByStartTime(afternoonActivities),
    [afternoonActivities]
  );

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${
    youthVenue?.latitude ?? -34.339501
  },${youthVenue?.longitude ?? 19.01917}`;

  const renderActivityCard = (evt: FestivalEvent) => {
    const isSaved = savedEventIds.includes(evt.id);

    return (
      <article
        key={evt.id}
        onClick={() => setSelectedEvent(evt)}
        className="editorial-surface rounded-2xl p-4 sm:p-5 transition-all hover:shadow-card hover:border-parchment-400 cursor-pointer space-y-3"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1.5 min-w-0 flex-1">
            {/* Time + Free Zone + Age Group */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-semibold text-teal-festival tabular-time inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-terracotta-festival shrink-0" />
                <span>
                  {evt.startTime} – {evt.endTime}
                </span>
              </span>

              <span className="badge-free-zone">Free Zone</span>

              {evt.ageGroup && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-teal-accent/10 text-teal-festival border border-teal-accent/20">
                  Ages {evt.ageGroup}
                </span>
              )}
            </div>

            {/* Activity Title */}
            <h3 className="font-serif font-bold text-lg text-teal-festival leading-snug">
              {evt.title}
            </h3>

            {/* Room / Sub-venue & Capacity */}
            <div className="flex items-center gap-2.5 flex-wrap text-xs text-ink-muted pt-0.5">
              {evt.subVenue && (
                <span className="inline-flex items-center gap-1 font-medium text-teal-festival">
                  <MapPin className="w-3.5 h-3.5 text-terracotta-festival shrink-0" />
                  <span>{evt.subVenue}</span>
                </span>
              )}

              {evt.capacityNote && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-parchment-200/75 text-[11px] text-ink-muted">
                  <Users className="w-3 h-3 shrink-0" />
                  <span>{evt.capacityNote}</span>
                </span>
              )}
            </div>
          </div>

          {/* Save Heart */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleToggleSave(evt.id);
            }}
            className={`min-w-[44px] min-h-[44px] -mr-1.5 -mt-1 p-2.5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              isSaved
                ? "text-terracotta-festival"
                : "text-ink-light hover:text-terracotta-festival hover:bg-parchment-200/60"
            }`}
            aria-label={isSaved ? `Remove ${evt.title}` : `Save ${evt.title}`}
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

        {/* Facilitator & Linked Artist Profile Chips */}
        <div className="pt-2.5 border-t border-parchment-200/90 space-y-2">
          {evt.facilitatorDisplay && (
            <p className="text-xs text-ink-festival">
              <span className="text-ink-muted">Facilitator: </span>
              <strong className="font-semibold text-teal-festival">
                {evt.facilitatorDisplay}
              </strong>
              {evt.affiliation && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-mustard-festival/15 text-mustard-dark">
                  {evt.affiliation}
                </span>
              )}
            </p>
          )}

          {evt.artists && evt.artists.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {evt.artists.map((artist) => (
                <button
                  key={artist.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedArtist(artist);
                  }}
                  className="min-h-[32px] px-2.5 py-1 rounded-lg bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-[11px] font-semibold text-teal-festival inline-flex items-center gap-1 transition-colors"
                >
                  <span>{artist.name} Bio</span>
                  <ChevronRight className="w-3 h-3 text-terracotta-festival" />
                </button>
              ))}
            </div>
          )}
        </div>
      </article>
    );
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-festival hover:text-terracotta-festival py-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          href="/programme?day=sat"
          className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta-festival hover:underline py-1"
        >
          <span>Full Saturday Programme</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Editorial Hero Card */}
      <section className="rounded-3xl overflow-hidden border border-parchment-300 bg-[#FCFBF7] shadow-card">
        <FestivalStripe height="h-1.5" />
        <div className="p-5 sm:p-7 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="editorial-kicker flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dedicated Youth Showcase</span>
            </span>
            <span className="badge-free-zone">Free Zone</span>
          </div>

          <div className="space-y-2">
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-teal-festival leading-tight">
              {YOUTH_PROGRAMME_INFO.title}
            </h1>
            <p className="text-sm text-ink-muted leading-relaxed">
              {YOUTH_PROGRAMME_INFO.homeCopy}
            </p>
          </div>

          {/* Key Programme Details */}
          <div className="p-4 rounded-2xl bg-parchment-100 border border-parchment-300 space-y-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 font-semibold text-teal-festival flex-wrap tabular-time">
              <Calendar className="w-4 h-4 text-terracotta-festival shrink-0" />
              <span>{YOUTH_PROGRAMME_INFO.dateDisplay}</span>
              <span className="text-parchment-400">•</span>
              <Clock className="w-4 h-4 text-terracotta-festival shrink-0" />
              <span>{YOUTH_PROGRAMME_INFO.timeRange}</span>
            </div>

            <div className="flex items-start gap-2 pt-1.5 border-t border-parchment-200">
              <MapPin className="w-4 h-4 text-teal-festival shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-teal-festival block">
                  Mthimkhulu Village Centre
                </strong>
                <span className="text-xs text-ink-muted">
                  Mthimkhulu Community Development, 9th Avenue, Kleinmond
                </span>
              </div>
            </div>
          </div>

          {/* Venue & Map Quick Actions */}
          <div className="grid grid-cols-2 gap-2.5">
            <Link
              href={`/map?venue=${YOUTH_PROGRAMME_INFO.venueId}`}
              className="min-h-[44px] py-2.5 px-3.5 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-semibold flex items-center justify-center gap-1.5 border border-parchment-300 transition-colors"
            >
              <MapIcon className="w-4 h-4 text-terracotta-festival" />
              <span>Locate on Map</span>
            </Link>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackEvent("directions_click", {
                  venueId: YOUTH_PROGRAMME_INFO.venueId,
                })
              }
              className="min-h-[44px] py-2.5 px-3.5 rounded-xl bg-teal-festival hover:bg-teal-light text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Directions</span>
            </a>
          </div>

          {/* Draft / Subject to Change Notice */}
          <div className="flex items-start gap-2 pt-1 text-[11px] text-ink-muted">
            <Info className="w-3.5 h-3.5 text-mustard-dark shrink-0 mt-0.5" />
            <span>
              {YOUTH_PROGRAMME_INFO.draftNotice} Listed capacities are informational.
            </span>
          </div>
        </div>
      </section>

      {/* Chronological Activities Schedule */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-ink-muted">Loading Children &amp; Youth activities...</p>
        </div>
      ) : (
        <div className="space-y-7">
          {/* Morning Sessions (10:00 & 11:00) */}
          {morningGroups.map(([time, items]) => (
            <section key={time} className="space-y-3">
              <div className="sticky top-14 z-20 bg-parchment/95 backdrop-blur-xs py-2 flex items-center gap-3">
                <span className="font-serif font-bold text-xl sm:text-2xl text-teal-festival tabular-time">
                  {time}
                </span>
                <div className="flex-1 h-px bg-parchment-300" />
                <span className="text-[11px] font-medium text-ink-muted">
                  {items.length > 1
                    ? `${items.length} concurrent rooms`
                    : "1 session"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map(renderActivityCard)}
              </div>
            </section>
          ))}

          {/* Midday Lunch Break (12:00–12:45) */}
          <section aria-label="Lunch Break" className="py-1">
            <div className="rounded-2xl bg-mustard-festival/12 border border-mustard-festival/30 p-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-mustard-festival/20 text-mustard-dark flex items-center justify-center shrink-0">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-terracotta-festival tabular-time block">
                    {YOUTH_PROGRAMME_INFO.lunchBreak.startTime} –{" "}
                    {YOUTH_PROGRAMME_INFO.lunchBreak.endTime}
                  </span>
                  <h2 className="font-serif font-bold text-base text-teal-festival">
                    {YOUTH_PROGRAMME_INFO.lunchBreak.title}
                  </h2>
                </div>
              </div>
              <span className="text-xs font-medium text-ink-muted">
                Mthimkhulu Village Centre
              </span>
            </div>
          </section>

          {/* Afternoon Sessions (13:00–14:00) */}
          {afternoonGroups.map(([time, items]) => (
            <section key={time} className="space-y-3">
              <div className="sticky top-14 z-20 bg-parchment/95 backdrop-blur-xs py-2 flex items-center gap-3">
                <span className="font-serif font-bold text-xl sm:text-2xl text-teal-festival tabular-time">
                  {time}
                </span>
                <div className="flex-1 h-px bg-parchment-300" />
                <span className="text-[11px] font-medium text-ink-muted">
                  {items.length > 1
                    ? `${items.length} concurrent rooms`
                    : "1 session"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map(renderActivityCard)}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Footer note */}
      <footer className="pt-4 border-t border-parchment-300/70 text-center text-xs text-ink-muted space-y-1">
        <p className="font-semibold text-teal-festival">
          KliK 2026 Children &amp; Youth Programme • Free Zone
        </p>
        <p className="text-[11px]">
          Programme details are in draft and subject to change.
        </p>
      </footer>

      <BackToTopButton />

      <EventDetailsModal
        event={selectedEvent}
        venue={
          selectedEvent
            ? venues.find((v) => v.id === selectedEvent.venueId) || youthVenue
            : null
        }
        isSaved={selectedEvent ? savedEventIds.includes(selectedEvent.id) : false}
        onClose={() => setSelectedEvent(null)}
        onToggleSave={handleToggleSave}
        allEvents={allEvents}
        onSelectEvent={(evt) => setSelectedEvent(evt)}
      />

      <ArtistProfileModal
        artist={selectedArtist}
        events={allEvents}
        onClose={() => setSelectedArtist(null)}
        onSelectEvent={(evt) => {
          setSelectedArtist(null);
          setSelectedEvent(evt);
        }}
      />
    </div>
  );
}
