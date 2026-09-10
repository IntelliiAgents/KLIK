"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Share2, Copy, Check, X, Send, Mail, Smartphone } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  text?: string;
  url?: string;
}

export const DEFAULT_PRODUCTION_URL = "https://klik2026.netlify.app";

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title = "KliK 2026 - Kleinmond Inniebos Kunstefees",
  text = "Join 19+ featured artists in Kleinmond for KliK 2026! Stories, poetry, music, visual arts, and community from 27-29 November 2026.",
  url,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Resolve the public share URL:
  // When running locally (localhost / 127.0.0.1 / private IP), or by default, always share the live
  // public deployment URL (https://klik2026.netlify.app) so recipients can access the app.
  const getShareUrl = (): string => {
    if (url && !url.includes("localhost") && !url.includes("127.0.0.1")) {
      return url;
    }
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isLocal =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("192.168.") ||
        hostname.startsWith("10.") ||
        hostname.endsWith(".local");

      if (!isLocal && window.location.origin) {
        return window.location.origin;
      }
    }
    return DEFAULT_PRODUCTION_URL;
  };

  const shareUrl = getShareUrl();

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {}
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: shareUrl,
        });
        onClose();
      } catch {}
    }
  };

  const shareUrlEnc = encodeURIComponent(shareUrl);
  const textEnc = encodeURIComponent(text + "\n\n" + shareUrl);

  const sharePlatforms = [
    {
      name: "WhatsApp",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.699c.971.53 1.771.815 2.796.815 3.181 0 5.767-2.586 5.768-5.766 0-3.180-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.514-4.486 10-10 10-1.802 0-3.486-.481-4.945-1.32l-5.055 1.325 1.353-4.942c-.933-1.498-1.353-3.235-1.353-5.063 0-5.514 4.486-10 10-10 5.514 0 10 4.486 10 10z" />
        </svg>
      ),
      color: "bg-[#25D366] text-white hover:bg-[#1EBE5B]",
      href: "https://api.whatsapp.com/send?text=" + textEnc,
    },
    {
      name: "Facebook",
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "bg-[#1877F2] text-white hover:bg-[#166FE5]",
      href: "https://www.facebook.com/sharer/sharer.php?u=" + shareUrlEnc,
    },
    {
      name: "X (Twitter)",
      icon: (
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      color: "bg-black text-white hover:bg-neutral-800",
      href:
        "https://twitter.com/intent/tweet?url=" +
        shareUrlEnc +
        "&text=" +
        encodeURIComponent(title + " - " + text),
    },
    {
      name: "Telegram",
      icon: <Send className="w-5 h-5" />,
      color: "bg-[#229ED9] text-white hover:bg-[#1E8CC2]",
      href:
        "https://t.me/share/url?url=" +
        shareUrlEnc +
        "&text=" +
        encodeURIComponent(title + "\n" + text),
    },
    {
      name: "Email",
      icon: <Mail className="w-5 h-5" />,
      color: "bg-teal-festival text-white hover:bg-teal-light",
      href: "mailto:?subject=" + encodeURIComponent(title) + "&body=" + textEnc,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Share KliK 2026"
    >
      <div
        className="relative max-w-sm w-full bg-parchment-50 rounded-3xl overflow-hidden shadow-2xl border border-parchment-300 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-parchment-200 flex items-center justify-between bg-parchment-100">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-terracotta-festival" />
            <h3 className="font-serif font-bold text-base text-teal-festival">Share KliK 2026</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-parchment-300 text-ink-muted hover:text-ink-festival transition-colors"
            aria-label="Close share dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Card Preview with Square Artwork */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-parchment-100 border border-parchment-300">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-parchment-300 bg-white shadow-xs">
              <Image
                src="/assets/klik-share-square.jpg"
                alt="KliK 2026 Official Festival Artwork"
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0 text-left">
              <span className="font-serif font-bold text-xs text-teal-festival block truncate">
                {title}
              </span>
              <p className="text-[11px] text-ink-muted line-clamp-2 mt-0.5 leading-snug">
                {text}
              </p>
              <span className="text-[10px] font-mono text-terracotta-festival block mt-0.5 truncate">
                {shareUrl}
              </span>
            </div>
          </div>

          {/* Social Platform Icons */}
          <div>
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-2">
              Share via
            </span>
            <div className="grid grid-cols-5 gap-2">
              {sharePlatforms.map((platform) => (
                <a
                  key={platform.name}
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={
                    "flex flex-col items-center justify-center p-2 rounded-2xl transition-transform active:scale-95 shadow-xs " +
                    platform.color
                  }
                  title={"Share on " + platform.name}
                >
                  {platform.icon}
                  <span className="text-[9px] font-bold mt-1 tracking-tight text-center truncate w-full">
                    {platform.name.split(" ")[0]}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Device Native Share */}
          {typeof navigator !== "undefined" && !!navigator.share && (
            <button
              onClick={handleNativeShare}
              className="w-full py-2.5 p-4 rounded-xl bg-parchment-200 hover:bg-parchment-300 text-teal-festival text-xs font-bold flex items-center justify-center gap-2 border border-parchment-300 transition-colors"
            >
              <Smartphone className="w-4 h-4 text-terracotta-festival" />
              <span>More sharing options (Device Share Sheet)</span>
            </button>
          )}

          {/* Copy Link Input Bar */}
          <div className="pt-1">
            <span className="text-[11px] font-bold text-ink-muted uppercase tracking-wider block mb-1.5">
              Or copy link
            </span>
            <div className="flex items-center gap-2 p-1.5 rounded-xl bg-parchment-100 border border-parchment-300">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-transparent px-2 text-xs font-mono text-ink-festival truncate outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className={
                  "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs " +
                  (copied
                    ? "bg-emerald-600 text-white"
                    : "bg-teal-festival text-white hover:bg-teal-light")
                }
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
