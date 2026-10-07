"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { VenueLocation } from "@/lib/types";
import { VenueListView } from "./VenueListView";
import {
  Navigation,
  Calendar,
  Layers,
  Map as MapIcon,
  Maximize2,
  Car,
  LocateFixed,
} from "lucide-react";
import Link from "next/link";
import { trackEvent } from "@/lib/analytics";

interface InteractiveMapProps {
  venues: VenueLocation[];
  checkedInVenueIds?: string[];
}

// High-resolution Esri Satellite Tiles (covers Kleinmond with high clarity, no API key required)
const SATELLITE_TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const SATELLITE_ATTRIBUTION =
  "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP";

// Clean, high-legibility street tiles (CartoDB Voyager)
const STREET_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const STREET_ATTRIBUTION =
  "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='https://carto.com/attributions'>CARTO</a>";

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  venues,
  checkedInVenueIds = [],
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  // Default to satellite view as requested
  const [mapViewMode, setMapViewMode] = useState<"satellite" | "street">("satellite");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueLocation | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // References to Leaflet objects
  const mapInstanceRef = useRef<any>(null);
  const currentTileLayerRef = useRef<any>(null);
  const markersRef = useRef<{ [venueId: string]: any }>({});
  const userMarkerRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    trackEvent("map_view");

    let isMounted = true;

    const initLeaflet = async () => {
      try {
        const L = (await import("leaflet")).default;
        leafletModuleRef.current = L;

        if (!isMounted || !mapContainerRef.current) return;

        // Cleanup previous instance if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Center on Kleinmond
        const kleinmondCenter: [number, number] = [-34.3395, 19.0265];

        const map = L.map(mapContainerRef.current, {
          center: kleinmondCenter,
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        mapInstanceRef.current = map;

        // Add Zoom Control at bottom right
        L.control.zoom({ position: "bottomright" }).addTo(map);

        // Add Initial Tile Layer (Satellite by default)
        const initialTileUrl =
          mapViewMode === "satellite" ? SATELLITE_TILE_URL : STREET_TILE_URL;
        const initialAttribution =
          mapViewMode === "satellite" ? SATELLITE_ATTRIBUTION : STREET_ATTRIBUTION;

        const tileLayer = L.tileLayer(initialTileUrl, {
          maxZoom: 19,
          attribution: initialAttribution,
        }).addTo(map);

        currentTileLayerRef.current = tileLayer;

        // Add custom markers for all venues
        const markerGroup: any[] = [];
        venues.forEach((venue) => {
          const isSelected = selectedVenue?.id === venue.id;

          const customIcon = L.divIcon({
            className: "klik-leaflet-marker",
            iconSize: [38, 38],
            iconAnchor: [19, 38],
            popupAnchor: [0, -36],
            html: `
              <div style="position: relative; width: 38px; height: 38px; cursor: pointer;">
                <div style="
                  width: 38px;
                  height: 38px;
                  border-radius: 50% 50% 50% 0;
                  background: ${isSelected ? "#D75A35" : "#263E47"};
                  transform: rotate(-45deg);
                  border: 2.5px solid #FFFFFF;
                  box-shadow: 0 4px 10px rgba(0,0,0,0.4);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: transform 0.2s ease, background-color 0.2s ease;
                ">
                  <div style="
                    width: 13px;
                    height: 13px;
                    border-radius: 50%;
                    background: #FFFFFF;
                    transform: rotate(45deg);
                  "></div>
                </div>
              </div>
            `,
          });

          const marker = L.marker([venue.latitude, venue.longitude], {
            icon: customIcon,
            title: venue.name,
          }).addTo(map);

          marker.on("click", () => {
            setSelectedVenue(venue);
            map.flyTo([venue.latitude, venue.longitude], 16, { duration: 0.8 });
            trackEvent("venue_view", { venueId: venue.id, venueName: venue.name });
          });

          markersRef.current[venue.id] = marker;
          markerGroup.push(marker);
        });

        // Fit map bounds to show all venues with padding
        if (venues.length > 0) {
          const latLngs = venues.map((v) => [v.latitude, v.longitude] as [number, number]);
          const bounds = L.latLngBounds(latLngs);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
        }

        setMapLoaded(true);
      } catch (err) {
        console.error("Leaflet map initialization error:", err);
      }
    };

    initLeaflet();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [venues]);

  // Handle Layer Toggle (Satellite vs Street View)
  const handleToggleMapMode = (mode: "satellite" | "street") => {
    if (mode === mapViewMode) return;
    setMapViewMode(mode);

    const map = mapInstanceRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L) return;

    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }

    const tileUrl = mode === "satellite" ? SATELLITE_TILE_URL : STREET_TILE_URL;
    const attribution = mode === "satellite" ? SATELLITE_ATTRIBUTION : STREET_ATTRIBUTION;

    const newLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution,
    }).addTo(map);

    currentTileLayerRef.current = newLayer;
    trackEvent("map_view", { mode });
  };

  // Update marker appearance when selected venue changes
  useEffect(() => {
    const L = leafletModuleRef.current;
    if (!L) return;

    venues.forEach((v) => {
      const marker = markersRef.current[v.id];
      if (!marker) return;

      const isSelected = selectedVenue?.id === v.id;
      const customIcon = L.divIcon({
        className: "klik-leaflet-marker",
        iconSize: [38, 38],
        iconAnchor: [19, 38],
        popupAnchor: [0, -36],
        html: `
          <div style="position: relative; width: 38px; height: 38px; cursor: pointer;">
            <div style="
              width: 38px;
              height: 38px;
              border-radius: 50% 50% 50% 0;
              background: ${isSelected ? "#D75A35" : "#263E47"};
              transform: rotate(-45deg) ${isSelected ? "scale(1.15)" : "scale(1)"};
              border: 2.5px solid #FFFFFF;
              box-shadow: 0 4px 12px rgba(0,0,0,0.45);
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.2s ease;
            ">
              <div style="
                width: 13px;
                height: 13px;
                border-radius: 50%;
                background: #FFFFFF;
                transform: rotate(45deg);
              "></div>
            </div>
          </div>
        `,
      });

      marker.setIcon(customIcon);
      if (isSelected) {
        marker.setZIndexOffset(1000);
      } else {
        marker.setZIndexOffset(0);
      }
    });
  }, [selectedVenue, venues]);

  // Fit all venues in viewport
  const handleFitAllVenues = useCallback(() => {
    const map = mapInstanceRef.current;
    const L = leafletModuleRef.current;
    if (!map || !L || venues.length === 0) return;

    const latLngs = venues.map((v) => [v.latitude, v.longitude] as [number, number]);
    const bounds = L.latLngBounds(latLngs);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [venues]);

  // Locate User (GPS)
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        setUserLocation([latitude, longitude]);

        const map = mapInstanceRef.current;
        const L = leafletModuleRef.current;
        if (!map || !L) return;

        map.flyTo([latitude, longitude], 16, { duration: 1 });

        // Update or create user location marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          const userIcon = L.divIcon({
            className: "klik-user-location-marker",
            iconSize: [22, 22],
            iconAnchor: [11, 11],
            html: `
              <div style="position: relative; width: 22px; height: 22px;">
                <div style="
                  position: absolute;
                  inset: 0;
                  border-radius: 50%;
                  background: rgba(25, 151, 163, 0.4);
                  animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                "></div>
                <div style="
                  position: absolute;
                  inset: 3px;
                  border-radius: 50%;
                  background: #1997A3;
                  border: 2px solid #FFFFFF;
                  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                "></div>
              </div>
            `,
          });

          userMarkerRef.current = L.marker([latitude, longitude], {
            icon: userIcon,
            title: "Your Location",
          }).addTo(map);
        }
      },
      (err) => {
        setIsLocating(false);
        console.warn("Geolocation error:", err);
        alert("Unable to access your current location. Please check browser permissions.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Selecting venue from list below
  const handleSelectVenueFromList = (venue: VenueLocation) => {
    setSelectedVenue(venue);
    trackEvent("venue_view", { venueId: venue.id, venueName: venue.name });

    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([venue.latitude, venue.longitude], 16, { duration: 0.8 });
      // Scroll smoothly to map on mobile
      mapContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Interactive Map Container */}
      <div className="relative rounded-3xl overflow-hidden border border-parchment-300 shadow-card bg-parchment-200">
        {/* Leaflet Map DOM Node */}
        <div
          ref={mapContainerRef}
          className="w-full h-[360px] sm:h-[420px] z-0"
          aria-label="Map of Kleinmond festival venues"
        />

        {/* Loading Spinner */}
        {!mapLoaded && (
          <div className="absolute inset-0 bg-parchment-100/90 flex flex-col items-center justify-center p-4 z-20">
            <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mb-2" />
            <p className="text-xs font-medium text-ink-muted">Loading satellite map...</p>
          </div>
        )}

        {/* Street / Satellite Toggle Control (Top-Right) */}
        <div className="absolute top-3 right-3 z-10 flex items-center bg-white/95 backdrop-blur-sm p-1 rounded-2xl shadow-md border border-parchment-300">
          <button
            type="button"
            onClick={() => handleToggleMapMode("street")}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              mapViewMode === "street"
                ? "bg-teal-festival text-white shadow-sm"
                : "text-ink-muted hover:text-ink-festival hover:bg-parchment-100"
            }`}
            title="Switch to Street View"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Street</span>
          </button>

          <button
            type="button"
            onClick={() => handleToggleMapMode("satellite")}
            className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              mapViewMode === "satellite"
                ? "bg-terracotta-festival text-white shadow-sm"
                : "text-ink-muted hover:text-ink-festival hover:bg-parchment-100"
            }`}
            title="Switch to Satellite View"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>
        </div>

        {/* Map Utility Controls (Top-Left: Fit All & Locate Me) */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={handleFitAllVenues}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-sm shadow-md border border-parchment-300 flex items-center justify-center text-teal-festival hover:text-terracotta-festival hover:bg-parchment-100 transition-colors"
            title="Fit All Venues"
            aria-label="Fit all festival venues"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleLocateUser}
            className={`w-9 h-9 rounded-xl bg-white/95 backdrop-blur-sm shadow-md border border-parchment-300 flex items-center justify-center transition-colors ${
              isLocating
                ? "text-teal-accent animate-pulse"
                : "text-teal-festival hover:text-teal-accent hover:bg-parchment-100"
            }`}
            title="Show My Location"
            aria-label="Show my location"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
        </div>

        {/* Map Mode Badge (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
            {mapViewMode === "satellite" ? "🛰️ Satellite View" : "🗺️ Street View"}
          </span>
        </div>

        {/* Selected Venue Bottom Card Overlay */}
        {selectedVenue && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-sm z-20 bg-parchment-50 p-4 rounded-2xl shadow-raised border border-parchment-300 animate-in slide-in-from-bottom-2 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold text-terracotta-festival">
                  {selectedVenue.category.replace("_", " ")}
                </span>
                <h4 className="font-serif font-bold text-base text-teal-festival leading-tight">
                  {selectedVenue.name}
                </h4>
                <p className="text-xs text-ink-muted mt-0.5">{selectedVenue.address}</p>
                <p className="text-[10px] font-mono text-ink-muted/80 mt-0.5">
                  GPS: {selectedVenue.latitude.toFixed(6)}, {selectedVenue.longitude.toFixed(6)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVenue(null)}
                className="min-w-[32px] min-h-[32px] text-ink-muted hover:text-ink-festival p-1 text-sm font-bold flex items-center justify-center shrink-0 rounded-lg hover:bg-parchment-200"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-parchment-200 text-xs">
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedVenue.latitude},${selectedVenue.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() =>
                  trackEvent("directions_click", {
                    venueId: selectedVenue.id,
                    venueName: selectedVenue.name,
                  })
                }
                className="min-h-[40px] py-1.5 px-2 rounded-xl bg-teal-festival text-white font-bold flex items-center justify-center gap-1 shadow-sm hover:bg-teal-light transition-colors text-center"
              >
                <Navigation className="w-3.5 h-3.5 shrink-0" />
                <span>Directions</span>
              </a>

              <Link
                href={`/programme?venue=${selectedVenue.id}`}
                className="min-h-[40px] py-1.5 px-2 rounded-xl bg-parchment-200 text-teal-festival font-bold flex items-center justify-center gap-1 border border-parchment-300 hover:bg-parchment-300 transition-colors text-center"
              >
                <Calendar className="w-3.5 h-3.5 text-terracotta-festival shrink-0" />
                <span>What&apos;s On</span>
              </Link>

              <Link
                href={`/ride?destination=${encodeURIComponent(selectedVenue.name)}`}
                className="min-h-[40px] py-1.5 px-2 rounded-xl bg-parchment-200 text-teal-festival font-bold flex items-center justify-center gap-1 border border-parchment-300 hover:bg-parchment-300 transition-colors text-center"
              >
                <Car className="w-3.5 h-3.5 text-teal-accent shrink-0" />
                <span>Get a Ride</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Festival Venues Directory List */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-teal-festival">
            Festival Venues ({venues.length})
          </h2>
          <span className="text-xs text-ink-muted">
            Tap a venue to locate on map
          </span>
        </div>

        <VenueListView
          venues={venues}
          checkedInVenueIds={checkedInVenueIds}
          onSelectVenue={handleSelectVenueFromList}
        />
      </section>
    </div>
  );
};
