"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Challenge, ChallengeProgress, CheckIn, VenueLocation } from "@/lib/types";
import {
  Award,
  CheckCircle2,
  Circle,
  Sparkles,
  QrCode,
  Layers,
  ChevronRight,
  Gift,
  HelpCircle,
  Share2,
} from "lucide-react";
import confetti from "canvas-confetti";

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

  const completedCount = progress.totalCheckInsCount;
  const targetCount = challenge.requiredCheckInCount;
  const percentComplete = Math.min(100, Math.round((completedCount / targetCount) * 100));

  const categoriesMetCount = progress.distinctCategoriesMet.length;
  const targetCategoriesCount = challenge.requiredDistinctCategoriesCount;

  useEffect(() => {
    if (progress.isCompleted && !hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);
      setShowCelebration(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#133D4B", "#C8522C", "#DE9E36", "#4B6354"],
        });
      } catch {
        // fallback if canvas not available
      }
    }
  }, [progress.isCompleted, hasTriggeredConfetti]);

  return (
    <div className="space-y-6">
      {/* Hero Quest Card */}
      <div className="bg-gradient-to-br from-teal-festival to-teal-dark text-parchment-50 p-5 rounded-3xl shadow-raised relative overflow-hidden">
        {/* Subtle decorative motif */}
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-mustard-festival text-ink-festival">
              Official Festival Quest
            </span>
            <h2 className="font-serif font-black text-2xl mt-1 text-parchment-50">
              {challenge.title}
            </h2>
            <p className="text-xs text-parchment-200 mt-0.5">
              {challenge.subtitle}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-mustard-light shrink-0">
            <Award className="w-7 h-7" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2 mt-4 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span>
              {completedCount} of {targetCount} Venues Visited
            </span>
            <span>{percentComplete}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-white/15 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-mustard-festival to-terracotta-festival transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
              role="progressbar"
              aria-valuenow={percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-parchment-300">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-mustard-light" />
              <span>
                Categories explored: <strong>{categoriesMetCount}</strong>/{targetCategoriesCount}
              </span>
            </span>
            <span>
              {progress.isCompleted ? "🎉 Goal Achieved!" : `${targetCount - completedCount} more to go`}
            </span>
          </div>
        </div>
      </div>

      {/* Completion Banner if Complete */}
      {progress.isCompleted && (
        <div className="p-4 rounded-2xl bg-mustard-festival/15 border-2 border-mustard-festival text-ink-festival space-y-2 animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-terracotta-festival shrink-0" />
            <h3 className="font-serif font-bold text-base text-teal-festival">
              Congratulations! Trail Completed!
            </h3>
          </div>
          <p className="text-xs text-ink-muted leading-relaxed">
            You have successfully explored Kleinmond across multiple artistic categories. You are eligible for the KliK 2026 festival lucky draw!
          </p>
          {progress.rewardDrawTicketNumber && (
            <div className="p-2.5 rounded-xl bg-parchment-50 border border-parchment-300 flex items-center justify-between">
              <span className="text-xs text-ink-muted">Lucky Draw Entry ID:</span>
              <span className="font-mono font-bold text-sm text-teal-festival">
                {progress.rewardDrawTicketNumber}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Quest Rules Summary */}
      <div className="p-4 rounded-2xl bg-parchment-100 border border-parchment-200 text-xs text-ink-festival space-y-2">
        <h4 className="font-bold flex items-center gap-1.5 text-teal-festival">
          <HelpCircle className="w-4 h-4 text-terracotta-festival" />
          <span>How The KliK Culture Trail Works</span>
        </h4>
        <p className="text-ink-muted leading-relaxed">
          {challenge.rulesDescription}
        </p>
      </div>

      {/* Steps List */}
      <div className="space-y-3">
        <h3 className="font-serif font-bold text-base text-teal-festival flex items-center justify-between">
          <span>Trail Waypoints</span>
          <span className="text-xs font-normal text-ink-muted">
            {checkIns.length} recorded
          </span>
        </h3>

        {challenge.steps.map((step, idx) => {
          // Check if any check-in matches this step's category or location
          const isDone = checkIns.length > idx;
          const matchingCheckIn = checkIns[idx];

          return (
            <div
              key={step.id}
              className={`p-4 rounded-2xl border transition-all ${
                isDone
                  ? "bg-parchment-50 border-eucalyptus-festival/40 shadow-subtle"
                  : "bg-parchment-100/60 border-parchment-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-eucalyptus-festival" />
                  ) : (
                    <Circle className="w-5 h-5 text-parchment-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-festival">
                      Waypoint {idx + 1}
                    </span>
                    {step.isRequired && (
                      <span className="text-[9px] font-semibold text-ink-muted bg-parchment-200 px-1.5 py-0.2 rounded">
                        Required
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif font-bold text-sm text-teal-festival">
                    {step.title}
                  </h4>
                  <p className="text-xs text-ink-muted mt-0.5">
                    {step.description}
                  </p>

                  {isDone && matchingCheckIn && (
                    <div className="mt-2 text-[11px] font-medium text-eucalyptus-dark bg-eucalyptus-festival/10 px-2 py-1 rounded-md inline-flex items-center gap-1">
                      <span>Checked in at: {matchingCheckIn.locationName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Direct QR Scanner trigger / deep-link test helper */}
      <div className="p-4 rounded-2xl bg-parchment-50 border border-parchment-300 space-y-3 shadow-subtle">
        <div className="flex items-center gap-2">
          <QrCode className="w-5 h-5 text-teal-festival" />
          <h4 className="font-serif font-bold text-sm text-teal-festival">
            Scan a Festival QR Code
          </h4>
        </div>
        <p className="text-xs text-ink-muted">
          Physical QR signs are posted at each official festival tent and entrance. You can also test a sample checkpoint below:
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {venues.slice(0, 4).map((v) => (
            <Link
              key={v.id}
              href={`/check-in/${v.id}?token=${v.qrCodeToken}`}
              className="p-2.5 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-teal-festival text-xs font-semibold flex items-center justify-between gap-1 transition-colors"
            >
              <span className="truncate">{v.shortName}</span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
