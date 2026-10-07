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
  emergencyContacts: [
    { name: "Emergency Services (General)", phone: "112" },
    { name: "NSRI Kleinmond (Sea Rescue)", phone: "082 990 5964" },
    { name: "Kleinmond Police (SAPS)", phone: "028 271 8200" },
    { name: "Overstrand Fire & Rescue", phone: "028 312 2400" },
    { name: "Festival Info Desk", phone: "028 271 4050" },
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
