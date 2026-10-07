"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Car, Navigation, MessageCircle, AlertCircle, MapPin } from "lucide-react";
import { repository } from "@/lib/db/repository";
import { VenueLocation } from "@/lib/types";
import { FESTIVAL_CONFIG, buildShuttleWhatsAppUrl } from "@/lib/config";
import { trackEvent } from "@/lib/analytics";

const DESTINATION_OPTIONS = [
  { id: "shed", label: "The Shed" },
  { id: "town_hall", label: "Town Hall" },
  { id: "main_beach", label: "Main Beach" },
  { id: "central_cafe", label: "Central Café" },
  { id: "mthimkhulu", label: "Mthimkhulu" },
  { id: "the_grail", label: "The Grail" },
  { id: "dixies", label: "Dixie's Restaurant" },
  { id: "other", label: "Other" },
];

export default function RidePage() {
  const [venues, setVenues] = useState<VenueLocation[]>([]);
  const [selectedDestination, setSelectedDestination] = useState<string>("The Grail Centre");
  const [customDestination, setCustomDestination] = useState<string>("");
  const [manualPickup, setManualPickup] = useState<string>("");
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [locationDenied, setLocationDenied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    trackEvent("app_open", { screen: "ride" });
    repository.getVenues().then(setVenues).catch(console.error);
  }, []);

  const getEffectiveDestination = () => {
    if (selectedDestination === "Other") {
      return customDestination.trim() || "Other destination in Kleinmond";
    }
    return selectedDestination;
  };

  const handleRequestRide = () => {
    setIsLocating(true);
    setErrorMessage(null);
    trackEvent("ride_request_started", { destination: getEffectiveDestination() });

    if (!navigator.geolocation) {
      setLocationDenied(true);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        trackEvent("ride_request_whatsapp_opened", {
          mode: "gps",
          destination: getEffectiveDestination(),
        });

        const url = buildShuttleWhatsAppUrl({
          lat: latitude,
          lng: longitude,
          destinationVenue: getEffectiveDestination(),
        });

        window.open(url, "_blank");
      },
      (error) => {
        setIsLocating(false);
        console.warn("Geolocation permission or error:", error);
        setLocationDenied(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 30000,
      }
    );
  };

  const handleManualPickupRequest = () => {
    if (!manualPickup) {
      setErrorMessage("Please choose your pickup point.");
      return;
    }

    trackEvent("ride_request_whatsapp_opened", {
      mode: "manual",
      pickup: manualPickup,
      destination: getEffectiveDestination(),
    });

    const url = buildShuttleWhatsAppUrl({
      pickupVenue: manualPickup,
      destinationVenue: getEffectiveDestination(),
    });

    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Back link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-festival hover:text-teal-light py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Opening Screen / Hero */}
      <div className="bg-parchment-50 rounded-3xl p-6 border border-parchment-300 shadow-subtle text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-olive-festival/15 text-olive-dark mx-auto flex items-center justify-center">
          <Car className="w-7 h-7 text-olive-festival" />
        </div>

        <h1 className="font-serif font-black text-2xl sm:text-3xl text-teal-festival">
          Get a Ride
        </h1>

        <p className="text-sm sm:text-base font-semibold text-ink-festival">
          Need a lift between festival venues?
        </p>

        <p className="text-xs text-ink-muted leading-relaxed max-w-sm mx-auto">
          Share your location and we&apos;ll prepare a WhatsApp message to connect directly with the festival shuttle driver.
        </p>
      </div>

      {/* Destination Selector */}
      <div className="bg-parchment-50 rounded-2xl p-5 border border-parchment-300 shadow-subtle space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-teal-festival">
          Where are you going?
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DESTINATION_OPTIONS.map((dest) => {
            const isSelected = selectedDestination === dest.label;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => setSelectedDestination(dest.label)}
                className={`min-h-[44px] py-2 px-3 rounded-xl text-xs font-bold text-center border transition-all ${
                  isSelected
                    ? "bg-teal-festival text-white border-teal-festival shadow-xs"
                    : "bg-parchment-100 hover:bg-parchment-200 text-ink-festival border-parchment-300"
                }`}
              >
                {dest.label}
              </button>
            );
          })}
        </div>

        {selectedDestination === "Other" && (
          <div className="pt-1">
            <input
              type="text"
              value={customDestination}
              onChange={(e) => setCustomDestination(e.target.value)}
              placeholder="Specify address or venue..."
              className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-parchment-100 border border-parchment-300 text-sm text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
            />
          </div>
        )}
      </div>

      {/* Primary Action Button or Manual Fallback */}
      {!locationDenied ? (
        <div className="space-y-3">
          <button
            onClick={handleRequestRide}
            disabled={isLocating}
            className="w-full min-h-[52px] py-4 px-6 rounded-2xl bg-terracotta-festival hover:bg-terracotta-dark text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-card active:scale-[0.98] transition-all disabled:opacity-75"
          >
            <Navigation className={`w-5 h-5 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Finding your location..." : "Request a Ride"}</span>
          </button>

          <p className="text-center text-[11px] text-ink-muted">
            We&apos;ll ask for location permission to generate a precise map pin for the driver.
          </p>

          <div className="text-center pt-1">
            <button
              onClick={() => setLocationDenied(true)}
              className="text-xs text-ink-muted hover:text-teal-festival underline"
            >
              Choose my pickup point manually instead
            </button>
          </div>
        </div>
      ) : (
        /* Manual Pickup Selector when location is denied/unavailable */
        <div className="bg-parchment-50 rounded-2xl p-5 border border-parchment-300 shadow-subtle space-y-3.5 animate-in fade-in">
          <div className="flex items-center gap-2 text-teal-festival">
            <MapPin className="w-4 h-4 text-terracotta-festival" />
            <h2 className="font-serif font-bold text-sm">
              Choose my pickup point
            </h2>
          </div>

          <p className="text-xs text-ink-muted">
            Select which festival venue you are currently at:
          </p>

          <select
            value={manualPickup}
            onChange={(e) => {
              setManualPickup(e.target.value);
              setErrorMessage(null);
            }}
            className="w-full min-h-[44px] py-2.5 px-3 rounded-xl bg-parchment-100 border border-parchment-300 text-sm text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
          >
            <option value="">Select pickup venue...</option>
            {venues.map((v) => (
              <option key={v.id} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>

          {errorMessage && (
            <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
          )}

          <button
            onClick={handleManualPickupRequest}
            disabled={!manualPickup}
            className="w-full min-h-[48px] py-3 px-5 rounded-xl bg-terracotta-festival hover:bg-terracotta-dark text-white text-sm font-bold flex items-center justify-center gap-2 shadow-card active:scale-[0.98] transition-all disabled:opacity-50"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Open WhatsApp with Driver</span>
          </button>
        </div>
      )}

      {/* Shuttle Info Note */}
      <div className="bg-parchment-100 p-4 rounded-2xl border border-parchment-300 text-xs text-ink-festival space-y-1.5 leading-relaxed">
        <strong className="font-bold text-teal-festival block">
          Festival Shuttle Information:
        </strong>
        <p className="text-ink-muted">
          Shuttle service operates between official festival venues throughout operating hours. Drivers accept ride requests directly via WhatsApp ({FESTIVAL_CONFIG.displayShuttlePhone}).
        </p>
      </div>
    </div>
  );
}
