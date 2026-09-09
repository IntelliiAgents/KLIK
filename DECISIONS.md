# Decisions and Assumptions Log

This document records the design assumptions, temporary defaults, and unresolved decisions for the **KliK 2026 Mobile-First PWA**.

---

## 1. Assumptions

### A. Festival Coordinates & Venue Locations
- **Assumption**: Venues are clustered around Kleinmond, Western Cape (approximate center: `[-34.3405, 19.0285]`).
- **Rationale**: The official festival poster specifies "Various venues across Kleinmond". For the seed data, realistic Kleinmond venues are mapped (Kleinmond Town Hall / Stadsaal, Kleinmond Community Hall, Kleinmond Public Library, Harbour Road Amphitheatre, Palmiet River Mouth Outdoor Arena, Main Beach Green).
- **Resolution**: Replace coordinates and venue names with official schedule when confirmed by organizers.

### B. Festival Dates & Schedule Timeframe
- **Assumption**: Friday 27 November 2026 to Sunday 29 November 2026.
- **Rationale**: Stated directly on the festival poster and Quicket page.
- **Seed Events**: Seed schedule times are generated across these three days (e.g., Friday opening 16:00, Saturday full day 09:00–22:00, Sunday 09:00–18:00) using the exact artist and event names featured on the official poster.

### C. Quicket Ticketing Boundary
- **Assumption**: The PWA does **not** process payments, sell tickets, or validate Quicket barcodes. It redirects guests to the official Quicket event link (`https://www.quicket.co.za/events/339579-kleinmond-inniebos-kunstefees-klik/`) or deep-links to specific Quicket sessions.
- **Rationale**: Explicitly mandated in user requirements to avoid duplicate ticketing systems.

### D. Anonymous Participant Identity
- **Assumption**: Users are not forced to create an account or provide an email/phone number to use the app, save events, or participate in the KliK Quest.
- **Implementation**: On first launch, a random UUID (`klik_anon_xxx`) is generated and persisted in IndexedDB and localStorage. An export/backup key abstraction is provided so users can back up or restore progress across devices.

### E. Supabase & Mapbox Fallback Architecture
- **Assumption**: Supabase and Mapbox credentials are not immediately provided in the development environment.
- **Implementation**: The application implements an abstract repository pattern (`FestivalRepository`). When `NEXT_PUBLIC_SUPABASE_URL` is unset, it automatically operates in local seed-adapter mode with IndexedDB caching. When `NEXT_PUBLIC_MAPBOX_TOKEN` is unset, Mapbox GL is bypassed and the app renders an accessible, searchable, filterable Venue List with direct Google/Apple Maps external links.

### F. KliK Quest Rules
- **Assumption**: "The KliK Culture Trail" requires 5 venue check-ins across at least 3 distinct activity categories (e.g., Poetry, Music, Art, Workshop, Community).
- **Implementation**: Challenge evaluation is handled by an isolated rules engine (`evaluateQuestCompletion()`), enabling dynamic configuration and future multi-quest definitions without UI refactoring.

---

## 2. Unresolved Decisions (Awaiting Organizer Input)

| ID | Topic | Current Temporary Choice | Awaiting Organizer Input |
|---|---|---|---|
| **DEC-01** | Exact GPS coordinates of all popup venues | Seeded with central Kleinmond locations (Stadsaal, Harbour Road, Library, etc.) | Final festival site map with exact tent and gate GPS coordinates |
| **DEC-02** | Official Quicket per-event deep links | Defaulting to the main festival Quicket landing page | Individual Quicket ticket tier URLs for paid sessions |
| **DEC-03** | Quest Prize & Sponsor Integration | Generic celebratory modal and lucky-draw verification token | Sponsor name, prize redemption booth location, and physical prize rules |
| **DEC-04** | QR Token Security / Signing Algorithm | HMAC-SHA256 placeholder with salt for seed tokens | Supabase Edge Function secret for verifying QR tokens |
| **DEC-05** | Offline sync window | Instant retry on reconnection + manual "Try Again" trigger | Desired server sync retry policy and retry backoff limits |
