"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Camera, X, AlertCircle, Smartphone } from "lucide-react";

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BarcodeDetectorResult {
  rawValue?: string;
}

interface BarcodeDetectorLike {
  detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]>;
}

declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => BarcodeDetectorLike;
  }
}

/**
 * Safely validates that a scanned QR URL belongs to a KLiK Quest check-in route
 * and extracts the internal path + query string (preventing open-redirect attacks).
 */
function parseKlikCheckInPath(rawValue: string): string | null {
  try {
    const trimmed = rawValue.trim();
    if (trimmed.startsWith("/check-in/")) {
      return trimmed;
    }
    const parsed = new URL(trimmed);
    if (parsed.pathname.startsWith("/check-in/")) {
      return `${parsed.pathname}${parsed.search}`;
    }
    return null;
  } catch {
    return null;
  }
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [status, setStatus] = useState<
    "initializing" | "scanning" | "unsupported" | "denied" | "error"
  >("initializing");
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const stopCamera = () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };

    const startScanner = async () => {
      setStatus("initializing");
      setFeedback(null);

      // Check browser support for in-app BarcodeDetector + getUserMedia
      if (
        typeof window === "undefined" ||
        !navigator.mediaDevices?.getUserMedia ||
        typeof window.BarcodeDetector === "undefined"
      ) {
        setStatus("unsupported");
        return;
      }

      try {
        const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setStatus("scanning");

        let lastScanTime = 0;
        const scanLoop = async (timestamp: number) => {
          if (cancelled) return;
          if (timestamp - lastScanTime > 250 && videoRef.current && videoRef.current.readyState >= 2) {
            lastScanTime = timestamp;
            try {
              const results = await detector.detect(videoRef.current);
              for (const item of results) {
                if (item.rawValue) {
                  const internalPath = parseKlikCheckInPath(item.rawValue);
                  if (internalPath) {
                    stopCamera();
                    onClose();
                    router.push(internalPath);
                    return;
                  } else {
                    setFeedback(
                      "That QR code is not an official KLiK Quest venue checkpoint sign."
                    );
                  }
                }
              }
            } catch {
              // Ignore transient frame decode failures
            }
          }
          rafRef.current = requestAnimationFrame(scanLoop);
        };

        rafRef.current = requestAnimationFrame(scanLoop);
      } catch (err: unknown) {
        if (cancelled) return;
        const name = err instanceof Error ? err.name : "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setStatus("denied");
        } else {
          setStatus("error");
        }
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [isOpen, onClose, router]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-teal-dark/75 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-modal-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-parchment-50 w-full max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border border-parchment-300 shadow-2xl z-10 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-festival text-white flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h3
                id="qr-scanner-modal-title"
                className="font-serif font-bold text-lg text-teal-festival leading-tight"
              >
                Scan Venue QR Code
              </h3>
              <p className="text-xs text-ink-muted">
                Point your camera at the KLiK Quest checkpoint poster
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR scanner"
            className="min-w-[40px] min-h-[40px] rounded-full text-ink-muted hover:text-teal-festival hover:bg-parchment-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {status === "scanning" || status === "initializing" ? (
          <div className="space-y-3">
            <div className="relative w-full aspect-square max-h-[300px] rounded-2xl overflow-hidden bg-teal-dark border-2 border-teal-festival/30 flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {/* Scanning reticle */}
              <div
                className="absolute inset-8 border-2 border-mustard-light/85 rounded-2xl pointer-events-none"
                aria-hidden="true"
              />
              {status === "initializing" && (
                <div className="absolute inset-0 bg-teal-dark/80 flex flex-col items-center justify-center text-white text-xs gap-2">
                  <Camera className="w-6 h-6 animate-pulse text-mustard-light" />
                  <span>Starting camera...</span>
                </div>
              )}
            </div>

            {feedback && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
                <span>{feedback}</span>
              </div>
            )}

            <p className="text-xs text-ink-muted text-center">
              Tip: You can also scan any venue QR sign directly with your phone&apos;s built-in Camera app.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-parchment-100 border border-parchment-300 space-y-3 text-xs text-ink-festival">
            <div className="flex items-start gap-2.5">
              <Smartphone className="w-5 h-5 text-terracotta-festival shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <strong className="block font-bold text-sm text-teal-festival">
                  {status === "denied"
                    ? "Camera permission was blocked"
                    : "Use your phone's native Camera app"}
                </strong>
                <p className="text-ink-muted leading-relaxed">
                  {status === "denied"
                    ? "Allow camera access in your browser settings, or simply open your phone's regular Camera app and point it at the KLiK Quest QR poster at the venue."
                    : "Open your phone's regular Camera app and point it at the displayed KLiK Quest QR poster at the venue — tap the link banner that appears to complete your check-in immediately."}
                </p>
                <p className="text-ink-muted leading-relaxed">
                  If the QR sign is damaged or won&apos;t scan, close this window and tap{" "}
                  <strong className="text-teal-festival">Check In Using My Location</strong> or{" "}
                  <strong className="text-teal-festival">Having trouble checking in?</strong> beside that venue.
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-teal-festival hover:bg-teal-light text-white font-bold text-xs transition-colors"
        >
          Close Scanner
        </button>
      </div>
    </div>
  );
};
