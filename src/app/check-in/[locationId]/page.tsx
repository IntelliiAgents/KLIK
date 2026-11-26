"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { repository } from "@/lib/db/repository";
import {
  hasCheckedInLocation,
  getOrCreateParticipantId,
  getParticipantName,
  setParticipantName as persistParticipantName,
} from "@/lib/db/idb";
import {
  VenueLocation,
  CheckIn,
  ChallengeProgress,
  FestivalEvent,
} from "@/lib/types";
import { getVenueCheckInAvailability } from "@/lib/quest/schedule";
import {
  QUEST_CONFIG,
  buildPrizeDrawWhatsAppUrl,
  buildSelfieVerificationWhatsAppUrl,
} from "@/lib/config";
import { SponsorShowcase } from "@/components/Sponsors/SponsorShowcase";
import { trackEvent } from "@/lib/analytics";
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Award,
  RefreshCw,
  ArrowLeft,
  WifiOff,
  LocateFixed,
  MessageCircle,
  Camera,
  Copy,
  Check,
  QrCode,
  HelpCircle,
} from "lucide-react";
import confetti from "canvas-confetti";

function CheckInContent() {
  const params = useParams();
  const searchParams = useSearchParams();

  const locationId = params?.locationId as string;
  const qrToken = (searchParams.get("token") || "").trim();
  const manualApprovalToken = (searchParams.get("manual_approval") || "").trim();

  const [venue, setVenue] = useState<VenueLocation | null>(null);
  const [events, setEvents] = useState<FestivalEvent[]>([]);
  const [progress, setProgress] = useState<ChallengeProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isGpsChecking, setIsGpsChecking] = useState<boolean>(false);
  const [alreadyCheckedIn, setAlreadyCheckedIn] = useState<boolean>(false);
  const [completedCheckIn, setCompletedCheckIn] = useState<CheckIn | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showSelfieHelp, setShowSelfieHelp] = useState<boolean>(false);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [participantName, setParticipantName] = useState<string>("");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const hasValidQrToken = Boolean(
    venue && qrToken && qrToken === venue.qrCodeToken
  );

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
    setParticipantName(getParticipantName());

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const init = async () => {
      if (!locationId) {
        setLoading(false);
        return;
      }
      try {
        const [v, hasAlready, pr, allEvts] = await Promise.all([
          repository.getVenueById(locationId),
          hasCheckedInLocation(locationId),
          repository.calculateQuestProgress(),
          repository.getEvents(),
        ]);
        setVenue(v);
        setAlreadyCheckedIn(hasAlready);
        setProgress(pr);
        setEvents(allEvts);

        // If participant arrived via an organiser-signed manual approval link, redeem automatically
        if (v && !hasAlready && manualApprovalToken) {
          const pid = getOrCreateParticipantId();
          const result = await repository.redeemManualApprovalLink(
            locationId,
            manualApprovalToken,
            pid
          );
          if (result.success && result.checkIn) {
            setCompletedCheckIn(result.checkIn);
            setAlreadyCheckedIn(true);
            if (result.progress) setProgress(result.progress);
            try {
              confetti({
                particleCount: result.isQuestJustCompleted ? 80 : 50,
                spread: 60,
                origin: { y: 0.7 },
                colors: ["#263E47", "#D75A35", "#D9A13E"],
              });
            } catch {
              // ignore
            }
          } else {
            setErrorMessage(result.message);
          }
        }
      } catch (err) {
        console.error("Check-in load error:", err);
        setErrorMessage("Unable to load location details.");
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [locationId, manualApprovalToken]);

  // Method A — Existing QR Code Check-In
  const handleConfirmQrCheckIn = async () => {
    if (!locationId || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const pid = getOrCreateParticipantId();
      const result = await repository.submitCheckIn(locationId, qrToken, pid);

      if (result.success && result.checkIn) {
        setCompletedCheckIn(result.checkIn);
        setAlreadyCheckedIn(true);
        if (result.progress) {
          setProgress(result.progress);
        } else {
          setProgress(await repository.calculateQuestProgress());
        }
        try {
          confetti({
            particleCount: result.isQuestJustCompleted ? 80 : 50,
            spread: 65,
            origin: { y: 0.7 },
            colors: ["#263E47", "#D75A35", "#D9A13E"],
          });
        } catch {
          // ignore
        }
      } else {
        setErrorMessage(result.message);
        if (result.alreadyCheckedIn && result.checkIn) {
          setCompletedCheckIn(result.checkIn);
          setAlreadyCheckedIn(true);
        }
        if (result.progress) setProgress(result.progress);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to record check-in.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Method B — GPS Location Check-In
  const handleGpsCheckIn = () => {
    if (!venue || isGpsChecking) return;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setErrorMessage(
        "Your browser does not support GPS check-in. Please scan the venue QR code or submit a selfie via WhatsApp below."
      );
      setShowSelfieHelp(true);
      return;
    }

    setIsGpsChecking(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const pid = getOrCreateParticipantId();
          const result = await repository.submitGpsCheckIn(
            venue.id,
            {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
            },
            pid
          );
          if (result.success && result.checkIn) {
            setCompletedCheckIn(result.checkIn);
            setAlreadyCheckedIn(true);
            if (result.progress) setProgress(result.progress);
            try {
              confetti({
                particleCount: result.isQuestJustCompleted ? 80 : 50,
                spread: 65,
                origin: { y: 0.7 },
                colors: ["#263E47", "#D75A35", "#D9A13E"],
              });
            } catch {
              // ignore
            }
          } else {
            setErrorMessage(result.message);
            if (!result.alreadyCheckedIn) {
              setShowSelfieHelp(true);
            }
          }
        } catch {
          setErrorMessage(
            "Unable to verify your GPS location. Try again or submit a selfie via WhatsApp below."
          );
          setShowSelfieHelp(true);
        } finally {
          setIsGpsChecking(false);
        }
      },
      (err) => {
        setIsGpsChecking(false);
        setErrorMessage(
          err.code === err.PERMISSION_DENIED
            ? "Location permission was denied. Please enable location access or submit a selfie via WhatsApp below."
            : "Could not obtain an accurate GPS signal. Step outdoors and try again, or submit a selfie via WhatsApp below."
        );
        setShowSelfieHelp(true);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleCopyCode = async () => {
    const code = progress?.rewardDrawTicketNumber;
    if (!code) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleNameChange = (val: string) => {
    setParticipantName(val);
    persistParticipantName(val);
  };

  if (loading) {
    return (
      <div className="py-16 text-center space-y-3">
        <div className="w-8 h-8 rounded-full border-3 border-teal-festival border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-ink-muted">Verifying KLiK Quest checkpoint...</p>
      </div>
    );
  }

  if (!venue) {
    return (
      <div className="bg-parchment-50 rounded-3xl p-6 text-center border border-dashed border-parchment-300 space-y-4 max-w-sm mx-auto">
        <AlertTriangle className="w-10 h-10 text-amber-600 mx-auto" />
        <h2 className="font-serif font-bold text-lg text-teal-festival">
          Location Not Found
        </h2>
        <p className="text-xs text-ink-muted">
          The scanned code does not match an active KLiK 2026 participating venue.
        </p>
        <Link
          href="/quest"
          className="inline-flex min-h-[44px] items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-festival text-white text-xs font-semibold"
        >
          <Award className="w-4 h-4" />
          <span>View KLiK Quest Locations</span>
        </Link>
      </div>
    );
  }

  const participantId = progress?.participantId || getOrCreateParticipantId();
  const availability = getVenueCheckInAvailability(venue.id, events);
  const completedCount = progress?.totalCheckInsCount || 0;
  const targetCount = QUEST_CONFIG.requiredLocations;
  const isQuestCompleted = Boolean(
    progress?.isCompleted && progress?.rewardDrawTicketNumber
  );
  const uniqueCode = progress?.rewardDrawTicketNumber || "";

  const selfieWhatsAppUrl = buildSelfieVerificationWhatsAppUrl({
    participantName,
    participantId,
    establishmentName: venue.name,
  });

  const competitionWhatsAppUrl = uniqueCode
    ? buildPrizeDrawWhatsAppUrl({
        ticketNumber: uniqueCode,
        participantName,
      })
    : "";

  return (
    <div className="space-y-5 pb-8 max-w-md mx-auto animate-in fade-in duration-300">
      {/* Back button */}
      <Link
        href="/quest"
        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-festival hover:text-teal-light"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to KLiK Quest</span>
      </Link>

      {/* Main Check-In Card */}
      <div className="bg-parchment-50 rounded-3xl p-5 sm:p-6 border border-parchment-300 shadow-card text-center relative overflow-hidden space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-parchment-200/90 p-2 flex items-center justify-center mx-auto border border-parchment-300 shadow-xs">
          <Image
            src="/assets/klik-round-logo-128.png"
            alt="Official KLiK Quest Checkpoint Emblem"
            width={56}
            height={56}
            className="w-full h-full object-contain"
          />
        </div>

        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-parchment-200 text-terracotta-festival">
            KLiK Quest Checkpoint
          </span>
          <h1 className="font-serif font-black text-xl sm:text-2xl text-teal-festival">
            {venue.name}
          </h1>
          <p className="text-xs text-ink-muted flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-terracotta-festival shrink-0" />
            <span>{venue.address}</span>
          </p>
        </div>

        {/* Offline Indicator */}
        {!isOnline && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              You are offline. Your check-in will be safely stored on your device and
              synced when reconnected.
            </span>
          </div>
        )}

        {/* Checked-In / Confirmed State */}
        {completedCheckIn || alreadyCheckedIn ? (
          <div className="space-y-4 pt-1">
            <div className="p-4 rounded-2xl bg-olive-festival/12 border border-olive-festival/30 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-olive-festival mx-auto" />
              <h2 className="font-serif font-bold text-lg text-teal-festival">
                {completedCheckIn ? "Check-In Confirmed!" : "Already Checked In"}
              </h2>
              <p className="text-xs text-ink-muted">
                {completedCheckIn?.syncStatus === "captured_offline"
                  ? "Saved on your device and added to your KLiK Quest progress!"
                  : "Your verified visit at this location is recorded toward the KLiK Quest."}
              </p>

              {/* Updated Progress Indicator */}
              <div className="pt-2 border-t border-olive-festival/20 space-y-1.5">
                <p className="text-xs font-bold text-teal-festival">
                  Your KLiK Quest Progress: {Math.min(completedCount, targetCount)} of{" "}
                  {targetCount} locations completed
                </p>
                <div className="w-full h-2 rounded-full bg-parchment-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-terracotta-festival transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round((completedCount / targetCount) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* If 5th Location Completed — Show Immediate Congratulatory Entry Code */}
            {isQuestCompleted && (
              <div className="p-4 rounded-2xl bg-white border-2 border-mustard-festival/60 text-center space-y-3 shadow-subtle">
                <span className="px-2.5 py-0.5 rounded-full bg-mustard-festival text-teal-dark text-[10px] font-black uppercase tracking-wider">
                  Congratulations! {QUEST_CONFIG.formattedPrizeValue} in Prizes
                </span>
                <p className="text-xs text-ink-festival leading-relaxed">
                  You&apos;ve completed {targetCount} participating locations! Here is
                  your unique competition entry code:
                </p>
                <div className="p-3 rounded-xl bg-parchment-100 border border-parchment-300 space-y-1.5">
                  <span className="font-mono font-black text-xl text-teal-festival tracking-wider block select-all">
                    {uniqueCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="min-h-[34px] px-3 py-1 rounded-lg bg-white border border-parchment-300 text-teal-festival text-xs font-bold inline-flex items-center gap-1"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-olive-festival" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Optional: Your name for WhatsApp entry"
                  aria-label="Your name for WhatsApp entry"
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-parchment-50 border border-parchment-300 text-xs text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
                />

                <a
                  href={competitionWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent("quest_entry_whatsapp_click", {
                      source: "checkin_completion",
                    })
                  }
                  className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-[#1E7E45] hover:bg-[#186838] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>Submit My Competition Entry via WhatsApp</span>
                </a>
                <p className="text-[11px] text-ink-muted">
                  Remember to tap Send in WhatsApp to submit your entry.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/quest"
                className="w-full min-h-[46px] py-3 px-4 rounded-xl bg-teal-festival hover:bg-teal-light text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Award className="w-4 h-4 text-mustard-light" />
                <span>View My KLiK Quest Progress</span>
              </Link>

              <Link
                href="/programme"
                className="w-full min-h-[42px] py-2.5 px-4 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-teal-festival font-semibold text-xs flex items-center justify-center transition-colors"
              >
                Browse Festival Programme
              </Link>
            </div>
          </div>
        ) : (
          /* Unchecked State: Method A (valid QR), Method B (GPS), Method C (WhatsApp Selfie) */
          <div className="space-y-4 pt-1">
            {errorMessage && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs text-left leading-relaxed"
              >
                {errorMessage}
              </div>
            )}

            {!availability.isOpen ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2 text-left">
                <strong className="font-bold text-sm text-teal-festival block">
                  Check-In Opens When This Venue Goes Live
                </strong>
                <p className="leading-relaxed">{availability.message}</p>
                {availability.nextOpenLabel && (
                  <p className="font-semibold text-teal-festival">
                    Next live window: {availability.nextOpenLabel}
                  </p>
                )}
              </div>
            ) : hasValidQrToken ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-olive-festival/10 border border-olive-festival/25 text-xs text-teal-festival flex items-center justify-center gap-2">
                  <QrCode className="w-4 h-4 text-olive-festival shrink-0" />
                  <span className="font-semibold">
                    Official KLiK QR code verified for this location!
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmQrCheckIn}
                  disabled={isSubmitting}
                  className="w-full min-h-[50px] py-3.5 px-4 rounded-xl bg-terracotta-festival hover:bg-terracotta-dark text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98] disabled:opacity-50"
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
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-ink-muted leading-relaxed">
                  To check in at <strong className="text-teal-festival">{venue.name}</strong>,
                  scan the official KLiK QR poster displayed at the venue — or use GPS
                  location verification below if you are already on site.
                </p>

                <button
                  type="button"
                  onClick={handleGpsCheckIn}
                  disabled={isGpsChecking}
                  className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-teal-festival hover:bg-teal-light text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-60"
                >
                  {isGpsChecking ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying your location...</span>
                    </>
                  ) : (
                    <>
                      <LocateFixed className="w-4 h-4" />
                      <span>Check In Using My Location</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Method C — Having trouble checking in? */}
            <div className="pt-2 border-t border-parchment-200 text-left space-y-2.5">
              <button
                type="button"
                onClick={() => setShowSelfieHelp((prev) => !prev)}
                className="w-full min-h-[38px] text-xs font-semibold text-terracotta-festival hover:underline flex items-center justify-center gap-1.5"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Having trouble checking in?</span>
              </button>

              {showSelfieHelp && (
                <div className="p-4 rounded-2xl bg-white border border-parchment-300 space-y-3 text-xs">
                  <div className="flex items-start gap-2">
                    <Camera className="w-4 h-4 text-terracotta-festival shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <strong className="font-bold text-teal-festival block">
                        Submit Photographic Proof via WhatsApp
                      </strong>
                      <p className="text-ink-muted leading-relaxed">
                        Send a selfie with the venue&apos;s displayed KLiK Quest QR
                        code, or a selfie with an owner, manager, representative or
                        recognised staff member (with their consent).
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5 leading-relaxed">
                    <strong>Attach your selfie in WhatsApp before sending.</strong>{" "}
                    Opening WhatsApp does not automatically submit a photo or complete
                    your check-in — it remains pending until manually approved.
                  </p>

                  <a
                    href={selfieWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      repository.submitManualVerificationRequest(
                        venue.id,
                        participantName,
                        participantId
                      );
                    }}
                    className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-[#1E7E45] hover:bg-[#186838] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>Submit Proof via WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tasteful Sponsor Exposure when Quest is Completed */}
      {isQuestCompleted && (
        <SponsorShowcase variant="compact" placement="checkin_completion" />
      )}
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
