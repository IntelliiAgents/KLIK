"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Car,
  Award,
  Ticket,
  Compass,
  ParkingSquare,
  HeartHandshake,
  Info,
  PhoneCall,
  Download,
  ChevronRight,
  Shield,
  Sparkles,
  Users,
  FileImage,
  Lock,
} from "lucide-react";
import { TicketsModal } from "@/components/UI/TicketsModal";
import { PosterGallery } from "@/components/Brand/PosterGallery";
import { BackToTopButton } from "@/components/UI/BackToTopButton";
import { FESTIVAL_CONFIG } from "@/lib/config";
import { ABOUT_KLIK_2026, SEED_PARTNERS } from "@/lib/data/seed";
import { trackEvent } from "@/lib/analytics";

export default function MorePage() {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isTicketsOpen, setIsTicketsOpen] = useState(false);

  const toggleSection = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const handleInstallClick = () => {
    trackEvent("app_open", { action: "install_prompt_trigger" });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("klik_trigger_install_prompt"));
    }
  };

  return (
    <div className="space-y-5 pb-10 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <span className="editorial-kicker">Festival Companion</span>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-teal-festival mt-0.5">
          More &amp; Festival Info
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Children &amp; Youth, artists, transport, official posters, and visitor information.
        </p>
      </div>

      {/* Primary Programme & People Directory */}
      <div className="editorial-surface divide-y divide-parchment-200 overflow-hidden">
        {/* Children & Youth Programme */}
        <Link
          href="/youth"
          className="flex items-center justify-between p-4 min-h-[58px] hover:bg-parchment-100 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-terracotta-festival/12 text-terracotta-festival flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm sm:text-base text-teal-festival block leading-snug">
                Children &amp; Youth Programme
              </span>
              <span className="text-xs text-ink-muted block">
                Saturday, 28 Nov • 10:00–14:00 • Mthimkhulu Free Zone
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-parchment-400 group-hover:text-terracotta-festival transition-colors shrink-0" />
        </Link>

        {/* Artists & Presenters */}
        <Link
          href="/artists"
          className="flex items-center justify-between p-4 min-h-[58px] hover:bg-parchment-100 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-teal-festival/10 text-teal-festival flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm sm:text-base text-teal-festival block leading-snug">
                Artists, Writers &amp; Facilitators
              </span>
              <span className="text-xs text-ink-muted block">
                Full biographies and connected sessions
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-parchment-400 group-hover:text-teal-festival transition-colors shrink-0" />
        </Link>

        {/* Official Festival Posters Accordion */}
        <div className="overflow-hidden">
          <button
            onClick={() => toggleSection("posters")}
            className="w-full flex items-center justify-between p-4 min-h-[58px] hover:bg-parchment-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-mustard-festival/20 text-mustard-dark flex items-center justify-center shrink-0">
                <FileImage className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-sm sm:text-base text-teal-festival block leading-snug">
                  Official Festival Posters
                </span>
                <span className="text-xs text-ink-muted block">
                  Expand, zoom, share, or download print sheets
                </span>
              </div>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-parchment-400 transition-transform shrink-0 ${
                openSection === "posters" ? "rotate-90 text-teal-festival" : ""
              }`}
            />
          </button>
          {openSection === "posters" && (
            <div className="px-4 sm:px-5 pb-5 pt-3 bg-parchment-100/70 border-t border-parchment-200 animate-in fade-in space-y-2.5">
              <p className="text-xs text-ink-muted leading-relaxed">
                Tap either programme sheet to inspect at full resolution, zoom in, share, or save to your device.
              </p>
              <PosterGallery compact />
            </div>
          )}
        </div>
      </div>

      {/* Visitor Services & Festival Guide */}
      <div className="editorial-surface divide-y divide-parchment-200 overflow-hidden">
        {/* 1. Get a Ride */}
        <Link
          href="/ride"
          className="flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <Car className="w-5 h-5 text-olive-festival" />
            <span className="font-semibold text-sm sm:text-base text-teal-festival">
              Get a Ride (Festival Shuttle)
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-parchment-400 group-hover:text-teal-festival transition-colors" />
        </Link>

        {/* 2. KliK Culture Trail */}
        <Link
          href="/culture-trail"
          onClick={() => trackEvent("culture_trail_open")}
          className="flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <Award className="w-5 h-5 text-terracotta-festival" />
            <span className="font-semibold text-sm sm:text-base text-teal-festival">
              KliK Culture Trail
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-parchment-400 group-hover:text-terracotta-festival transition-colors" />
        </Link>

        {/* 3. Tickets */}
        <button
          onClick={() => {
            trackEvent("ticket_click", { location: "more_menu" });
            setIsTicketsOpen(true);
          }}
          className="w-full flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <Ticket className="w-5 h-5 text-mustard-dark" />
            <span className="font-semibold text-sm sm:text-base text-teal-festival">
              Tickets &amp; Passes (Quicket)
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-parchment-400 group-hover:text-mustard-dark transition-colors" />
        </button>

        {/* 4. Things to Do */}
        <div className="overflow-hidden">
          <button
            onClick={() => {
              toggleSection("things_to_do");
              trackEvent("things_to_do_view");
            }}
            className="w-full flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <Compass className="w-5 h-5 text-teal-accent" />
              <span className="font-semibold text-sm sm:text-base text-teal-festival">
                Things to Do in Kleinmond
              </span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-parchment-400 transition-transform ${
                openSection === "things_to_do" ? "rotate-90 text-teal-festival" : ""
              }`}
            />
          </button>
          {openSection === "things_to_do" && (
            <div className="px-5 pb-5 pt-3 bg-parchment-100/70 text-xs text-ink-festival space-y-3 border-t border-parchment-200 animate-in fade-in">
              <p className="text-ink-muted leading-relaxed">
                Explore Kleinmond between festival sessions:
              </p>

              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-parchment-50 border border-parchment-300">
                  <strong className="font-bold text-teal-festival block mb-0.5">
                    Eat &amp; Drink
                  </strong>
                  <p className="text-ink-muted">
                    Fresh coastal seafood at Kleinmond Harbour waterfront and cosy local cafés along Botrivier Road.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-parchment-50 border border-parchment-300">
                  <strong className="font-bold text-teal-festival block mb-0.5">
                    Explore &amp; Nature
                  </strong>
                  <p className="text-ink-muted">
                    Palmiet River Lagoon boardwalk, See en Fynbos coastal walking trails, and the wild horses of Rooisand estuary.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-parchment-50 border border-parchment-300">
                  <strong className="font-bold text-teal-festival block mb-0.5">
                    Shopping &amp; Craft
                  </strong>
                  <p className="text-ink-muted">
                    Local pottery, indigenous botanical remedies, and artisanal crafts at Harbour Road and the KliK Market.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-parchment-50 border border-parchment-300">
                  <strong className="font-bold text-teal-festival block mb-0.5">
                    Stay &amp; Overberg Hospitality
                  </strong>
                  <p className="text-ink-muted">
                    Guesthouses, coastal cottages, and B&amp;Bs nestled between the Atlantic Ocean and the Kogelberg mountain slopes.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 5. Parking & Transport */}
        <div className="overflow-hidden">
          <button
            onClick={() => toggleSection("transport")}
            className="w-full flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <ParkingSquare className="w-5 h-5 text-teal-festival" />
              <span className="font-semibold text-sm sm:text-base text-teal-festival">
                Parking &amp; Transport
              </span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-parchment-400 transition-transform ${
                openSection === "transport" ? "rotate-90 text-teal-festival" : ""
              }`}
            />
          </button>
          {openSection === "transport" && (
            <div className="px-5 pb-5 pt-3 bg-parchment-100/70 text-xs text-ink-festival space-y-3 border-t border-parchment-200 animate-in fade-in">
              <div className="space-y-2 leading-relaxed">
                <p>
                  <strong className="text-teal-festival">Official Parking Areas:</strong>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-ink-muted">
                  <li>
                    <strong className="text-ink-festival">Town Hall:</strong> Paved parking lot adjacent to Main Road 54.
                  </li>
                  <li>
                    <strong className="text-ink-festival">Harbour Waterfront:</strong> Parking bays along Harbour Road for The Shed and Tides.
                  </li>
                  <li>
                    <strong className="text-ink-festival">Main Beach:</strong> Parking area at the beach boardwalk pavilion.
                  </li>
                  <li>
                    <strong className="text-ink-festival">The Grail Centre:</strong> Street parking along 15th Avenue.
                  </li>
                  <li>
                    <strong className="text-ink-festival">Mthimkhulu Village Centre:</strong> Access and parking along 9th Avenue.
                  </li>
                </ul>

                <p className="pt-2 text-ink-muted">
                  <strong className="text-teal-festival">Festival Shuttle:</strong> Operated in partnership with official transport partner <strong className="text-ink-festival">Happy Landings</strong> (Executive Chauffeurs &amp; Tours). A dedicated shuttle runs between venues. Use the <strong>Get a Ride</strong> section or message the driver on WhatsApp (+27 72 315 0382).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 6. Festival Partners */}
        <div className="overflow-hidden">
          <button
            onClick={() => toggleSection("partners")}
            className="w-full flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <HeartHandshake className="w-5 h-5 text-terracotta-festival" />
              <span className="font-semibold text-sm sm:text-base text-teal-festival">
                Festival Partners &amp; Supporters
              </span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-parchment-400 transition-transform ${
                openSection === "partners" ? "rotate-90 text-teal-festival" : ""
              }`}
            />
          </button>
          {openSection === "partners" && (
            <div className="px-5 pb-5 pt-3 bg-parchment-100/70 text-xs text-ink-festival space-y-3 border-t border-parchment-200 animate-in fade-in">
              <p className="text-ink-muted">
                KliK 2026 is brought to life through the shared vision and collaboration of our community partners:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {SEED_PARTNERS.map((p) => (
                  <div
                    key={p.name}
                    className="p-3 rounded-2xl bg-white border border-parchment-200 shadow-subtle flex flex-col items-center justify-between text-center gap-2"
                  >
                    {p.logoUrl ? (
                      <div
                        className="w-full h-16 relative flex items-center justify-center p-1 bg-white rounded-lg overflow-hidden"
                        style={{ position: "relative", height: "64px", overflow: "hidden" }}
                      >
                        <Image
                          src={p.logoUrl}
                          alt={`${p.name} Logo`}
                          fill
                          sizes="(max-width: 640px) 50vw, 33vw"
                          className="object-contain p-0.5"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-16 rounded-lg bg-parchment-100 flex items-center justify-center p-1 text-center border border-parchment-200">
                        <span className="font-serif font-bold text-[11px] text-teal-festival leading-tight">
                          {p.name}
                        </span>
                      </div>
                    )}

                    <div className="w-full min-w-0 pt-1 border-t border-parchment-200/50 flex flex-col justify-center">
                      <strong className="font-serif font-bold text-[11px] text-teal-festival block leading-tight line-clamp-2 min-h-[1.75rem] flex items-center justify-center">
                        {p.name}
                      </strong>
                      <span className="text-[10px] text-ink-muted block mt-0.5 leading-tight line-clamp-2 min-h-[1.5rem] flex items-center justify-center">
                        {p.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 7. About KliK 2026 */}
        <div className="overflow-hidden">
          <button
            onClick={() => toggleSection("about")}
            className="w-full flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <Info className="w-5 h-5 text-teal-festival" />
              <span className="font-semibold text-sm sm:text-base text-teal-festival">
                {ABOUT_KLIK_2026.heading}
              </span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-parchment-400 transition-transform ${
                openSection === "about" ? "rotate-90 text-teal-festival" : ""
              }`}
            />
          </button>
          {openSection === "about" && (
            <div className="px-5 pb-5 pt-3 bg-parchment-100/70 text-xs sm:text-sm text-ink-festival space-y-3 border-t border-parchment-200 leading-relaxed animate-in fade-in">
              {ABOUT_KLIK_2026.paragraphs.map((paragraph, index) => (
                <p key={index} className="text-ink-festival/90">
                  {paragraph}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* 8. Help & Contact */}
        <div className="overflow-hidden">
          <button
            onClick={() => toggleSection("help")}
            className="w-full flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <PhoneCall className="w-5 h-5 text-olive-festival" />
              <span className="font-semibold text-sm sm:text-base text-teal-festival">
                Help &amp; Emergency Contact
              </span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-parchment-400 transition-transform ${
                openSection === "help" ? "rotate-90 text-teal-festival" : ""
              }`}
            />
          </button>
          {openSection === "help" && (
            <div className="px-5 pb-5 pt-3 bg-parchment-100/70 text-xs text-ink-festival space-y-2.5 border-t border-parchment-200 animate-in fade-in">
              <p className="font-bold text-teal-festival">Festival &amp; Emergency Assistance:</p>
              <div className="space-y-1.5">
                {FESTIVAL_CONFIG.emergencyContacts.map((c) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-parchment-50 border border-parchment-300"
                  >
                    <span className="font-medium text-ink-festival">{c.name}</span>
                    <a
                      href={`tel:${c.phone.replace(/\s+/g, "")}`}
                      className="font-bold text-terracotta-festival hover:underline ml-2 tabular-time"
                    >
                      {c.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 9. Privacy & Offline Storage Notice */}
        <div className="overflow-hidden">
          <button
            onClick={() => toggleSection("privacy")}
            className="w-full flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <Lock className="w-5 h-5 text-teal-festival" />
              <span className="font-semibold text-sm sm:text-base text-teal-festival">
                Privacy &amp; Offline Storage
              </span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-parchment-400 transition-transform ${
                openSection === "privacy" ? "rotate-90 text-teal-festival" : ""
              }`}
            />
          </button>
          {openSection === "privacy" && (
            <div className="px-5 pb-5 pt-3 bg-parchment-100/70 text-xs text-ink-festival space-y-2.5 border-t border-parchment-200 leading-relaxed animate-in fade-in">
              <p className="font-semibold text-teal-festival">
                No Tracking Cookies or Advertising Pixels
              </p>
              <p className="text-ink-muted">
                The KliK 2026 companion app does not set tracking cookies, advertising identifiers, or third-party analytics trackers. No personal registration is required to browse the programme or build your schedule.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-ink-muted">
                <li>
                  <strong className="text-ink-festival">On-Device Storage:</strong> Your saved festival sessions, Culture Trail venue check-ins, and cached offline programme data are stored locally on your device using browser storage (<code className="text-[11px]">IndexedDB</code> and <code className="text-[11px]">localStorage</code>) so the app works reliably without mobile signal.
                </li>
                <li>
                  <strong className="text-ink-festival">Optional Location:</strong> Device GPS is accessed only if you explicitly tap &ldquo;Show My Location&rdquo; on the map or &ldquo;Use Current Location&rdquo; when requesting a shuttle ride, and is never stored on a server.
                </li>
                <li>
                  <strong className="text-ink-festival">External Services:</strong> Opening Quicket (ticketing), Google Maps (directions), or WhatsApp (shuttle booking) navigates to those external platforms under their respective privacy policies.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* 10. Install App */}
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <Download className="w-5 h-5 text-teal-festival" />
            <span className="font-semibold text-sm sm:text-base text-teal-festival">
              Install App for Offline Access
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-parchment-400 group-hover:text-teal-festival transition-colors" />
        </button>
      </div>

      {/* Discreet Organizer Link at bottom */}
      <div className="pt-3 text-center">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-ink-muted/70 hover:text-teal-festival py-2 px-3 rounded-lg transition-colors"
        >
          <Shield className="w-3.5 h-3.5 text-ink-muted/50" />
          <span>Organizer Sign In</span>
        </Link>
      </div>

      {/* Tickets Modal */}
      <TicketsModal
        isOpen={isTicketsOpen}
        onClose={() => setIsTicketsOpen(false)}
      />

      <BackToTopButton />
    </div>
  );
}
