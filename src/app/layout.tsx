import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { TopHeader } from "@/components/Navigation/TopHeader";
import { BottomNav } from "@/components/Navigation/BottomNav";
import { InstallPrompt } from "@/components/UI/InstallPrompt";
import { SimulatedMailboxNotification } from "@/components/Auth/SimulatedMailboxNotification";

export const metadata: Metadata = {
  title: "KliK 2026 - Kleinmond Inniebos Kunstefees",
  description:
    "Official Progressive Web App for KliK 2026 Kunstefees. Stories, poetry, music, art and community in Kleinmond, Western Cape. 27–29 November 2026.",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://klik2026.netlify.app"
  ),
  openGraph: {
    title: "KliK 2026 | Kleinmond Inniebos Kunstefees",
    description:
      "Official PWA for KliK 2026 Kunstefees. Stories, poetry, music, art and community in Kleinmond. 27–29 November 2026.",
    url: process.env.NEXT_PUBLIC_APP_URL || "https://klik2026.netlify.app",
    siteName: "KliK 2026 Kunstefees",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "KliK 2026 Kleinmond Inniebos Kunstefees Official Artwork",
      },
      {
        url: "/og-square.jpg",
        width: 600,
        height: 600,
        alt: "KliK 2026 Official Logo Square",
      },
    ],
    locale: "en_ZA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KliK 2026 | Kleinmond Inniebos Kunstefees",
    description:
      "Official PWA for KliK 2026 Kunstefees. Stories, poetry, music, art and community in Kleinmond.",
    images: ["/og-image.jpg"],
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
  themeColor: "#133D4B",
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

        <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3 pb-24 sm:pb-28">
          {children}
        </main>

        <SimulatedMailboxNotification />
        <InstallPrompt />
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
