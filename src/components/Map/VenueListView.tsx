"use client";

import React, { useState } from "react";
import Link from "next/link";
import { VenueLocation, VenueCategory } from "@/lib/types";
import {
  Search,
  MapPin,
  Navigation,
  QrCode,
  CheckCircle2,
  Accessibility,
  Car,
  Utensils,
  Info,
} from "lucide-react";

interface VenueListViewProps {
  venues: VenueLocation[];
  checkedInVenueIds?: string[];
  onSelectVenue?: (venue: VenueLocation) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "All Venues",
  performance: "Performance",
  workshop: "Workshops",
  market: "Market",
  youth: "Youth Hub",
  outdoor: "Outdoor & Trails",
  info: "Info & First Aid",
};

export const VenueListView: React.FC<VenueListViewProps> = ({
  venues,
  checkedInVenueIds = [],
  onSelectVenue,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredVenues = venues.filter((venue) => {
    const matchesCategory =
      selectedCategory === "all" || venue.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4">
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
          placeholder="Search venues, halls, markets, or trails..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-parchment-50 border border-parchment-300 text-sm text-ink-festival placeholder:text-ink-muted focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-festival transition-all"
          aria-label="Search venues"
        />
      </div>

      {/* Category Pills */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar"
        role="tablist"
        aria-label="Filter venues by category"
      >
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => {
          const isSelected = selectedCategory === key;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              role="tab"
              aria-selected={isSelected}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                isSelected
                  ? "bg-teal-festival text-white shadow-sm"
                  : "bg-parchment-200 text-ink-muted hover:bg-parchment-300 hover:text-ink-festival"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Venues Count */}
      <div className="flex items-center justify-between text-xs text-ink-muted px-1">
        <span>
          Showing <strong>{filteredVenues.length}</strong> of {venues.length} festival venues
        </span>
      </div>

      {/* Venues List */}
      <div className="space-y-3">
        {filteredVenues.map((venue) => {
          const isCheckedIn = checkedInVenueIds.includes(venue.id);
          const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`;
          const checkInUrl = `/check-in/${venue.id}?token=${venue.qrCodeToken}`;

          return (
            <article
              key={venue.id}
              onClick={() => onSelectVenue?.(venue)}
              className="bg-parchment-50 p-4 rounded-2xl border border-parchment-200 shadow-subtle hover:shadow-card transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-parchment-200 text-teal-festival">
                      {venue.category}
                    </span>
                    {isCheckedIn && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-eucalyptus-festival/15 text-eucalyptus-dark flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Checked In</span>
                      </span>
                    )}
                  </div>
                  <h3 className="font-serif font-bold text-base text-teal-festival leading-snug">
                    {venue.name}
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-terracotta-festival shrink-0" />
                    <span>{venue.address}</span>
                  </p>
                </div>
              </div>

              {/* Accessibility & Facilities */}
              <div className="flex items-center gap-3 py-2 text-xs text-ink-muted border-y border-parchment-200 my-2.5">
                {venue.isWheelchairAccessible && (
                  <span className="flex items-center gap-1" title="Wheelchair accessible">
                    <Accessibility className="w-3.5 h-3.5 text-teal-festival" />
                    <span>Accessible</span>
                  </span>
                )}
                {venue.hasParking && (
                  <span className="flex items-center gap-1" title="Parking available">
                    <Car className="w-3.5 h-3.5 text-teal-festival" />
                    <span>Parking</span>
                  </span>
                )}
                {venue.hasFoodNearby && (
                  <span className="flex items-center gap-1" title="Food & refreshments nearby">
                    <Utensils className="w-3.5 h-3.5 text-teal-festival" />
                    <span>Food Nearby</span>
                  </span>
                )}
              </div>

              {/* Notes */}
              {venue.accessibilityNotes && (
                <p className="text-xs text-ink-muted italic mb-3">
                  {venue.accessibilityNotes}
                </p>
              )}

              {/* Actions: Directions & Check-In */}
              <div className="flex items-center gap-2 pt-1">
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 py-2 px-3 rounded-lg bg-teal-festival hover:bg-teal-light text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Directions</span>
                </a>

                <Link
                  href={checkInUrl}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 py-2 px-3 rounded-lg bg-parchment-200 hover:bg-parchment-300 text-teal-festival text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-parchment-300"
                >
                  <QrCode className="w-3.5 h-3.5 text-terracotta-festival" />
                  <span>{isCheckedIn ? "Re-scan" : "Check In"}</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
