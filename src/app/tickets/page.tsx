"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Ticket, ExternalLink, Check } from "lucide-react";
import { FESTIVAL_CONFIG } from "@/lib/config";
import { trackEvent } from "@/lib/analytics";

export default function TicketsPage() {
  const handleQuicketClick = () => {
    trackEvent("ticket_click", { location: "tickets_page" });
  };

  return (
    <div className="space-y-6 pb-8 animate-in fade-in duration-300">
      {/* Back to Home */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-festival hover:text-teal-light py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Header */}
      <div className="bg-parchment-50 rounded-3xl p-6 border border-parchment-300 shadow-subtle text-center space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-terracotta-festival">
          Official Festival Pricing
        </span>
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-teal-festival">
          Festival Tickets
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted max-w-sm mx-auto">
          Secure your passes and individual session tickets online via Quicket.
        </p>
      </div>

      {/* Passes and Pricing Cards */}
      <div className="space-y-3">
        {/* 3-Day Pass */}
        <div className="p-5 rounded-3xl bg-parchment-50 border-2 border-teal-festival/20 shadow-subtle flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="font-serif font-bold text-lg text-teal-festival">
                3-Day Festival Pass
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-mustard-festival/20 text-mustard-dark">
                Best Value
              </span>
            </div>
            <p className="text-xs text-ink-muted">
              Full access to all ticketed festival sessions across Friday, Saturday, and Sunday.
            </p>
          </div>
          <span className="font-serif font-black text-2xl text-teal-festival shrink-0">
            R300
          </span>
        </div>

        {/* 2-Day Pass */}
        <div className="p-5 rounded-3xl bg-parchment-50 border border-parchment-300 shadow-subtle flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif font-bold text-lg text-teal-festival">
              2-Day Festival Pass
            </h2>
            <p className="text-xs text-ink-muted">
              Access to any two days of festival sessions.
            </p>
          </div>
          <span className="font-serif font-black text-2xl text-teal-festival shrink-0">
            R200
          </span>
        </div>

        {/* Individual Sessions */}
        <div className="p-5 rounded-3xl bg-parchment-50 border border-parchment-300 shadow-subtle flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif font-bold text-lg text-teal-festival">
              Individual Sessions
            </h2>
            <p className="text-xs text-ink-muted">
              Single session ticket. Also provides full Saturday day access to all Writer&apos;s Café author conversations.
            </p>
          </div>
          <span className="font-serif font-black text-2xl text-teal-festival shrink-0">
            R100
          </span>
        </div>

        {/* Free Zone */}
        <div className="p-5 rounded-3xl bg-olive-festival/10 border border-olive-festival/25 shadow-subtle flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-serif font-bold text-lg text-olive-dark">
              Free Zone Events
            </h2>
            <p className="text-xs text-ink-muted">
              Community market, art exhibitions, See en Fynbos walk, talent showcase, marching band parade, and youth workshops.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-olive-festival text-white shrink-0">
            FREE
          </span>
        </div>
      </div>

      {/* Writer's Café Special Clarification */}
      <div className="bg-parchment-100 p-4 rounded-2xl border border-parchment-300 text-xs text-ink-festival space-y-1.5">
        <strong className="font-bold text-teal-festival block">
          Writer&apos;s Café Saturday Access:
        </strong>
        <p className="text-ink-muted leading-relaxed">
          A single R100 ticket provides access to all six Writer&apos;s Café author dialogues on Saturday at Kleinmond Central Café. Valid 2-day and 3-day festival passes also cover all Writer&apos;s Café sessions.
        </p>
      </div>

      {/* Buy Button */}
      <div>
        <a
          href={FESTIVAL_CONFIG.quicketUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleQuicketClick}
          className="w-full min-h-[52px] py-4 px-6 rounded-2xl bg-terracotta-festival hover:bg-terracotta-dark text-white font-bold text-base flex items-center justify-center gap-2.5 shadow-card active:scale-[0.98] transition-all"
        >
          <Ticket className="w-5 h-5" />
          <span>Buy Tickets on Quicket</span>
          <ExternalLink className="w-4 h-4 opacity-80" />
        </a>
      </div>
    </div>
  );
}
