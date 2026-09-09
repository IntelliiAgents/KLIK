import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import { TopHeader } from "@/components/Navigation/TopHeader";
import { BottomNav } from "@/components/Navigation/BottomNav";
import { InstallPrompt } from "@/components/UI/InstallPrompt";

export const metadata: Metadata = {
  title: "KliK 2026 - Kleinmond Inniebos Kunstefees",
  description:
    "Official Progressive Web App for KliK 2026 Kunstefees. Stories, poetry, music, art and community in Kleinmond, Western Cape.",
  manifest: "/manifest.webmanifest",
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
        <link rel="icon" href="/icons/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col bg-parchment text-ink-festival selection:bg-terracotta-festival selection:text-white antialiased">
        <TopHeader />

        <main className="flex-1 max-w-md w-full mx-auto px-4 pt-3 pb-24 sm:pb-28">
          {children}
        </main>

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
