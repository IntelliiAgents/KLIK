"use client";

import React, { useState, useEffect } from "react";
import {
  Challenge,
  ChallengeProgress,
  CheckIn,
  FestivalEvent,
  VenueLocation,
  CheckInVerificationMethod,
} from "@/lib/types";
import {
  getVenueCheckInAvailability,
  isBeforeFestivalLaunch,
} from "@/lib/quest/schedule";
import {
  CheckCircle2,
  Circle,
  Award,
  MapPin,
  Gift,
  MessageCircle,
  User,
  X,
  QrCode,
  LocateFixed,
  Camera,
  Copy,
  Check,
  AlertCircle,
  Clock,
  RefreshCw,
  HelpCircle,
  Sparkles,
  Navigation,
  Bike,
  Waves,
  Trophy,
} from "lucide-react";
import confetti from "canvas-confetti";
import {
  QUEST_CONFIG,
  QUEST_PRIZES,
  QUEST_SPONSORS,
  buildPrizeDrawWhatsAppUrl,
  buildSelfieVerificationWhatsAppUrl,
  buildSponsorWhatsAppUrl,
  getVenueGeofenceRadiusMeters,
} from "@/lib/config";
import { repository } from "@/lib/db/repository";
import {
  getOrCreateParticipantId,
  getParticipantName,
  setParticipantName as persistParticipantName,
  isVerifiedCheckInStatus,
} from "@/lib/db/idb";
import { trackEvent } from "@/lib/analytics";
import { QrScannerModal } from "./QrScannerModal";
import { SponsorShowcase } from "@/components/Sponsors/SponsorShowcase";

interface QuestTrackerProps {
  challenge: Challenge;
  progress: ChallengeProgress;
  checkIns: CheckIn[];
  venues: VenueLocation[];
  events: FestivalEvent[];
  onRefresh: () => Promise<void>;
}

function formatMethodBadge(method?: CheckInVerificationMethod): string {
  if (method === "gps") return "GPS Verified";
  if (method === "manual_whatsapp_selfie" || method === "manual_staff_override") {
    return "Manually Verified";
  }
  return "QR Verified";
}

export const QuestTracker: React.FC<QuestTrackerProps> = ({
  challenge,
  progress,
  checkIns,
  venues,
  events,
  onRefresh,
}) => {
  const beforeFestival = isBeforeFestivalLaunch();
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);
  const [participantName, setParticipantName] = useState("");
  const [copiedCode, setCopiedCode] = useState(false);
  const [openedWhatsAppNote, setOpenedWhatsAppNote] = useState(false);

  // Method A — QR Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Method B — GPS Check-in state (per venue)
  const [gpsLoadingVenueId, setGpsLoadingVenueId] = useState<string | null>(null);
  const [venueFeedback, setVenueFeedback] = useState<
    Record<string, { type: "success" | "error" | "info"; text: string }>
  >({});

  // Method C — Selfie / WhatsApp fallback panel (per venue)
  const [openHelpVenueId, setOpenHelpVenueId] = useState<string | null>(null);

  const completedCount = progress.totalCheckInsCount;
  const targetCount = challenge.requiredCheckInCount || QUEST_CONFIG.requiredLocations;
  const displayCompleted = Math.min(completedCount, targetCount);
  const percentComplete = Math.min(
    100,
    Math.round((completedCount / targetCount) * 100)
  );
  const ticketNumber = progress.rewardDrawTicketNumber || "";

  useEffect(() => {
    setParticipantName(getParticipantName());
  }, []);

  const handleNameChange = (val: string) => {
    setParticipantName(val);
    persistParticipantName(val);
  };

  useEffect(() => {
    if (progress.isCompleted && !hasTriggeredConfetti) {
      setHasTriggeredConfetti(true);
      try {
        // Auto-open celebration modal only on fresh completion in this session
        const seenKey = "klik_quest_celebration_seen";
        if (!sessionStorage.getItem(seenKey)) {
          sessionStorage.setItem(seenKey, "true");
          setShowCelebration(true);
          confetti({
            particleCount: 65,
            spread: 65,
            origin: { y: 0.6 },
            colors: ["#263E47", "#D75A35", "#D9A13E", "#747A57"],
          });
        }
      } catch {
        // ignore
      }
    }
  }, [progress.isCompleted, hasTriggeredConfetti]);

  const verifiedByVenue = new Map<string, CheckIn>();
  const pendingByVenue = new Map<string, CheckIn>();
  for (const c of checkIns) {
    if (isVerifiedCheckInStatus(c.syncStatus)) {
      if (!verifiedByVenue.has(c.locationId)) {
        verifiedByVenue.set(c.locationId, c);
      }
    } else if (
      c.syncStatus === "pending_manual_review" ||
      c.syncStatus === "requires_staff_review"
    ) {
      if (!pendingByVenue.has(c.locationId)) {
        pendingByVenue.set(c.locationId, c);
      }
    }
  }

  const visitedVenueNames = venues
    .filter((v) => verifiedByVenue.has(v.id))
    .map((v) => v.shortName || v.name);

  const whatsAppEntryUrl = ticketNumber
    ? buildPrizeDrawWhatsAppUrl({
        ticketNumber,
        participantName,
        visitedVenues: visitedVenueNames,
      })
    : "";

  const handleCopyCode = async () => {
    if (!ticketNumber) return;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(ticketNumber);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = ticketNumber;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleWhatsAppEntryClick = () => {
    // Do NOT mark message as delivered or sent — only inform user to tap Send in WhatsApp
    setOpenedWhatsAppNote(true);
    trackEvent("quest_entry_whatsapp_click", {
      completedCount,
    });
  };

  // Method B — GPS Location Check-In
  const handleGpsCheckIn = (venue: VenueLocation) => {
    if (gpsLoadingVenueId) return;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setVenueFeedback((prev) => ({
        ...prev,
        [venue.id]: {
          type: "error",
          text: "Your browser does not support GPS location verification. Please scan the venue QR code or use WhatsApp selfie verification below.",
        },
      }));
      setOpenHelpVenueId(venue.id);
      return;
    }

    setGpsLoadingVenueId(venue.id);
    setVenueFeedback((prev) => ({
      ...prev,
      [venue.id]: {
        type: "info",
        text: "Checking your GPS location and accuracy...",
      },
    }));

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

          if (result.success) {
            setVenueFeedback((prev) => ({
              ...prev,
              [venue.id]: { type: "success", text: result.message },
            }));
            setOpenHelpVenueId((curr) => (curr === venue.id ? null : curr));
            await onRefresh();
            try {
              confetti({
                particleCount: result.isQuestJustCompleted ? 80 : 40,
                spread: 60,
                origin: { y: 0.7 },
                colors: ["#263E47", "#D75A35", "#D9A13E"],
              });
            } catch {
              // ignore
            }
            if (result.isQuestJustCompleted) {
              setShowCelebration(true);
            }
          } else {
            setVenueFeedback((prev) => ({
              ...prev,
              [venue.id]: { type: "error", text: result.message },
            }));
            // Offer alternative selfie verification whenever location verification fails
            if (!result.alreadyCheckedIn) {
              setOpenHelpVenueId(venue.id);
            }
          }
        } catch {
          setVenueFeedback((prev) => ({
            ...prev,
            [venue.id]: {
              type: "error",
              text: "Could not complete GPS check-in. Please try again or submit a selfie via WhatsApp below.",
            },
          }));
          setOpenHelpVenueId(venue.id);
        } finally {
          setGpsLoadingVenueId(null);
        }
      },
      (err) => {
        setGpsLoadingVenueId(null);
        let msg =
          "Unable to access your GPS location. Please enable location services or use WhatsApp selfie verification below.";
        if (err.code === err.PERMISSION_DENIED) {
          msg =
            "Location permission was denied. Enable location permission in your browser settings, scan the venue QR code, or submit a selfie via WhatsApp below.";
        } else if (err.code === err.TIMEOUT) {
          msg =
            "GPS signal timed out. Step into an open area and try again, or submit a selfie via WhatsApp below.";
        }
        trackEvent("checkin_method_used", {
          method: "gps",
          status: "failed",
          venueId: venue.id,
          reason: `geo_error_${err.code}`,
        });
        setVenueFeedback((prev) => ({
          ...prev,
          [venue.id]: { type: "error", text: msg },
        }));
        setOpenHelpVenueId(venue.id);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0, // Require fresh GPS reading
      }
    );
  };

  // Method C — Record pending manual verification & open WhatsApp
  const handleManualSelfieWhatsApp = async (venue: VenueLocation) => {
    const pid = getOrCreateParticipantId();
    await repository.submitManualVerificationRequest(venue.id, participantName, pid);
    await onRefresh();
    setVenueFeedback((prev) => ({
      ...prev,
      [venue.id]: {
        type: "info",
        text: "WhatsApp opened. Remember to attach your selfie photo before tapping Send — your check-in stays pending until manually approved.",
      },
    }));
  };

  const participantId = progress.participantId || getOrCreateParticipantId();

  return (
    <div className="space-y-6">
      {/* 1. Promotional Prize Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#1C323A] via-teal-festival to-teal-dark text-parchment-50 p-5 sm:p-6 shadow-card border-2 border-mustard-festival/45 relative overflow-hidden space-y-4">
        <div
          className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-mustard-festival via-terracotta-festival to-olive-light"
          aria-hidden="true"
        />

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-mustard-light">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>EXPLORE. CHECK IN. WIN!</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mustard-festival text-teal-dark text-xs font-black tracking-wide">
            <Trophy className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{QUEST_CONFIG.formattedPrizeValue} IN PRIZES</span>
          </span>
        </div>

        <p className="text-xs sm:text-sm text-parchment-100/95 leading-relaxed">
          Take part in the <strong className="text-white">KLiK Quest Lucky Draw</strong>!
          Explore our participating festival locations and stand a chance to win
          exciting local Kleinmond adventure prizes worth{" "}
          <strong className="text-mustard-light">
            {QUEST_CONFIG.formattedPrizeValue}
          </strong>
          . The Lucky Draw will be held at the conclusion of the KLiK Festival
          (Sunday, 29 November 2026).
        </p>

        {/* Featured Prizes with Activity Photos, Official Logos, Brief Descriptions & WhatsApp Booking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUEST_PRIZES.map((prize) => {
            const sponsor = QUEST_SPONSORS.find((s) => s.id === prize.sponsorId);
            const isDarkEmblem = prize.sponsorId === "emotion-ebike";
            return (
              <div
                key={prize.id}
                className="rounded-2xl bg-white/10 border border-white/20 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {sponsor?.imageUrl && (
                    <div className="relative w-full aspect-[16/9] bg-teal-dark overflow-hidden border-b border-white/15">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sponsor.imageUrl}
                        alt={prize.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-center"
                      />
                      <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-black/60 to-transparent"
                        aria-hidden="true"
                      />
                      {sponsor.logoUrl && (
                        <div
                          className={`absolute bottom-2 left-2.5 shadow-sm overflow-hidden flex items-center justify-center border ${
                            isDarkEmblem
                              ? "w-10 h-10 rounded-full bg-black border-white/60 p-0.5"
                              : "h-10 px-2 py-1 rounded-lg bg-white/95 border-white/80"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={sponsor.logoUrl}
                            alt={`${sponsor.name} logo`}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      )}
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-lg bg-terracotta-festival text-white text-xs font-black shadow-md tabular-time">
                        Worth {prize.formattedValue}
                      </span>
                    </div>
                  )}

                  <div className="p-3.5 space-y-1.5">
                    <div>
                      <h3 className="font-serif font-bold text-sm text-white leading-snug">
                        {prize.title}
                      </h3>
                      <span className="text-[10px] text-mustard-light font-semibold block mt-0.5">
                        Sponsored by {prize.sponsorName}
                      </span>
                    </div>
                    <p className="text-[11px] text-parchment-100/90 leading-relaxed">
                      {prize.briefDescription}
                    </p>
                  </div>
                </div>

                <div className="px-3.5 pb-3.5 pt-0.5">
                  <a
                    href={buildSponsorWhatsAppUrl(prize.sponsorId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackEvent("sponsor_whatsapp_click", {
                        sponsorId: prize.sponsorId,
                        placement: "quest_landing",
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-[11px] font-bold text-mustard-light hover:text-white transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>
                      Want to book or need more info? WhatsApp{" "}
                      {QUEST_CONFIG.whatsappLocalDisplay}
                    </span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-xs text-parchment-200/90 leading-relaxed">
          Visit any {QUEST_CONFIG.requiredLocations} of our{" "}
          {QUEST_CONFIG.totalLocations} participating locations, complete your
          check-ins and submit your unique competition entry code.{" "}
          <strong className="text-white">Adventure awaits!</strong>
        </p>

        {/* How it Works (3 clear steps) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
          <div className="rounded-xl bg-white/10 border border-white/15 p-2.5">
            <strong className="text-mustard-light block font-bold">
              1. Visit 5 of 8 Locations
            </strong>
            <span className="text-parchment-200/90">
              Each distinct verified location counts once.
            </span>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-2.5">
            <strong className="text-mustard-light block font-bold">
              2. Check In 3 Ways
            </strong>
            <span className="text-parchment-200/90">
              Scan QR poster, verify by GPS, or send a WhatsApp selfie.
            </span>
          </div>
          <div className="rounded-xl bg-white/10 border border-white/15 p-2.5">
            <strong className="text-mustard-light block font-bold">
              3. Submit Entry Code
            </strong>
            <span className="text-parchment-200/90">
              Unlock your unique code after 5 check-ins &amp; enter via WhatsApp.
            </span>
          </div>
        </div>
      </div>

      {/* 2. KLiK Quest Progress Card */}
      <div className="bg-parchment-50 rounded-3xl p-5 sm:p-6 border border-parchment-300 shadow-subtle space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-festival">
              Live Progress • Saved On Your Device
            </span>
            <h2 className="font-serif font-black text-lg sm:text-2xl text-teal-festival leading-tight">
              Your KLiK Quest Progress: {displayCompleted} of {targetCount} locations
              completed
            </h2>
            <p className="text-xs text-ink-muted">
              {progress.isCompleted
                ? "Congratulations! You have qualified for the KLiK Quest competition."
                : `Complete ${Math.max(
                    0,
                    targetCount - completedCount
                  )} more distinct participating location${
                    targetCount - completedCount === 1 ? "" : "s"
                  } to unlock your unique competition entry code.`}
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-olive-festival/15 p-2 flex items-center justify-center shrink-0">
            <Award className="w-7 h-7 text-olive-festival" aria-hidden="true" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-3 rounded-full bg-parchment-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-terracotta-festival transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
              role="progressbar"
              aria-valuenow={percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Your KLiK Quest Progress: ${displayCompleted} of ${targetCount} locations completed`}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-ink-muted flex-wrap gap-1">
            <span>
              {completedCount} verified location{completedCount === 1 ? "" : "s"} (out
              of {venues.length} participating)
            </span>
            <span className="font-semibold text-teal-festival">
              {progress.isCompleted
                ? "Qualified!"
                : `${Math.max(0, targetCount - completedCount)} remaining`}
            </span>
          </div>

          {pendingByVenue.size > 0 && (
            <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0 text-amber-700" aria-hidden="true" />
              <span>
                {pendingByVenue.size} location
                {pendingByVenue.size === 1 ? "" : "s"} pending manual WhatsApp selfie
                approval (pending check-ins count once approved).
              </span>
            </p>
          )}
        </div>

        {/* Method A Primary Scanner Action */}
        {!progress.isCompleted && (
          <div className="pt-1 space-y-2">
            {beforeFestival ? (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 leading-relaxed">
                <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <strong className="font-bold block text-teal-festival">
                    Check-Ins Unlock When Festival Events Go Live
                  </strong>
                  <span>
                    KLiK 2026 opens Friday, 27 November at 16:00. Each venue unlocks
                    for check-in once its scheduled event goes live (15 min before
                    start).
                  </span>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-teal-festival hover:bg-teal-light text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] transition-all"
              >
                <QrCode className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Scan Venue QR Code (Preferred Method)</span>
              </button>
            )}
          </div>
        )}

        {/* Competition Completion & Unique Entry Code Card */}
        {progress.isCompleted && ticketNumber && (
          <div className="p-4 sm:p-5 rounded-2xl bg-parchment-100 border-2 border-olive-festival/40 space-y-4 mt-2">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs font-bold text-olive-dark">
                <Gift className="w-4 h-4 text-terracotta-festival shrink-0" />
                <span>Congratulations! You&apos;ve Qualified for {QUEST_CONFIG.formattedPrizeValue} in Prizes</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-olive-festival text-white">
                Qualified
              </span>
            </div>

            {/* Unique Entry Code Display + Copy Button */}
            <div className="bg-white p-4 rounded-xl border border-parchment-300 text-center space-y-2 shadow-2xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-ink-muted block">
                Your Unique Competition Entry Code
              </span>
              <span
                className="font-mono font-black text-xl sm:text-2xl text-teal-festival tracking-wider block select-all"
                data-testid="quest-unique-code"
              >
                {ticketNumber}
              </span>

              <div className="flex items-center justify-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-teal-festival text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-olive-festival" />
                      <span>Code Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-ink-muted leading-relaxed">
                This code stays permanently saved on your device so you can retrieve or
                copy it anytime, even if WhatsApp is unavailable.
              </p>
            </div>

            {/* Optional Participant Name Input */}
            <div className="space-y-1">
              <label
                htmlFor="quest-inline-participant-name"
                className="block text-[11px] font-bold uppercase tracking-wider text-teal-festival"
              >
                Your Name (Optional — included in your WhatsApp entry)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="quest-inline-participant-name"
                  type="text"
                  value={participantName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Sarah van der Merwe"
                  className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-parchment-300 text-xs sm:text-sm text-ink-festival placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-teal-festival"
                />
              </div>
            </div>

            {/* Primary Competition Entry WhatsApp CTA */}
            <div className="flex flex-col gap-2">
              <a
                href={whatsAppEntryUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppEntryClick}
                className="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#1E7E45] hover:bg-[#186838] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Submit My Competition Entry via WhatsApp</span>
              </a>

              {openedWhatsAppNote && (
                <p className="text-[11px] text-teal-festival bg-teal-festival/5 border border-teal-festival/20 rounded-xl px-3 py-2 leading-relaxed">
                  WhatsApp was opened with your competition entry ready.{" "}
                  <strong>Make sure you tap Send inside WhatsApp</strong> to complete
                  your entry (WhatsApp number: {QUEST_CONFIG.whatsappIntlDisplay}).
                </p>
              )}

              <button
                type="button"
                onClick={() => setShowCelebration(true)}
                className="w-full min-h-[42px] py-2 px-3.5 rounded-xl bg-teal-festival hover:bg-teal-light text-white text-xs font-bold transition-colors"
              >
                Open Full-Screen Competition Ticket
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Tasteful Compact Sponsor Placement on Progress Page */}
      <SponsorShowcase variant="compact" placement="quest_progress" />

      {/* 4. All 8 Participating Establishments with 3 Check-In Methods */}
      <section className="space-y-3" aria-labelledby="quest-locations-heading">
        <div className="flex items-end justify-between gap-2 flex-wrap">
          <div>
            <span className="editorial-kicker">
              Visit Any {targetCount} of {venues.length}
            </span>
            <h3
              id="quest-locations-heading"
              className="font-serif font-bold text-lg text-teal-festival"
            >
              Participating Festival Locations ({venues.length})
            </h3>
          </div>
          <span className="text-[11px] text-ink-muted font-mono">
            Ref: {participantId}
          </span>
        </div>

        <div className="space-y-3">
          {venues.map((venue) => {
            const verifiedRecord = verifiedByVenue.get(venue.id);
            const pendingRecord = !verifiedRecord
              ? pendingByVenue.get(venue.id)
              : undefined;
            const isVisited = Boolean(verifiedRecord);
            const isPending = Boolean(pendingRecord);
            const isGpsLoading = gpsLoadingVenueId === venue.id;
            const feedback = venueFeedback[venue.id];
            const isHelpOpen = openHelpVenueId === venue.id;
            const radiusM = getVenueGeofenceRadiusMeters(venue.id);
            const availability = getVenueCheckInAvailability(venue.id, events);
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${venue.latitude},${venue.longitude}`;

            const selfieWhatsAppUrl = buildSelfieVerificationWhatsAppUrl({
              participantName,
              participantId,
              establishmentName: venue.name,
            });

            return (
              <article
                key={venue.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  isVisited
                    ? "bg-olive-festival/8 border-olive-festival/30"
                    : isPending
                    ? "bg-amber-50/70 border-amber-300"
                    : "bg-parchment-50 border-parchment-300 shadow-subtle"
                }`}
              >
                {/* Header row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isVisited
                          ? "bg-olive-festival text-white"
                          : isPending
                          ? "bg-amber-500 text-white"
                          : "bg-parchment-200 text-ink-muted"
                      }`}
                    >
                      {isVisited ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isPending ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <Circle className="w-4 h-4 stroke-[1.5]" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h4 className="font-serif font-bold text-sm sm:text-base text-teal-festival leading-snug">
                        {venue.name}
                      </h4>
                      <p className="text-xs text-ink-muted flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-terracotta-festival shrink-0" />
                        <span>{venue.address}</span>
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {isVisited ? (
                      <span className="inline-flex flex-col items-end gap-0.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-olive-festival text-white">
                          Visited
                        </span>
                        <span className="text-[10px] text-olive-dark font-medium">
                          {formatMethodBadge(verifiedRecord?.verificationMethod)}
                        </span>
                      </span>
                    ) : isPending ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                        Pending Approval
                      </span>
                    ) : (
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() =>
                          trackEvent("directions_click", {
                            venueId: venue.id,
                            venueName: venue.name,
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-[11px] font-semibold text-teal-festival transition-colors"
                      >
                        <Navigation className="w-3 h-3 text-terracotta-festival" />
                        <span>Directions</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Inline feedback message (GPS result / manual pending status) */}
                {feedback && (
                  <div
                    role="status"
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 leading-relaxed ${
                      feedback.type === "success"
                        ? "bg-olive-festival/15 border border-olive-festival/30 text-olive-dark"
                        : feedback.type === "error"
                        ? "bg-red-50 border border-red-200 text-red-800"
                        : "bg-parchment-100 border border-parchment-300 text-teal-festival"
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{feedback.text}</span>
                  </div>
                )}

                {/* 3 Check-In Methods (for unvisited venues — gated by live event schedule) */}
                {!isVisited && (
                  <div className="space-y-2.5 pt-1 border-t border-parchment-200">
                    {/* Live / Scheduled Window Pill */}
                    <div className="flex items-center justify-between gap-2 flex-wrap text-[11px]">
                      {availability.isOpen ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-olive-festival/15 text-olive-dark font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-olive-festival animate-pulse" />
                          <span>Live Now — Check-In Open</span>
                        </span>
                      ) : availability.nextOpenLabel ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-parchment-200 text-teal-festival font-semibold">
                          <Clock className="w-3 h-3 text-terracotta-festival" />
                          <span>Opens {availability.nextOpenLabel}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-parchment-200 text-ink-muted font-semibold">
                          <Clock className="w-3 h-3" />
                          <span>Scheduled events ended</span>
                        </span>
                      )}
                    </div>

                    {availability.isOpen ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Method A — QR Code (Primary) */}
                        <button
                          type="button"
                          onClick={() => setIsScannerOpen(true)}
                          className="min-h-[44px] py-2 px-3 rounded-xl bg-teal-festival hover:bg-teal-light text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <QrCode className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Scan QR at Venue</span>
                        </button>

                        {/* Method B — GPS Location Check-In */}
                        <button
                          type="button"
                          onClick={() => handleGpsCheckIn(venue)}
                          disabled={Boolean(gpsLoadingVenueId)}
                          className="min-h-[44px] py-2 px-3 rounded-xl bg-parchment-100 hover:bg-parchment-200 text-teal-festival text-xs font-bold flex items-center justify-center gap-1.5 border border-parchment-300 transition-colors disabled:opacity-60"
                        >
                          {isGpsLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                              <span>Verifying GPS...</span>
                            </>
                          ) : (
                            <>
                              <LocateFixed
                                className="w-4 h-4 text-terracotta-festival shrink-0"
                                aria-hidden="true"
                              />
                              <span>Check In Using My Location</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <p className="text-[11px] text-ink-muted bg-parchment-100 border border-parchment-200 rounded-xl px-3 py-2 leading-relaxed">
                        {availability.message}
                      </p>
                    )}

                    {/* Method C Toggle — Having trouble checking in? */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenHelpVenueId(isHelpOpen ? null : venue.id)
                        }
                        aria-expanded={isHelpOpen}
                        className="min-h-[36px] text-xs font-semibold text-terracotta-festival hover:underline inline-flex items-center gap-1.5 py-1"
                      >
                        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Having trouble checking in?</span>
                      </button>
                      <span className="text-[10px] text-ink-muted">
                        GPS area: within {radiusM}m of venue
                      </span>
                    </div>

                    {/* Method C Drawer — Selfie / WhatsApp Manual Verification */}
                    {isHelpOpen && (
                      <div className="p-4 rounded-2xl bg-white border border-parchment-300 space-y-3 text-xs animate-in fade-in">
                        <div className="flex items-start gap-2">
                          <Camera
                            className="w-4 h-4 text-terracotta-festival shrink-0 mt-0.5"
                            aria-hidden="true"
                          />
                          <div className="space-y-1">
                            <strong className="font-bold text-teal-festival block">
                              Selfie / WhatsApp Manual Verification
                            </strong>
                            <p className="text-ink-muted leading-relaxed">
                              If you cannot scan the QR poster or verify your GPS
                              location, send photographic proof of your visit via
                              WhatsApp for manual approval:
                            </p>
                          </div>
                        </div>

                        <ul className="list-disc pl-5 space-y-1 text-ink-festival/90 leading-relaxed">
                          <li>
                            A selfie with the establishment&apos;s displayed KLiK Quest
                            QR code, <strong>or</strong>
                          </li>
                          <li>
                            A selfie with an owner, manager, representative or
                            recognised staff member at the participating
                            establishment, with their consent.
                          </li>
                        </ul>

                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                          <strong>Important:</strong> Tapping the button below opens
                          WhatsApp with your details pre-filled.{" "}
                          <strong>
                            Please attach your selfie photo in WhatsApp before tapping
                            Send.
                          </strong>{" "}
                          Opening WhatsApp does not automatically submit a photo or
                          complete your check-in — your visit remains{" "}
                          <strong>pending manual approval</strong> until verified.
                        </div>

                        <div className="space-y-1">
                          <label
                            htmlFor={`selfie-name-${venue.id}`}
                            className="block text-[10px] font-bold uppercase tracking-wider text-ink-muted"
                          >
                            Your Name (Optional)
                          </label>
                          <input
                            id={`selfie-name-${venue.id}`}
                            type="text"
                            value={participantName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Optional: enter your name"
                            className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-parchment-50 border border-parchment-300 text-xs text-ink-festival focus:outline-none focus:ring-2 focus:ring-teal-festival"
                          />
                        </div>

                        <a
                          href={selfieWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleManualSelfieWhatsApp(venue)}
                          className="w-full min-h-[46px] py-2.5 px-4 rounded-xl bg-[#1E7E45] hover:bg-[#186838] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
                        >
                          <MessageCircle className="w-4 h-4 shrink-0" />
                          <span>Submit Proof via WhatsApp</span>
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {/* QR Scanner Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />

      {/* Competition Completion / Congratulations Modal */}
      {showCelebration && progress.isCompleted && ticketNumber && (
        <div
          className="fixed inset-0 z-50 bg-teal-dark/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quest-celebration-title"
        >
          <div className="bg-parchment-50 w-full max-w-md rounded-3xl p-5 sm:p-6 border border-parchment-300 shadow-2xl text-center space-y-4 animate-in zoom-in-95 relative my-auto max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              aria-label="Close congratulations dialog"
              className="absolute top-4 right-4 min-w-[36px] min-h-[36px] rounded-full text-ink-muted hover:text-ink-festival hover:bg-parchment-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-olive-festival/15 text-olive-dark mx-auto flex items-center justify-center">
              <Award className="w-8 h-8 text-olive-festival" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta-festival block">
                KLiK Quest Completed • {QUEST_CONFIG.formattedPrizeValue} in Prizes
              </span>
              <h3
                id="quest-celebration-title"
                className="font-serif font-black text-2xl text-teal-festival"
              >
                Congratulations!
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                You have verified {displayCompleted} of {targetCount} participating
                locations and qualified to enter the KLiK Quest competition!
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-parchment-300 space-y-2 shadow-2xs">
              <span className="text-ink-muted block text-[10px] uppercase font-bold tracking-wider">
                Your Unique Competition Entry Code
              </span>
              <span className="font-mono font-black text-2xl text-teal-festival tracking-wider block select-all">
                {ticketNumber}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="min-h-[36px] px-3 py-1 rounded-lg bg-parchment-100 hover:bg-parchment-200 border border-parchment-300 text-teal-festival text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
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

            {/* Name Input for WhatsApp Entry */}
            <div className="text-left space-y-1">
              <label
                htmlFor="modal-quest-name"
                className="block text-[11px] font-bold uppercase tracking-wider text-teal-festival"
              >
                Your Name (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="modal-quest-name"
                  type="text"
                  value={participantName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Sarah van der Merwe"
                  className="w-full min-h-[44px] pl-9 pr-3.5 py-2.5 rounded-xl bg-white border border-parchment-300 text-xs sm:text-sm text-ink-festival placeholder:text-ink-muted/60 focus:outline-none focus:ring-2 focus:ring-teal-festival"
                />
              </div>
            </div>

            {/* WhatsApp Entry CTA */}
            <div className="space-y-2">
              <a
                href={whatsAppEntryUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppEntryClick}
                className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-[#1E7E45] hover:bg-[#186838] text-white font-bold text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>Submit My Competition Entry via WhatsApp</span>
              </a>

              <p className="text-[11px] text-ink-muted leading-snug">
                Tap Send in WhatsApp ({QUEST_CONFIG.whatsappIntlDisplay}) to submit
                your entry. Your code remains stored in the app if WhatsApp is
                unavailable.
              </p>
            </div>

            {/* Compact Sponsor Placement on Completion Screen */}
            <div className="text-left pt-1">
              <SponsorShowcase variant="compact" placement="quest_completion" />
            </div>

            <button
              type="button"
              onClick={() => setShowCelebration(false)}
              className="w-full min-h-[42px] py-2.5 px-4 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-teal-festival font-bold text-xs transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
