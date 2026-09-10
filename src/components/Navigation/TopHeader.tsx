"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { KliKLogo } from "../Brand/KliKLogo";
import { Wifi, WifiOff, RefreshCw, Bell, Shield, Share2 } from "lucide-react";
import { ShareModal } from "../UI/ShareModal";
import { getOfflineQueueCount, flushOfflineQueue } from "@/lib/db/idb";

export const TopHeader: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const updateSyncCount = async () => {
      const count = await getOfflineQueueCount();
      setPendingSyncCount(count);
    };

    updateSyncCount();

    const handleOnline = async () => {
      setIsOnline(true);
      setIsSyncing(true);
      await flushOfflineQueue();
      await updateSyncCount();
      setIsSyncing(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const interval = setInterval(updateSyncCount, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);

  const handleManualSync = async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    await flushOfflineQueue();
    const count = await getOfflineQueueCount();
    setPendingSyncCount(count);
    setIsSyncing(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-parchment/95 backdrop-blur-md border-b border-parchment-200 transition-colors">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left Brand */}
          <KliKLogo variant="compact" />

          {/* Right Status Badges & Controls */}
          <div className="flex items-center gap-1.5">
            {/* Share App Button */}
            <button
              onClick={() => setIsShareOpen(true)}
              className="p-2 rounded-full text-ink-muted hover:text-teal-festival hover:bg-parchment-200 focus-visible:ring-2 focus-visible:ring-terracotta-festival transition-colors"
              title="Share KliK 2026 Festival App"
              aria-label="Share Festival App"
            >
              <Share2 className="w-4 h-4 text-terracotta-festival" aria-hidden="true" />
            </button>

            {/* Offline / Online indicator */}
            {!isOnline ? (
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-terracotta-festival text-white shadow-sm"
                title="You are currently offline. Changes are saved locally on your device."
                role="status"
                aria-live="polite"
              >
                <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Offline</span>
              </span>
            ) : pendingSyncCount > 0 ? (
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-mustard-festival text-ink-festival hover:bg-mustard-light transition-colors"
                title={`${pendingSyncCount} check-in(s) waiting to sync. Tap to sync now.`}
                aria-label={`Sync ${pendingSyncCount} pending items`}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`}
                  aria-hidden="true"
                />
                <span>Sync ({pendingSyncCount})</span>
              </button>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium text-eucalyptus-festival bg-eucalyptus-festival/10"
                title="Connected to network"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-eucalyptus-festival animate-pulse" />
                <span>Live</span>
              </span>
            )}

            {/* Organiser Portal Link (Demonstration) */}
            <Link
              href="/admin"
              className="p-2 rounded-full text-ink-muted hover:text-teal-festival hover:bg-parchment-200 focus-visible:ring-2 focus-visible:ring-terracotta-festival transition-colors"
              title="Organizer Portal"
              aria-label="Organizer Portal"
            >
              <Shield className="w-4 h-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="border-pattern-klik w-full" aria-hidden="true" />
      </header>

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
    </>
  );
};
