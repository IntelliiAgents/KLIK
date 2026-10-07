"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, MapPin, Heart, Menu, WifiOff, CheckCircle2 } from "lucide-react";
import { getSavedEvents, flushOfflineQueue } from "@/lib/db/idb";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  badgeCount?: number;
}

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const [savedCount, setSavedCount] = useState<number>(0);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [showReconnectedBanner, setShowReconnectedBanner] = useState<boolean>(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const updateCount = async () => {
      try {
        const items = await getSavedEvents();
        setSavedCount(items.length);
      } catch {
        // silent
      }
    };

    updateCount();
    const interval = setInterval(updateCount, 2500);
    window.addEventListener("storage", updateCount);

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
      }, 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowReconnectedBanner(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", updateCount);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [pathname]);

  // Do not render bottom attendee nav in admin
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const navItems: NavItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Programme", href: "/programme", icon: Calendar },
    { name: "Map", href: "/map", icon: MapPin },
    { name: "My Festival", href: "/my-festival", icon: Heart, badgeCount: savedCount },
    { name: "More", href: "/more", icon: Menu },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-parchment-100/95 backdrop-blur-md border-t border-parchment-300 shadow-raised pb-[env(safe-area-inset-bottom,0px)]"
      role="navigation"
      aria-label="Main festival navigation"
    >
      <div className="max-w-3xl lg:max-w-4xl mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          const IconComponent = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center h-full min-h-[48px] py-1 px-1 rounded-xl transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta-festival ${
                isActive
                  ? "text-terracotta-festival font-bold"
                  : "text-ink-muted hover:text-teal-festival font-medium"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <IconComponent
                  className={`w-6 h-6 transition-transform ${
                    isActive ? "scale-105 stroke-[2.2]" : "stroke-[1.8]"
                  }`}
                  aria-hidden="true"
                />
                {item.badgeCount && item.badgeCount > 0 ? (
                  <span
                    className="absolute -top-1 -right-2 min-w-[17px] h-[17px] px-1 rounded-full bg-terracotta-festival text-white text-[10px] font-bold flex items-center justify-center leading-none shadow-xs"
                    aria-label={`${item.badgeCount} saved events`}
                  >
                    {item.badgeCount > 99 ? "99+" : item.badgeCount}
                  </span>
                ) : null}
              </div>

              <span className="text-[11px] leading-tight tracking-tight mt-1 truncate max-w-full">
                {item.name}
              </span>

              {isActive && (
                <span
                  className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-terracotta-festival"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
