# Progressive Web App (PWA) Specifications: KliK 2026

## 1. Overview & Capabilities

The **KliK 2026 Progressive Web App** gives festival guests a fast, native-like mobile app experience without requiring installation through the Apple App Store or Google Play Store.

### Key Capabilities:
- **Instant QR Launch**: Attendees scan any festival QR sign and immediately open the full application without installation friction.
- **Optional Home Screen Installation**: Contextual invitations appear after meaningful engagement (saving an event, starting a quest), offering full standalone window experience.
- **Offline Shell & Data**: Caches the core UI, icons, styles, seed data, and venue list so guests can navigate even during mobile network blackouts.
- **Durable Local Storage**: Saved schedules and check-ins persist in IndexedDB and sync upon reconnection.

---

## 2. Web App Manifest

Defined in `src/app/manifest.ts` and generated as `/manifest.webmanifest`:
- **`name`**: "KliK 2026 - Kleinmond Inniebos Kunstefees"
- **`short_name`**: "KliK 2026"
- **`display`**: `"standalone"`
- **`orientation`**: `"portrait"`
- **`theme_color`**: `"#133D4B"` (Deep Teal)
- **`background_color`**: `"#FAF6EE"` (Warm Parchment)
- **`icons`**:
  - `192x192` PNG (`/icons/icon-192.png`)
  - `512x512` PNG (`/icons/icon-512.png`)
  - `512x512` Maskable PNG (`/icons/icon-512-maskable.png`)
  - Scalable vector SVG (`/icons/icon.svg`)

---

## 3. Service Worker Strategy (`public/sw.js`)

The service worker implements tailored caching policies:

### A. Pre-Cached Static Assets (Cache-First)
- App Shell routes: `/`, `/programme`, `/map`, `/quest`, `/my-festival`, `/offline`
- PWA Icons: `/icons/icon.svg`, `/icons/icon-192.png`, `/icons/icon-512.png`
- Manifest: `/manifest.webmanifest`
- Next.js compiled chunks and CSS stylesheets (`/_next/static/*`)

### B. Dynamic Navigation Routes (Stale-While-Revalidate + Fallback)
- Navigation requests are served from cache while updating in the background.
- If the network fails and a requested page has not been cached, the service worker seamlessly returns the `/offline` fallback page.

### C. Excluded from Cache
- Sensitive paths: `/admin` and organizer controls.
- Mapbox tiles (`*.mapbox.com`) to prevent cache bloat.
- High-resolution raw media files.

---

## 4. Install Invitation Logic

To preserve a welcoming user experience, the app does **not** spam visitors with immediate install modals on first load:
1. When `beforeinstallprompt` fires on Chromium / Android, the event is deferred.
2. When the user takes an intentional action (saving an event to My Festival, recording a check-in, or exploring multiple tabs), a custom event `klik_user_engaged` is dispatched.
3. An elegant, non-intrusive floating bar appears at the bottom of the screen with "Install" and "Dismiss" controls.
4. On iOS Safari (which lacks `beforeinstallprompt`), the bar provides clear 3-step instructions on using the Safari Share icon to "Add to Home Screen".
