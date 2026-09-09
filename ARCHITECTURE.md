# System Architecture: KliK 2026 Progressive Web App

## 1. High-Level Overview

The **KliK 2026 Progressive Web App** is engineered as an offline-first, mobile-centric festival guide for attendees and organizers of the **Kleinmond Inniebos Kunstefees** in the Overstrand region of South Africa. 

Due to the coastal mountain geography of Kleinmond, mobile network connectivity can be intermittent. The application is architected with a **Local-First, Cloud-Synced** pattern:
- The device remains fully functional even with zero connectivity.
- Data such as saved schedules, check-ins, and quest progress are stored persistently in **IndexedDB** on the client.
- The user interface operates against a clean **Repository Abstraction** (`FestivalRepository`) that defaults to local seed data and transitions automatically to **Supabase** when credentials are provided.
- Maps dynamically adapt: if Mapbox credentials or WebGL are missing or network connectivity is cut, an accessible, searchable, filterable **Venue Directory** serves all venue information and external GPS navigation.

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 15 App Shell                 │
│  (Home, Programme, Map, KliK Quest, My Festival, Admin)│
└───────────────┬────────────────────────┬───────────────┘
                │                        │
       ┌────────▼────────┐      ┌────────▼────────┐
       │ Service Worker  │      │ IDB Storage     │
       │ (sw.js Cache)   │      │ (Offline Queue) │
       └────────┬────────┘      └────────┬────────┘
                │                        │
       ┌────────▼────────────────────────▼────────┐
       │        FestivalRepository Abstraction    │
       └────────┬────────────────────────┬────────┘
                │                        │
     ┌──────────▼─────────┐    ┌─────────▼─────────┐
     │ Local Seed Adapter │    │ Supabase Adapter  │
     │ (Zero Credentials) │    │ (Cloud Production)│
     └────────────────────┘    └───────────────────┘
```

---

## 2. Technology Stack & Rationale

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | Server-side rendering, streaming, static generation, minimal client JavaScript. |
| **Language** | TypeScript (Strict Mode) | Strong domain type safety across festival events, venues, challenges, and check-ins. |
| **Styling** | Tailwind CSS 3.4 | Mobile-first design system utilizing custom brand tokens derived from official festival artwork (`parchment`, `teal`, `terracotta`, `mustard`, `eucalyptus`). |
| **Client Storage** | IndexedDB (`idb` v8) | High-capacity durable storage for saved events, offline check-in queue, and anonymous participant tokens. |
| **Mapping** | Mapbox GL JS + SVG Fallback | Interactive satellite/outdoor maps with custom pins, dynamically loaded only on the map route. Gracefully falls back to accessible venue list. |
| **PWA & Offline** | Web App Manifest + Service Worker | Standalone mobile installability, caching of app shell, icons, fonts, and offline fallback routing. |
| **Database & Auth** | Supabase (PostgreSQL + RLS) | Cloud database and edge functions for festival data, secure QR token verification, and organizer role checks. |

---

## 3. Storage & Offline Synchronization Architecture

### Client-Side Database Schema (IndexedDB: `klik-2026-store`)
1. **`saved_events`**: Stores bookmarked events (`eventId`, `savedAt`). Indexed by `savedAt`.
2. **`check_ins`**: Stores recorded check-ins (`id`, `participantId`, `locationId`, `timestamp`, `syncStatus`, `tokenUsed`).
3. **`offline_queue`**: Stores check-ins captured while offline (`id`, `checkIn`, `attemptCount`, `lastAttemptAt`).
4. **`keyval`**: Stores key-value metadata (e.g., dismissed notices, install prompt preferences).

### Synchronization Lifecycle
1. When a user scans a festival QR code or opens `/check-in/[locationId]?token=...`:
   - If online: The check-in is saved to `check_ins` with status `verified`.
   - If offline: The check-in is saved with status `captured_offline` and placed in `offline_queue`.
2. The application listens for `window.online` and foreground visibility changes.
3. Upon network reconnection, `flushOfflineQueue()` is invoked, processing all queued items and updating their status to `verified`.
4. Users are provided an explicit "Sync Now" header button displaying the pending count when items are awaiting sync.

---

## 4. Quicket Boundary & Ticketing Flow

The KliK PWA strictly respects ticketing boundaries:
- **No In-App Payment**: Financial transactions, ticket sales, credit card processing, and ticket inventory management are delegated to **Quicket**.
- **Deep-Links**: Events feature an official Quicket link pointing directly to `https://www.quicket.co.za/events/339579-kleinmond-inniebos-kunstefees-klik/`.
- **Free vs. Ticketed Differentiation**: Free community workshops and open-mic gatherings are explicitly highlighted with a green badge, requiring no tickets. Ticketed sessions display their price and direct Quicket booking actions.

---

## 5. Security & Row-Level Security (RLS) Design

The Supabase PostgreSQL migration (`supabase/migrations/20260101000000_klik_initial_schema.sql`) implements strict Row-Level Security:
1. **Public Read**: Festivals, editions, venues, artists, events, and active notices are readable by any client (`SELECT USING (true)`).
2. **Participant Isolation**: Participants and check-ins are restricted: users can insert their check-ins, but can only read check-ins tied to their participant ID.
3. **Organizer Role**: Mutations to the schedule (`events`, `venues`, `notices`) require an authenticated Supabase user whose JWT contains `role = 'organizer'`.
4. **QR Code Verification**: QR tokens use cryptographic nonces to prevent attendees from forging check-ins without physically visiting the checkpoint signs.

---

## 6. Accessibility & Older Device Optimization

- Target standard: **WCAG 2.2 AA**.
- Minimum touch target: `48px × 48px` on bottom navigation and primary interactive elements.
- Visible focus rings with high-contrast terracotta outline (`#C8522C`).
- Respects `prefers-reduced-motion` by nullifying CSS animations and transitions.
- Semantic HTML landmarks (`<header>`, `<main>`, `<nav>`, `<article>`, `<section>`).
- Full screen-reader and non-WebGL compatibility via the comprehensive Venue Directory list view.
