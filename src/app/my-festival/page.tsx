"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { repository } from "@/lib/db/repository";
import {
  getSavedEvents,
  removeSavedEvent,
  getCheckIns,
  getOrCreateParticipantId,
} from "@/lib/db/idb";
import {
  FestivalEvent,
  SavedEvent,
  CheckIn,
  ChallengeProgress,
  VenueLocation,
} from "@/lib/types";
import { EventCard } from "@/components/Events/EventCard";
import { EventDetailsModal } from "@/components/Events/EventDetailsModal";
import {
  Heart,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Award,
  User,
  Copy,
  Check,
  ChevronRight,
  Share2,
} from "lucide-react";

export default function MyFestivalPage() {
  const [allEvents, setAllEvents] = useState<FestivalEvent[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [questProgress, setQuestProgress] = useState<ChallengeProgress | null>(null);
  const [participantId, setParticipantId] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<FestivalEvent | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"schedule" | "checkins">("schedule");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const pid = getOrCreateParticipantId();
        setParticipantId(pid);

        const [evts, vns, saved, chks, prog] = await Promise.all([
          repository.getEvents(),
          repository.getVenues(),
          getSavedEvents(),
          getCheckIns(),
          repository.calculateQuestProgress(),
        ]);

        setAllEvents(evts);
        setVenues(vns);
        setSavedEvents(saved);
        setCheckIns(chks);
        setQuestProgress(prog);
      } catch (e) {
        console.error("My Festival load error:", e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleToggleSave = async (eventId: string) => {
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

  // Schedule conflict detection algorithm:
  // An event conflicts if another saved event is on the same date and their time ranges overlap!
  const conflictingEventIds = useMemo(() => {
    const conflicts = new Set<string>();
    for (let i = 0; i < savedFestivalEvents.length; i++) {
      for (let j = i + 1; j < savedFestivalEvents.length; j++) {
        const a = savedFestivalEvents[i];
        const b = savedFestivalEvents[j];

        if (a.date === b.date) {
          // Time overlap check (assuming HH:mm format)
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

  const copyParticipantId = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(participantId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 pb-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-teal-festival">
          My Festival
        </h1>
        <p className="text-xs text-ink-muted mt-0.5">
          Your personal itinerary, schedule conflict warnings, and check-in history.
        </p>
      </div>

      {/* Anonymous Device Profile Card */}
      <div className="p-3.5 rounded-2xl bg-parchment-100 border border-parchment-300 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-teal-festival text-white flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-ink-muted block">
              Anonymous Device ID
            </span>
            <span className="font-mono text-xs font-semibold text-teal-festival truncate block">
              {participantId || "Loading..."}
            </span>
          </div>
        </div>

        <button
          onClick={copyParticipantId}
          className="px-2.5 py-1.5 rounded-lg bg-parchment-200 hover:bg-parchment-300 text-teal-festival font-bold flex items-center gap-1 shrink-0 transition-colors"
          title="Copy backup key"
          aria-label="Copy participant backup key"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-eucalyptus-festival" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? "Copied" : "Backup"}</span>
        </button>
      </div>

      {/* Quest Quick Summary */}
      <div className="bg-teal-festival text-parchment-50 p-4 rounded-2xl flex items-center justify-between gap-3 shadow-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-mustard-light shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-sm text-parchment-50">
              The KliK Culture Trail
            </h3>
            <p className="text-xs text-parchment-200">
              {questProgress?.totalCheckInsCount || 0} of 5 check-ins completed
            </p>
          </div>
        </div>

        <Link
          href="/quest"
          className="px-3 py-1.5 rounded-lg bg-mustard-festival text-ink-festival text-xs font-bold hover:bg-mustard-light transition-colors shrink-0"
        >
          View Trail
        </Link>
      </div>

      {/* Tabs: Saved Schedule vs Check-in History */}
      <div className="flex items-center gap-1 bg-parchment-200 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab("schedule")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === "schedule"
              ? "bg-teal-festival text-white shadow-sm"
              : "text-ink-muted hover:text-teal-festival"
          }`}
        >
          Saved Itinerary ({savedFestivalEvents.length})
        </button>

        <button
          onClick={() => setActiveTab("checkins")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
            activeTab === "checkins"
              ? "bg-teal-festival text-white shadow-sm"
              : "text-ink-muted hover:text-teal-festival"
          }`}
        >
          Check-in Log ({checkIns.length})
        </button>
      </div>

      {/* Tab 1: Saved Schedule */}
      {activeTab === "schedule" && (
        <div className="space-y-3">
          {/* Conflict Alert Banner if any conflicts exist */}
          {conflictingEventIds.size > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block">
                  Schedule Conflicts Detected ({conflictingEventIds.size / 2} overlaps)
                </strong>
                <span>
                  You have saved multiple events occurring at overlapping times on the same day. Check the conflict tags on your cards below.
                </span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="py-12 text-center text-ink-muted space-y-2">
              <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
              <p className="text-xs">Loading saved itinerary...</p>
            </div>
          ) : savedFestivalEvents.length > 0 ? (
            savedFestivalEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                isSaved={true}
                onToggleSave={handleToggleSave}
                onOpenDetails={(e) => setSelectedEvent(e)}
                showConflictWarning={conflictingEventIds.has(evt.id)}
              />
            ))
          ) : (
            <div className="bg-parchment-50 rounded-2xl p-8 text-center border border-dashed border-parchment-300 space-y-3">
              <Heart className="w-8 h-8 text-terracotta-festival mx-auto opacity-60" />
              <h3 className="font-serif font-bold text-base text-teal-festival">
                No saved events yet
              </h3>
              <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
                Tap the heart icon on any event in the programme to bookmark it to your personal schedule.
              </p>
              <Link
                href="/programme"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-teal-festival text-white text-xs font-semibold hover:bg-teal-light transition-colors"
              >
                Browse Festival Programme
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Check-in Log */}
      {activeTab === "checkins" && (
        <div className="space-y-3">
          {checkIns.length > 0 ? (
            checkIns.map((chk) => (
              <div
                key={chk.id}
                className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200 flex items-center justify-between gap-3 shadow-subtle"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-eucalyptus-festival/15 text-eucalyptus-festival flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-sm text-teal-festival truncate">
                      {chk.locationName}
                    </h4>
                    <p className="text-xs text-ink-muted">
                      {new Date(chk.timestamp).toLocaleString("en-ZA", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      chk.syncStatus === "verified"
                        ? "bg-eucalyptus-festival/15 text-eucalyptus-dark"
                        : "bg-mustard-festival/20 text-mustard-dark"
                    }`}
                  >
                    {chk.syncStatus === "verified" ? "Verified" : "Captured Offline"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-parchment-50 rounded-2xl p-8 text-center border border-dashed border-parchment-300 space-y-3">
              <CheckCircle2 className="w-8 h-8 text-ink-muted mx-auto opacity-50" />
              <h3 className="font-serif font-bold text-base text-teal-festival">
                No check-ins captured yet
              </h3>
              <p className="text-xs text-ink-muted max-w-xs mx-auto leading-relaxed">
                Scan the QR code posters at any participating festival tent or venue in Kleinmond to log your visit.
              </p>
              <Link
                href="/quest"
                className="inline-block mt-2 px-4 py-2 rounded-xl bg-teal-festival text-white text-xs font-semibold hover:bg-teal-light transition-colors"
              >
                Explore Trail Waypoints
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        venue={venues.find((v) => v.id === selectedEvent?.venueId)}
        isSaved={selectedEvent ? true : false}
        onClose={() => setSelectedEvent(null)}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}
