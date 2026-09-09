"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { repository } from "@/lib/db/repository";
import {
  FestivalEvent,
  VenueLocation,
  FestivalNotice,
  Challenge,
} from "@/lib/types";
import {
  Shield,
  Lock,
  Calendar,
  MapPin,
  Bell,
  Award,
  AlertTriangle,
  Check,
  Plus,
  ArrowLeft,
  Clock,
} from "lucide-react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState<"events" | "venues" | "notices" | "quest">("events");
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [notices, setNotices] = useState<FestivalNotice[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  // New Notice form state
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");
  const [noticeLevel, setNoticeLevel] = useState<"info" | "important" | "urgent">("important");
  const [noticeSuccess, setNoticeSuccess] = useState(false);

  // Load data
  useEffect(() => {
    const load = async () => {
      try {
        const [evts, vns, notifs, ch] = await Promise.all([
          repository.getEvents(),
          repository.getVenues(),
          repository.getNotices(),
          repository.getChallenge(),
        ]);
        setEvents(evts);
        setVenues(vns);
        setNotices(notifs);
        setChallenge(ch);
      } catch (err) {
        console.error("Admin load error:", err);
      }
    };
    load();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default organizer passcode for local prototype demonstration
    if (passcode === "klik2026" || passcode === "admin") {
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Invalid access code. (Hint for demo: klik2026)");
    }
  };

  const handleUpdateStatus = async (
    eventId: string,
    status: FestivalEvent["scheduleStatus"],
    notice?: string
  ) => {
    await repository.updateEventScheduleStatus(eventId, status, notice);
    const updated = await repository.getEvents();
    setEvents(updated);
  };

  const handlePublishNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeTitle.trim() || !noticeContent.trim()) return;

    await repository.publishNotice({
      title: noticeTitle,
      content: noticeContent,
      level: noticeLevel,
      isActive: true,
    });

    const refreshed = await repository.getNotices();
    setNotices(refreshed);
    setNoticeTitle("");
    setNoticeContent("");
    setNoticeSuccess(true);
    setTimeout(() => setNoticeSuccess(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="py-12 max-w-sm mx-auto space-y-5 animate-in fade-in">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-festival hover:text-teal-light"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Festival App</span>
        </Link>

        <div className="bg-parchment-50 p-6 rounded-3xl border border-parchment-300 shadow-card text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-festival text-white flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h2 className="font-serif font-bold text-xl text-teal-festival">
              Organizer Portal
            </h2>
            <p className="text-xs text-ink-muted mt-1">
              Enter your staff passcode to manage live festival schedules and notices.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3 pt-2">
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Passcode (Demo: klik2026)"
              className="w-full px-4 py-2.5 rounded-xl bg-parchment-100 border border-parchment-300 text-sm focus:outline-none focus:ring-2 focus:ring-teal-festival"
              aria-label="Organizer passcode"
              required
            />

            {authError && (
              <p className="text-xs text-red-600 font-medium">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-teal-festival text-white text-xs font-bold hover:bg-teal-light transition-colors shadow-sm"
            >
              Sign In as Organizer
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6 animate-in fade-in">
      {/* Admin Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-terracotta-festival text-white">
            Staff Portal
          </span>
          <h1 className="font-serif font-black text-2xl text-teal-festival mt-1">
            Festival Operations
          </h1>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-3 py-1.5 rounded-lg bg-parchment-200 text-xs font-semibold text-ink-festival hover:bg-parchment-300 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-parchment-200 p-1 rounded-2xl text-xs font-bold overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("events")}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "events" ? "bg-teal-festival text-white shadow-sm" : "text-ink-muted"
          }`}
        >
          Events ({events.length})
        </button>

        <button
          onClick={() => setActiveTab("venues")}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "venues" ? "bg-teal-festival text-white shadow-sm" : "text-ink-muted"
          }`}
        >
          Venues ({venues.length})
        </button>

        <button
          onClick={() => setActiveTab("notices")}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "notices" ? "bg-teal-festival text-white shadow-sm" : "text-ink-muted"
          }`}
        >
          Notices ({notices.length})
        </button>

        <button
          onClick={() => setActiveTab("quest")}
          className={`flex-1 py-2 px-3 rounded-xl transition-all whitespace-nowrap ${
            activeTab === "quest" ? "bg-teal-festival text-white shadow-sm" : "text-ink-muted"
          }`}
        >
          Quest
        </button>
      </div>

      {/* Tab: Events Management */}
      {activeTab === "events" && (
        <div className="space-y-3">
          <p className="text-xs text-ink-muted">
            Quickly update live statuses (Happening Now, Moved, Cancelled) to notify all festival attendees in real time.
          </p>

          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200 shadow-subtle space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase text-terracotta-festival">
                    {evt.date} • {evt.startTime}
                  </span>
                  <h3 className="font-serif font-bold text-sm text-teal-festival">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-ink-muted">{evt.venueName}</p>
                </div>

                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    evt.scheduleStatus === "happening_now"
                      ? "bg-terracotta-festival text-white"
                      : evt.scheduleStatus === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : evt.scheduleStatus === "moved"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-parchment-200 text-ink-festival"
                  }`}
                >
                  {evt.scheduleStatus.replace("_", " ")}
                </span>
              </div>

              {/* Status Action Buttons */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <button
                  onClick={() => handleUpdateStatus(evt.id, "happening_now")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-teal-festival text-white hover:bg-teal-light"
                >
                  Set Live
                </button>
                <button
                  onClick={() => handleUpdateStatus(evt.id, "scheduled")}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-parchment-200 text-ink-festival hover:bg-parchment-300"
                >
                  Reset Scheduled
                </button>
                <button
                  onClick={() =>
                    handleUpdateStatus(evt.id, "moved", "Relocated to Town Hall foyer due to weather")
                  }
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200"
                >
                  Mark Moved
                </button>
                <button
                  onClick={() =>
                    handleUpdateStatus(evt.id, "cancelled", "Cancelled by artist management")
                  }
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-red-100 text-red-700 hover:bg-red-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Venues Management */}
      {activeTab === "venues" && (
        <div className="space-y-3">
          <p className="text-xs text-ink-muted">
            All registered festival venues and active physical QR check-in tokens.
          </p>

          {venues.map((v) => (
            <div
              key={v.id}
              className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200 shadow-subtle space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-teal-festival">
                  {v.name}
                </h3>
                <span className="text-[10px] uppercase font-bold text-ink-muted bg-parchment-200 px-2 py-0.5 rounded-full">
                  {v.category}
                </span>
              </div>
              <p className="text-xs text-ink-muted">{v.address}</p>
              <div className="text-[11px] font-mono text-teal-festival bg-parchment-100 p-2 rounded-lg break-all">
                QR Token: {v.qrCodeToken}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Notices Management */}
      {activeTab === "notices" && (
        <div className="space-y-4">
          {/* Publish Notice Form */}
          <form
            onSubmit={handlePublishNotice}
            className="bg-parchment-50 p-4 rounded-2xl border border-parchment-300 space-y-3 shadow-subtle"
          >
            <h3 className="font-serif font-bold text-sm text-teal-festival flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-terracotta-festival" />
              <span>Broadcast New Notice</span>
            </h3>

            <div>
              <input
                type="text"
                value={noticeTitle}
                onChange={(e) => setNoticeTitle(e.target.value)}
                placeholder="Notice headline..."
                className="w-full p-2.5 rounded-xl bg-parchment-100 border border-parchment-300 text-xs focus:ring-2 focus:ring-teal-festival"
                required
              />
            </div>

            <div>
              <textarea
                value={noticeContent}
                onChange={(e) => setNoticeContent(e.target.value)}
                placeholder="Notice details..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-parchment-100 border border-parchment-300 text-xs focus:ring-2 focus:ring-teal-festival"
                required
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              <select
                value={noticeLevel}
                onChange={(e) =>
                  setNoticeLevel(e.target.value as "info" | "important" | "urgent")
                }
                className="p-2 rounded-xl bg-parchment-100 border border-parchment-300 text-xs"
              >
                <option value="info">Info Level</option>
                <option value="important">Important (Banner)</option>
                <option value="urgent">Urgent Alert</option>
              </select>

              <button
                type="submit"
                className="py-2 px-4 rounded-xl bg-teal-festival text-white text-xs font-bold hover:bg-teal-light"
              >
                Publish Notice
              </button>
            </div>

            {noticeSuccess && (
              <p className="text-xs text-eucalyptus-dark font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-eucalyptus-festival" />
                <span>Notice published to all festival guests!</span>
              </p>
            )}
          </form>

          {/* Existing Notices */}
          <div className="space-y-2.5">
            <h4 className="font-serif font-bold text-xs text-teal-festival">
              Live Notices ({notices.length})
            </h4>
            {notices.map((n) => (
              <div
                key={n.id}
                className="p-3.5 rounded-2xl bg-parchment-50 border border-parchment-200 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <strong className="font-bold text-teal-festival">{n.title}</strong>
                  <span className="text-[10px] uppercase font-bold text-terracotta-festival">
                    {n.level}
                  </span>
                </div>
                <p className="text-ink-muted">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Quest Overview */}
      {activeTab === "quest" && challenge && (
        <div className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200 space-y-3">
          <h3 className="font-serif font-bold text-sm text-teal-festival">
            {challenge.title} Configuration
          </h3>
          <p className="text-xs text-ink-muted">{challenge.description}</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 rounded-xl bg-parchment-100">
              <span className="text-ink-muted block text-[10px]">Required Stops:</span>
              <span className="font-bold text-base text-teal-festival">
                {challenge.requiredCheckInCount} Locations
              </span>
            </div>
            <div className="p-3 rounded-xl bg-parchment-100">
              <span className="text-ink-muted block text-[10px]">Required Categories:</span>
              <span className="font-bold text-base text-terracotta-festival">
                {challenge.requiredDistinctCategoriesCount} Distinct Categories
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
