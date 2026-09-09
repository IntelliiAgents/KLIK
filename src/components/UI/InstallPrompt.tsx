"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Share2, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showIOSGuide, setShowIOSGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if already installed
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

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Check if user has engaged with the app (e.g. saved an event or checked in)
      const hasEngaged =
        localStorage.getItem("klik_saved_events") ||
        localStorage.getItem("klik_check_ins") ||
        localStorage.getItem("klik_has_engaged");

      if (hasEngaged) {
        setShowBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Listen for custom trigger when user saves an event or performs key actions
    const handleEngagement = () => {
      localStorage.setItem("klik_has_engaged", "true");
      if (!isStandalone) {
        setShowBanner(true);
      }
    };

    window.addEventListener("klik_user_engaged", handleEngagement);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("klik_user_engaged", handleEngagement);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Don't ask again for 24 hours
    localStorage.setItem("klik_install_dismissed", Date.now().toString());
  };

  if (!showBanner) return null;

  return (
    <>
      <div
        className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 bg-teal-festival text-parchment-50 p-4 rounded-xl shadow-raised border border-teal-light flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
        role="complementary"
        aria-label="Install app prompt"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-terracotta-festival text-white flex items-center justify-center shrink-0 shadow-sm">
            <Download className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">Install KliK 2026</p>
            <p className="text-xs text-parchment-200">
              {isIOS
                ? "Add to your Home Screen for instant offline access."
                : "Install app for faster offline festival access."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-lg bg-mustard-festival text-ink-festival text-xs font-bold hover:bg-mustard-light focus-visible:ring-2 focus-visible:ring-white transition-colors"
          >
            {isIOS ? "How-To" : "Install"}
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 text-parchment-300 hover:text-white transition-colors"
            aria-label="Dismiss installation prompt"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* iOS Safari Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4">
          <div className="bg-parchment-50 text-ink-festival w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-raised border border-parchment-300 animate-in fade-in zoom-in-95">
            <h3 className="font-serif font-bold text-lg text-teal-festival mb-2">
              Add KliK to your Home Screen
            </h3>
            <p className="text-sm text-ink-muted mb-4 leading-relaxed">
              Install the KliK 2026 festival app directly in Safari without downloading from an app store:
            </p>
            <ol className="space-y-3 text-sm text-ink-festival mb-6">
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-teal-festival/10 text-teal-festival font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <span>
                  Tap the <strong className="inline-flex items-center gap-1 font-semibold"><Share2 className="w-4 h-4 text-teal-festival inline" /> Share</strong> icon in your Safari bottom bar.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-teal-festival/10 text-teal-festival font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <span>
                  Scroll down and tap <strong className="inline-flex items-center gap-1 font-semibold"><PlusSquare className="w-4 h-4 text-terracotta-festival inline" /> Add to Home Screen</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-teal-festival/10 text-teal-festival font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <span>
                  Tap <strong>Add</strong> in the top right. Enjoy seamless offline access!
                </span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-lg bg-teal-festival text-parchment-50 font-semibold text-sm hover:bg-teal-light transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
