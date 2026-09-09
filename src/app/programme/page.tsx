"use client";

import React, { useState, useEffect, useMemo } from "react";
import { repository } from "@/lib/db/repository";
import { getSavedEvents, saveEvent, removeSavedEvent } from "@/lib/db/idb";
import { FestivalEvent, VenueLocation, EventCategory } from "@/lib/types";
import { EventCard } from "@/components/Events/EventCard";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import {
  Calendar,
  Search,
  Filter,
  X,
  Clock,
  SlidersHorizontal,
  ChevronDown,
} from "lucide-react";

const DAYS = [
  { id: "all", label: "All Days", date: "" },
  { id: "fri", label: "Fri 27 Nov", date: "2026-11-27" },
  { id: "sat", label: "Sat 28 Nov", date: "2026-11-28" },
  { id: "sun", label: "Sun 29 Nov", date: "2026-11-29" },
];

const CATEGORIES: { id: string; label: string }[] = [
  { id: "all", label: "All Categories" },
  { id: "music", label: "Music" },
  { id: "poetry", label: "Poetry" },
  { id: "stories", label: "Stories & Talks" },
  { id: "workshop", label: "Workshops" },
  { id: "art", label: "Visual Arts" },
  { id: "market", label: "Market" },
  { id: "youth", label: "Youth & Kids" },
  { id: "outdoor", label: "Outdoor" },
  { id: "community", label: "Community" },
];

export default function ProgrammePage() {
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<FestivalEvent | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedDay, setSelectedDay] = useState<string>("fri"); // Default to Friday
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedVenue, setSelectedVenue] = useState<string>("all");
  const [ticketFilter, setTicketFilter] = useState<"all" | "free" | "ticketed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
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
  }, []);

  const handleToggleSave = async (eventId: string) => {
    const isCurrentlySaved = savedEventIds.includes(eventId);
    if (isCurrentlySaved) {
      await removeSavedEvent(eventId);
      setSavedEventIds((prev) => prev.filter((id) => id !== eventId));
    } else {
      await saveEvent(eventId);
      setSavedEventIds((prev) => [...prev, eventId]);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("klik_user_engaged"));
      }
    }
  };

  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Day filter
      if (selectedDay !== "all") {
        const dayConfig = DAYS.find((d) => d.id === selectedDay);
        if (dayConfig && evt.date !== dayConfig.date) return false;
      }

      // Category filter
      if (selectedCategory !== "all" && evt.category !== selectedCategory) {
        return false;
      }

      // Venue filter
      if (selectedVenue !== "all" && evt.venueId !== selectedVenue) {
        return false;
      }

      // Ticket filter
      if (ticketFilter === "free" && evt.isTicketed) return false;
      if (ticketFilter === "ticketed" && !evt.isTicketed) return false;

      // Search Query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = evt.title.toLowerCase().includes(q);
        const matchesDesc = evt.description.toLowerCase().includes(q);
        const matchesVenue = evt.venueName?.toLowerCase().includes(q);
        const matchesArtist = evt.artists.some((a) => a.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesVenue && !matchesArtist) {
          return false;
        }
      }

      return true;
    });
  }, [events, selectedDay, selectedCategory, selectedVenue, ticketFilter, searchQuery]);

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-teal-festival">
          Festival Programme
        </h1>
        <p className="text-xs text-ink-muted mt-0.5">
          Explore performances, discussions, workshops and community gatherings.
        </p>
      </div>

      {/* Day Navigation Tabs */}
      <div
        className="flex items-center gap-1.5 p-1 bg-parchment-200 rounded-2xl"
        role="tablist"
        aria-label="Filter programme by day"
      >
        {DAYS.map((day) => {
          const isSelected = selectedDay === day.id;
          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              role="tab"
              aria-selected={isSelected}
              className={`flex-1 py-2.5 px-2 rounded-xl text-xs font-bold text-center transition-all ${
                isSelected
                  ? "bg-teal-festival text-white shadow-sm"
                  : "text-ink-muted hover:text-teal-festival hover:bg-parchment-300"
              }`}
            >
              {day.label}
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted"
          aria-hidden="true"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by artist, title, or keyword..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-parchment-50 border border-parchment-300 text-sm text-ink-festival placeholder:text-ink-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-festival transition-all"
          aria-label="Search events"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink-festival"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills Scroller */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"
        role="tablist"
        aria-label="Filter by category"
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              role="tab"
              aria-selected={isSelected}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? "bg-terracotta-festival text-white shadow-sm"
                  : "bg-parchment-200 text-ink-muted hover:bg-parchment-300 hover:text-ink-festival"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Advanced Filters Toggle (Venue & Free/Ticketed) */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-festival hover:text-teal-light transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters & Venues</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${
              showAdvancedFilters ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Free / Ticketed Quick Switch */}
        <div className="flex items-center gap-1 bg-parchment-200 p-0.5 rounded-lg text-[11px] font-semibold">
          <button
            onClick={() => setTicketFilter("all")}
            className={`px-2 py-1 rounded-md transition-colors ${
              ticketFilter === "all" ? "bg-parchment-50 text-ink-festival shadow-sm" : "text-ink-muted"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTicketFilter("free")}
            className={`px-2 py-1 rounded-md transition-colors ${
              ticketFilter === "free" ? "bg-parchment-50 text-eucalyptus-dark shadow-sm" : "text-ink-muted"
            }`}
          >
            Free
          </button>
          <button
            onClick={() => setTicketFilter("ticketed")}
            className={`px-2 py-1 rounded-md transition-colors ${
              ticketFilter === "ticketed" ? "bg-parchment-50 text-terracotta-festival shadow-sm" : "text-ink-muted"
            }`}
          >
            Ticketed
          </button>
        </div>
      </div>

      {/* Collapsible Filter Panel */}
      {showAdvancedFilters && (
        <div className="p-3.5 bg-parchment-100 rounded-2xl border border-parchment-300 space-y-3 animate-in fade-in duration-200 text-xs">
          <div>
            <label className="block font-bold text-teal-festival mb-1">
              Select Venue:
            </label>
            <select
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="w-full p-2 rounded-xl bg-parchment-50 border border-parchment-300 text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
            >
              <option value="all">All Kleinmond Venues</option>
              {venues.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {(selectedCategory !== "all" ||
            selectedVenue !== "all" ||
            ticketFilter !== "all" ||
            searchQuery !== "") && (
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSelectedVenue("all");
                setTicketFilter("all");
                setSearchQuery("");
              }}
              className="text-xs font-semibold text-terracotta-festival hover:underline block text-right"
            >
              Reset all filters
            </button>
          )}
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-ink-muted px-1">
        <span>
          Showing <strong>{filteredEvents.length}</strong> event{filteredEvents.length === 1 ? "" : "s"}
        </span>
      </div>

      {/* Chronological Event Cards List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-ink-muted space-y-2">
            <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
            <p className="text-xs">Loading festival programme...</p>
          </div>
        ) : filteredEvents.length > 0 ? (
          filteredEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              isSaved={savedEventIds.includes(evt.id)}
              onToggleSave={handleToggleSave}
              onOpenDetails={(e) => setSelectedEvent(e)}
            />
          ))
        ) : (
          <div className="bg-parchment-50 rounded-2xl p-8 text-center border border-dashed border-parchment-300 space-y-2">
            <Calendar className="w-8 h-8 text-ink-muted mx-auto opacity-50" />
            <h3 className="font-serif font-bold text-base text-teal-festival">
              No matching events found
            </h3>
            <p className="text-xs text-ink-muted max-w-xs mx-auto">
              Try adjusting your search keywords, day selection, or category filters to see more activities.
            </p>
            <button
              onClick={() => {
                setSelectedDay("all");
                setSelectedCategory("all");
                setSelectedVenue("all");
                setTicketFilter("all");
                setSearchQuery("");
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-teal-festival text-white text-xs font-semibold hover:bg-teal-light"
            >
              Show all events
            </button>
          </div>
        )}
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        venue={venues.find((v) => v.id === selectedEvent?.venueId)}
        isSaved={selectedEvent ? savedEventIds.includes(selectedEvent.id) : false}
        onClose={() => setSelectedEvent(null)}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}
