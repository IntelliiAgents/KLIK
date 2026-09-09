"use client";

import React, { useEffect, useState } from "react";
import { repository } from "@/lib/db/repository";
import { getCheckIns } from "@/lib/db/idb";
import { VenueLocation } from "@/lib/types";
import { InteractiveMap } from "@/components/Map/InteractiveMap";
import { MapPin, Navigation } from "lucide-react";

export default function MapPage() {
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [checkedInVenueIds, setCheckedInVenueIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    <div className="space-y-4 pb-6 animate-in fade-in duration-300">
      <div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-teal-festival">
          Festival Venues & Map
        </h1>
        <p className="text-xs text-ink-muted mt-0.5">
          Find halls, performance tents, coastal paths, parking, and toilets across Kleinmond.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-ink-muted space-y-2">
          <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
          <p className="text-xs">Locating festival checkpoints...</p>
        </div>
      ) : (
        <InteractiveMap venues={venues} checkedInVenueIds={checkedInVenueIds} />
      )}
    </div>
  );
}
