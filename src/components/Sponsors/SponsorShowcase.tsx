"use client";

import React, { useEffect, useRef } from "react";
import {
  MessageCircle,
  MapPin,
  Waves,
  Bike,
  ExternalLink,
  Award,
} from "lucide-react";
import {
  QUEST_SPONSORS,
  buildSponsorWhatsAppUrl,
} from "@/lib/config";
import { trackEvent } from "@/lib/analytics";
import type { QuestSponsor } from "@/lib/types";

interface SponsorShowcaseProps {
  variant?: "full" | "compact" | "strip";
  placement:
    | "home_banner"
    | "home_section"
    | "quest_landing"
    | "quest_progress"
    | "quest_completion"
    | "checkin_completion";
}

function SponsorLogoThumb({
  sponsor,
  sizeClass = "w-11 h-11",
}: {
  sponsor: QuestSponsor;
  sizeClass?: string;
}) {
  const isDarkEmblem = sponsor.id === "emotion-ebike";
  if (sponsor.logoUrl) {
    return (
      <div
        className={`${sizeClass} shrink-0 overflow-hidden flex items-center justify-center ${
          isDarkEmblem ? "rounded-full" : ""
        }`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={sponsor.logoUrl}
          alt={`${sponsor.name} logo`}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-xl bg-teal-festival/10 text-teal-festival flex items-center justify-center shrink-0`}
    >
      {sponsor.id === "pura-vida-kayaking" ? (
        <Waves className="w-5 h-5" aria-hidden="true" />
      ) : (
        <Bike className="w-5 h-5" aria-hidden="true" />
      )}
    </div>
  );
}

export const SponsorShowcase: React.FC<SponsorShowcaseProps> = ({
  variant = "full",
  placement,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackedRef = useRef(false);

  // Track genuine viewport impressions once per placement without PII
  useEffect(() => {
    const el = containerRef.current;
    if (!el || trackedRef.current) return;

    if (typeof IntersectionObserver === "undefined") {
      trackedRef.current = true;
      QUEST_SPONSORS.forEach((s) =>
        trackEvent("sponsor_impression", { sponsorId: s.id, placement, variant })
      );
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !trackedRef.current) {
          trackedRef.current = true;
          QUEST_SPONSORS.forEach((s) =>
            trackEvent("sponsor_impression", { sponsorId: s.id, placement, variant })
          );
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [placement, variant]);

  const handleCardClick = (sponsor: QuestSponsor) => {
    trackEvent("sponsor_card_click", {
      sponsorId: sponsor.id,
      placement,
      variant,
    });
  };

  const handleWhatsAppClick = (sponsor: QuestSponsor) => {
    trackEvent("sponsor_whatsapp_click", {
      sponsorId: sponsor.id,
      placement,
      variant,
    });
  };

  // 1. Lightweight inline strip (directly beneath Homepage KLiK Quest Banner)
  if (variant === "strip") {
    return (
      <div
        ref={containerRef}
        className="rounded-2xl bg-parchment-50 border border-parchment-300 px-4 py-3 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
        aria-label="KLiK Quest Prize Sponsors"
      >
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-teal-festival shrink-0">
          <Award className="w-4 h-4 text-mustard-dark shrink-0" aria-hidden="true" />
          <span>Prizes Sponsored By</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {QUEST_SPONSORS.map((sponsor) => (
            <a
              key={sponsor.id}
              href={buildSponsorWhatsAppUrl(sponsor.id)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                handleCardClick(sponsor);
                handleWhatsAppClick(sponsor);
              }}
              className="min-h-[40px] pl-1.5 pr-3 py-1 rounded-xl bg-white hover:bg-parchment-100 border border-parchment-300 text-xs font-semibold text-teal-festival inline-flex items-center gap-2 transition-colors shadow-2xs"
            >
              <SponsorLogoThumb sponsor={sponsor} sizeClass="w-7 h-7" />
              <span>{sponsor.shortName}</span>
              <ExternalLink className="w-3 h-3 text-ink-light shrink-0" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    );
  }

  // 2. Compact cards (secondary placements: Quest progress & Completion / Congratulations)
  if (variant === "compact") {
    return (
      <div
        ref={containerRef}
        className="rounded-2xl bg-parchment-50 border border-parchment-300 p-4 space-y-3 shadow-subtle"
        aria-label="Prizes Sponsored by Our Local Adventure Partners"
      >
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-terracotta-festival flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Prizes Sponsored by Our Local Adventure Partners</span>
          </span>
          <span className="text-[11px] text-ink-muted">
            Kleinmond, Western Cape
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {QUEST_SPONSORS.map((sponsor) => (
            <div
              key={sponsor.id}
              onClick={() => handleCardClick(sponsor)}
              className="rounded-xl bg-white border border-parchment-200 p-3 flex flex-col justify-between gap-2.5 shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <SponsorLogoThumb sponsor={sponsor} sizeClass="w-12 h-12" />

                <div className="min-w-0">
                  <h4 className="font-serif font-bold text-sm text-teal-festival leading-tight">
                    {sponsor.name}
                  </h4>
                  <p className="text-[11px] text-ink-muted leading-snug mt-0.5">
                    {sponsor.tagline}
                  </p>
                </div>
              </div>

              <a
                href={buildSponsorWhatsAppUrl(sponsor.id)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleWhatsAppClick(sponsor);
                }}
                className="min-h-[40px] w-full py-2 px-3 rounded-lg bg-[#1E7E45] hover:bg-[#186838] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Book / Enquire on WhatsApp</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Dedicated Full Promotional Section
  return (
    <section
      ref={containerRef}
      aria-labelledby={`sponsor-heading-${placement}`}
      className="space-y-4"
    >
      <div className="text-center space-y-1.5">
        <span className="editorial-kicker block">KLiK Quest Adventure Partners</span>
        <h2
          id={`sponsor-heading-${placement}`}
          className="font-serif font-bold text-lg sm:text-2xl text-teal-festival tracking-tight"
        >
          PRIZES SPONSORED BY OUR LOCAL ADVENTURE PARTNERS
        </h2>
        <p className="text-xs sm:text-sm text-ink-muted max-w-lg mx-auto leading-relaxed">
          Support the local Kleinmond adventure businesses making the KLiK Quest prizes possible — tap below to book or enquire directly via WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUEST_SPONSORS.map((sponsor) => {
          const isDarkEmblem = sponsor.id === "emotion-ebike";
          return (
            <article
              key={sponsor.id}
              onClick={() => handleCardClick(sponsor)}
              className="editorial-surface rounded-3xl overflow-hidden flex flex-col justify-between shadow-card hover:shadow-raised transition-shadow"
            >
              <div>
                {/* Official Activity Photograph + Top-Left Partner Logo Overlay */}
                <div className="relative w-full aspect-[16/10] bg-teal-dark border-b border-parchment-200 overflow-hidden">
                  {sponsor.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={sponsor.imageUrl}
                      alt={`${sponsor.name} — ${sponsor.tagline}`}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover object-center"
                    />
                  ) : null}

                  {/* Official Partner Logo Badge (Top-Left) */}
                  {sponsor.logoUrl && (
                    <div
                      className={`absolute top-3 left-3 overflow-hidden flex items-center justify-center ${
                        isDarkEmblem
                          ? "w-14 h-14 rounded-full drop-shadow-md"
                          : "h-14 px-2 py-1 rounded-xl bg-white/95 backdrop-blur-xs shadow-sm"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sponsor.logoUrl}
                        alt={`${sponsor.name} official logo`}
                        loading="lazy"
                        decoding="async"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Sponsor Details */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-terracotta-festival">
                      <Award className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Official KLiK Quest Prize Sponsor</span>
                    </span>
                    <h3 className="font-serif font-black text-xl text-teal-festival leading-snug">
                      {sponsor.name}
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs sm:text-[13.5px] leading-relaxed text-ink-festival/90">
                    {sponsor.description.map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                  </div>

                  <p className="text-xs font-semibold text-teal-festival flex items-center gap-1.5 pt-1">
                    <MapPin
                      className="w-3.5 h-3.5 text-terracotta-festival shrink-0"
                      aria-hidden="true"
                    />
                    <span>{sponsor.location}</span>
                  </p>
                </div>
              </div>

              {/* Booking & Enquiry WhatsApp CTA */}
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-1">
                <a
                  href={buildSponsorWhatsAppUrl(sponsor.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWhatsAppClick(sponsor);
                  }}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#1E7E45] hover:bg-[#186838] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{sponsor.ctaLabel}</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
