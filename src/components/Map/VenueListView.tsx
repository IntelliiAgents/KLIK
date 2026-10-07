"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VenueLocation } from "@/lib/types";
import {
  Search,
  MapPin,
  Navigation,
  Calendar,
  Accessibility,
  Car,
  Utensils,
  X,
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface VenueListViewProps {
  venues: VenueLocation[];
  checkedInVenueIds?: string[];
  onSelectVenue?: (venue: VenueLocation) => void;
}

export const VenueListView: React.FC<VenueListViewProps> = ({
  venues,
  onSelectVenue,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVenues = venues.filter((venue) => {
    if (searchQuery.trim() === "") return true;
    const q = searchQuery.toLowerCase();
    return (
      venue.name.toLowerCase().includes(q) ||
      venue.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3.5">
      {/* Search Input */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted"
          aria-hidden="true"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search venue or street..."
          className="w-full min-h-[44px] pl-10 pr-9 py-2.5 rounded-xl bg-parchment-50 border border-parchment-300 text-sm text-ink-festival placeholder:text-ink-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-festival transition-all"
          aria-label="Search venues"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink-festival"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Venues Cards */}
      <div className="space-y-2.5">
        {filteredVenues.map((venue) => {
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`;

          return (
            <article
              key={venue.id}
              onClick={() => onSelectVenue?.(venue)}
              className="bg-parchment-50 p-4 rounded-2xl border border-parchment-300 shadow-subtle hover:shadow-card transition-all space-y-2.5 cursor-pointer"
            >
              {/* Venue Name & Address */}
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-teal-festival leading-snug">
                  {venue.name}
                </h3>
                <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-terracotta-festival shrink-0" />
                  <span>{venue.address}</span>
                </p>
              </div>

              {/* Confirmed Facilities */}
              {(venue.isWheelchairAccessible || venue.hasParking || venue.hasFoodNearby) && (
                <div className="flex items-center gap-3.5 py-1 text-xs text-ink-muted border-t border-parchment-200">
                  {venue.isWheelchairAccessible && (
                    <span className="flex items-center gap-1 text-[11px]" title="Wheelchair accessible">
                      <Accessibility className="w-3.5 h-3.5 text-teal-festival" />
                      <span>Accessible</span>
                    </span>
                  )}
                  {venue.hasParking && (
                    <span className="flex items-center gap-1 text-[11px]" title="Parking available">
                      <Car className="w-3.5 h-3.5 text-teal-festival" />
                      <span>Parking</span>
                    </span>
                  )}
                  {venue.hasFoodNearby && (
                    <span className="flex items-center gap-1 text-[11px]" title="Food & refreshments nearby">
                      <Utensils className="w-3.5 h-3.5 text-teal-festival" />
                      <span>Food nearby</span>
                    </span>
                  )}
                </div>
              )}

              {/* Actions: What's On Here & Directions */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-parchment-200">
                <Link
                  href={`/programme?venue=${venue.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    trackEvent("venue_view", { venueId: venue.id, venueName: venue.name });
                  }}
                  className="min-h-[44px] py-2 px-3 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-bold flex items-center justify-center gap-1.5 border border-parchment-300 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5 text-terracotta-festival" />
                  <span>What&apos;s On Here</span>
                </Link>

                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackEvent("directions_click", { venueId: venue.id, venueName: venue.name });
                  }}
                  className="min-h-[44px] py-2 px-3 rounded-xl bg-teal-festival hover:bg-teal-light text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
