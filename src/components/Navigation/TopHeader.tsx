"use client";

import React, { useState, useEffect } from "react";
import { KliKLogo } from "../Brand/KliKLogo";
import { FestivalStripe } from "../Brand/FestivalStripe";
import { Share2, WifiOff, CheckCircle2, AlertCircle } from "lucide-react";
import { ShareModal } from "../UI/ShareModal";
import { flushOfflineQueue } from "@/lib/db/idb";
import { repository } from "@/lib/db/repository";
import { FestivalNotice } from "@/lib/types";

import { usePathname } from "next/navigation";

export const TopHeader: React.FC = () => {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState<boolean>(false);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [activeNotice, setActiveNotice] = useState<FestivalNotice | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    // Fetch active notice for top banner if available
    const checkNotices = async () => {
      try {
        const notices = await repository.getNotices();
        if (notices.length > 0) {
          // Only show important or urgent notices
          const imp = notices.find((n) => n.level === "urgent" || n.level === "important");
          if (imp) setActiveNotice(imp);
        }
      } catch {
        // Fail silently
      }
    };
    checkNotices();

    const handleOnline = async () => {
      setIsOnline(true);
      setShowReconnectedBanner(true);
      try {
        await flushOfflineQueue();
      } catch {
        // silent
      }
      setTimeout(() => {
        setShowReconnectedBanner(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedBanner(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Do not render top attendee header inside admin dashboard
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleShareClick = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://klik2026.netlify.app";
    const shareData = {
      title: "KLiK 2026 - Kleinmond Inniebos Kunstefees",
      text: "Explore the official KLiK 2026 Kunstefees programme. 27–29 November 2026 in Kleinmond.",
      url: shareUrl,
    };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: unknown) {
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    setIsShareOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-parchment-100/95 backdrop-blur-md border-b border-parchment-300">
        <div className="max-w-3xl lg:max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          {/* Left: Small, clean KLiK logo */}
          <KliKLogo variant="compact" />

          {/* Right: Optional native share icon */}
          <div className="flex items-center">
            <button
              onClick={handleShareClick}
              className="min-w-[44px] min-h-[44px] p-2.5 rounded-full text-ink-muted hover:text-teal-festival hover:bg-parchment-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-festival transition-colors flex items-center justify-center"
              title="Share KLiK 2026 Festival App"
              aria-label="Share Festival App"
            >
              <Share2 className="w-5 h-5 text-teal-festival" aria-hidden="true" />
            </button>
          </div>
        </div>

        <FestivalStripe height="h-[2px]" />

        {/* Connectivity Status Notification */}
        {!isOnline && (
          <div
            className="bg-amber-100/95 border-b border-amber-300 px-4 py-2 text-center text-xs font-medium text-amber-900 flex items-center justify-center gap-2 animate-in fade-in"
            role="status"
          >
            <WifiOff className="w-3.5 h-3.5 text-amber-700 shrink-0" aria-hidden="true" />
            <span>You&apos;re offline. Your saved programme is still available.</span>
          </div>
        )}

        {isOnline && showReconnectedBanner && (
          <div
            className="bg-olive-festival/15 border-b border-olive-festival/30 px-4 py-2 text-center text-xs font-semibold text-teal-festival flex items-center justify-center gap-2 animate-in fade-in"
            role="status"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-olive-festival shrink-0" aria-hidden="true" />
            <span>Back online.</span>
          </div>
        )}

        {/* Important Festival Alert Banner */}
        {activeNotice && (
          <div
            className="bg-terracotta-festival text-white px-4 py-2.5 text-xs font-medium flex items-center justify-center gap-2 text-center shadow-xs"
            role="alert"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-white" aria-hidden="true" />
            <div className="leading-tight">
              <strong className="font-bold mr-1 uppercase tracking-wide">{activeNotice.title}:</strong>
              <span>{activeNotice.content}</span>
            </div>
          </div>
        )}
      </header>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
};
