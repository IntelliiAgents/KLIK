"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { repository } from "@/lib/db/repository";
import { getSavedEvents, saveEvent, removeSavedEvent } from "@/lib/db/idb";
import { Artist, FestivalEvent, VenueLocation } from "@/lib/types";
import { ArtistProfileModal } from "@/components/Artists/ArtistProfileModal";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import { BackToTopButton } from "@/components/UI/BackToTopButton";
import { trackEvent } from "@/lib/analytics";
import {
  ArrowLeft,
  Search,
  X,
  ChevronRight,
  Calendar,
} from "lucide-react";

const DISCIPLINE_FILTERS = [
  { id: "all", label: "All Artists" },
  { id: "literary", label: "Writers & Poets" },
  { id: "music", label: "Music" },
  { id: "visual", label: "Visual & Social Arts" },
  { id: "youth", label: "Children & Youth" },
];

function ArtistsContent() {
  const searchParams = useSearchParams();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDiscipline, setActiveDiscipline] = useState("all");
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<FestivalEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent("app_open", { screen: "artists" });
    trackEvent("artists_view");

    const load = async () => {
      try {
        const [arts, evts, vns, saved] = await Promise.all([
          repository.getArtists(),
          repository.getEvents(),
          repository.getVenues(),
          getSavedEvents(),
        ]);
        // Sort alphabetically for crisp directory browsing
        const sortedArts = [...arts].sort((a, b) =>
          a.name.replace(/^Dr\.\s+/i, "").localeCompare(b.name.replace(/^Dr\.\s+/i, ""))
        );
        setArtists(sortedArts);
        setEvents(evts);
        setVenues(vns);
        setSavedEventIds(saved.map((s) => s.eventId));

        const artistParam = searchParams.get("artist");
        if (artistParam) {
          const found = sortedArts.find((a) => a.id === artistParam);
          if (found) setSelectedArtist(found);
        }
      } catch (err) {
        console.error("Artists load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [searchParams]);

  const handleToggleSave = async (eventId: string) => {
    const isCurrentlySaved = savedEventIds.includes(eventId);
    if (isCurrentlySaved) {
      await removeSavedEvent(eventId);
      setSavedEventIds((prev) => prev.filter((id) => id !== eventId));
    } else {
      await saveEvent(eventId);
      setSavedEventIds((prev) => [...prev, eventId]);
    }
  };

  // Map artistId -> confirmed events
  const artistEventsMap = useMemo(() => {
    const map = new Map<string, FestivalEvent[]>();
    for (const evt of events) {
      for (const a of evt.artists || []) {
        if (!map.has(a.id)) map.set(a.id, []);
        map.get(a.id)!.push(evt);
      }
    }
    return map;
  }, [events]);

  const filteredArtists = useMemo(() => {
    return artists.filter((artist) => {
      // Only show artists connected to at least one confirmed programme event
      const linkedEvents = artistEventsMap.get(artist.id) || [];
      if (linkedEvents.length === 0) return false;

      if (activeDiscipline === "youth") {
        if (!linkedEvents.some((e) => e.category === "youth")) return false;
      } else if (activeDiscipline === "literary") {
        const d = artist.discipline.toLowerCase();
        if (
          !d.includes("poet") &&
          !d.includes("writer") &&
          !d.includes("author") &&
          !d.includes("novel") &&
          !d.includes("critic") &&
          !d.includes("publish") &&
          !d.includes("story")
        ) {
          return false;
        }
      } else if (activeDiscipline === "music") {
        const d = artist.discipline.toLowerCase();
        if (
          !d.includes("music") &&
          !d.includes("jazz") &&
          !d.includes("rock") &&
          !d.includes("brass")
        ) {
          return false;
        }
      } else if (activeDiscipline === "visual") {
        const d = artist.discipline.toLowerCase();
        if (
          !d.includes("visual") &&
          !d.includes("art") &&
          !d.includes("curator") &&
          !d.includes("theatre") &&
          !d.includes("activist") &&
          !d.includes("food") &&
          !d.includes("walk")
        ) {
          return false;
        }
      }

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = artist.name.toLowerCase().includes(q);
        const matchesDisc = artist.discipline.toLowerCase().includes(q);
        const matchesBio = artist.bio.toLowerCase().includes(q);
        if (!matchesName && !matchesDisc && !matchesBio) return false;
      }

      return true;
    });
  }, [artists, artistEventsMap, activeDiscipline, searchQuery]);

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-festival hover:text-terracotta-festival py-1 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>

        <Link
          href="/programme"
          className="inline-flex items-center gap-1 text-xs font-semibold text-terracotta-festival hover:underline py-1"
        >
          <span>View Programme</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Editorial Header */}
      <div className="space-y-1">
        <span className="editorial-kicker">KliK 2026 Line-up</span>
        <div className="flex items-baseline justify-between gap-2">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-teal-festival">
            Artists &amp; Presenters
          </h1>
          <span className="text-xs text-ink-muted shrink-0">
            {filteredArtists.length} profiles
          </span>
        </div>
        <p className="text-xs sm:text-sm text-ink-muted">
          Writers, poets, musicians, visual artists, and facilitators across Kleinmond.
        </p>
      </div>

      {/* Search + Discipline Pills */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artist, book title, or discipline..."
            className="w-full min-h-[44px] pl-10 pr-9 py-2.5 rounded-xl bg-[#FCFBF7] border border-parchment-300 text-sm text-ink-festival placeholder:text-ink-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-festival transition-all"
            aria-label="Search artists"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink-festival"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {DISCIPLINE_FILTERS.map((f) => {
            const isActive = activeDiscipline === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveDiscipline(f.id)}
                className={`min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border transition-colors ${
                  isActive
                    ? "bg-teal-festival text-white border-teal-festival"
                    : "bg-[#FCFBF7] hover:bg-parchment-200 text-ink-festival border-parchment-300"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Artist Directory Grid */}
      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-ink-muted">Loading artist profiles...</p>
        </div>
      ) : filteredArtists.length === 0 ? (
        <div className="editorial-surface rounded-2xl p-8 text-center space-y-3">
          <p className="text-sm font-medium text-ink-festival">
            No artist profiles match your search.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setActiveDiscipline("all");
            }}
            className="px-4 py-2 rounded-xl bg-teal-festival text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredArtists.map((artist) => {
            const sessionCount = (artistEventsMap.get(artist.id) || []).length;
            const initials = artist.name
              .replace(/^Dr\.\s+/i, "")
              .split(/[\s&]+/)
              .filter((p) => p && !p.startsWith("("))
              .slice(0, 2)
              .map((w) => w[0]?.toUpperCase() || "")
              .join("");

            return (
              <button
                key={artist.id}
                type="button"
                onClick={() => setSelectedArtist(artist)}
                className="text-left editorial-surface rounded-2xl p-4 sm:p-5 transition-all hover:shadow-card hover:border-parchment-400 flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-xl bg-parchment-200/90 text-teal-festival font-serif font-bold text-sm flex items-center justify-center shrink-0 border border-parchment-300 group-hover:bg-teal-festival group-hover:text-white transition-colors"
                      aria-hidden="true"
                    >
                      {initials || "K"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-serif font-bold text-base sm:text-lg text-teal-festival leading-snug group-hover:text-terracotta-festival transition-colors truncate">
                        {artist.name}
                      </h2>
                      <p className="text-xs text-ink-muted truncate">{artist.discipline}</p>
                    </div>
                  </div>

                  <p className="text-xs text-ink-festival/85 leading-relaxed line-clamp-3">
                    {artist.bio.replace(/\n+/g, " ")}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-parchment-200/80 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-ink-muted inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-terracotta-festival" />
                    <span>
                      {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
                    </span>
                  </span>

                  <span className="font-semibold text-terracotta-festival inline-flex items-center gap-0.5">
                    <span>Read profile</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <BackToTopButton />

      <ArtistProfileModal
        artist={selectedArtist}
        events={events}
        onClose={() => setSelectedArtist(null)}
        onSelectEvent={(evt) => {
          setSelectedArtist(null);
          setSelectedEvent(evt);
        }}
      />

      <EventDetailsModal
        event={selectedEvent}
        venue={
          selectedEvent
            ? venues.find((v) => v.id === selectedEvent.venueId) || null
            : null
        }
        isSaved={selectedEvent ? savedEventIds.includes(selectedEvent.id) : false}
        onClose={() => setSelectedEvent(null)}
        onToggleSave={handleToggleSave}
        allEvents={events}
        onSelectEvent={(evt) => setSelectedEvent(evt)}
      />
    </div>
  );
}

export default function ArtistsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-ink-muted">Loading artist profiles...</p>
        </div>
      }
    >
      <ArtistsContent />
    </Suspense>
  );
}
