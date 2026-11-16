"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Challenge, ChallengeProgress, CheckIn, VenueLocation } from "@/lib/types";
import {
  CheckCircle2,
  Circle,
  Award,
  MapPin,
  Gift,
  MessageCircle,
  User,
  X,
} from "lucide-react";
import confetti from "canvas-confetti";
import { buildPrizeDrawWhatsAppUrl } from "@/lib/config";
import { trackEvent } from "@/lib/analytics";

interface QuestTrackerProps {
  challenge: Challenge;
  progress: ChallengeProgress;
  checkIns: CheckIn[];
  venues: VenueLocation[];
}

export const QuestTracker: React.FC<QuestTrackerProps> = ({
  challenge,
  progress,
  checkIns,
  venues,
}) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [hasSentWhatsApp, setHasSentWhatsApp] = useState(false);

  const completedCount = progress.totalCheckInsCount;
  const targetCount = challenge.requiredCheckInCount || 5;
  const percentComplete = Math.min(100, Math.round((completedCount / targetCount) * 100));
  const ticketNumber = progress.rewardDrawTicketNumber || "KLIK-2026-WIN";

  useEffect(() => {
    try {
      const savedName = localStorage.getItem("klik_participant_name");
      if (savedName) setParticipantName(savedName);
      const sentFlag = localStorage.getItem("klik_prize_draw_submitted");
      if (sentFlag === "true") setHasSentWhatsApp(true);
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleNameChange = (val: string) => {
    setParticipantName(val);
    try {
      localStorage.setItem("klik_participant_name", val);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (progress.isCompleted && !hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);
      setShowCelebration(true);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#263E47", "#D75A35", "#D9A13E", "#747A57"],
        });
      } catch {
        // fallback
      }
    }
  }, [progress.isCompleted, hasTriggeredConfetti]);

  const checkedVenueIds = new Set(checkIns.map((c) => c.locationId));
  const visitedVenueNames = venues
    .filter((v) => checkedVenueIds.has(v.id))
    .map((v) => v.shortName || v.name);

  const whatsAppEntryUrl = buildPrizeDrawWhatsAppUrl({
    ticketNumber,
    participantName,
    visitedVenues: visitedVenueNames,
  });

  const handleWhatsAppClick = () => {
    setHasSentWhatsApp(true);
    try {
      localStorage.setItem("klik_prize_draw_submitted", "true");
    } catch {
      // ignore
    }
    trackEvent("culture_trail_open", {
      action: "whatsapp_lucky_draw_entry",
      ticketNumber,
    });
  };

  return (
    <div className="space-y-6">
      {/* Culture Trail Progress Card */}
      <div className="bg-parchment-50 rounded-3xl p-6 border border-parchment-300 shadow-subtle space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-festival">
              Culture Trail
            </span>
            <h2 className="font-serif font-black text-xl sm:text-2xl text-teal-festival leading-tight">
              {completedCount >= targetCount
                ? "Culture Trail Completed!"
                : `${completedCount} of ${targetCount} locations visited`}
            </h2>
            <p className="text-xs text-ink-muted">
              Visit participating venues across Kleinmond and scan their checkpoint signs.
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-olive-festival/10 p-2 flex items-center justify-center shrink-0">
            <Award className="w-7 h-7 text-olive-festival" />
          </div>
        </div>

        {/* Restrained Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-2.5 rounded-full bg-parchment-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-terracotta-festival transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
              role="progressbar"
              aria-valuenow={percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>{completedCount} of {targetCount} checkpoints</span>
            <span className="font-medium text-teal-festival">
              {progress.isCompleted ? "Completed" : `${targetCount - completedCount} remaining`}
            </span>
          </div>
        </div>

        {progress.isCompleted && (
          <div className="p-4 sm:p-5 rounded-2xl bg-parchment-100 border-2 border-olive-festival/35 space-y-3.5 mt-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-olive-dark">
                <Gift className="w-4 h-4 text-terracotta-festival shrink-0" />
                <span>Official Lucky Draw &amp; Redemption Ticket</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-olive-festival text-white">
                Active
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-parchment-300 text-center space-y-1 shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted block">
                Your Unique Lucky Draw Code
              </span>
              <span className="font-mono font-black text-xl sm:text-2xl text-teal-festival tracking-wide block">
                {ticketNumber}
              </span>
              {participantName.trim() && (
                <span className="text-xs font-semibold text-olive-dark block">
                  Holder: {participantName.trim()}
                </span>
              )}
              <p className="text-[11px] text-ink-muted pt-1">
                This code remains permanently active on your app. Present this screen to redeem your prize if you win!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={whatsAppEntryUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="flex-1 py-2.5 px-3.5 rounded-xl bg-[#1E7E45] hover:bg-[#186838] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>
                  {hasSentWhatsApp ? "Resend Entry via WhatsApp" : "Send Entry via WhatsApp"}
                </span>
              </a>

              <button
                type="button"
                onClick={() => setShowCelebration(true)}
                className="py-2.5 px-3.5 rounded-xl bg-teal-festival hover:bg-teal-light text-white text-xs font-bold transition-colors"
              >
                {participantName.trim() ? "Full-Screen Ticket" : "Add Name & View Ticket"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Venues Checkpoint List */}
      <section className="space-y-3">
        <h3 className="font-serif font-bold text-base text-teal-festival">
          Trail Locations
        </h3>

        <div className="space-y-2">
          {venues.map((venue) => {
            const isVisited = checkedVenueIds.has(venue.id);

            return (
              <div
                key={venue.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  isVisited
                    ? "bg-olive-festival/5 border-olive-festival/20"
                    : "bg-parchment-50 border-parchment-300"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      isVisited
                        ? "bg-olive-festival text-white"
                        : "bg-parchment-200 text-ink-muted"
                    }`}
                  >
                    {isVisited ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Circle className="w-4 h-4 stroke-[1.5]" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-sm text-teal-festival leading-tight truncate">
                      {venue.name}
                    </h4>
                    <p className="text-[11px] text-ink-muted truncate">{venue.address}</p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  {isVisited ? (
                    <span className="text-[11px] font-bold text-olive-festival">
                      Visited
                    </span>
                  ) : (
                    <Link
                      href={`/check-in/${venue.id}?token=${venue.qrCodeToken}`}
                      className="px-3 py-1.5 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-bold border border-parchment-300 transition-colors"
                    >
                      Check In
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Completion Modal */}
      {showCelebration && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-parchment-50 w-full max-w-sm rounded-3xl p-6 border border-parchment-300 shadow-2xl text-center space-y-4 animate-in zoom-in-95 relative">
            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              aria-label="Close modal"
              className="absolute top-4 right-4 p-1.5 rounded-full text-ink-muted hover:text-ink-festival hover:bg-parchment-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-olive-festival/15 text-olive-dark mx-auto flex items-center justify-center">
              <Award className="w-8 h-8 text-olive-festival" />
            </div>

            <div className="space-y-1">
              <h3 className="font-serif font-black text-xl text-teal-festival">
                Congratulations!
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                You have visited {completedCount} festival checkpoints and completed the KLiK Culture Trail.
              </p>
            </div>

            <div className="bg-parchment-100 p-4 rounded-2xl border border-parchment-300 text-xs text-ink-festival space-y-1">
              <span className="text-ink-muted block text-[10px] uppercase font-bold tracking-wider">
                Festival Lucky Draw Number
              </span>
              <span className="font-mono font-black text-xl text-teal-festival block">
                {ticketNumber}
              </span>
              <p className="text-[11px] text-ink-muted pt-1">
                Enter your name below and tap WhatsApp to register your entry. This ticket stays permanently active on your app so you can show it to redeem your prize!
              </p>
            </div>

            {/* Name Input for WhatsApp Entry */}
            <div className="text-left space-y-1.5">
              <label
                htmlFor="lucky-draw-name"
                className="block text-[11px] font-bold uppercase tracking-wider text-teal-festival"
              >
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="lucky-draw-name"
                  type="text"
                  value={participantName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Sarah van der Merwe"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-parchment-300 text-xs text-ink-festival placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-teal-festival"
                />
              </div>
            </div>

            {/* WhatsApp Entry CTA */}
            <div className="space-y-2 pt-1">
              <a
                href={whatsAppEntryUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppClick}
                className="w-full py-3.5 px-4 rounded-xl bg-[#1E7E45] hover:bg-[#186838] text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Send Lucky Draw Entry via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setShowCelebration(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-teal-festival font-bold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
