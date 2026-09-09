"use client";

import React, { useEffect, useRef, useState } from "react";
import { VenueLocation } from "@/lib/types";
import { VenueListView } from "./VenueListView";
import { MapPin, Navigation, List, Map as MapIcon, AlertCircle, QrCode } from "lucide-react";
import Link from "next/link";

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
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [selectedVenue, setSelectedVenue] = useState<VenueLocation | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!token || token.trim() === "" || token === "your_mapbox_token_here") {
      setHasMapboxToken(false);
      setViewMode("list"); // Default gracefully to list view if token is missing
      return;
    }

    setHasMapboxToken(true);

    let isMounted = true;
    let mapInstance: unknown = null;

    // Dynamically import mapbox-gl only when component mounts and token exists
    const initMap = async () => {
      try {
        const mapboxglModule = await import("mapbox-gl");
        const mapboxgl = mapboxglModule.default;

        if (!isMounted || !mapContainerRef.current) return;

        mapboxgl.accessToken = token;

        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/outdoors-v12",
          center: [19.0278, -34.3415], // Kleinmond Central
          zoom: 14.2,
          attributionControl: false,
        });

        mapInstance = map;

        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

        map.on("load", () => {
          if (!isMounted) return;
          setMapLoaded(true);

          // Add markers for venues
          venues.forEach((venue) => {
            const el = document.createElement("div");
            el.className = "klik-map-marker";
            el.style.width = "32px";
            el.style.height = "32px";
            el.style.cursor = "pointer";
            el.innerHTML = `
              <div style="background-color: #133D4B; border: 2px solid #DE9E36; color: white; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            `;

            const popupContent = `
              <div style="font-family: inherit; max-width: 220px; padding: 4px;">
                <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #C8522C;">${venue.category}</span>
                <h4 style="font-size: 14px; font-weight: 700; color: #133D4B; margin: 4px 0 2px 0;">${venue.name}</h4>
                <p style="font-size: 11px; color: #666; margin-bottom: 8px;">${venue.address}</p>
                <div style="display: flex; gap: 6px;">
                  <a href="https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}" target="_blank" rel="noopener" style="font-size: 11px; font-weight: 600; background: #133D4B; color: white; padding: 4px 8px; border-radius: 6px; text-decoration: none;">Directions</a>
                  <a href="/check-in/${venue.id}?token=${venue.qrCodeToken}" style="font-size: 11px; font-weight: 600; background: #FAF6EE; border: 1px solid #133D4B; color: #133D4B; padding: 4px 8px; border-radius: 6px; text-decoration: none;">Check In</a>
                </div>
              </div>
            `;

            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent);

            new mapboxgl.Marker(el)
              .setLngLat([venue.longitude, venue.latitude])
              .setPopup(popup)
              .addTo(map);

            el.addEventListener("click", () => {
              setSelectedVenue(venue);
            });
          });
        });

        map.on("error", (e) => {
          console.warn("Mapbox error:", e);
          setMapError("Map tiles could not be loaded. Displaying list view fallback.");
          setViewMode("list");
        });
      } catch (err) {
        console.warn("Mapbox load failed:", err);
        setMapError("Interactive map is currently unavailable. Using directory list.");
        setViewMode("list");
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
    <div className="space-y-4">
      {/* View Switcher Controls */}
      <div className="flex items-center justify-between bg-parchment-200 p-1 rounded-xl">
        <button
          onClick={() => setViewMode("map")}
          disabled={!hasMapboxToken}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            viewMode === "map"
              ? "bg-teal-festival text-white shadow-sm"
              : hasMapboxToken
              ? "text-ink-muted hover:text-ink-festival"
              : "text-ink-muted/50 cursor-not-allowed"
          }`}
          title={!hasMapboxToken ? "Mapbox token required for interactive map" : "Interactive Map"}
        >
          <MapIcon className="w-4 h-4" />
          <span>Interactive Map</span>
        </button>

        <button
          onClick={() => setViewMode("list")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
            viewMode === "list"
              ? "bg-teal-festival text-white shadow-sm"
              : "text-ink-muted hover:text-ink-festival"
          }`}
        >
          <List className="w-4 h-4" />
          <span>Venue Directory ({venues.length})</span>
        </button>
      </div>

      {/* Fallback Notice if token is missing or error occurred */}
      {!hasMapboxToken && (
        <div className="p-3.5 rounded-xl bg-parchment-100 border border-parchment-300 text-xs text-ink-muted flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-mustard-festival shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold text-ink-festival">
              Accessible Venue Directory Active
            </strong>
            <span>
              All festival locations, facilities, and external GPS directions to Google/Apple Maps are fully accessible below. (To enable Mapbox satellite layers, configure <code className="font-mono bg-parchment-200 px-1 py-0.5 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> in your environment).
            </span>
          </div>
        </div>
      )}

      {/* Map View */}
      {viewMode === "map" && hasMapboxToken && (
        <div className="relative rounded-2xl overflow-hidden border border-parchment-300 shadow-card bg-parchment-200">
          <div
            ref={mapContainerRef}
            className="w-full h-[400px] min-h-[350px]"
            aria-label="Interactive map of Kleinmond festival venues"
          />

          {!mapLoaded && !mapError && (
            <div className="absolute inset-0 bg-parchment-100/90 flex flex-col items-center justify-center p-4">
              <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mb-2" />
              <p className="text-xs font-medium text-ink-muted">Loading festival map...</p>
            </div>
          )}

          {/* Selected venue overlay sheet */}
          {selectedVenue && (
            <div className="absolute bottom-3 left-3 right-3 bg-parchment-50 p-3.5 rounded-xl shadow-raised border border-parchment-300 animate-in slide-in-from-bottom-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-festival">
                    {selectedVenue.category}
                  </span>
                  <h4 className="font-serif font-bold text-sm text-teal-festival">
                    {selectedVenue.name}
                  </h4>
                  <p className="text-xs text-ink-muted">{selectedVenue.address}</p>
                </div>
                <button
                  onClick={() => setSelectedVenue(null)}
                  className="text-xs text-ink-muted hover:text-ink-festival p-1"
                  aria-label="Dismiss details"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVenue.latitude},${selectedVenue.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-teal-festival text-white text-xs font-bold text-center flex items-center justify-center gap-1"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>
                <Link
                  href={`/check-in/${selectedVenue.id}?token=${selectedVenue.qrCodeToken}`}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-parchment-200 text-teal-festival border border-parchment-300 text-xs font-bold text-center flex items-center justify-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5 text-terracotta-festival" />
                  <span>Check In</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Directory List View */}
      {viewMode === "list" && (
        <VenueListView
          venues={venues}
          checkedInVenueIds={checkedInVenueIds}
          onSelectVenue={(v) => setSelectedVenue(v)}
        />
      )}
    </div>
  );
};
