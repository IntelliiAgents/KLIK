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
  MessageCircle,
} from "lucide-react";
import {
  QUEST_CONFIG,
  QUEST_PRIZES,
  QUEST_SPONSORS,
  buildSponsorWhatsAppUrl,
} from "@/lib/config";
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
    <section aria-labelledby="home-klik-quest-heading" className="space-y-3">
      <div className="rounded-3xl bg-gradient-to-br from-[#1C323A] via-teal-festival to-[#2E4852] text-parchment-50 p-5 sm:p-7 shadow-raised border-2 border-mustard-festival/50 relative overflow-hidden">
        {/* Top Multi-Tone Festival Accent Stripe */}
        <div
          className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-mustard-festival via-terracotta-festival to-olive-light"
          aria-hidden="true"
        />

        {/* Subtle Decorative Radial Glows (Lightweight pure CSS, zero image overhead) */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-56 h-56 rounded-full bg-mustard-festival/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-20 -left-16 w-56 h-56 rounded-full bg-terracotta-festival/20 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative z-10 space-y-4">
          {/* Exciting Top Badge Row */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/12 border border-mustard-light/40 text-[11px] font-bold uppercase tracking-[0.15em] text-mustard-light">
              <Sparkles className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>Exciting Prizes To Be Won!</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black tracking-wide bg-gradient-to-r from-mustard-festival to-mustard-light text-teal-dark shadow-sm">
              <Trophy className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>WIN {QUEST_CONFIG.formattedPrizeValue} IN PRIZES</span>
            </span>
          </div>

          {/* Headline & Enticing Copy */}
          <div className="space-y-1.5">
            <h2
              id="home-klik-quest-heading"
              className="font-serif font-black text-2xl sm:text-3xl text-white leading-tight tracking-tight"
            >
              THE KLiK QUEST
            </h2>
            <p className="font-serif font-bold text-sm sm:text-base text-mustard-light">
              Explore Kleinmond. Check In. Win Unforgettable Coastal Adventures!
            </p>
            <p className="text-xs sm:text-sm text-parchment-100/95 leading-relaxed max-w-2xl">
              Turn your festival weekend into a treasure hunt! Check in at any{" "}
              <strong className="text-white">
                {QUEST_CONFIG.requiredLocations} of {QUEST_CONFIG.totalLocations}
              </strong>{" "}
              participating KLiK venues to unlock your unique entry code and stand a
              chance to win these exciting local adventure prizes:
            </p>
          </div>

          {/* Two Exciting Prizes Preview Cards with Activity Photos & Partner Logos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUEST_PRIZES.map((prize) => {
              const sponsor = QUEST_SPONSORS.find((s) => s.id === prize.sponsorId);
              const isDarkEmblem = prize.sponsorId === "emotion-ebike";
              return (
                <div
                  key={prize.id}
                  className="rounded-2xl bg-white/10 border border-white/20 overflow-hidden backdrop-blur-xs flex flex-col justify-between"
                >
                  <div>
                    {/* Activity Photograph Header */}
                    {sponsor?.imageUrl && (
                      <div className="relative w-full aspect-[16/9] bg-teal-dark overflow-hidden border-b border-white/15">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={sponsor.imageUrl}
                          alt={prize.title}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover object-center"
                        />
                        <div
                          className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent"
                          aria-hidden="true"
                        />
                        {sponsor.logoUrl && (
                          <div
                            className={`absolute bottom-2 left-2.5 shadow-sm overflow-hidden flex items-center justify-center border ${
                              isDarkEmblem
                                ? "w-10 h-10 rounded-full bg-black border-white/60 p-0.5"
                                : "h-10 px-2 py-1 rounded-lg bg-white/95 border-white/80"
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={sponsor.logoUrl}
                              alt={`${sponsor.name} logo`}
                              loading="lazy"
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        )}
                        <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-lg bg-terracotta-festival text-white text-xs font-black shadow-md tabular-time">
                          Worth {prize.formattedValue}
                        </span>
                      </div>
                    )}

                    <div className="p-3.5 space-y-1.5">
                      <h3 className="font-serif font-bold text-sm text-white leading-snug">
                        {prize.title}
                      </h3>
                      <p className="text-[11px] text-parchment-100/90 leading-relaxed">
                        {prize.briefDescription}
                      </p>
                    </div>
                  </div>

                  <div className="px-3.5 pb-3.5 pt-0.5">
                    <a
                      href={buildSponsorWhatsAppUrl(prize.sponsorId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent("sponsor_whatsapp_click", {
                          sponsorId: prize.sponsorId,
                          placement: "home_banner",
                        })
                      }
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-mustard-light hover:text-white transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        Book or enquire on WhatsApp ({QUEST_CONFIG.whatsappLocalDisplay})
                      </span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Live Progress Indicator for Participants Who Have Started */}
          {hasStarted && (
            <div className="rounded-2xl bg-black/20 border border-white/20 p-3.5 space-y-2">
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

              <div className="w-full h-2.5 rounded-full bg-white/15 overflow-hidden">
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
          <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-3">
            <Link
              href="/quest"
              onClick={() =>
                trackEvent("home_quest_banner_click", {
                  hasStarted,
                  verifiedCount,
                  isCompleted,
                })
              }
              className="inline-flex min-h-[50px] w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-terracotta-festival to-terracotta-light hover:from-terracotta-dark hover:to-terracotta-festival text-white font-black text-xs sm:text-sm tracking-wide uppercase shadow-card active:scale-[0.99] transition-all"
            >
              <Gift className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{ctaLabel}</span>
              <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
            </Link>

            <span className="text-[11px] text-parchment-200/90 text-center sm:text-left">
              Free to enter • Check in by QR Scan, GPS Location, or WhatsApp Selfie
            </span>
          </div>
        </div>
      </div>

      {/* Tasteful Sponsor Attribution Directly Beneath Banner */}
      <SponsorShowcase variant="strip" placement="home_banner" />
    </section>
  );
};
