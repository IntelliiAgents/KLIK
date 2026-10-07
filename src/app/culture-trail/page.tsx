"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { repository } from "@/lib/db/repository";
import { getCheckIns } from "@/lib/db/idb";
import { Challenge, ChallengeProgress, CheckIn, VenueLocation } from "@/lib/types";
import { QuestTracker } from "@/components/Quest/QuestTracker";
import { trackEvent } from "@/lib/analytics";

export default function CultureTrailPage() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent("app_open", { screen: "culture_trail" });
    trackEvent("culture_trail_open");

    const load = async () => {
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
        console.error("Culture Trail load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-5 pb-8 animate-in fade-in duration-300">
      <div>
        <Link
          href="/more"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-festival hover:text-teal-light py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to More</span>
        </Link>
      </div>

      <div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-teal-festival">
          KLiK Culture Trail
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
          Explore participating venues across Kleinmond and collect check-ins.
        </p>
      </div>

      {loading || !challenge || !progress ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-ink-muted">Loading Culture Trail...</p>
        </div>
      ) : (
        <QuestTracker
          challenge={challenge}
          progress={progress}
          checkIns={checkIns}
          venues={venues}
        />
      )}
    </div>
  );
}
