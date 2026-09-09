# Data Model: KliK 2026

This document defines the typed domain models and entity-relationship structure for the **KliK 2026 Progressive Web App**.

---

## 1. Entity-Relationship Overview

```
Festivals (1) ──────────< Festival Editions (N)
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
      Venues (N)         Events (N)        Challenges (N)
            │                  │                  │
            │                  ├────< Artists (M) │
            │                  │                  │
            └──────────┬───────┘                  │
                       │                          │
                 Check-Ins (N) >────────── Challenge Progress (N)
                       │
                 Participants (1)
```

---

## 2. Model Definitions

### Festival
Top-level festival entity representing the ongoing event brand.
- `id`: `string` (e.g. `'klik-festival'`)
- `name`: `string` ('Kleinmond Inniebos Kunstefees')
- `shortName`: `string` ('KliK')
- `tagline`: `string` ('Celebrate creativity. Connect community.')
- `description`: `string`
- `quicketUrl`: `string`

### Festival Edition
A specific annual calendar staging.
- `id`: `string` (e.g. `'klik-2026'`)
- `festivalId`: `string` (foreign key)
- `editionYear`: `number` (2026)
- `startDate`: `string` ('2026-11-27')
- `endDate`: `string` ('2026-11-29')
- `locationName`: `string` ('Kleinmond, Western Cape')
- `status`: `'draft' | 'published' | 'live' | 'archived'`

### VenueLocation
Physical locations and popup hubs across Kleinmond.
- `id`: `string` (e.g. `'loc-town-hall'`)
- `name`: `string`
- `shortName`: `string`
- `category`: `'performance' | 'workshop' | 'market' | 'youth' | 'food_drink' | 'parking' | 'toilets' | 'first_aid' | 'info' | 'outdoor'`
- `address`: `string`
- `latitude`: `number`
- `longitude`: `number`
- `accessibilityNotes`: `string`
- `hasToilets`: `boolean`
- `hasParking`: `boolean`
- `hasFoodNearby`: `boolean`
- `isWheelchairAccessible`: `boolean`
- `capacity`: `number` (optional)
- `qrCodeToken`: `string` (signed token for physical QR code stands)

### FestivalEvent
Sessions, performances, workshops, and exhibitions on the schedule.
- `id`: `string` (e.g. `'evt-friday-sunset-session'`)
- `title`: `string`
- `description`: `string`
- `date`: `string` (ISO `YYYY-MM-DD`)
- `startTime`: `string` (`HH:mm`)
- `endTime`: `string` (`HH:mm`)
- `venueId`: `string`
- `venueName`: `string`
- `category`: `'music' | 'poetry' | 'theatre' | 'stories' | 'workshop' | 'art' | 'market' | 'youth' | 'community' | 'competition'`
- `language`: `'af' | 'en' | 'bilingual' | 'multilingual'`
- `isTicketed`: `boolean`
- `ticketPrice`: `string` (e.g. `'R 120'`)
- `quicketUrl`: `string`
- `artists`: `Artist[]`
- `accessibilityInfo`: `string`
- `scheduleStatus`: `'scheduled' | 'happening_now' | 'moved' | 'cancelled' | 'delayed'`
- `statusNotice`: `string` (optional, for live changes)
- `checkInAvailable`: `boolean`
- `isFeatured`: `boolean`

### Artist
Creators, performers, and workshop facilitators.
- `id`: `string`
- `name`: `string`
- `discipline`: `string`
- `bio`: `string`
- `websiteUrl`: `string` (optional)
- `imageUrl`: `string` (optional)

### Participant
Anonymous or registered festival-goer.
- `id`: `string` (UUID like `'klik_anon_xxx'`)
- `createdAt`: `string`
- `name`: `string` (optional)
- `email`: `string` (optional)
- `deviceFingerprint`: `string` (optional)

### CheckIn
A recorded visit by a participant to a festival venue.
- `id`: `string`
- `participantId`: `string`
- `locationId`: `string`
- `locationName`: `string`
- `timestamp`: `string` (ISO)
- `syncStatus`: `'captured_offline' | 'pending_sync' | 'verified' | 'rejected' | 'requires_staff_review'`
- `tokenUsed`: `string`
- `verifiedAt`: `string` (optional)
- `notes`: `string` (optional)

### Challenge & Progress
Gamified festival exploration trail ("The KliK Culture Trail").
- `id`: `string`
- `title`: `string`
- `subtitle`: `string`
- `description`: `string`
- `rulesDescription`: `string`
- `requiredCheckInCount`: `number` (5)
- `requiredDistinctCategoriesCount`: `number` (3)
- `steps`: `ChallengeStep[]`
- `badgeName`: `string`
- `badgeIcon`: `string`

Progress:
- `challengeId`: `string`
- `participantId`: `string`
- `completedCheckInIds`: `string[]`
- `distinctCategoriesMet`: `string[]`
- `totalCheckInsCount`: `number`
- `isCompleted`: `boolean`
- `completedAt`: `string` (optional)
- `isEligibleForReward`: `boolean`
- `rewardDrawTicketNumber`: `string` (optional, e.g. `'KLIK-A94F2B-2026'`)

### FestivalNotice
Live broadcasts and operations alerts.
- `id`: `string`
- `title`: `string`
- `content`: `string`
- `level`: `'info' | 'important' | 'urgent'`
- `createdAt`: `string`
- `expiresAt`: `string` (optional)
- `isActive`: `boolean`
