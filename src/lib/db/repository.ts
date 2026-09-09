import {
  Festival,
  FestivalEdition,
  VenueLocation,
  FestivalEvent,
  Artist,
  FestivalNotice,
  Challenge,
  CheckIn,
  ChallengeProgress,
  EventCategory,
  VenueCategory,
} from "../types";
import {
  SEED_FESTIVAL,
  SEED_EDITION,
  SEED_VENUES,
  SEED_EVENTS,
  SEED_ARTISTS,
  SEED_NOTICES,
  SEED_CHALLENGE,
} from "../data/seed";
import {
  getCheckIns,
  recordCheckIn,
  hasCheckedInLocation,
  getOrCreateParticipantId,
} from "./idb";

export interface EventFilterOptions {
  day?: string; // YYYY-MM-DD
  category?: EventCategory | "all";
  venueId?: string;
  isTicketed?: boolean;
  searchQuery?: string;
}

export interface FestivalRepository {
  getFestival(): Promise<Festival>;
  getEdition(): Promise<FestivalEdition>;
  getVenues(): Promise<VenueLocation[]>;
  getVenueById(id: string): Promise<VenueLocation | null>;
  getEvents(filters?: EventFilterOptions): Promise<FestivalEvent[]>;
  getEventById(id: string): Promise<FestivalEvent | null>;
  getArtists(): Promise<Artist[]>;
  getNotices(): Promise<FestivalNotice[]>;
  getChallenge(): Promise<Challenge>;
  calculateQuestProgress(): Promise<ChallengeProgress>;
  submitCheckIn(
    locationId: string,
    token: string,
    participantId?: string
  ): Promise<{ success: boolean; checkIn: CheckIn; message: string }>;
  // Admin methods
  updateEventScheduleStatus(
    eventId: string,
    status: FestivalEvent["scheduleStatus"],
    notice?: string
  ): Promise<boolean>;
  publishNotice(notice: Omit<FestivalNotice, "id" | "createdAt">): Promise<FestivalNotice>;
}

// In-Memory & Local Storage implementation of FestivalRepository
class LocalSeedRepository implements FestivalRepository {
  private events: FestivalEvent[] = [...SEED_EVENTS];
  private venues: VenueLocation[] = [...SEED_VENUES];
  private notices: FestivalNotice[] = [...SEED_NOTICES];

  constructor() {
    // Attempt to hydrate custom admin modifications from localStorage if on browser
    if (typeof window !== "undefined") {
      try {
        const storedEvents = localStorage.getItem("klik_admin_events");
        if (storedEvents) {
          this.events = JSON.parse(storedEvents);
        }
        const storedNotices = localStorage.getItem("klik_admin_notices");
        if (storedNotices) {
          this.notices = JSON.parse(storedNotices);
        }
      } catch {
        // use defaults
      }
    }
  }

  async getFestival(): Promise<Festival> {
    return SEED_FESTIVAL;
  }

  async getEdition(): Promise<FestivalEdition> {
    return SEED_EDITION;
  }

  async getVenues(): Promise<VenueLocation[]> {
    return this.venues;
  }

  async getVenueById(id: string): Promise<VenueLocation | null> {
    return this.venues.find((v) => v.id === id) || null;
  }

  async getEvents(filters?: EventFilterOptions): Promise<FestivalEvent[]> {
    let result = [...this.events];

    if (!filters) return result;

    if (filters.day) {
      result = result.filter((e) => e.date === filters.day);
    }

    if (filters.category && filters.category !== "all") {
      result = result.filter((e) => e.category === filters.category);
    }

    if (filters.venueId && filters.venueId !== "all") {
      result = result.filter((e) => e.venueId === filters.venueId);
    }

    if (typeof filters.isTicketed === "boolean") {
      result = result.filter((e) => e.isTicketed === filters.isTicketed);
    }

    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          (e.venueName && e.venueName.toLowerCase().includes(q)) ||
          e.artists.some((a) => a.name.toLowerCase().includes(q))
      );
    }

    // Sort chronologically
    return result.sort((a, b) => {
      const dateCmp = a.date.localeCompare(b.date);
      if (dateCmp !== 0) return dateCmp;
      return a.startTime.localeCompare(b.startTime);
    });
  }

  async getEventById(id: string): Promise<FestivalEvent | null> {
    return this.events.find((e) => e.id === id) || null;
  }

  async getArtists(): Promise<Artist[]> {
    return SEED_ARTISTS;
  }

  async getNotices(): Promise<FestivalNotice[]> {
    return this.notices.filter((n) => n.isActive);
  }

  async getChallenge(): Promise<Challenge> {
    return SEED_CHALLENGE;
  }

  async calculateQuestProgress(): Promise<ChallengeProgress> {
    const participantId = getOrCreateParticipantId();
    const checkIns = await getCheckIns();
    const challenge = SEED_CHALLENGE;

    // Find distinct categories visited based on checked-in venues
    const visitedLocationIds = new Set(checkIns.map((c) => c.locationId));
    const distinctCategories = new Set<string>();

    for (const locId of visitedLocationIds) {
      const venue = this.venues.find((v) => v.id === locId);
      if (venue) {
        distinctCategories.add(venue.category);
      }
      // Also check if any event at this venue had categories
      const venueEvents = this.events.filter((e) => e.venueId === locId);
      venueEvents.forEach((e) => distinctCategories.add(e.category));
    }

    const completedCheckInIds = checkIns.map((c) => c.id);
    const totalCount = visitedLocationIds.size;
    const categoriesArray = Array.from(distinctCategories);

    const isCompleted =
      totalCount >= challenge.requiredCheckInCount &&
      categoriesArray.length >= challenge.requiredDistinctCategoriesCount;

    return {
      challengeId: challenge.id,
      participantId,
      completedCheckInIds,
      distinctCategoriesMet: categoriesArray,
      totalCheckInsCount: totalCount,
      isCompleted,
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      isEligibleForReward: isCompleted,
      rewardDrawTicketNumber: isCompleted
        ? `KLIK-${participantId.slice(-6).toUpperCase()}-2026`
        : undefined,
    };
  }

  async submitCheckIn(
    locationId: string,
    token: string,
    participantId?: string
  ): Promise<{ success: boolean; checkIn: CheckIn; message: string }> {
    const pid = participantId || getOrCreateParticipantId();
    const venue = await this.getVenueById(locationId);

    if (!venue) {
      throw new Error(`Location not found with ID: ${locationId}`);
    }

    // Check duplicate
    const alreadyCheckedIn = await hasCheckedInLocation(locationId);
    if (alreadyCheckedIn) {
      const existing = (await getCheckIns()).find((c) => c.locationId === locationId)!;
      return {
        success: false,
        checkIn: existing,
        message: `You have already checked in at ${venue.name}.`,
      };
    }

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;

    // Create record
    const checkIn: CheckIn = {
      id: `chk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      participantId: pid,
      locationId: venue.id,
      locationName: venue.name,
      timestamp: new Date().toISOString(),
      syncStatus: isOnline ? "verified" : "captured_offline",
      tokenUsed: token,
      verifiedAt: isOnline ? new Date().toISOString() : undefined,
    };

    await recordCheckIn(checkIn);

    return {
      success: true,
      checkIn,
      message: isOnline
        ? `Successfully checked in at ${venue.name}!`
        : `Checked in at ${venue.name} (Captured offline - will sync when reconnected).`,
    };
  }

  async updateEventScheduleStatus(
    eventId: string,
    status: FestivalEvent["scheduleStatus"],
    notice?: string
  ): Promise<boolean> {
    const idx = this.events.findIndex((e) => e.id === eventId);
    if (idx === -1) return false;

    this.events[idx] = {
      ...this.events[idx],
      scheduleStatus: status,
      statusNotice: notice,
    };

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("klik_admin_events", JSON.stringify(this.events));
      } catch {
        // ignore
      }
    }
    return true;
  }

  async publishNotice(notice: Omit<FestivalNotice, "id" | "createdAt">): Promise<FestivalNotice> {
    const newNotice: FestivalNotice = {
      ...notice,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.notices.unshift(newNotice);

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("klik_admin_notices", JSON.stringify(this.notices));
      } catch {
        // ignore
      }
    }
    return newNotice;
  }
}

// Export singleton instance
export const repository: FestivalRepository = new LocalSeedRepository();
