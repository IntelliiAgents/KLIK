"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { repository } from "@/lib/db/repository";
import { getCheckIns } from "@/lib/db/idb";
import {
  Challenge,
  ChallengeProgress,
  CheckIn,
  FestivalEvent,
  VenueLocation,
} from "@/lib/types";
import { QuestTracker } from "@/components/Quest/QuestTracker";
import { SponsorShowcase } from "@/components/Sponsors/SponsorShowcase";
import { BackToTopButton } from "@/components/UI/BackToTopButton";
import { trackEvent } from "@/lib/analytics";
import { QUEST_CONFIG } from "@/lib/config";

export default function CultureTrailPage() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuestData = useCallback(async () => {
    try {
      const [ch, pr, chks, vns, evts] = await Promise.all([
        repository.getChallenge(),
        repository.calculateQuestProgress(),
        getCheckIns(),
        repository.getVenues(),
        repository.getEvents(),
      ]);
      setChallenge(ch);
      setProgress(pr);
      setCheckIns(chks);
      setVenues(vns);
      setEvents(evts);
    } catch (err) {
      console.error("KLiK Quest load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    trackEvent("app_open", { screen: "klik_quest" });
    trackEvent("culture_trail_open");
    loadQuestData();

    const handleRefresh = () => {
      loadQuestData();
    };
    window.addEventListener("klik_checkins_changed", handleRefresh);
    window.addEventListener("focus", handleRefresh);
    return () => {
      window.removeEventListener("klik_checkins_changed", handleRefresh);
      window.removeEventListener("focus", handleRefresh);
    };
  }, [loadQuestData]);

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-300">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-festival hover:text-teal-light py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div>
        <span className="editorial-kicker">
          Culture Trail Competition • {QUEST_CONFIG.formattedPrizeValue} in Prizes
        </span>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-teal-festival mt-0.5">
          The KLiK Quest
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
          Visit any {QUEST_CONFIG.requiredLocations} of{" "}
          {QUEST_CONFIG.totalLocations} participating festival locations across
          Kleinmond, complete your check-ins, and unlock your unique competition
          entry code.
        </p>
      </div>

      {loading || !challenge || !progress ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-ink-muted">Loading KLiK Quest...</p>
        </div>
      ) : (
        <>
          <QuestTracker
            challenge={challenge}
            progress={progress}
            checkIns={checkIns}
            venues={venues}
            events={events}
            onRefresh={loadQuestData}
          />

          {/* Dedicated Full Sponsor Section on KLiK Quest Landing Page */}
          <div className="pt-4 border-t border-parchment-300/80">
            <SponsorShowcase variant="full" placement="quest_landing" />
          </div>

          {/* Competition Terms & Conditions (Lucky Draw Rules) */}
          <section
            aria-labelledby="quest-terms-heading"
            className="editorial-surface rounded-3xl p-5 sm:p-6 space-y-3"
          >
            <div className="flex items-center gap-2 text-teal-festival">
              <FileText
                className="w-4 h-4 text-terracotta-festival shrink-0"
                aria-hidden="true"
              />
              <h2
                id="quest-terms-heading"
                className="font-serif font-bold text-base sm:text-lg text-teal-festival"
              >
                Competition Terms &amp; Conditions
              </h2>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              By participating in the KLiK Quest competition, entrants agree to
              the following rules and conditions:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-xs text-ink-festival/90 leading-relaxed">
              <li>
                <strong className="text-teal-festival">Lucky Draw Format &amp; Draw Date:</strong>{" "}
                The KLiK Quest competition is a{" "}
                <strong className="text-teal-festival">Lucky Draw</strong>. Every
                eligible participant who completes verified check-ins at at least
                five (5) distinct participating festival locations and submits
                their unique competition entry code via WhatsApp (
                {QUEST_CONFIG.whatsappLocalDisplay}) will be entered into the
                draw.{" "}
                <strong className="text-teal-festival">
                  The Lucky Draw will take place at the conclusion of the KLiK
                  Festival (Sunday, 29 November 2026).
                </strong>
              </li>
              <li>
                <strong className="text-teal-festival">Staff &amp; Family Exclusion:</strong>{" "}
                Staff, organisers, committee members, volunteers, prize sponsors,
                and immediate family members of the KLiK Festival team do not
                qualify to participate or win prizes in this competition.
              </li>
              <li>
                <strong className="text-teal-festival">Prize Validity (Until February 2027):</strong>{" "}
                All prizes are{" "}
                <strong className="text-teal-festival">
                  valid until 28 February 2027
                </strong>{" "}
                and must be redeemed before this date. Bookings must be arranged
                in advance via WhatsApp ({QUEST_CONFIG.whatsappLocalDisplay}),
                subject to availability and safe weather conditions.
              </li>
              <li>
                <strong className="text-teal-festival">Not Redeemable for Cash:</strong>{" "}
                Prizes are{" "}
                <strong className="text-teal-festival">
                  not redeemable or exchangeable for cash
                </strong>
                , credit, or alternative goods, and may not be resold.
              </li>
              <li>
                <strong className="text-teal-festival">One Entry Per Participant:</strong>{" "}
                Participants are limited to one (1) official Lucky Draw entry.
                Duplicate check-ins at the same venue do not increase progress,
                and fraudulent or tampered submissions will be disqualified.
              </li>
              <li>
                <strong className="text-teal-festival">Winner Notification &amp; Redemption:</strong>{" "}
                Winners will be contacted via WhatsApp or telephone after the
                festival draw using the contact details from their submitted
                entry. Participants should retain their unique competition code
                on the app for verification. If a winner cannot be reached within
                14 days, the organisers reserve the right to select a new winner.
              </li>
              <li>
                <strong className="text-teal-festival">Safety &amp; General Conditions:</strong>{" "}
                Guided coastal e-bike and lagoon kayaking experiences are subject
                to the standard safety briefings, age/fitness requirements, and
                indemnity terms of E-Motion E-Bike Adventures and Pura Vida
                Kayaking Adventures. The KLiK Festival organisers&apos; decision
                on verification and the Lucky Draw outcome is final.
              </li>
            </ul>
          </section>
        </>
      )}

      <BackToTopButton />
    </div>
  );
}
