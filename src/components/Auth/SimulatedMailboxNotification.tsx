"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SentEmail } from "@/lib/types";
import { ExternalLink, X, KeyRound, UserCheck } from "lucide-react";

export function SimulatedMailboxNotification() {
  const [latestEmail, setLatestEmail] = useState<SentEmail | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const handleEmailSent = (e: Event) => {
      const customEvent = e as CustomEvent<SentEmail>;
      if (customEvent.detail) {
        setLatestEmail(customEvent.detail);
        setIsDismissed(false);
      }
    };

    window.addEventListener("klik_email_sent", handleEmailSent);
    return () => {
      window.removeEventListener("klik_email_sent", handleEmailSent);
    };
  }, []);

  if (!latestEmail || isDismissed) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-[420px] z-[9999] animate-in slide-in-from-top-4 duration-300">
      <div className="bg-teal-festival text-parchment-50 rounded-2xl p-4 shadow-2xl border-2 border-mustard-festival/70 space-y-3">
        <div className="flex items-start justify-between gap-2 border-b border-white/15 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-mustard-festival text-ink-festival flex items-center justify-center shrink-0">
              {latestEmail.type === "activation" ? (
                <UserCheck className="w-4 h-4" />
              ) : (
                <KeyRound className="w-4 h-4" />
              )}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-mustard-festival flex items-center gap-1">
                <span>Simulated Mailbox</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <h4 className="text-xs font-serif font-bold text-white leading-tight">
                {latestEmail.subject}
              </h4>
            </div>
          </div>
          <button
            onClick={() => setIsDismissed(true)}
            className="text-parchment-300 hover:text-white p-1 rounded-lg transition-colors"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs space-y-1 text-parchment-100 bg-white/5 p-2.5 rounded-xl border border-white/10 font-mono text-[11px]">
          <div>
            <span className="text-parchment-300">To:</span> <strong className="text-white">{latestEmail.to}</strong>
          </div>
          <p className="line-clamp-3 text-parchment-200 font-sans text-xs pt-1">
            {latestEmail.body.split("\n\n")[1] || latestEmail.body}
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={() => setIsDismissed(true)}
            className="px-3 py-1.5 rounded-xl text-xs text-parchment-200 hover:text-white font-medium"
          >
            Dismiss
          </button>
          <Link
            href={latestEmail.actionUrl}
            onClick={() => setIsDismissed(true)}
            className="px-3.5 py-1.5 rounded-xl bg-mustard-festival text-ink-festival text-xs font-bold hover:bg-mustard-light transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>{latestEmail.actionText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
