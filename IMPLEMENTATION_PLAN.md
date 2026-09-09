# Implementation Plan - KliK 2026 Progressive Web App (MVP)

A resilient, mobile-first Progressive Web App for **KliK 2026 (Kleinmond Inniebos Kunstefees)**, 27–29 November 2026 in Kleinmond, Western Cape, South Africa.

## 1. Objectives & Scope
- Deliver a production-quality, mobile-first PWA for festival-goers and organizers.
- Respect and embody the visual identity derived from official artwork: warm parchment background (`#FBF8F2`), deep teal (`#133D4B`), terracotta (`#C8522C`), mustard/sand (`#DE9E36`), olive green (`#4B6354`), and charcoal ink (`#1E262B`).
- Fully operable without credentials (mock/seed repository adapter + IndexedDB local persistence), with clean plug-in points for Supabase (DB/Auth/Storage) and Mapbox GL.
- Resilient offline capability: Service worker cache, IndexedDB event saves, offline check-in queue with automatic resynchronization.

## 2. Architecture & Components
1. **Core Shell & Navigation**:
   - Fixed mobile bottom navigation with 5 primary destinations: Home, Programme, Map, KliK Quest, My Festival.
   - Header with quick status (offline/online indicator, notices bell, anonymous participant sync indicator).
2. **Home Screen**:
   - Hero with KliK typography and visual identity (respecting original logo proportions).
   - "Happening Now" and "Coming Up Next" dynamic widgets.
   - Festival notice banner (live updates).
   - Featured free & ticketed events teaser.
   - Quicket integration link (`https://www.quicket.co.za/events/339579-kleinmond-inniebos-kunstefees-klik/`).
   - Non-intrusive contextual PWA installation trigger.
3. **Programme Screen**:
   - Day tabs (Friday 27 Nov, Saturday 28 Nov, Sunday 29 Nov 2026).
   - Search bar with instant debounced filtering.
   - Filters: Categories (Poetry, Music, Theatre, Stories, Workshops, Youth, Art, Market, Food & Drink), Venues, Free vs Ticketed.
   - Chronological event timeline cards with live status badges ("Happening now", "Starting in 30m").
   - Event details modal/page with bilingual metadata (Afrikaans/English), artist roster, accessibility info, Quicket ticket button, directions trigger, and "Save to My Festival".
4. **Map & Venues Screen**:
   - Mapbox GL dynamic component with markers categorized by venue type (Performance, Workshop, Market, Youth, Food/Drink, Parking, Toilets, First Aid, Info, Outdoor).
   - Graceful fallback: When `NEXT_PUBLIC_MAPBOX_TOKEN` is missing, WebGL is disabled, or client is offline, a rich, searchable, filterable Venue List is displayed seamlessly.
   - External directions links to Google Maps and Apple Maps with GPS coordinates.
5. **KliK Quest ("The KliK Culture Trail")**:
   - Typed challenge engine: 5 check-ins across at least 3 distinct activity categories.
   - Visual progress tracker showing completed vs required stops.
   - Celebration screen upon completion with prize eligibility lottery marker.
6. **QR Check-In Flow**:
   - Route: `/check-in/[locationId]?token=[signedToken]`
   - Displays location name, category, and confirmation button.
   - Duplicate prevention check against existing check-in history.
   - Stores locally in IndexedDB; queues for server sync if offline or pending verification.
7. **My Festival**:
   - Saved events timeline with overlap/schedule conflict warnings.
   - Check-in history log with offline sync status indicators.
   - Anonymous participant ID generation with export/recovery abstraction.
8. **Organiser Administration (`/admin`)**:
   - Prototype panel for organizers: view venues, edit events, mark events as moved/cancelled, publish festival notices, inspect quest submissions.
9. **PWA & Offline Service Worker**:
   - Web App Manifest (`manifest.webmanifest`) with standalone display, theme colors, icons.
   - Service Worker (`sw.js`) caching app shell, static assets, and essential runtime seed data.
   - Offline fallback page and automatic sync listeners for network reconnection.

## 3. Technology Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with custom KliK theme tokens
- **Local Persistence**: IndexedDB (via `idb` wrapper) + `localStorage` fallback
- **Mapping**: Mapbox GL JS (dynamically imported) + custom SVG pins
- **Icons**: Lucide React
- **PWA**: Custom service worker + W3C Web App Manifest

## 4. Verification & Quality Gates
- TypeScript check (`npx tsc --noEmit`)
- Production build verification (`npm run build`)
- Viewport testing (360x640, 390x844, Desktop)
- Functional verification: Programme filtering, Save event, Conflict detection, QR check-in, Quest progress, Offline behavior, Missing Mapbox token fallback.
