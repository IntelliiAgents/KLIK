"use client";

import React from "react";
import Link from "next/link";
import {
  Award,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Trophy,
  Gift,
} from "lucide-react";
import { QUEST_CONFIG } from "@/lib/config";
import { trackEvent } from "@/lib/analytics";
import { SponsorShowcase } from "@/components/Sponsors/SponsorShowcase";

interface HomeQuestBannerProps {
  verifiedCount: number;
  isCompleted: boolean;
}

export const HomeQuestBanner: React.FC<HomeQuestBannerProps> = ({
  verifiedCount,
  isCompleted,
}) => {
  const target = QUEST_CONFIG.requiredLocations;
  const hasStarted = verifiedCount > 0 || isCompleted;
  const percent = Math.min(100, Math.round((verifiedCount / target) * 100));

  const ctaLabel = isCompleted
    ? "VIEW YOUR ENTRY CODE"
    : hasStarted
    ? "CONTINUE YOUR QUEST"
    : "START YOUR QUEST";

  return (
    <section aria-labelledby="home-klik-quest-heading" className="space-y-2.5">
      <div className="rounded-3xl bg-gradient-to-br from-[#1C323A] via-teal-festival to-[#2E4852] text-parchment-50 p-5 sm:p-6 shadow-raised border-2 border-mustard-festival/50 relative overflow-hidden">
        {/* Top Multi-Tone Festival Accent Stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-mustard-festival via-terracotta-festival to-olive-light"
          aria-hidden="true"
        />

        {/* Subtle Decorative Radial Glows */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-48 h-48 rounded-full bg-mustard-festival/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-terracotta-festival/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 space-y-3.5">
          {/* Exciting Badge Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/12 border border-mustard-light/40 text-[11px] font-bold uppercase tracking-[0.14em] text-mustard-light">
              <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Exciting Prizes To Be Won!</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-gradient-to-r from-mustard-festival to-mustard-light text-teal-dark shadow-sm">
              <Trophy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>WIN {QUEST_CONFIG.formattedPrizeValue} IN PRIZES</span>
            </span>
          </div>

          {/* Compact, Enticing Copy */}
          <div className="space-y-1">
            <h2
              id="home-klik-quest-heading"
              className="font-serif font-black text-2xl sm:text-3xl text-white leading-tight tracking-tight"
            >
              THE KLiK QUEST
            </h2>
            <p className="font-serif font-bold text-sm sm:text-base text-mustard-light">
              Explore. Check In. Enter Our Festival Lucky Draw!
            </p>
            <p className="text-xs sm:text-sm text-parchment-100/95 leading-relaxed max-w-xl">
              Visit any{" "}
              <strong className="text-white">
                {QUEST_CONFIG.requiredLocations} of {QUEST_CONFIG.totalLocations}
              </strong>{" "}
              participating Kleinmond venues to unlock your Lucky Draw code and
              stand a chance to win guided coastal e-bike &amp; lagoon kayaking
              adventures worth{" "}
              <strong className="text-mustard-light">
                {QUEST_CONFIG.formattedPrizeValue}
              </strong>
              !
            </p>
          </div>

          {/* Live Progress Indicator for Participants Who Have Started */}
          {hasStarted && (
            <div className="rounded-2xl bg-black/20 border border-white/20 p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
                <span className="font-bold text-white flex items-center gap-1.5">
                  {isCompleted ? (
                    <CheckCircle2
                      className="w-4 h-4 text-mustard-light shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <Award
                      className="w-4 h-4 text-mustard-light shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  <span>
                    Your KLiK Quest Progress: {Math.min(verifiedCount, target)} of{" "}
                    {target} locations completed
                  </span>
                </span>
                {isCompleted && (
                  <span className="px-2.5 py-0.5 rounded-full bg-olive-festival text-white text-[10px] font-bold uppercase tracking-wider shrink-0">
                    Qualified!
                  </span>
                )}
              </div>

              <div className="w-full h-2 rounded-full bg-white/15 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-mustard-festival via-terracotta-light to-terracotta-festival transition-all duration-500"
                  style={{ width: `${percent}%` }}
                  role="progressbar"
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`KLiK Quest progress: ${verifiedCount} of ${target} locations completed`}
                />
              </div>
            </div>
          )}

          {/* Primary Call-To-Action */}
          <div className="pt-0.5 flex flex-col sm:flex-row sm:items-center gap-2.5">
            <Link
              href="/quest"
              onClick={() =>
                trackEvent("home_quest_banner_click", {
                  hasStarted,
                  verifiedCount,
                  isCompleted,
                })
              }
              className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-terracotta-festival to-terracotta-light hover:from-terracotta-dark hover:to-terracotta-festival text-white font-black text-xs sm:text-sm tracking-wide uppercase shadow-card active:scale-[0.99] transition-all"
            >
              <Gift className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </Link>

            <span className="text-[11px] text-parchment-200/90 text-center sm:text-left">
              Tap to view prizes, check in &amp; read Lucky Draw rules • Ts &amp; Cs apply
            </span>
          </div>
        </div>
      </div>

      {/* Compact Sponsor Attribution Strip Directly Beneath Banner */}
      <SponsorShowcase variant="strip" placement="home_banner" />
    </section>
  );
};
