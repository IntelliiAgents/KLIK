import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { TopHeader } from "@/components/Navigation/TopHeader";
import { BottomNav } from "@/components/Navigation/BottomNav";
import { InstallPrompt } from "@/components/UI/InstallPrompt";
import { UpdatePrompt } from "@/components/UI/UpdatePrompt";
import { SimulatedMailboxNotification } from "@/components/Auth/SimulatedMailboxNotification";

export const metadata: Metadata = {
  title: "KliK 2026 — Kleinmond inniebos Kunstefees | Official Festival App",
  description:
    "Official festival guide for KliK 2026. Explore full programmes, artists, venues, interactive maps, shuttle rides, and book tickets for 27–29 November 2026 in Kleinmond.",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL("https://klik2026.netlify.app"),
  openGraph: {
    title: "KliK 2026 — Kleinmond inniebos Kunstefees",
    description:
      "Explore the official festival programme, artists, venue map, and book tickets for Kleinmond inniebos Kunstefees (27–29 Nov 2026).",
    url: "https://klik2026.netlify.app",
    siteName: "KliK 2026 Kunstefees",
    images: [
      {
        url: "https://klik2026.netlify.app/og-square.jpg",
        width: 600,
        height: 600,
        alt: "KliK 2026 — Kleinmond inniebos Kunstefees",
      },
      {
        url: "https://klik2026.netlify.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KliK 2026 — Kleinmond inniebos Kunstefees",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KliK 2026 — Kleinmond inniebos Kunstefees",
    description:
      "Official festival guide: programme, artists, venues, and ticket booking. 27–29 November 2026, Kleinmond.",
    images: ["https://klik2026.netlify.app/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/assets/klik-round-logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KliK 2026",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#263E47",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/assets/klik-round-logo-128.png" type="image/png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-parchment text-ink-festival selection:bg-terracotta-festival selection:text-white antialiased">
        <TopHeader />
        <main className="flex-1 max-w-3xl lg:max-w-4xl w-full mx-auto px-4 sm:px-6 pt-3 pb-24 sm:pb-28">
          {children}
        </main>

        <SimulatedMailboxNotification />
        <InstallPrompt />
        <UpdatePrompt />
        <BottomNav />

        {/* Register Service Worker client script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(reg) { console.log('KliK SW registered:', reg.scope); },
                    function(err) { console.warn('KliK SW registration failed:', err); }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
