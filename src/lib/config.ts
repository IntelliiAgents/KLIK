// KliK 2026 Application Configuration
import type { QuestSponsor } from "./types";

export const QUEST_CONFIG = {
  name: "KLiK Quest",
  subtitle: "Culture Trail Competition",
  // Central prize value configuration (R1,700 E-Bike + R600 Kayaking = R2,300)
  totalPrizeValue: 2300,
  formattedPrizeValue: "R2,300",
  requiredLocations: 5,
  totalLocations: 8,
  // Official KLiK Quest competition & verification WhatsApp contact
  whatsappLocalDisplay: "079 698 1395",
  whatsappIntlDisplay: "+27 79 698 1395",
  whatsappE164: "+27796981395",
  whatsappApiNumber: "27796981395",
  whatsappBaseUrl: "https://wa.me/27796981395",
  // GPS location check-in geofence & accuracy thresholds (configurable per venue)
  defaultGeofenceRadiusMeters: 150,
  maxGpsAccuracyMeters: 150,
  venueGeofenceOverrides: {
    "loc-the-shed": 150,
    "loc-town-hall": 150,
    "loc-main-beach": 250,
    "loc-marching-route": 250,
    "loc-mthimkhulu": 150,
    "loc-central-cafe": 150,
    "loc-the-grail": 175,
    "loc-tides": 150,
  } as Record<string, number>,
};

export interface QuestPrize {
  id: string;
  sponsorId: QuestSponsor["id"];
  title: string;
  value: number;
  formattedValue: string;
  sponsorName: string;
  briefDescription: string;
}

export const QUEST_PRIZES: QuestPrize[] = [
  {
    id: "prize-coastal-ebike",
    sponsorId: "emotion-ebike",
    title: "Guided Coastal E-Bike Experience for Two",
    value: 1700,
    formattedValue: "R1,700",
    sponsorName: "E-Motion E-Bike Adventures",
    briefDescription:
      "Cruise effortlessly along Kleinmond's dramatic coastline and mountain trails with a local guide on two electric bikes — soaking up sweeping sea views and hidden Overstrand gems at your own pace.",
  },
  {
    id: "prize-lagoon-kayaking",
    sponsorId: "pura-vida-kayaking",
    title: "Kayaking Experience for Two on the Kleinmond Lagoon",
    value: 600,
    formattedValue: "R600",
    sponsorName: "Pura Vida Kayaking Adventures",
    briefDescription:
      "Paddle together across the tranquil, mountain-framed waters of the Kleinmond Lagoon on a fun, beginner-friendly kayaking outing surrounded by Kogelberg coastal beauty.",
  },
];

export function getVenueGeofenceRadiusMeters(venueId: string): number {
  return (
    QUEST_CONFIG.venueGeofenceOverrides[venueId] ??
    QUEST_CONFIG.defaultGeofenceRadiusMeters
  );
}

export const QUEST_SPONSORS: QuestSponsor[] = [
  {
    id: "pura-vida-kayaking",
    name: "Pura Vida Kayaking Adventures",
    shortName: "Pura Vida Kayaking",
    tagline: "Palmiet River Kayaking Experiences",
    description: [
      "Discover Kleinmond from a whole new perspective with a kayaking adventure on the beautiful Palmiet River. Surrounded by spectacular mountain scenery and natural beauty, Pura Vida offers fun, beginner-friendly kayaking experiences for families, couples, friends and adventure seekers.",
      "Whether you're looking for a relaxing paddle or an unforgettable outdoor experience, there's no better way to explore our waterways.",
    ],
    location: "Based in Kleinmond, Western Cape.",
    ctaLabel: "WhatsApp 079 698 1395 to Book / Enquire",
    whatsappMessage:
      "Hi Pura Vida Kayaking Adventures! I saw your feature on the KLiK Festival app and would love to book or get more information about kayaking on the Kleinmond Lagoon / Palmiet River.",
    imageUrl: "/assets/sponsors/pura-vida-kayak-activity.jpg",
    logoUrl: "/assets/sponsors/pura-vida-kayak-logo.jpg",
    expectedImageFilename: "public/assets/sponsors/pura-vida-kayak-activity.jpg",
    expectedLogoFilename: "public/assets/sponsors/pura-vida-kayak-logo.jpg",
  },
  {
    id: "emotion-ebike",
    name: "E-Motion E-Bike Adventures",
    shortName: "E-Motion E-Bikes",
    tagline: "Guided Overstrand E-Bike Experiences & Rentals",
    description: [
      "Explore the spectacular coastline, mountain landscapes and hidden gems of the Overstrand on an electric bike.",
      "E-Motion E-Bike Adventures offers guided e-bike experiences and rentals, making it easier to explore further, enjoy the scenery and experience the region at your own pace.",
      "More adventure. Less effort. Endless possibilities.",
    ],
    location: "Based in Kleinmond, Western Cape.",
    ctaLabel: "WhatsApp 079 698 1395 to Book / Enquire",
    whatsappMessage:
      "Hi E-Motion E-Bike Adventures! I saw your feature on the KLiK Festival app and would love to book or get more information about guided e-bike experiences or rentals in Kleinmond.",
    imageUrl: "/assets/sponsors/emotion-ebike-activity.jpg",
    logoUrl: "/assets/sponsors/emotion-ebike-logo.png",
    expectedImageFilename: "public/assets/sponsors/emotion-ebike-activity.jpg",
    expectedLogoFilename: "public/assets/sponsors/emotion-ebike-logo.png",
  },
];

export const FESTIVAL_CONFIG = {
  name: "KliK 2026",
  fullName: "Kleinmond Inniebos Kunstefees",
  dates: "27–29 November 2026",
  datesShort: "27–29 Nov 2026",
  location: "Kleinmond, Western Cape",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://klik2026.netlify.app",
  quicketUrl:
    "https://www.quicket.co.za/events/339579-kleinmond-inniebos-kunstefees-klik/",
  // Configurable shuttle contact phone number (E.164 format for WhatsApp — PRESERVED)
  shuttlePhoneNumber: process.env.NEXT_PUBLIC_SHUTTLE_PHONE || "+27723150382",
  displayShuttlePhone: "+27 72 315 0382",
  // KLiK Quest competition entry & manual verification WhatsApp phone number
  prizeDrawPhoneNumber:
    process.env.NEXT_PUBLIC_PRIZE_DRAW_PHONE || QUEST_CONFIG.whatsappE164,
  displayPrizeDrawPhone: QUEST_CONFIG.whatsappIntlDisplay,
  emergencyContacts: [
    { name: "Emergency Services (General)", phone: "112" },
    { name: "NSRI Kleinmond (Sea Rescue)", phone: "082 990 5964" },
    { name: "Kleinmond Police (SAPS)", phone: "028 271 8200" },
    { name: "Overstrand Fire & Rescue", phone: "028 312 2400" },
    { name: "Festival Info Desk", phone: "063 939 2761" },
  ],
};

/**
 * Builds a pre-filled WhatsApp message URL to request a shuttle ride.
 * Preserves the dedicated Happy Landings shuttle number (+27 72 315 0382).
 */
export function buildShuttleWhatsAppUrl(options: {
  lat?: number;
  lng?: number;
  pickupVenue?: string;
  destinationVenue?: string;
}): string {
  const phone = FESTIVAL_CONFIG.shuttlePhoneNumber.replace(/[^0-9]/g, "");

  let locationText = "";
  if (options.lat !== undefined && options.lng !== undefined) {
    locationText = `https://maps.google.com/?q=${options.lat},${options.lng}`;
  } else if (options.pickupVenue) {
    locationText = options.pickupVenue;
  } else {
    locationText = "Current location (to be confirmed)";
  }

  const destinationText = options.destinationVenue || "Festival Venue";

  const message = `Hi, I'd like to request a KLiK Festival ride.\n\nPickup location:\n${locationText}\n\nDestination:\n${destinationText}\n\nRequested via the KLiK Festival app.`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a pre-filled WhatsApp message URL to submit a completed KLiK Quest competition entry.
 * Sends to +27 79 698 1395 (https://wa.me/27796981395).
 */
export function buildPrizeDrawWhatsAppUrl(options: {
  ticketNumber: string;
  participantName?: string;
  visitedVenues?: string[];
}): string {
  const phone = FESTIVAL_CONFIG.prizeDrawPhoneNumber.replace(/[^0-9]/g, "");
  const cleanName = options.participantName?.trim();
  const nameLine = cleanName ? `\n\nName: ${cleanName}` : "";

  const message = `Hi! I've successfully completed the KLiK Quest!\n\nMy unique competition entry code is: ${options.ticketNumber}${nameLine}\n\nI've completed five participating locations and would like to enter the competition.\n\nThank you!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a pre-filled WhatsApp message URL for Method C (Selfie / Manual Check-In Verification).
 * Sends to +27 79 698 1395 (https://wa.me/27796981395).
 */
export function buildSelfieVerificationWhatsAppUrl(options: {
  participantName?: string;
  participantId: string;
  establishmentName: string;
}): string {
  const phone = QUEST_CONFIG.whatsappApiNumber;
  const cleanName = options.participantName?.trim();
  const participantLine = cleanName ? cleanName : "Not provided";

  const message = `Hi! I'm participating in the KLiK Quest and am having difficulty checking in.\n\nParticipant: ${participantLine}\n\nParticipant reference: ${options.participantId}\n\nLocation: ${options.establishmentName}\n\nI am submitting photographic proof of my visit for manual verification.\n\nPlease assist me with completing my check-in.\n\nThanks!`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds a pre-filled WhatsApp enquiry URL for a KLiK Quest adventure sponsor.
 * Sends to +27 79 698 1395 (https://wa.me/27796981395) with business-specific text.
 */
export function buildSponsorWhatsAppUrl(sponsorId: QuestSponsor["id"]): string {
  const sponsor = QUEST_SPONSORS.find((s) => s.id === sponsorId);
  const text =
    sponsor?.whatsappMessage ||
    "Hi! I saw your adventure experience on the KLiK Festival app and would like to enquire.";
  return `${QUEST_CONFIG.whatsappBaseUrl}?text=${encodeURIComponent(text)}`;
}
