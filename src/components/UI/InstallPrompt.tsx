"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Download, X, Share2, PlusSquare, Smartphone, Sparkles, CheckCircle2 } from "lucide-react";

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

    // Check if recently dismissed (within 6 hours)
    const dismissedTime = localStorage.getItem("klik_install_dismissed");
    const sixHours = 6 * 60 * 60 * 1000;
    const isRecentlyDismissed =
      dismissedTime && Date.now() - parseInt(dismissedTime, 10) < sixHours;

    // Automatically prompt after 1.8 seconds if not recently dismissed
    const timer = setTimeout(() => {
      if (!isRecentlyDismissed && !isStandalone) {
        setShowPrompt(true);
      }
    }, 1800);

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
      // General fallback
      alert(
        "To install KLiK on your device, tap your browser's menu (⋮ or Share icon) and choose 'Add to Home screen' or 'Install App'."
      );
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't auto-prompt again for 6 hours
    localStorage.setItem("klik_install_dismissed", Date.now().toString());
  };

  return (
    <>
      {/* Animated Dropdown / Popup Prompt */}
      {showPrompt && (
        <aside
          role="dialog"
          aria-label="Install App Prompt"
          className="fixed top-3 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-top-6 fade-in duration-500 ease-out"
        >
          <div className="bg-[#263E47] text-white rounded-3xl p-4 sm:p-5 shadow-2xl border-2 border-[#D75A35] relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#D75A35]/25 rounded-full blur-2xl pointer-events-none" />

            {/* Header row */}
            <div className="flex items-start justify-between gap-3 relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white p-1 shrink-0 shadow-md">
                  <Image
                    src="/assets/klik-round-logo-128.png"
                    alt="KLiK App Icon"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#D75A35] text-white flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Install Web App</span>
                    </span>
                  </div>
                  <h3 className="font-serif font-black text-base text-white leading-tight">
                    Install KLiK 2026 App
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-colors shrink-0"
                aria-label="Dismiss installation prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Value props */}
            <p className="text-xs text-white/85 mt-2.5 mb-3.5 leading-relaxed">
              Add KLiK to your phone&apos;s Home Screen for the best experience — instant offline maps, daily programme timetables, and live alerts.
            </p>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1 border-t border-white/15">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 min-h-[42px] py-2.5 px-4 rounded-xl bg-[#D75A35] hover:bg-[#D75A35]/90 active:scale-[0.98] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <Download className="w-4 h-4" />
                <span>{isIOS ? "How to Install on iPhone" : "Install on Phone"}</span>
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="min-h-[42px] py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-xs font-medium transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* iOS Safari Step-by-Step Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-end sm:items-center justify-center p-4">
          <div className="bg-[#F7F4EC] text-[#263E47] w-full max-w-sm rounded-3xl p-6 shadow-2xl border-2 border-[#263E47] animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D75A35]">
                  iPhone &amp; iPad Safari
                </span>
                <h3 className="font-serif font-black text-xl text-[#263E47] leading-tight">
                  Add KLiK to Home Screen
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-ink-muted"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-ink-muted leading-relaxed">
              Install the KLiK 2026 festival app directly to your home screen with Safari — no App Store download required:
            </p>

            <ol className="space-y-3 text-xs text-[#263E47]">
              <li className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-parchment-200">
                <span className="w-6 h-6 rounded-full bg-[#263E47] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  Tap the <strong className="inline-flex items-center gap-1 font-bold text-[#263E47]"><Share2 className="w-3.5 h-3.5 text-[#1997A3] inline" /> Share</strong> button in Safari&apos;s bottom navigation bar.
                </div>
              </li>

              <li className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-parchment-200">
                <span className="w-6 h-6 rounded-full bg-[#263E47] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  Scroll down the share menu and tap <strong className="inline-flex items-center gap-1 font-bold text-[#D75A35]"><PlusSquare className="w-3.5 h-3.5 text-[#D75A35] inline" /> Add to Home Screen</strong>.
                </div>
              </li>

              <li className="flex items-start gap-3 bg-white p-3 rounded-2xl border border-parchment-200">
                <span className="w-6 h-6 rounded-full bg-[#263E47] text-white font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  Tap <strong className="font-bold text-[#263E47]">Add</strong> in the top-right corner. The KLiK icon will appear on your phone!
                </div>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => {
                setShowIOSGuide(false);
                setShowPrompt(false);
              }}
              className="w-full py-3 rounded-xl bg-[#263E47] text-white font-bold text-xs hover:bg-[#263E47]/90 transition-colors shadow-sm"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
