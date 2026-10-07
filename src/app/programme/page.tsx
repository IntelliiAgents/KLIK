"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { repository } from "@/lib/db/repository";
import { getSavedEvents, saveEvent, removeSavedEvent } from "@/lib/db/idb";
import { FestivalEvent, VenueLocation } from "@/lib/types";
import { EventCard } from "@/components/Events/EventCard";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import { trackEvent } from "@/lib/analytics";
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
} from "lucide-react";

const DAYS = [
  { id: "fri", label: "FRI 27", fullDate: "2026-11-27", subtitle: "27 November" },
  { id: "sat", label: "SAT 28", fullDate: "2026-11-28", subtitle: "28 November" },
  { id: "sun", label: "SUN 29", fullDate: "2026-11-29", subtitle: "29 November" },
];

const CATEGORIES = [
  { id: "all", label: "All Categories" },
  { id: "music", label: "Music" },
  { id: "poetry", label: "Poetry" },
  { id: "stories", label: "Stories & Talks" },
  { id: "workshop", label: "Workshops" },
  { id: "art", label: "Visual Arts" },
  { id: "youth", label: "Youth & Children" },
  { id: "market", label: "Market" },
  { id: "outdoor", label: "Outdoor Walks" },
];

function ProgrammeContent() {
  const searchParams = useSearchParams();
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<FestivalEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Determine initial day (current day during festival, else Friday 27)
  const getInitialDay = () => {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const date = String(now.getDate()).padStart(2, "0");
      const todayIso = `${year}-${month}-${date}`;
      const found = DAYS.find((d) => d.fullDate === todayIso);
      return found ? found.id : "fri";
    } catch {
      return "fri";
    }
  };

  const [selectedDayId, setSelectedDayId] = useState<string>(getInitialDay());
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter Drawer State
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterVenue, setFilterVenue] = useState<string>("all");
  const [filterTicket, setFilterTicket] = useState<"all" | "free" | "ticketed">("all");

  useEffect(() => {
    trackEvent("programme_view");

    // Check URL query parameters
    const venueParam = searchParams.get("venue");
    if (venueParam) setFilterVenue(venueParam);

    const catParam = searchParams.get("category");
    if (catParam) setFilterCategory(catParam);

    const dayParam = searchParams.get("day");
    if (dayParam && DAYS.some((d) => d.id === dayParam)) {
      setSelectedDayId(dayParam);
    }

    const init = async () => {
      try {
        const [allEvents, allVenues, savedList] = await Promise.all([
          repository.getEvents(),
          repository.getVenues(),
          getSavedEvents(),
        ]);
        setEvents(allEvents);
        setVenues(allVenues);
        setSavedEventIds(savedList.map((s) => s.eventId));
      } catch (err) {
        console.error("Programme load error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [searchParams]);

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

  const activeFilterCount =
    (filterCategory !== "all" ? 1 : 0) +
    (filterVenue !== "all" ? 1 : 0) +
    (filterTicket !== "all" ? 1 : 0);

  const clearAllFilters = () => {
    setFilterCategory("all");
    setFilterVenue("all");
    setFilterTicket("all");
    setSearchQuery("");
  };

  // Filter events
  const filteredEvents = useMemo(() => {
    const activeDay = DAYS.find((d) => d.id === selectedDayId);
    const dayDate = activeDay?.fullDate;

    return events.filter((evt) => {
      // Day filter
      if (dayDate && evt.date !== dayDate) return false;

      // Category filter
      if (filterCategory !== "all" && evt.category !== filterCategory) return false;

      // Venue filter
      if (filterVenue !== "all" && evt.venueId !== filterVenue) return false;

      // Ticket filter
      if (filterTicket === "free" && evt.isTicketed) return false;
      if (filterTicket === "ticketed" && !evt.isTicketed) return false;

      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = evt.title.toLowerCase().includes(q);
        const matchesDesc = evt.description?.toLowerCase().includes(q);
        const matchesVenue = evt.venueName?.toLowerCase().includes(q);
        const matchesArtist = evt.artists?.some((a) => a.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesVenue && !matchesArtist) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedDayId, filterCategory, filterVenue, filterTicket, searchQuery]);

  // Group filtered events chronologically by start time
  const timeGroupedEvents = useMemo(() => {
    const groups: { time: string; events: FestivalEvent[] }[] = [];
    const map = new Map<string, FestivalEvent[]>();

    const sorted = [...filteredEvents].sort((a, b) => a.startTime.localeCompare(b.startTime));

    for (const evt of sorted) {
      const slot = evt.startTime || "All Day";
      if (!map.has(slot)) {
        map.set(slot, []);
      }
      map.get(slot)!.push(evt);
    }

    const sortedTimeKeys = Array.from(map.keys()).sort();
    for (const key of sortedTimeKeys) {
      groups.push({
        time: key,
        events: map.get(key)!,
      });
    }

    return groups;
  }, [filteredEvents]);

  const selectedVenueForModal = selectedEvent
    ? venues.find((v) => v.id === selectedEvent.venueId) || null
    : null;

  return (
    <div className="space-y-4 pb-8 animate-in fade-in duration-300">
      {/* 1. Header & Three Highly Visible Day Tabs: FRI 27, SAT 28, SUN 29 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-teal-festival">
            Programme
          </h1>
          <span className="text-xs text-ink-muted">
            {filteredEvents.length} {filteredEvents.length === 1 ? "event" : "events"}
          </span>
        </div>

        <div
          className="grid grid-cols-3 gap-2 p-1.5 bg-parchment-200/80 rounded-2xl border border-parchment-300"
          role="tablist"
          aria-label="Filter programme by day"
        >
          {DAYS.map((day) => {
            const isSelected = selectedDayId === day.id;
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDayId(day.id)}
                role="tab"
                aria-selected={isSelected}
                className={`min-h-[50px] py-2 px-3 rounded-xl font-bold text-center transition-all flex flex-col items-center justify-center ${
                  isSelected
                    ? "bg-teal-festival text-white shadow-card scale-[1.01]"
                    : "text-ink-muted hover:text-teal-festival hover:bg-parchment-200"
                }`}
              >
                <span className="font-serif text-sm sm:text-base leading-none tracking-wide">
                  {day.label}
                </span>
                <span className="text-[10px] opacity-80 mt-1 leading-none">
                  {day.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Search programme... & ONE secondary button: Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search programme..."
            className="w-full min-h-[44px] pl-10 pr-9 py-2.5 rounded-xl bg-parchment-50 border border-parchment-300 text-sm text-ink-festival placeholder:text-ink-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-festival transition-all"
            aria-label="Search programme"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink-festival"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ONE Filter Button */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className={`min-h-[44px] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 border transition-all shrink-0 ${
            activeFilterCount > 0
              ? "bg-terracotta-festival text-white border-terracotta-festival shadow-xs"
              : "bg-parchment-50 hover:bg-parchment-200 text-teal-festival border-parchment-300"
          }`}
          aria-label="Open filter options"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-terracotta-festival text-[11px] font-black flex items-center justify-center ml-0.5">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between text-xs text-ink-muted px-1">
          <span className="truncate">
            Filtering by:{" "}
            <strong className="text-teal-festival font-semibold">
              {[
                filterCategory !== "all"
                  ? CATEGORIES.find((c) => c.id === filterCategory)?.label || filterCategory
                  : null,
                filterVenue !== "all"
                  ? venues.find((v) => v.id === filterVenue)?.shortName || "Venue"
                  : null,
                filterTicket !== "all" ? (filterTicket === "free" ? "Free Only" : "Ticketed Only") : null,
              ]
                .filter(Boolean)
                .join(", ")}
            </strong>
          </span>
          <button
            onClick={clearAllFilters}
            className="text-xs font-bold text-terracotta-festival hover:underline shrink-0 ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* 3. Chronological Editorial Timeline */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-ink-muted">Loading programme...</p>
        </div>
      ) : timeGroupedEvents.length === 0 ? (
        <div className="bg-parchment-50 rounded-2xl p-8 text-center border border-parchment-300 space-y-3">
          <p className="text-sm font-medium text-ink-festival">
            No events match your search or filter on this day.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-xl bg-teal-festival text-white text-xs font-bold hover:bg-teal-light"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6 pt-2">
          {timeGroupedEvents.map((group) => (
            <section key={group.time} className="space-y-1">
              {/* Time Dominates Header */}
              <div className="sticky top-14 z-20 bg-parchment/95 backdrop-blur-xs py-2 flex items-center gap-3">
                <span className="font-serif font-black text-xl sm:text-2xl text-teal-festival tracking-tight">
                  {group.time}
                </span>
                <div className="flex-1 h-px bg-parchment-300" />
                <span className="text-[11px] font-semibold text-ink-muted">
                  {group.events.length} {group.events.length === 1 ? "event" : "events"}
                </span>
              </div>

              {/* Grouped events visually under the same time region */}
              <div className="bg-parchment-50 rounded-2xl border border-parchment-300/80 px-4 py-1 divide-y divide-parchment-200 shadow-subtle">
                {group.events.map((evt) => (
                  <EventCard
                    key={evt.id}
                    event={evt}
                    isSaved={savedEventIds.includes(evt.id)}
                    onToggleSave={handleToggleSave}
                    onOpenDetails={(e) => setSelectedEvent(e)}
                    variant="timeline"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Programme Editorial Footer */}
      <footer className="pt-6 text-center text-xs text-ink-muted space-y-1 border-t border-parchment-300/60 mt-6">
        <p className="font-semibold text-teal-festival">
          Official KLiK 2026 Festival Programme
        </p>
        <p className="text-[11px] text-ink-light">
          Programme subject to change. All sessions held in Kleinmond, Western Cape.
        </p>
      </footer>

      {/* Filter Modal / Drawer */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="fixed inset-0"
            onClick={() => setIsFilterOpen(false)}
            aria-hidden="true"
          />

          <div className="relative bg-parchment-50 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 border border-parchment-300 shadow-2xl z-10 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-parchment-200 pb-3">
              <h2 className="font-serif font-bold text-lg text-teal-festival">
                Filter Programme
              </h2>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="min-w-[40px] min-h-[40px] p-2 rounded-full text-ink-muted hover:text-teal-festival flex items-center justify-center"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-festival">
                Category
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = filterCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setFilterCategory(cat.id)}
                      className={`min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors flex items-center justify-between border ${
                        isSelected
                          ? "bg-teal-festival text-white border-teal-festival"
                          : "bg-parchment-100 hover:bg-parchment-200 text-ink-festival border-parchment-300"
                      }`}
                    >
                      <span className="truncate">{cat.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 ml-1 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Venue Filter */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-festival">
                Venue
              </label>
              <select
                value={filterVenue}
                onChange={(e) => setFilterVenue(e.target.value)}
                className="w-full min-h-[44px] py-2 px-3 rounded-xl bg-parchment-100 border border-parchment-300 text-sm text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
              >
                <option value="all">All Venues</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Free vs Ticketed */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-teal-festival">
                Admission
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: "all", label: "All" },
                    { id: "free", label: "Free Only" },
                    { id: "ticketed", label: "Ticketed" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setFilterTicket(opt.id)}
                    className={`min-h-[40px] py-2 px-2 rounded-xl text-xs font-bold text-center border ${
                      filterTicket === opt.id
                        ? "bg-teal-festival text-white border-teal-festival"
                        : "bg-parchment-100 text-ink-festival border-parchment-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-parchment-200 flex items-center gap-2">
              <button
                onClick={clearAllFilters}
                className="min-h-[44px] flex-1 py-2.5 px-3 rounded-xl bg-parchment-200 text-teal-festival font-bold text-xs hover:bg-parchment-300 transition-colors"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsFilterOpen(false)}
                className="min-h-[44px] flex-1 py-2.5 px-3 rounded-xl bg-teal-festival text-white font-bold text-xs hover:bg-teal-light transition-colors"
              >
                Show Events ({filteredEvents.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        venue={selectedVenueForModal}
        isSaved={selectedEvent ? savedEventIds.includes(selectedEvent.id) : false}
        onClose={() => setSelectedEvent(null)}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}

export default function ProgrammePage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-ink-muted">Loading programme...</p>
        </div>
      }
    >
      <ProgrammeContent />
    </Suspense>
  );
}
