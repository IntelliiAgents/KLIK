"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { repository } from "@/lib/db/repository";
import { getCheckIns } from "@/lib/db/idb";
import { VenueLocation } from "@/lib/types";
import { InteractiveMap } from "@/components/Map/InteractiveMap";
import { BackToTopButton } from "@/components/UI/BackToTopButton";
import { trackEvent } from "@/lib/analytics";

function MapPageContent() {
  const searchParams = useSearchParams();
  const initialVenueId = searchParams.get("venue");
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [checkedInVenueIds, setCheckedInVenueIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent("app_open", { screen: "map" });
    trackEvent("map_view");

    const load = async () => {
      try {
        const [allVenues, checkIns] = await Promise.all([
          repository.getVenues(),
          getCheckIns(),
        ]);
        setVenues(allVenues);
        setCheckedInVenueIds(checkIns.map((c) => c.locationId));
      } catch (e) {
        console.error("Map page load error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-300">
      <div>
        <span className="editorial-kicker">Kleinmond, Overberg Coast</span>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-teal-festival mt-0.5">
          Festival Map &amp; Venues
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1 leading-relaxed">
          Explore all festival locations across Kleinmond, switch between satellite and street views, or get turn-by-turn directions.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-ink-muted">Loading venues...</p>
        </div>
      ) : (
        <InteractiveMap
          venues={venues}
          checkedInVenueIds={checkedInVenueIds}
          initialVenueId={initialVenueId}
        />
      )}

      <BackToTopButton />
    </div>
  );
}

export default function MapPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-ink-muted">Loading festival map...</p>
        </div>
      }
    >
      <MapPageContent />
    </Suspense>
  );
}
