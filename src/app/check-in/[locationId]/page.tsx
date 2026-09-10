"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { repository } from "@/lib/db/repository";
import { hasCheckedInLocation, getOrCreateParticipantId } from "@/lib/db/idb";
import { VenueLocation, CheckIn, CheckInSyncStatus } from "@/lib/types";
import {
  QrCode,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Award,
  RefreshCw,
  ArrowLeft,
  WifiOff,
  Navigation,
} from "lucide-react";
import confetti from "canvas-confetti";

function CheckInContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const locationId = params?.locationId as string;
  const token = searchParams.get("token") || "standard-token";

  const [venue, setVenue] = useState<VenueLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState<boolean>(false);
  const [completedCheckIn, setCompletedCheckIn] = useState<CheckIn | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const checkStatus = async () => {
      if (!locationId) return;
      try {
        const v = await repository.getVenueById(locationId);
        setVenue(v);

        const hasAlready = await hasCheckedInLocation(locationId);
        setAlreadyCheckedIn(hasAlready);
      } catch (err) {
        console.error("Check-in load error:", err);
        setErrorMessage("Unable to find location details.");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, [locationId]);

  const handleConfirmCheckIn = async () => {
    if (!locationId || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const pid = getOrCreateParticipantId();
      const result = await repository.submitCheckIn(locationId, token, pid);

      if (result.success) {
        setCompletedCheckIn(result.checkIn);
        setAlreadyCheckedIn(true);
        // Trigger small celebration confetti
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ["#133D4B", "#C8522C", "#DE9E36"],
          });
        } catch {
          // ignore
        }
      } else {
        setErrorMessage(result.message);
        if (result.checkIn) {
          setCompletedCheckIn(result.checkIn);
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to record check-in.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-ink-muted">Verifying festival checkpoint...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="bg-parchment-50 rounded-3xl p-6 text-center border border-dashed border-parchment-300 space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
        <h2 className="font-serif font-bold text-lg text-teal-festival">
          Location Not Found
        </h2>
        <p className="text-xs text-ink-muted">
          The scanned code does not match an active KliK 2026 festival venue.
        </p>
        <Link
          href="/map"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-festival text-white text-xs font-semibold"
        >
          <MapPin className="w-4 h-4" />
          <span>Browse Festival Venues</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6 max-w-sm mx-auto animate-in fade-in duration-300">
      {/* Back button */}
      <Link
        href="/quest"
        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-festival hover:text-teal-light"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to KliK Quest</span>
      </Link>

      {/* Main Check-In Card */}
      <div className="bg-parchment-50 rounded-3xl p-6 border border-parchment-300 shadow-card text-center relative overflow-hidden">
        {/* Top Emblem Checkpoint Stamp */}
        <div className="w-16 h-16 rounded-2xl bg-parchment-200/90 p-2 flex items-center justify-center mx-auto mb-3 border border-parchment-300 shadow-xs">
          <Image
            src="/assets/klik-round-logo-128.png"
            alt="Official KliK Checkpoint Emblem"
            width={56}
            height={56}
            className="w-full h-full object-contain"
          />
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-parchment-200 text-terracotta-festival">
          {venue.category} Checkpoint
        </span>

        <h1 className="font-serif font-black text-xl sm:text-2xl text-teal-festival mt-1 mb-1">
          {venue.name}
        </h1>

        <p className="text-xs text-ink-muted flex items-center justify-center gap-1 mb-4">
          <MapPin className="w-3.5 h-3.5 text-terracotta-festival shrink-0" />
          <span>{venue.address}</span>
        </p>

        {/* Offline Warning indicator if device is currently offline */}
        {!isOnline && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>You are offline. Your check-in will be safely stored locally.</span>
          </div>
        )}

        {/* Success / Already Checked-In State */}
        {completedCheckIn || alreadyCheckedIn ? (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-2xl bg-eucalyptus-festival/15 border border-eucalyptus-festival/30 text-eucalyptus-dark space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-eucalyptus-festival/20 p-1 flex items-center justify-center">
                <Image
                  src="/assets/klik-round-logo-128.png"
                  alt="Verified KliK Stamp"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-serif font-bold text-base text-teal-festival">
                {completedCheckIn ? "Check-In Confirmed!" : "Already Checked In"}
              </h3>
              <p className="text-xs text-ink-muted">
                {completedCheckIn?.syncStatus === "captured_offline"
                  ? "Captured offline on this device. It will automatically synchronize when connectivity returns."
                  : "Your presence at this venue has been verified and recorded toward The KliK Culture Trail."}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link
                href="/quest"
                className="w-full py-3 px-4 rounded-xl bg-teal-festival hover:bg-teal-light text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Award className="w-4 h-4 text-mustard-light" />
                <span>View KliK Quest Progress</span>
              </Link>

              <Link
                href="/programme"
                className="w-full py-2.5 px-4 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-teal-festival font-semibold text-xs transition-colors"
              >
                Explore More Programme Sessions
              </Link>
            </div>
          </div>
        ) : (
          /* Confirmation Prompt State */
          <div className="space-y-4 pt-2">
            <p className="text-xs text-ink-muted leading-relaxed">
              Confirm your visit to log this stop toward your Culture Trail explorer progress.
            </p>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {errorMessage}
              </div>
            )}

            <button
              onClick={handleConfirmCheckIn}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-terracotta-festival hover:bg-terracotta-dark text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Recording check-in...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm Venue Check-In</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckInPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-ink-muted">Loading checkpoint...</p>
        </div>
      }
    >
      <CheckInContent />
    </Suspense>
  );
}
