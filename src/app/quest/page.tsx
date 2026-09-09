"use client";

import React, { useEffect, useState } from "react";
import { repository } from "@/lib/db/repository";
import { getCheckIns } from "@/lib/db/idb";
import { Challenge, ChallengeProgress, CheckIn, VenueLocation } from "@/lib/types";
import { QuestTracker } from "@/components/Quest/QuestTracker";

export default function QuestPage() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        console.error("Quest page load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4 pb-6 animate-in fade-in duration-300">
      <div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-teal-festival">
          KliK Quest
        </h1>
        <p className="text-xs text-ink-muted mt-0.5">
          Follow the Culture Trail across Kleinmond, check in, and qualify for festival rewards.
        </p>
      </div>

      {loading || !challenge || !progress ? (
        <div className="py-12 text-center text-ink-muted space-y-2">
          <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
          <p className="text-xs">Loading quest progress...</p>
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
