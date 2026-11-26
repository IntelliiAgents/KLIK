"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { repository } from "@/lib/db/repository";
import { getCheckIns } from "@/lib/db/idb";
import { Challenge, ChallengeProgress, CheckIn, VenueLocation } from "@/lib/types";
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
  const [loading, setLoading] = useState(true);

  const loadQuestData = useCallback(async () => {
    try {
      const [ch, pr, chks, vns] = await Promise.all([
        repository.getChallenge(),
        repository.calculateQuestProgress(),
        getCheckIns(),
        repository.getVenues(),
      ]);
      setChallenge(ch);
      setProgress(pr);
      setCheckIns(chks);
      setVenues(vns);
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
            onRefresh={loadQuestData}
          />

          {/* Dedicated Full Sponsor Section on KLiK Quest Landing Page */}
          <div className="pt-4 border-t border-parchment-300/80">
            <SponsorShowcase variant="full" placement="quest_landing" />
          </div>
        </>
      )}

      <BackToTopButton />
    </div>
  );
}
