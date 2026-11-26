// KLiK Quest Live Schedule & Check-In Window Enforcement (SAST / UTC+2)
// Participants may only check in at a venue once an event at that venue is live
// (or manually marked 'happening_now' by an organiser). Pre-festival check-ins are blocked.

import type { FestivalEvent } from "@/lib/types";

// Official festival opening timestamp (SAST = UTC+02:00): Friday 27 Nov 2026, 16:00
// Allow a 15-minute early arrival grace window before each scheduled session starts,
// and a 30-minute grace window after each session ends.
export const FESTIVAL_LAUNCH_WINDOW_START_ISO = "2026-11-27T15:45:00+02:00";
export const FESTIVAL_LAUNCH_WINDOW_START_MS = Date.parse(
  FESTIVAL_LAUNCH_WINDOW_START_ISO
);

const EARLY_ARRIVAL_GRACE_MINUTES = 15;
const POST_EVENT_GRACE_MINUTES = 30;

export interface VenueCheckInAvailability {
  isOpen: boolean;
  reason: "live_now" | "before_festival" | "not_yet_live" | "ended";
  activeEventTitle?: string;
  nextOpenLabel?: string;
  message: string;
}

function parseSastDateTimeMs(dateIso: string, timeHm: string): number {
  return Date.parse(`${dateIso}T${timeHm}:00+02:00`);
}

function formatShortDay(dateIso: string): string {
  if (dateIso === "2026-11-27") return "Fri 27 Nov";
  if (dateIso === "2026-11-28") return "Sat 28 Nov";
  if (dateIso === "2026-11-29") return "Sun 29 Nov";
  return dateIso;
}

/**
 * Checks whether a specific participating venue is currently open for KLiK Quest check-ins
 * based on its scheduled events (or an organiser's manual 'happening_now' status).
 */
export function getVenueCheckInAvailability(
  venueId: string,
  events: FestivalEvent[],
  nowMs: number = Date.now()
): VenueCheckInAvailability {
  const venueEvents = events
    .filter((e) => e.venueId === venueId && e.scheduleStatus !== "cancelled")
    .sort((a, b) => {
      const d = a.date.localeCompare(b.date);
      if (d !== 0) return d;
      return a.startTime.localeCompare(b.startTime);
    });

  // 1. Check if an organiser manually set an event at this venue to 'happening_now'
  // (only honoured once the festival launch window has opened)
  const manuallyLive = venueEvents.find(
    (e) => e.scheduleStatus === "happening_now"
  );
  if (manuallyLive && nowMs >= FESTIVAL_LAUNCH_WINDOW_START_MS) {
    return {
      isOpen: true,
      reason: "live_now",
      activeEventTitle: manuallyLive.title,
      message: `Live now: ${manuallyLive.title} — Check-in is open!`,
    };
  }

  // 2. Check if any scheduled event at this venue is currently live (including grace buffer)
  for (const evt of venueEvents) {
    const startMs =
      parseSastDateTimeMs(evt.date, evt.startTime) -
      EARLY_ARRIVAL_GRACE_MINUTES * 60 * 1000;
    const endMs =
      parseSastDateTimeMs(evt.date, evt.endTime) +
      POST_EVENT_GRACE_MINUTES * 60 * 1000;

    if (nowMs >= startMs && nowMs <= endMs) {
      return {
        isOpen: true,
        reason: "live_now",
        activeEventTitle: evt.title,
        message: `Live now: ${evt.title} (${evt.startTime}–${evt.endTime}) — Check-in is open!`,
      };
    }
  }

  // 3. Find the next upcoming scheduled event at this venue
  const upcoming = venueEvents.find(
    (evt) =>
      parseSastDateTimeMs(evt.date, evt.startTime) -
        EARLY_ARRIVAL_GRACE_MINUTES * 60 * 1000 >
      nowMs
  );

  if (upcoming) {
    const label = `${formatShortDay(upcoming.date)} at ${upcoming.startTime}`;
    const isBeforeFestival = nowMs < FESTIVAL_LAUNCH_WINDOW_START_MS;
    return {
      isOpen: false,
      reason: isBeforeFestival ? "before_festival" : "not_yet_live",
      nextOpenLabel: label,
      message: `Check-in is not open yet. Check-ins at this venue unlock when "${upcoming.title}" goes live on ${label}.`,
    };
  }

  // 4. All scheduled events at this venue have concluded
  return {
    isOpen: false,
    reason: "ended",
    message:
      "All scheduled festival sessions at this venue have concluded. If you visited during a live event and had trouble checking in, use WhatsApp selfie verification.",
  };
}

/**
 * Returns true if the overall KLiK Festival has not yet started.
 */
export function isBeforeFestivalLaunch(nowMs: number = Date.now()): boolean {
  return nowMs < FESTIVAL_LAUNCH_WINDOW_START_MS;
}

/**
 * Returns true if a check-in timestamp was created before official festival launch
 * (i.e. pre-festival testing data that must not count toward the official Lucky Draw).
 */
export function isPreFestivalTimestamp(isoTimestamp?: string | null): boolean {
  if (!isoTimestamp) return false;
  const parsed = Date.parse(isoTimestamp);
  if (Number.isNaN(parsed)) return false;
  return parsed < FESTIVAL_LAUNCH_WINDOW_START_MS;
}
