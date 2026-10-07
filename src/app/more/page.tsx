"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  ExternalLink,
} from "lucide-react";
import { TicketsModal } from "@/components/UI/TicketsModal";
import { FESTIVAL_CONFIG } from "@/lib/config";
import { SEED_PARTNERS } from "@/lib/data/seed";
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
    <div className="space-y-5 pb-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-teal-festival">
          More
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
          Information, transport, and festival directory.
        </p>
      </div>

      {/* Clean Vertical Menu */}
      <div className="bg-parchment-50 rounded-3xl border border-parchment-300 divide-y divide-parchment-200 shadow-subtle overflow-hidden">
        {/* 1. Get a Ride */}
        <Link
          href="/ride"
          className="flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <Car className="w-5 h-5 text-olive-festival" />
            <span className="font-semibold text-sm sm:text-base text-teal-festival">
              Get a Ride
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-parchment-400 group-hover:text-teal-festival transition-colors" />
        </Link>

        {/* 2. KLiK Culture Trail */}
        <Link
          href="/culture-trail"
          onClick={() => trackEvent("culture_trail_open")}
          className="flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors group"
        >
          <div className="flex items-center gap-3.5">
            <Award className="w-5 h-5 text-terracotta-festival" />
            <span className="font-semibold text-sm sm:text-base text-teal-festival">
              KLiK Culture Trail
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
              Tickets &amp; Passes
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
                Things to Do
              </span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-parchment-400 transition-transform ${
                openSection === "things_to_do" ? "rotate-90 text-teal-festival" : ""
              }`}
            />
          </button>
          {openSection === "things_to_do" && (
            <div className="px-5 pb-5 pt-2 bg-parchment-100/70 text-xs text-ink-festival space-y-3 border-t border-parchment-200 animate-in fade-in">
              <p className="text-ink-muted leading-relaxed">
                Explore Kleinmond between festival sessions:
              </p>

              {/* Categories */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-parchment-50 border border-parchment-300">
                  <strong className="font-bold text-teal-festival block mb-0.5">
                    Eat &amp; Drink
                  </strong>
                  <p className="text-ink-muted">
                    Fresh coastal seafood at Kleinmond Harbour waterfront and cafés along Botrivier Road.
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
                    Local pottery, indigenous botanical remedies, and artisanal crafts at Harbour Road and the KLiK Market.
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
            <div className="px-5 pb-5 pt-2 bg-parchment-100/70 text-xs text-ink-festival space-y-3 border-t border-parchment-200 animate-in fade-in">
              <div className="space-y-2 leading-relaxed">
                <p>
                  <strong className="text-teal-festival">Official Parking Areas:</strong>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-ink-muted">
                  <li><strong className="text-ink-festival">Town Hall:</strong> Paved parking lot adjacent to Main Road 54.</li>
                  <li><strong className="text-ink-festival">Harbour Waterfront:</strong> Parking bays along Harbour Road for The Shed and Tides.</li>
                  <li><strong className="text-ink-festival">Main Beach:</strong> Parking area at the beach boardwalk pavilion.</li>
                  <li><strong className="text-ink-festival">The Grail Centre:</strong> Street parking along 15th Avenue.</li>
                </ul>

                <p className="pt-2 text-ink-muted">
                  <strong className="text-teal-festival">Festival Shuttle:</strong> A dedicated shuttle runs between venues. Use the <strong>Get a Ride</strong> section or message the driver on WhatsApp (+27 72 315 0382).
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
                Festival Partners
              </span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-parchment-400 transition-transform ${
                openSection === "partners" ? "rotate-90 text-teal-festival" : ""
              }`}
            />
          </button>
          {openSection === "partners" && (
            <div className="px-5 pb-5 pt-2 bg-parchment-100/70 text-xs text-ink-festival space-y-3 border-t border-parchment-200 animate-in fade-in">
              <p className="text-ink-muted">
                KLiK 2026 is brought to life with the generous collaboration of our community partners:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SEED_PARTNERS.map((p) => (
                  <div
                    key={p.name}
                    className="p-3 rounded-xl bg-parchment-50 border border-parchment-300 space-y-0.5"
                  >
                    <span className="font-bold text-teal-festival block">{p.name}</span>
                    <span className="text-[11px] text-ink-muted">{p.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 7. About KLiK */}
        <div className="overflow-hidden">
          <button
            onClick={() => toggleSection("about")}
            className="w-full flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors text-left"
          >
            <div className="flex items-center gap-3.5">
              <Info className="w-5 h-5 text-teal-festival" />
              <span className="font-semibold text-sm sm:text-base text-teal-festival">
                About KLiK
              </span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-parchment-400 transition-transform ${
                openSection === "about" ? "rotate-90 text-teal-festival" : ""
              }`}
            />
          </button>
          {openSection === "about" && (
            <div className="px-5 pb-5 pt-2 bg-parchment-100/70 text-xs text-ink-festival space-y-2 border-t border-parchment-200 leading-relaxed animate-in fade-in">
              <p>
                <strong>Kleinmond Inniebos Kunstefees (KLiK 2026)</strong> is a celebration of literature, poetry, acoustic indigenous music, theatre, and visual arts hosted across venues in Kleinmond from 27 to 29 November 2026.
              </p>
              <p className="italic font-serif text-teal-festival">
                &ldquo;Meet the writers. Follow the music. Make room for art.&rdquo;
              </p>
              <p className="text-ink-muted">
                All festival venues are located in Kleinmond, Overstrand Biosphere, Western Cape.
              </p>
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
                Help &amp; Contact
              </span>
            </div>
            <ChevronRight
              className={`w-4 h-4 text-parchment-400 transition-transform ${
                openSection === "help" ? "rotate-90 text-teal-festival" : ""
              }`}
            />
          </button>
          {openSection === "help" && (
            <div className="px-5 pb-5 pt-2 bg-parchment-100/70 text-xs text-ink-festival space-y-2.5 border-t border-parchment-200 animate-in fade-in">
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
                      className="font-bold text-terracotta-festival hover:underline ml-2"
                    >
                      {c.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 9. Install App */}
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between p-4 min-h-[56px] hover:bg-parchment-100 transition-colors text-left group"
        >
          <div className="flex items-center gap-3.5">
            <Download className="w-5 h-5 text-teal-festival" />
            <span className="font-semibold text-sm sm:text-base text-teal-festival">
              Install App
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-parchment-400 group-hover:text-teal-festival transition-colors" />
        </button>
      </div>

      {/* Discreet Organizer Link at bottom */}
      <div className="pt-4 text-center">
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
    </div>
  );
}
