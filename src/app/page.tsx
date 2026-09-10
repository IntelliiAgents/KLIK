"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { KliKLogo } from "@/components/Brand/KliKLogo";
import { EventCard } from "@/components/Events/EventCard";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import { repository } from "@/lib/db/repository";
import { SEED_PARTNERS } from "@/lib/data/seed";
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
  Maximize2,
  X,
  Palette,
  Music,
  Users,
  Share2,
} from "lucide-react";
import { ShareModal } from "@/components/UI/ShareModal";

export default function HomePage() {
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [notices, setNotices] = useState<FestivalNotice[]>([]);
  const [savedEventIds, setSavedEventIds] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<FestivalEvent | null>(null);
  const [questProgress, setQuestProgress] = useState<ChallengeProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [activeArtTab, setActiveArtTab] = useState<"programme" | "youth">("programme");
  const [artworkModal, setArtworkModal] = useState<{
    src: string;
    title: string;
    subtitle: string;
  } | null>(null);

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
      {/* Hero Header with Authentic Artwork Logo */}
      <section className="bg-parchment-50 rounded-3xl p-5 border border-parchment-300 shadow-subtle text-center relative overflow-hidden">
        {/* Subtle decorative background ring */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-mustard-festival/10 pointer-events-none blur-2xl" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-teal-festival/10 pointer-events-none blur-2xl" />

        {/* Official KliK Artwork Logo */}
        <KliKLogo variant="full" priority className="my-1.5" />

        {/* Date & Location Pill */}
        <div className="mt-3.5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-parchment-200 border border-parchment-300 text-xs font-semibold text-teal-festival">
          <Calendar className="w-3.5 h-3.5 text-terracotta-festival" />
          <span>27–29 November 2026</span>
          <span className="text-parchment-400">•</span>
          <MapPin className="w-3.5 h-3.5 text-teal-festival" />
          <span>Kleinmond, Western Cape</span>
        </div>

        {/* Panoramic Coastal Artwork Banner */}
        <div className="relative mt-4 w-full h-24 sm:h-28 rounded-2xl overflow-hidden border border-parchment-300 shadow-sm group cursor-pointer"
          onClick={() =>
            setArtworkModal({
              src: "/assets/poster.jpg",
              title: "KliK 2026 Festival Poster & Coastal Artwork",
              subtitle: "Panoramic Kleinmond coastal mountains, sea, and protea fynbos",
            })
          }
          title="Tap to view full festival poster and artwork"
        >
          <Image
            src="/assets/kleinmond-landscape.jpg"
            alt="Scenic painting of Kleinmond coastal mountains, sea, and blooming protea"
            fill
            sizes="(max-width: 640px) 100vw, 450px"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal-festival/85 via-teal-festival/30 to-transparent flex items-end justify-between p-2.5">
            <div className="text-left">
              <span className="text-[11px] sm:text-xs font-serif italic text-parchment-100 drop-shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-mustard-festival" />
                <span>Celebrate creativity. Connect community.</span>
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-md border border-white/20">
              <Maximize2 className="w-2.5 h-2.5" />
              <span>Artwork</span>
            </span>
          </div>
        </div>

        {/* Primary Call to Actions */}
        <div className="grid grid-cols-2 gap-2.5 mt-4">
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

        {/* Share App Action */}
        <div className="mt-2.5">
          <button
            onClick={() => setIsShareOpen(true)}
            className="w-full py-2.5 px-4 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-teal-festival border border-parchment-300 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Share2 className="w-4 h-4 text-terracotta-festival" />
            <span>Share App on WhatsApp & Socials</span>
          </button>
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

      {/* KliK Quest Progress Banner with Authentic Round Logo */}
      <section className="bg-gradient-to-r from-teal-festival to-teal-dark text-parchment-50 p-4 rounded-2xl shadow-subtle relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-parchment-100/15 p-0.5 flex items-center justify-center overflow-hidden">
              <Image
                src="/assets/klik-round-logo-128.png"
                alt="Culture Trail Logo"
                width={32}
                height={32}
                className="w-full h-full object-contain"
              />
            </div>
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
          Check in at 5 festival venues across Kleinmond to earn your official Culture Explorer badge.
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

      {/* Youth Festival Spotlight Card */}
      <section className="bg-parchment-100 rounded-3xl p-4 border border-parchment-300 shadow-subtle overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-terracotta-festival" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-terracotta-festival">
              Youth Arts Spotlight
            </span>
          </div>
          <Link
            href="/programme?category=youth"
            className="text-xs font-semibold text-teal-festival hover:underline flex items-center"
          >
            <span>Youth Events</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-3.5 items-center">
          {/* Youth Poster Artwork Thumbnail */}
          <div
            className="relative w-full sm:w-32 aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-parchment-300 cursor-pointer group shrink-0 bg-parchment-200"
            onClick={() =>
              setArtworkModal({
                src: "/assets/youth-poster.jpg",
                title: "Kleinmond Has Talent - Youth Festival Artwork",
                subtitle: "Workshops: 20 Sep - 4 Oct 2026 | Competitions: 28 Nov 2026",
              })
            }
            title="Tap to view full Youth Festival artwork"
          >
            <Image
              src="/assets/youth-poster.jpg"
              alt="Kleinmond Has Talent Youth Festival Poster artwork with dancers and performers"
              fill
              sizes="(max-width: 640px) 100vw, 128px"
              className="object-cover object-top group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2">
              <span className="text-[10px] text-white font-bold flex items-center gap-1">
                <Maximize2 className="w-3 h-3" /> Zoom
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-left flex-1">
            <h3 className="font-serif font-bold text-base text-teal-festival">
              Kleinmond Has Talent 2026
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Workshops & competitions for young creatives aged 14–25. Poetry, Drama, Street Dance, Music, Sketching & Painting at Mthimkhulu Village Centre.
            </p>
            <div className="pt-1 flex flex-wrap gap-1.5 text-[11px] font-medium text-teal-festival">
              <span className="px-2 py-0.5 rounded-md bg-parchment-200 border border-parchment-300">
                Workshops: 20 Sep – 4 Oct
              </span>
              <span className="px-2 py-0.5 rounded-md bg-mustard-festival/20 text-ink-festival border border-mustard-festival/30">
                Competitions: 28 Nov
              </span>
            </div>
          </div>
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

      {/* Festival Artwork & Posters Gallery Showcase */}
      <section className="rounded-3xl overflow-hidden border border-parchment-300 shadow-subtle bg-parchment-50">
        <div className="p-4 border-b border-parchment-200">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-festival">
              Festival Artwork & Posters
            </span>
            <span className="text-[11px] font-medium text-ink-muted">
              Tap poster to view in full
            </span>
          </div>
          <h3 className="font-serif font-bold text-lg text-teal-festival mt-0.5">
            Visual Story of KliK 2026
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Explore the official posters celebrating Kleinmond&apos;s rich landscape, culture, and performers.
          </p>

          {/* Toggle Tabs */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setActiveArtTab("programme")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeArtTab === "programme"
                  ? "bg-teal-festival text-white shadow-xs"
                  : "bg-parchment-200 text-teal-festival hover:bg-parchment-300"
              }`}
            >
              Festival Programme Poster
            </button>
            <button
              onClick={() => setActiveArtTab("youth")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeArtTab === "youth"
                  ? "bg-teal-festival text-white shadow-xs"
                  : "bg-parchment-200 text-teal-festival hover:bg-parchment-300"
              }`}
            >
              Youth Festival Poster
            </button>
          </div>
        </div>

        {/* Artwork Display Container */}
        <div
          className="relative aspect-[3/4] sm:aspect-[4/3] w-full bg-parchment-200 cursor-pointer group overflow-hidden"
          onClick={() =>
            setArtworkModal(
              activeArtTab === "programme"
                ? {
                    src: "/assets/poster.jpg",
                    title: "KliK 2026 Main Festival Programme Poster",
                    subtitle: "Featuring 19+ artists, festival events, and Kleinmond coastal landscape",
                  }
                : {
                    src: "/assets/youth-poster.jpg",
                    title: "Kleinmond Has Talent - Youth Festival Poster",
                    subtitle: "Workshops and competitions for young creatives aged 14–25",
                  }
            )
          }
        >
          <Image
            src={activeArtTab === "programme" ? "/assets/poster.jpg" : "/assets/youth-poster.jpg"}
            alt={
              activeArtTab === "programme"
                ? "KliK 2026 Kleinmond Inniebos Kunstefees Poster with featured artists and festival events"
                : "Kleinmond Has Talent Youth Festival poster with African patterns and youth performers"
            }
            fill
            sizes="(max-width: 640px) 100vw, 500px"
            className="object-contain object-center group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center pointer-events-none">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Tap to inspect full poster</span>
            </span>
          </div>
        </div>

        {/* Caption footer */}
        <div className="p-3 bg-parchment-100 border-t border-parchment-200 flex items-center justify-between text-xs text-ink-muted">
          <span>
            {activeArtTab === "programme"
              ? "Official 2026 Festival Lineup & Coastal Motif"
              : "Youth Performing Arts & Workshops Programme"}
          </span>
          <span className="text-[10px] font-bold text-terracotta-festival uppercase tracking-wider">
            Official Media
          </span>
        </div>
      </section>

      {/* Official Festival Partners */}
      <section className="bg-parchment-50 rounded-3xl p-5 border border-parchment-300 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-mustard-dark" />
          <h2 className="font-serif font-bold text-base text-teal-festival">
            Official Festival Partners
          </h2>
        </div>
        <p className="text-xs text-ink-muted">
          KliK 2026 is proudly presented in collaboration with our dedicated community and cultural partners:
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {SEED_PARTNERS.map((partner) => (
            <div
              key={partner.name}
              className="p-2.5 rounded-xl bg-parchment-100/90 border border-parchment-200 flex flex-col justify-center"
            >
              <span className="font-semibold text-xs text-teal-festival line-clamp-1">
                {partner.name}
              </span>
              <span className="text-[10px] text-ink-muted line-clamp-1">
                {partner.role}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Artwork Modal Lightbox */}
      {artworkModal && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setArtworkModal(null)}
          role="dialog"
          aria-modal="true"
          aria-label={artworkModal.title}
        >
          <div
            className="relative max-w-lg w-full max-h-[92vh] flex flex-col bg-parchment-50 rounded-2xl overflow-hidden shadow-2xl border border-parchment-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-3.5 border-b border-parchment-200 flex items-center justify-between bg-parchment-100 shrink-0">
              <div className="pr-4">
                <h4 className="font-serif font-bold text-sm text-teal-festival line-clamp-1">
                  {artworkModal.title}
                </h4>
                <p className="text-[11px] text-ink-muted line-clamp-1">
                  {artworkModal.subtitle}
                </p>
              </div>
              <button
                onClick={() => setArtworkModal(null)}
                className="p-1.5 rounded-full hover:bg-parchment-300 text-ink-muted hover:text-ink-festival transition-colors"
                aria-label="Close artwork preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image View */}
            <div className="relative flex-1 overflow-auto max-h-[75vh] p-2 bg-parchment-200 flex items-center justify-center">
              <Image
                src={artworkModal.src}
                alt={artworkModal.title}
                width={800}
                height={1200}
                className="w-auto h-auto max-h-[72vh] max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-parchment-100 border-t border-parchment-200 flex items-center justify-between text-xs">
              <span className="text-ink-muted">Pinch or scroll to examine details</span>
              <button
                onClick={() => setArtworkModal(null)}
                className="px-3 py-1 bg-teal-festival text-white rounded-lg font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />

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
