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
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Public Mapbox GL token for satellite/streets rendering | If empty, automatically displays the accessible venue directory fallback with Google/Apple navigation |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | If empty, uses local seed repository with IndexedDB |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anonymous API key | Optional for local demo |
| `NEXT_PUBLIC_APP_URL` | Base URL for QR deep-links and social shares | `http://localhost:3000` |

---

## 🗺️ How to Configure Mapbox GL

1. Create a free account at [https://account.mapbox.com/](https://account.mapbox.com/).
2. Create a public token with default scopes.
3. Add it to `.env.local`:
   ```env
   NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoieW91ci11c2VyIiwiYSI6InlvdXItdG9rZW4ifQ...
   ```
4. Restart your development server. The map page (`/map`) will load the dynamic 3D/outdoors terrain map. If left blank, the app runs without errors using the accessible directory view.

---

## 🗄️ How to Connect Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste the contents of `supabase/migrations/20260101000000_klik_initial_schema.sql` and run it.
4. Copy your project URL and `anon` key from **Project Settings > API**.
5. Add them to `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

---

## 📱 How to Test PWA Installation

### Chrome / Edge (Desktop & Android):
1. Navigate to `http://localhost:3000` or production deployment.
2. An install icon appears in the browser URL bar, or interact with the app (e.g. save an event to My Festival) to trigger the floating install banner.
3. Tap **Install** to add KliK 2026 as a standalone application.

### Safari (iOS iPhone / iPad):
1. Open the site in Safari.
2. Tap the **Share** icon at the bottom of the screen.
3. Scroll down and tap **Add to Home Screen**.
4. Launch KliK from your home screen with no browser chrome.

---

## 📴 How to Test Offline Behavior

1. Open DevTools in Chrome or Edge (`F12` or right-click -> Inspect).
2. Open the **Network** tab.
3. Toggle the network dropdown from "No throttling" to **"Offline"**.
4. Notice the header status changes from "Live" to an **Offline** badge.
5. Navigate to `/programme`, view event details, save sessions, and open `/my-festival`—all cached data loads immediately.
6. Check in at any venue (e.g. `/check-in/loc-writers-cafe?token=seed-token-writers-cafe-2026`). Notice the status is safely saved as **Captured Offline**.
7. Toggle the network back to **"No throttling"**. The header displays the pending sync counter and automatically flushes the queue, confirming your check-ins!

---

## 🛡️ Organizer Admin Portal

Organizers can access the operations console at `/admin`:
- **Demo Passcode**: `klik2026`
- **Features**: Live event status updates (Happening Now, Moved, Cancelled), venue inspection, instant emergency notice broadcasts, and quest configuration review.

---

## 📂 Project Structure

```
├── public/
│   ├── assets/              # Festival artwork & poster
│   ├── icons/               # PWA icons (192, 512, maskable, svg)
│   └── sw.js                # Custom Service Worker
├── src/
│   ├── app/                 # Next.js App Router (Home, Programme, Map, Quest, My Festival, Admin)
│   ├── components/          # Reusable UI, Navigation, Events, Map, Brand
│   ├── lib/
│   │   ├── data/seed.ts     # Authentic seed data matching poster artists
│   │   ├── db/idb.ts        # IndexedDB device storage & offline queue
│   │   ├── db/repository.ts # Local & Supabase repository adapters
│   │   └── types/index.ts   # Domain models
│   └── styles/globals.css   # Tailwind styles & brand tokens
├── supabase/migrations/     # Production SQL schema & RLS policies
├── ARCHITECTURE.md
├── DATA_MODEL.md
├── DECISIONS.md
├── IMPLEMENTATION_PLAN.md
├── PWA.md
└── CONTENT_NEEDED.md
```
