// KLiK Quest GPS Geofence Verification & Signed Manual Approval Utilities
// Privacy note: User coordinates are evaluated in-memory and NEVER persisted.

import { QUEST_CONFIG, getVenueGeofenceRadiusMeters } from "@/lib/config";
import type { VenueLocation, CheckInVerificationMethod } from "@/lib/types";

export interface GpsVerificationInput {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface GpsVerificationResult {
  verified: boolean;
  reason: "verified" | "poor_accuracy" | "outside_geofence" | "invalid_coordinates";
  distanceMeters: number;
  accuracyMeters: number;
  allowedRadiusMeters: number;
  maxAccuracyMeters: number;
  message: string;
}

const EARTH_RADIUS_METERS = 6371000;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Calculates great-circle distance in metres between two WGS84 coordinates (Haversine formula).
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Validates a participant's reported GPS position against an establishment's verified coordinates,
 * configurable geofence radius, and maximum acceptable GPS accuracy.
 * Does NOT store user coordinates.
 */
export function verifyLocationAgainstVenue(
  position: GpsVerificationInput,
  venue: VenueLocation
): GpsVerificationResult {
  const allowedRadiusMeters =
    venue.geofenceRadiusMeters ?? getVenueGeofenceRadiusMeters(venue.id);
  const maxAccuracyMeters = QUEST_CONFIG.maxGpsAccuracyMeters;

  if (
    !Number.isFinite(position.latitude) ||
    !Number.isFinite(position.longitude) ||
    !Number.isFinite(position.accuracy) ||
    position.latitude < -90 ||
    position.latitude > 90 ||
    position.longitude < -180 ||
    position.longitude > 180 ||
    position.accuracy <= 0
  ) {
    return {
      verified: false,
      reason: "invalid_coordinates",
      distanceMeters: 0,
      accuracyMeters: 0,
      allowedRadiusMeters,
      maxAccuracyMeters,
      message:
        "Your device returned an invalid GPS reading. Please try again outdoors or submit a selfie via WhatsApp.",
    };
  }

  const distanceMeters = Math.round(
    calculateDistanceMeters(
      position.latitude,
      position.longitude,
      venue.latitude,
      venue.longitude
    )
  );
  const accuracyMeters = Math.round(position.accuracy);

  if (accuracyMeters > maxAccuracyMeters) {
    return {
      verified: false,
      reason: "poor_accuracy",
      distanceMeters,
      accuracyMeters,
      allowedRadiusMeters,
      maxAccuracyMeters,
      message: `Your GPS signal accuracy is currently ±${accuracyMeters}m (needs to be within ±${maxAccuracyMeters}m). Step closer to an open area and try again, or use WhatsApp selfie verification below.`,
    };
  }

  if (distanceMeters > allowedRadiusMeters) {
    const distanceLabel =
      distanceMeters >= 1000
        ? `${(distanceMeters / 1000).toFixed(1)} km`
        : `${distanceMeters}m`;
    return {
      verified: false,
      reason: "outside_geofence",
      distanceMeters,
      accuracyMeters,
      allowedRadiusMeters,
      maxAccuracyMeters,
      message: `You appear to be about ${distanceLabel} away from ${venue.shortName || venue.name} (check-in area is within ${allowedRadiusMeters}m). Please move closer to the venue or submit a selfie via WhatsApp if you are already there.`,
    };
  }

  return {
    verified: true,
    reason: "verified",
    distanceMeters,
    accuracyMeters,
    allowedRadiusMeters,
    maxAccuracyMeters,
    message: `Location verified at ${venue.name}!`,
  };
}

// ==========================================
// Signed Manual Approval Link Helpers
// ==========================================
// Allows an authenticated organiser to send a verifiable single-location approval link
// back to a participant over WhatsApp when operating in offline-first / local-first mode.

const MANUAL_APPROVAL_SECRET_NAMESPACE = "klik2026::manual_checkin_approval::v1";

export interface ManualApprovalPayload {
  pid: string;
  loc: string;
  m: CheckInVerificationMethod;
  by: string;
  ts: number;
}

async function computeApprovalSignature(payloadBase64: string): Promise<string> {
  const input = `${MANUAL_APPROVAL_SECRET_NAMESPACE}::${payloadBase64}`;
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(input);
    const hash = await crypto.subtle.digest("SHA-256", data);
    const bytes = Array.from(new Uint8Array(hash));
    return bytes
      .slice(0, 12)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback deterministic hash if SubtleCrypto unavailable in non-secure context
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function encodeBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeBase64Url(b64url: string): string {
  const padded =
    b64url.replace(/-/g, "+").replace(/_/g, "/") +
    "===".slice((b64url.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export async function createManualApprovalToken(
  payload: Omit<ManualApprovalPayload, "ts">
): Promise<string> {
  const fullPayload: ManualApprovalPayload = {
    ...payload,
    ts: Date.now(),
  };
  const encoded = encodeBase64Url(JSON.stringify(fullPayload));
  const sig = await computeApprovalSignature(encoded);
  return `${encoded}.${sig}`;
}

export async function verifyManualApprovalToken(
  token: string,
  expectedLocationId: string
): Promise<{ valid: boolean; payload?: ManualApprovalPayload; error?: string }> {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) {
      return { valid: false, error: "Invalid approval token format." };
    }
    const [encoded, sig] = parts;
    const expectedSig = await computeApprovalSignature(encoded);
    if (sig !== expectedSig) {
      return { valid: false, error: "Manual approval signature could not be verified." };
    }
    const decoded = JSON.parse(decodeBase64Url(encoded)) as ManualApprovalPayload;
    if (!decoded.pid || !decoded.loc || decoded.loc !== expectedLocationId) {
      return {
        valid: false,
        error: "This approval link does not match this festival location.",
      };
    }
    // Tokens remain valid across the festival weekend (14 days)
    const maxAgeMs = 14 * 24 * 60 * 60 * 1000;
    if (Date.now() - decoded.ts > maxAgeMs) {
      return { valid: false, error: "This manual approval link has expired." };
    }
    return { valid: true, payload: decoded };
  } catch {
    return { valid: false, error: "Unable to read manual approval link." };
  }
}
