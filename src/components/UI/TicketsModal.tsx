"use client";

import React from "react";
import { X, ExternalLink, Ticket, Check } from "lucide-react";
import { FESTIVAL_CONFIG } from "@/lib/config";
import { trackEvent } from "@/lib/analytics";

interface TicketsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TicketsModal: React.FC<TicketsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleQuicketClick = () => {
    trackEvent("ticket_click", { location: "tickets_modal" });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tickets-modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-parchment-50 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 border border-parchment-300 shadow-2xl z-10 space-y-5 animate-in slide-in-from-bottom-6 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-parchment-200 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-festival">
              Official Festival Pricing
            </span>
            <h2 id="tickets-modal-title" className="font-serif font-black text-2xl text-teal-festival mt-0.5">
              Festival Tickets
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              Book online securely via Quicket.
            </p>
          </div>

          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] p-2.5 rounded-full text-ink-muted hover:text-teal-festival hover:bg-parchment-200 transition-colors flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Table / Grid */}
        <div className="space-y-2.5">
          {/* 3-Day Pass */}
          <div className="p-4 rounded-2xl bg-parchment-100 border border-parchment-300 flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <strong className="font-serif font-bold text-base text-teal-festival">
                  3-Day Pass
                </strong>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-mustard-festival/20 text-mustard-dark">
                  Best Value
                </span>
              </div>
              <p className="text-xs text-ink-muted mt-0.5">
                Full weekend access across all festival sessions
              </p>
            </div>
            <span className="font-serif font-black text-xl text-teal-festival shrink-0">
              R300
            </span>
          </div>

          {/* 2-Day Pass */}
          <div className="p-4 rounded-2xl bg-parchment-100 border border-parchment-300 flex items-center justify-between gap-3">
            <div>
              <strong className="font-serif font-bold text-base text-teal-festival block">
                2-Day Pass
              </strong>
              <p className="text-xs text-ink-muted mt-0.5">
                Access to any two days of festival programming
              </p>
            </div>
            <span className="font-serif font-black text-xl text-teal-festival shrink-0">
              R200
            </span>
          </div>

          {/* Individual Sessions */}
          <div className="p-4 rounded-2xl bg-parchment-100 border border-parchment-300 flex items-center justify-between gap-3">
            <div>
              <strong className="font-serif font-bold text-base text-teal-festival block">
                Individual Sessions
              </strong>
              <p className="text-xs text-ink-muted mt-0.5">
                Per session ticket (including Writer&apos;s Café full day access)
              </p>
            </div>
            <span className="font-serif font-black text-xl text-teal-festival shrink-0">
              R100
            </span>
          </div>

          {/* Free Zone */}
          <div className="p-4 rounded-2xl bg-olive-festival/10 border border-olive-festival/25 flex items-center justify-between gap-3">
            <div>
              <strong className="font-serif font-bold text-base text-olive-dark block">
                Free Zone Events
              </strong>
              <p className="text-xs text-ink-muted mt-0.5">
                Market, exhibitions, walks, talent show &amp; youth activities
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-olive-festival text-white shrink-0">
              FREE
            </span>
          </div>
        </div>

        {/* Writer's Café Special Note */}
        <div className="p-3 rounded-xl bg-parchment-200/70 border border-parchment-300 text-xs text-ink-festival space-y-1">
          <strong className="font-semibold text-teal-festival block">
            Writer&apos;s Café Saturday Note:
          </strong>
          <p className="text-ink-muted leading-relaxed">
            A single R100 ticket provides access to all six Writer&apos;s Café author conversations on Saturday. Valid 2-day and 3-day festival passes also cover all Writer&apos;s Café sessions.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="pt-2">
          <a
            href={FESTIVAL_CONFIG.quicketUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleQuicketClick}
            className="w-full min-h-[48px] py-3.5 px-5 rounded-2xl bg-terracotta-festival hover:bg-terracotta-dark text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-card active:scale-[0.98] transition-all"
          >
            <Ticket className="w-5 h-5" />
            <span>Buy Tickets on Quicket</span>
            <ExternalLink className="w-4 h-4 opacity-80" />
          </a>
        </div>
      </div>
    </div>
  );
};
