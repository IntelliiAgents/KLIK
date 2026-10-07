# KliK 2026: Kleinmond Inniebos Kunstefees Progressive Web App

A resilient, mobile-first Progressive Web App (PWA) for the **KliK 2026 Kunstefees** (27–29 November 2026) across various venues in Kleinmond, Overstrand, Western Cape, South Africa.

Official ticketing and festival info:  
[https://www.quicket.co.za/events/339579-kleinmond-inniebos-kunstefees-klik/](https://www.quicket.co.za/events/339579-kleinmond-inniebos-kunstefees-klik/)

---

## 🎨 Visual Identity & Brand System

Derived from the official festival artwork:
- **Warm Parchment Background**: `#FAF6EE` (`#F8F4EB`)
- **Deep Coastal Teal**: `#133D4B`
- **Burnt Terracotta**: `#C8522C`
- **Mustard & Sand Accents**: `#DE9E36`
- **Overstrand Eucalyptus & Olive**: `#4B6354`
- **Protea Coral**: `#D33E36`

---

## 🧭 Simplified Attendee UX Architecture

Designed specifically for older residents, visitors, tourists, and first-time smartphone users attending the festival:

1. **Answers the 4 Core Questions Immediately**:
   - **What is happening now?** Dedicated prominent cards on the Home screen.
   - **What is happening next?** Chronological upcoming shows directly below.
   - **What would I like to attend?** Clean time-dominated Programme with 3 large day tabs (**FRI 27**, **SAT 28**, **SUN 29**) and one simple **Filter** button.
   - **How do I get there?** One-tap **Directions** on every card, accessible venue directory, and official **Get a Ride** shuttle requests via WhatsApp.

2. **5-Item Primary Navigation**:
   - **Home** (`/`)
   - **Programme** (`/programme`)
   - **Map** (`/map`)
   - **My Festival** (`/my-festival`)
   - **More** (`/more` - Transport, Culture Trail, Tickets, Partners, About, Help)

3. **Zero Jargon in Attendee UI**:
   - No device IDs, sync counters, Supabase/IDB notices, or Mapbox token warnings are shown to attendees.
   - Friendly offline notifications: *"You're offline. Your saved programme is still available."* and *"Back online."*

4. **"Get a Ride" Shuttle Feature**:
   - Allows attendees to share their live GPS location via WhatsApp to request the festival shuttle, with a manual venue pickup point fallback.

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js `v18.18+` or `v20+` or `v22+`
- npm `v9+` or `v10+` or `v11+`

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your desktop or mobile browser.

### 4. Build for Production
```bash
npm run build
npm run start
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

| Variable | Description | Default / Fallback |
|---|---|---|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Public Mapbox GL token for interactive map | If empty, automatically displays the accessible venue directory fallback with Google/Apple navigation |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | If empty, uses local seed repository with IndexedDB |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anonymous API key | Optional for local demo |
| `NEXT_PUBLIC_APP_URL` | Base URL for QR deep-links and social shares | `http://localhost:3000` |
| `NEXT_PUBLIC_SHUTTLE_PHONE` | Festival shuttle WhatsApp contact number | `+27821234567` |

---

## 📱 How to Test PWA Installation

### Chrome / Edge (Desktop & Android):
1. Navigate to `http://localhost:3000` or production deployment.
2. Tap the floating install banner or use **More > Install KliK App**.
3. Tap **Install** to add KliK 2026 as a standalone application.

### Safari (iOS iPhone / iPad):
1. Open the site in Safari.
2. Tap the **Share** icon at the bottom of the screen.
3. Scroll down and tap **Add to Home Screen**.
4. Launch KliK from your home screen with no browser chrome.

---

## 📴 How to Test Offline Behavior

1. Open DevTools in Chrome or Edge (`F12`).
2. Open the **Network** tab and toggle network to **"Offline"**.
3. Notice the header displays a friendly banner: *"You're offline. Your saved programme is still available."*
4. Navigate to `/programme`, view event details, save sessions, and open `/my-festival`—all data loads immediately from IndexedDB.
5. Toggle network back to **"No throttling"**. The banner updates to *"Back online."* and automatically synchronizes queued items in the background.

---

## 🛡️ Organizer Admin Portal

Organizers can access the operations console at `/admin` (or via the discreet link in **More**):
- **Demo Passcode**: `klik2026`
- **Features**: Live event status overrides (Happening Now, Moved, Cancelled), instant emergency notice broadcasts, venue inspection, and quest configuration review.

---

## 📂 Project Structure

```
├── public/
│   ├── assets/              # Festival artwork & poster
│   ├── icons/               # PWA icons (192, 512, maskable, svg)
│   └── sw.js                # Custom Service Worker
├── src/
│   ├── app/                 # Next.js App Router (Home, Programme, Map, My Festival, More, Ride, Quest, Admin)
│   ├── components/          # Reusable UI, Navigation, Events, Map, Brand, Quest
│   ├── lib/
│   │   ├── analytics.ts     # Anonymous attendee interaction tracking hooks
│   │   ├── config.ts        # Festival info & shuttle WhatsApp integration
│   │   ├── data/seed.ts     # Authentic seed data matching poster artists
│   │   ├── db/idb.ts        # IndexedDB device storage & offline queue
│   │   ├── db/repository.ts # Local & Supabase repository adapters
│   │   └── types/index.ts   # Domain models
│   └── styles/globals.css   # Tailwind styles & brand tokens
├── ARCHITECTURE.md
├── DATA_MODEL.md
├── DECISIONS.md
├── IMPLEMENTATION_PLAN.md
└── README.md
```
