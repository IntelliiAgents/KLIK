"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, X } from "lucide-react";

export const UpdatePrompt: React.FC = () => {
  const [showReload, setShowReload] = useState<boolean>(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const handleServiceWorkerUpdate = (reg: ServiceWorkerRegistration) => {
      // Helper function to check waiting worker
      const checkWaiting = () => {
        if (reg.waiting) {
          setWaitingWorker(reg.waiting);
          setShowReload(true);
        }
      };

      checkWaiting();

      // If an update is found in progress
      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            // New content is available and waiting
            setWaitingWorker(newWorker);
            setShowReload(true);
          }
        });
      });
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg) {
        handleServiceWorkerUpdate(reg);
        // Check for updates periodically when user is active
        try {
          reg.update();
        } catch {
          // ignore
        }
      }
    });

    // Listen for custom event or controller change
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  if (!showReload) {
    return null;
  }

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-[100] animate-in slide-in-from-top duration-300"
    >
      <div className="bg-[#142628]/95 backdrop-blur-md text-white border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-terracotta-festival flex items-center justify-center shrink-0 shadow-sm text-white">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h4 className="font-serif font-bold text-xs sm:text-sm text-white leading-tight">
              Festival Update Available
            </h4>
            <p className="text-[11px] text-parchment-200/90 leading-tight mt-0.5">
              New schedule and festival updates are ready.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleUpdate}
            className="min-h-[36px] px-3 py-1.5 rounded-xl bg-terracotta-festival hover:bg-terracotta-dark text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Update Now</span>
          </button>
          <button
            type="button"
            onClick={() => setShowReload(false)}
            className="w-8 h-8 rounded-lg hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Dismiss update"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
