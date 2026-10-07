"use client";

import React, { useEffect, useRef, useState } from "react";
import { VenueLocation } from "@/lib/types";
import { VenueListView } from "./VenueListView";
import { Navigation, Calendar } from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface InteractiveMapProps {
  venues: VenueLocation[];
  checkedInVenueIds?: string[];
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  venues,
  checkedInVenueIds = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hasMapboxToken, setHasMapboxToken] = useState<boolean>(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueLocation | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    trackEvent("map_view");

    if (!token || token.trim() === "" || token.startsWith("your_")) {
      setHasMapboxToken(false);
      return;
    }

    setHasMapboxToken(true);

    let isMounted = true;
    let mapInstance: unknown = null;

    const initMap = async () => {
      try {
        const mapboxglModule = await import("mapbox-gl");
        const mapboxgl = mapboxglModule.default;

        if (!isMounted || !mapContainerRef.current) return;

        mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/outdoors-v12",
          center: [19.029, -34.341],
          zoom: 14.2,
          attributionControl: false,
        });

        mapInstance = map;
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

        map.on("load", () => {
          if (!isMounted) return;
          setMapLoaded(true);

          venues.forEach((venue) => {
            const el = document.createElement("div");
            el.className = "klik-map-marker";
            el.style.width = "34px";
            el.style.height = "34px";
            el.style.cursor = "pointer";
            el.innerHTML = `
              <div style="background-color: #263E47; border: 2px solid #D75A35; color: white; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 8px rgba(38,62,71,0.25);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            `;

            new mapboxgl.Marker(el)
              .setLngLat([venue.longitude, venue.latitude])
              .addTo(map);

            el.addEventListener("click", () => {
              setSelectedVenue(venue);
              trackEvent("venue_view", { venueId: venue.id, venueName: venue.name });
            });
          });
        });

        map.on("error", () => {
          setHasMapboxToken(false);
        });
      } catch {
        setHasMapboxToken(false);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstance && typeof (mapInstance as { remove?: () => void }).remove === "function") {
        (mapInstance as { remove: () => void }).remove();
      }
    };
  }, [token, venues]);

  return (
    <div className="space-y-6">
      {/* Interactive Map (if token is provided, fail completely gracefully if not) */}
      {hasMapboxToken && (
        <div className="relative rounded-3xl overflow-hidden border border-parchment-300 shadow-card bg-parchment-200">
          <div
            ref={mapContainerRef}
            className="w-full h-[300px] sm:h-[360px]"
            aria-label="Map of Kleinmond festival venues"
          />

          {!mapLoaded && (
            <div className="absolute inset-0 bg-parchment-100/90 flex flex-col items-center justify-center p-4">
              <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mb-2" />
              <p className="text-xs font-medium text-ink-muted">Loading map...</p>
            </div>
          )}

          {/* Selected venue preview sheet */}
          {selectedVenue && (
            <div className="absolute bottom-3 left-3 right-3 bg-parchment-50 p-4 rounded-2xl shadow-raised border border-parchment-300 animate-in slide-in-from-bottom-2 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-serif font-bold text-base text-teal-festival">
                    {selectedVenue.name}
                  </h4>
                  <p className="text-xs text-ink-muted">{selectedVenue.address}</p>
                </div>
                <button
                  onClick={() => setSelectedVenue(null)}
                  className="min-w-[32px] min-h-[32px] text-ink-muted hover:text-ink-festival p-1 text-sm font-bold flex items-center justify-center"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-parchment-200">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVenue.latitude},${selectedVenue.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("directions_click", { venueId: selectedVenue.id, venueName: selectedVenue.name })}
                  className="min-h-[40px] py-1.5 px-3 rounded-xl bg-teal-festival text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>

                <Link
                  href={`/programme?venue=${selectedVenue.id}`}
                  className="min-h-[40px] py-1.5 px-3 rounded-xl bg-parchment-200 text-teal-festival text-xs font-bold flex items-center justify-center gap-1.5 border border-parchment-300"
                >
                  <Calendar className="w-3.5 h-3.5 text-terracotta-festival" />
                  <span>What&apos;s On Here</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Festival Venues Directory */}
      <section className="space-y-3">
        <h2 className="font-serif font-bold text-lg text-teal-festival">
          Festival Venues
        </h2>

        <VenueListView
          venues={venues}
          checkedInVenueIds={checkedInVenueIds}
          onSelectVenue={(v) => {
            setSelectedVenue(v);
            trackEvent("venue_view", { venueId: v.id, venueName: v.name });
          }}
        />
      </section>
    </div>
  );
};
