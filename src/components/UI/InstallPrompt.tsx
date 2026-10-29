"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if already running as installed standalone app
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return;
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Capture Chrome/Android install event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Only auto-show when the browser genuinely fires beforeinstallprompt or on iOS,
    // and only if not dismissed in the last 12 hours, after a calm 4-second delay
    const dismissedTime = localStorage.getItem("klik_install_dismissed");
    const twelveHours = 12 * 60 * 60 * 1000;
    const isRecentlyDismissed =
      dismissedTime && Date.now() - parseInt(dismissedTime, 10) < twelveHours;

    const timer = setTimeout(() => {
      if (!isRecentlyDismissed && !isStandalone && (deferredPrompt || isAppleDevice)) {
        setShowPrompt(true);
      }
    }, 4000);

    // Custom event to trigger prompt manually (e.g. from More menu)
    const handleManualTrigger = () => {
      setShowPrompt(true);
      if (deferredPrompt) {
        deferredPrompt.prompt();
      } else if (isAppleDevice) {
        setShowIOSGuide(true);
      }
    };

    window.addEventListener("klik_trigger_install_prompt", handleManualTrigger);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("klik_trigger_install_prompt", handleManualTrigger);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      alert(
        "To install KliK on your device, open your browser menu (⋮ or Share icon) and choose 'Add to Home screen' or 'Install App'."
      );
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("klik_install_dismissed", Date.now().toString());
  };

  return (
    <>
      {showPrompt && (
        <aside
          role="dialog"
          aria-label="Install Festival App"
          className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-40 animate-in fade-in duration-300"
        >
          <div className="bg-parchment-50 text-ink-festival rounded-2xl p-4 shadow-raised border border-parchment-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-white p-1 shrink-0 border border-parchment-300 shadow-xs">
                  <Image
                    src="/assets/klik-round-logo-128.png"
                    alt="KliK App Icon"
                    width={44}
                    height={44}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <span className="editorial-kicker">Offline Companion</span>
                  <h3 className="font-serif font-bold text-sm sm:text-base text-teal-festival leading-tight mt-0.5">
                    Save KliK 2026 to Home Screen
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full hover:bg-parchment-200 text-ink-muted hover:text-ink-festival flex items-center justify-center transition-colors shrink-0"
                aria-label="Dismiss installation prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-ink-muted mt-2 mb-3 leading-relaxed">
              Access your saved schedule, artist bios, and festival venues even when coastal signal drops.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 min-h-[40px] py-2 px-3.5 rounded-xl bg-teal-festival hover:bg-teal-light text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isIOS ? "How to Add on iPhone" : "Install App"}</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="min-h-[40px] py-2 px-3 rounded-xl bg-parchment-200/80 hover:bg-parchment-300 text-ink-muted hover:text-ink-festival text-xs font-semibold transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* iOS Safari Step-by-Step Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-parchment-50 text-ink-festival w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-parchment-300 animate-in fade-in space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="editorial-kicker">iPhone &amp; iPad Safari</span>
                <h3 className="font-serif font-bold text-xl text-teal-festival leading-tight mt-0.5">
                  Add KliK to Home Screen
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-8 h-8 rounded-full hover:bg-parchment-200 flex items-center justify-center text-ink-muted"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Install the KliK 2026 festival companion directly from Safari — no App Store download needed:
            </p>

            <ol className="space-y-2.5 text-xs text-ink-festival">
              <li className="flex items-start gap-3 bg-white p-3 rounded-xl border border-parchment-200">
                <span className="w-6 h-6 rounded-full bg-teal-festival text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  Tap the{" "}
                  <strong className="inline-flex items-center gap-1 font-bold text-teal-festival">
                    <Share2 className="w-3.5 h-3.5 text-teal-accent inline" /> Share
                  </strong>{" "}
                  button in Safari&apos;s toolbar.
                </div>
              </li>

              <li className="flex items-start gap-3 bg-white p-3 rounded-xl border border-parchment-200">
                <span className="w-6 h-6 rounded-full bg-teal-festival text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  Scroll down and tap{" "}
                  <strong className="inline-flex items-center gap-1 font-bold text-terracotta-festival">
                    <PlusSquare className="w-3.5 h-3.5 text-terracotta-festival inline" /> Add to Home Screen
                  </strong>
                  .
                </div>
              </li>

              <li className="flex items-start gap-3 bg-white p-3 rounded-xl border border-parchment-200">
                <span className="w-6 h-6 rounded-full bg-teal-festival text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  Tap <strong className="font-bold text-teal-festival">Add</strong> in the top-right corner.
                </div>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => {
                setShowIOSGuide(false);
                setShowPrompt(false);
              }}
              className="w-full py-3 rounded-xl bg-teal-festival text-white font-bold text-xs hover:bg-teal-light transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};
