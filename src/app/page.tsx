"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { KliKLogo } from "@/components/Brand/KliKLogo";
import { EventCard } from "@/components/Events/EventCard";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import { repository } from "@/lib/db/repository";
import { isEventSaved, saveEvent, removeSavedEvent, getSavedEvents } from "@/lib/db/idb";
import {
  FestivalEvent,
  FestivalNotice,
  ChallengeProgress,
  VenueLocation,
} from "@/lib/types";
import {
  Calendar,
  MapPin,
  Ticket,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  ExternalLink,
  Info,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [notices, setNotices] = useState<FestivalNotice[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<FestivalEvent | null>(null);
  const [questProgress, setQuestProgress] = useState<ChallengeProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allEvents, allVenues, allNotices, savedList, progress] = await Promise.all([
          repository.getEvents(),
          repository.getVenues(),
          repository.getNotices(),
          getSavedEvents(),
          repository.calculateQuestProgress(),
        ]);
        setEvents(allEvents);
        setVenues(allVenues);
        setNotices(allNotices);
        setSavedEventIds(savedList.map((s) => s.eventId));
        setQuestProgress(progress);
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
      await removeSavedEvent(eventId);
      setSavedEventIds((prev) => prev.filter((id) => id !== eventId));
    } else {
      await saveEvent(eventId);
      setSavedEventIds((prev) => [...prev, eventId]);
      // Trigger user engagement event for non-intrusive PWA install prompt
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("klik_user_engaged"));
      }
    }
  };

  // Sample "Happening now" and "Coming up next" logic
  // For demonstrability of the 2026 festival, pick the premier Friday/Saturday events
  const happeningNowEvents = events.filter((e) => e.isFeatured).slice(0, 1);
  const comingUpEvents = events.filter((e) => !e.isTicketed || e.isFeatured).slice(1, 4);

  const activeNotice = notices.length > 0 ? notices[0] : null;

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-300">
      {/* Hero Header with Logo */}
      <section className="bg-parchment-50 rounded-3xl p-5 border border-parchment-300 shadow-subtle text-center relative overflow-hidden">
        <KliKLogo variant="full" className="my-2" />

        {/* Date & Location Pill */}
        <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-parchment-200 border border-parchment-300 text-xs font-semibold text-teal-festival">
          <Calendar className="w-3.5 h-3.5 text-terracotta-festival" />
          <span>27–29 November 2026</span>
          <span className="text-parchment-400">•</span>
          <MapPin className="w-3.5 h-3.5 text-teal-festival" />
          <span>Kleinmond, Western Cape</span>
        </div>

        {/* Primary Call to Actions */}
        <div className="grid grid-cols-2 gap-2.5 mt-5">
          <Link
            href="/programme"
            className="py-3 px-3 rounded-2xl bg-teal-festival hover:bg-teal-light text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-[0.98]"
          >
            <Calendar className="w-4 h-4" />
            <span>View Programme</span>
          </Link>

          <Link
            href="/map"
            className="py-3 px-3 rounded-2xl bg-parchment-200 hover:bg-parchment-300 text-teal-festival border border-parchment-300 text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-transform active:scale-[0.98]"
          >
            <MapPin className="w-4 h-4 text-terracotta-festival" />
            <span>Festival Map</span>
          </Link>
        </div>

        {/* Official Quicket Ticket Action */}
        <div className="mt-3">
          <a
            href="https://www.quicket.co.za/events/339579-kleinmond-inniebos-kunstefees-klik/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-terracotta-festival hover:bg-terracotta-dark text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <Ticket className="w-4 h-4" />
            <span>Get Official Quicket Tickets</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-80" />
          </a>
        </div>
      </section>

      {/* Festival Notice Banner */}
      {activeNotice && (
        <section
          className="p-3.5 rounded-2xl bg-mustard-festival/15 border border-mustard-festival/30 flex items-start gap-2.5"
          role="region"
          aria-label="Important Festival Notice"
        >
          <Info className="w-4 h-4 text-terracotta-festival shrink-0 mt-0.5" />
          <div className="text-xs text-ink-festival">
            <strong className="font-bold text-teal-festival block">
              {activeNotice.title}
            </strong>
            <span className="text-ink-muted leading-relaxed">
              {activeNotice.content}
            </span>
          </div>
        </section>
      )}

      {/* KliK Quest Progress Banner */}
      <section className="bg-gradient-to-r from-teal-festival to-teal-dark text-parchment-50 p-4 rounded-2xl shadow-subtle">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-mustard-light" />
            <h3 className="font-serif font-bold text-sm text-parchment-50">
              The KliK Culture Trail
            </h3>
          </div>
          <Link
            href="/quest"
            className="text-[11px] font-bold text-mustard-light flex items-center hover:underline"
          >
            <span>Open Trail</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <p className="text-xs text-parchment-200 mb-3">
          Check in at 5 festival venues across Kleinmond to earn your culture explorer status.
        </p>

        <div className="w-full h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-mustard-festival rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(
                100,
                ((questProgress?.totalCheckInsCount || 0) / 5) * 100
              )}%`,
            }}
          />
        </div>

        <div className="mt-1.5 flex items-center justify-between text-[11px] text-parchment-300 font-medium">
          <span>{questProgress?.totalCheckInsCount || 0} of 5 venues visited</span>
          <span>
            {questProgress?.isCompleted ? "Goal Completed! 🎉" : "In Progress"}
          </span>
        </div>
      </section>

      {/* Happening Now Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-terracotta-festival animate-ping" />
            <h2 className="font-serif font-bold text-base text-teal-festival">
              Happening Now
            </h2>
          </div>
          <Link
            href="/programme"
            className="text-xs font-semibold text-terracotta-festival flex items-center gap-0.5 hover:underline"
          >
            <span>Full schedule</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {happeningNowEvents.map((evt) => (
          <EventCard
            key={evt.id}
            event={{ ...evt, scheduleStatus: "happening_now" }}
            isSaved={savedEventIds.includes(evt.id)}
            onToggleSave={handleToggleSave}
            onOpenDetails={(e) => setSelectedEvent(e)}
          />
        ))}
      </section>

      {/* Coming Up Next Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-base text-teal-festival flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-festival" />
            <span>Coming Up Next</span>
          </h2>
          <span className="text-xs text-ink-muted">Friday & Saturday Highlights</span>
        </div>

        <div className="space-y-3">
          {comingUpEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              isSaved={savedEventIds.includes(evt.id)}
              onToggleSave={handleToggleSave}
              onOpenDetails={(e) => setSelectedEvent(e)}
            />
          ))}
        </div>
      </section>

      {/* Festival Artwork Poster Banner */}
      <section className="rounded-2xl overflow-hidden border border-parchment-300 shadow-subtle relative bg-parchment-100">
        <div className="p-4 bg-parchment-50 border-b border-parchment-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-festival">
            Official Festival Artwork
          </span>
          <h3 className="font-serif font-bold text-base text-teal-festival">
            Celebrate Creativity. Connect Community.
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Join 19+ featured South African poets, musicians, artists, and storytellers in Kleinmond.
          </p>
        </div>
        <div className="relative aspect-[16/9] w-full bg-parchment-200">
          <Image
            src="/assets/poster.jpg"
            alt="KliK 2026 Kleinmond Inniebos Kunstefees Poster with featured artists and festival events"
            fill
            sizes="(max-width: 600px) 100vw, 450px"
            className="object-cover object-top"
            loading="lazy"
          />
        </div>
      </section>

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
