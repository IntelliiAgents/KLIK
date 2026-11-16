// KliK 2026 Application Configuration

export const FESTIVAL_CONFIG = {
  name: "KliK 2026",
  fullName: "Kleinmond Inniebos Kunstefees",
  dates: "27–29 November 2026",
  datesShort: "27–29 Nov 2026",
  location: "Kleinmond, Western Cape",
  quicketUrl: "https://www.quicket.co.za/events/339579-kleinmond-inniebos-kunstefees-klik/",
  // Configurable shuttle contact phone number (E.164 format for WhatsApp)
  shuttlePhoneNumber: process.env.NEXT_PUBLIC_SHUTTLE_PHONE || "+27723150382",
  displayShuttlePhone: "+27 72 315 0382",
  // Configurable prize draw WhatsApp phone number (defaults to Festival Info Desk)
  prizeDrawPhoneNumber: process.env.NEXT_PUBLIC_PRIZE_DRAW_PHONE || "+27639392761",
  displayPrizeDrawPhone: "+27 63 939 2761",
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
 * Builds a pre-filled WhatsApp message URL to submit a completed Culture Trail Lucky Draw entry.
 */
export function buildPrizeDrawWhatsAppUrl(options: {
  ticketNumber: string;
  participantName?: string;
  visitedVenues?: string[];
}): string {
  const phone = FESTIVAL_CONFIG.prizeDrawPhoneNumber.replace(/[^0-9]/g, "");
  const cleanName = options.participantName?.trim();
  const nameLine = cleanName ? cleanName : "[Please type your name here]";
  const venuesLine =
    options.visitedVenues && options.visitedVenues.length > 0
      ? `\n\nCheckpoints visited (${options.visitedVenues.length}):\n• ${options.visitedVenues.join("\n• ")}`
      : "";

  const message = `Hi KLiK Festival Team! 🎉\n\nI've completed the KLiK Culture Trail and would like to enter the Lucky Draw.\n\nName: ${nameLine}\nLucky Draw Code: ${options.ticketNumber}${venuesLine}\n\nSent via the KLiK 2026 Festival App`;

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
