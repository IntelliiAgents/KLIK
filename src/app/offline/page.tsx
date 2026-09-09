"use client";

import React from "react";
import Link from "next/link";
import { WifiOff, RefreshCw, Heart, Calendar, MapPin } from "lucide-react";

export default function OfflinePage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="py-12 text-center space-y-6 animate-in fade-in">
      <div className="w-16 h-16 rounded-3xl bg-terracotta-festival/15 text-terracotta-festival flex items-center justify-center mx-auto shadow-subtle">
        <WifiOff className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-xs mx-auto">
        <h1 className="font-serif font-black text-2xl text-teal-festival">
          You are Offline
        </h1>
        <p className="text-xs text-ink-muted leading-relaxed">
          Weak mobile connectivity is common along the coastal mountains of Kleinmond. Don&apos;t worry—your saved events, check-in history, and cached programme remain available on your device.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 max-w-xs mx-auto pt-2">
        <button
          onClick={handleReload}
          className="w-full py-3 px-4 rounded-xl bg-teal-festival text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-teal-light transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Check Connection & Retry</span>
        </button>

        <Link
          href="/my-festival"
          className="w-full py-2.5 px-4 rounded-xl bg-parchment-200 text-teal-festival text-xs font-semibold flex items-center justify-center gap-2 hover:bg-parchment-300 transition-colors"
        >
          <Heart className="w-4 h-4 text-terracotta-festival" />
          <span>View Saved My Festival Schedule</span>
        </Link>

        <Link
          href="/map"
          className="w-full py-2.5 px-4 rounded-xl bg-parchment-200 text-teal-festival text-xs font-semibold flex items-center justify-center gap-2 hover:bg-parchment-300 transition-colors"
        >
          <MapPin className="w-4 h-4 text-teal-festival" />
          <span>Open Offline Venue Directory</span>
        </Link>
      </div>
    </div>
  );
}
