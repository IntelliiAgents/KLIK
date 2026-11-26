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
  CheckInVerificationMethod,
  ManualCheckInAuditEntry,
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
  deleteCheckInById,
  getVerifiedCheckInForLocation,
  getPendingCheckInForLocation,
  getOrCreateParticipantId,
  getOrCreateCompetitionCode,
  getSavedCompetitionCode,
  isVerifiedCheckInStatus,
} from "./idb";
import {
  verifyLocationAgainstVenue,
  createManualApprovalToken,
  verifyManualApprovalToken,
  type GpsVerificationInput,
  type GpsVerificationResult,
} from "../quest/geo";
import {
  getVenueCheckInAvailability,
  isPreFestivalTimestamp,
} from "../quest/schedule";
import { FESTIVAL_CONFIG } from "../config";
import { trackEvent } from "../analytics";

export interface EventFilterOptions {
  day?: string; // YYYY-MM-DD
  category?: EventCategory | "all";
  venueId?: string;
  isTicketed?: boolean;
  searchQuery?: string;
}

export interface CheckInActionResult {
  success: boolean;
  checkIn?: CheckIn;
  message: string;
  alreadyCheckedIn?: boolean;
  progress?: ChallengeProgress;
  isQuestJustCompleted?: boolean;
  gpsDetails?: GpsVerificationResult;
}

export interface ManualApprovalInput {
  participantId: string;
  participantName?: string;
  locationId: string;
  verificationMethod: CheckInVerificationMethod;
  adminEmail: string;
  adminName: string;
  notes?: string;
}

export interface ManualApprovalResult {
  success: boolean;
  message: string;
  entry?: ManualCheckInAuditEntry;
  approvalLink?: string;
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
  // Method A — Existing QR Code Check-In (preserves all distributed QR tokens)
  submitCheckIn(
    locationId: string,
    token: string,
    participantId?: string
  ): Promise<CheckInActionResult>;
  // Method B — GPS Location Check-In (validates geofence & accuracy, never stores user coords)
  submitGpsCheckIn(
    locationId: string,
    position: GpsVerificationInput,
    participantId?: string
  ): Promise<CheckInActionResult>;
  // Method C — Pending Selfie / WhatsApp Manual Verification Request
  submitManualVerificationRequest(
    locationId: string,
    participantName?: string,
    participantId?: string
  ): Promise<CheckInActionResult>;
  // Method C Completion — Redeem Organiser-Signed Manual Approval Link
  redeemManualApprovalLink(
    locationId: string,
    approvalToken: string,
    participantId?: string
  ): Promise<CheckInActionResult>;
  // Admin methods
  updateEventScheduleStatus(
    eventId: string,
    status: FestivalEvent["scheduleStatus"],
    notice?: string
  ): Promise<boolean>;
  publishNotice(
    notice: Omit<FestivalNotice, "id" | "createdAt">
  ): Promise<FestivalNotice>;
  approveManualCheckIn(input: ManualApprovalInput): Promise<ManualApprovalResult>;
  rejectManualCheckIn(input: ManualApprovalInput): Promise<ManualApprovalResult>;
  getManualCheckInAuditTrail(): Promise<ManualCheckInAuditEntry[]>;
}

const CURRENT_PROGRAM_VERSION = "10.6-klik-2026-quest-production-ready";
const AUDIT_TRAIL_STORAGE_KEY = "klik_admin_manual_checkin_audit_v1";
const QUEST_STARTED_TRACKED_KEY = "klik_quest_started_tracked";
const QUEST_COMPLETED_TRACKED_KEY = "klik_quest_completed_tracked";

// In-memory serialization lock to prevent race conditions when simultaneous check-ins arrive
const checkInLocks = new Map<string, Promise<CheckInActionResult>>();
let progressCalculationLock: Promise<ChallengeProgress> | null = null;

class LocalSeedRepository implements FestivalRepository {
  private events: FestivalEvent[] = [...SEED_EVENTS];
  private venues: VenueLocation[] = [...SEED_VENUES];
  private notices: FestivalNotice[] = [...SEED_NOTICES];

  constructor() {
    if (typeof window !== "undefined") {
      try {
        const storedVersion = localStorage.getItem("klik_program_version");
        if (storedVersion !== CURRENT_PROGRAM_VERSION) {
          localStorage.removeItem("klik_admin_events");
          localStorage.setItem("klik_program_version", CURRENT_PROGRAM_VERSION);
          this.events = [...SEED_EVENTS];
          this.venues = [...SEED_VENUES];
        } else {
          const storedEvents = localStorage.getItem("klik_admin_events");
          if (storedEvents) {
            this.events = JSON.parse(storedEvents);
          }
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
          (e.subVenue && e.subVenue.toLowerCase().includes(q)) ||
          (e.facilitatorDisplay && e.facilitatorDisplay.toLowerCase().includes(q)) ||
          (e.hosts && e.hosts.some((h) => h.toLowerCase().includes(q))) ||
          e.artists.some((a) => a.name.toLowerCase().includes(q))
      );
    }

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

  private async runWithLocationLock(
    locationId: string,
    fn: () => Promise<CheckInActionResult>
  ): Promise<CheckInActionResult> {
    const existingLock = checkInLocks.get(locationId);
    const nextRun = (existingLock ? existingLock.catch(() => undefined) : Promise.resolve()).then(
      fn
    );
    checkInLocks.set(locationId, nextRun);
    try {
      return await nextRun;
    } finally {
      if (checkInLocks.get(locationId) === nextRun) {
        checkInLocks.delete(locationId);
      }
    }
  }

  async calculateQuestProgress(): Promise<ChallengeProgress> {
    // Serialize progress & competition code generation so simultaneous 5th check-ins
    // cannot generate duplicate codes or miss eligibility
    const previous = progressCalculationLock;
    const current = (previous ? previous.catch(() => undefined) : Promise.resolve()).then(
      async (): Promise<ChallengeProgress> => {
        const participantId = getOrCreateParticipantId();
        const checkIns = await getCheckIns();
        const challenge = SEED_CHALLENGE;
        const validVenueIds = new Set(this.venues.map((v) => v.id));

        // Only count DISTINCT, VERIFIED participating locations
        const verifiedCheckIns = checkIns.filter(
          (c) =>
            validVenueIds.has(c.locationId) && isVerifiedCheckInStatus(c.syncStatus)
        );
        const verifiedLocationSet = new Set(
          verifiedCheckIns.map((c) => c.locationId)
        );

        // Pending manual verification locations (explicitly excluded from verified count)
        const pendingLocationSet = new Set(
          checkIns
            .filter(
              (c) =>
                validVenueIds.has(c.locationId) &&
                !verifiedLocationSet.has(c.locationId) &&
                (c.syncStatus === "pending_manual_review" ||
                  c.syncStatus === "requires_staff_review")
            )
            .map((c) => c.locationId)
        );

        const distinctCategories = new Set<string>();
        for (const locId of verifiedLocationSet) {
          const venue = this.venues.find((v) => v.id === locId);
          if (venue) {
            distinctCategories.add(venue.category);
          }
          const venueEvents = this.events.filter((e) => e.venueId === locId);
          venueEvents.forEach((e) => distinctCategories.add(e.category));
        }

        const totalCount = verifiedLocationSet.size;
        const saved = await getSavedCompetitionCode();
        const hasValidSavedCode =
          Boolean(saved.code) && !isPreFestivalTimestamp(saved.completedAt);
        const isCompleted =
          totalCount >= challenge.requiredCheckInCount || hasValidSavedCode;

        let rewardDrawTicketNumber = hasValidSavedCode
          ? saved.code || undefined
          : undefined;
        let completedAt = hasValidSavedCode
          ? saved.completedAt || undefined
          : undefined;

        if (isCompleted) {
          const persisted = await getOrCreateCompetitionCode();
          rewardDrawTicketNumber = persisted.code;
          completedAt = persisted.completedAt;
        }

        return {
          challengeId: challenge.id,
          participantId,
          completedCheckInIds: verifiedCheckIns.map((c) => c.id),
          verifiedLocationIds: Array.from(verifiedLocationSet),
          pendingLocationIds: Array.from(pendingLocationSet),
          distinctCategoriesMet: Array.from(distinctCategories),
          totalCheckInsCount: totalCount,
          isCompleted,
          completedAt,
          isEligibleForReward: isCompleted,
          rewardDrawTicketNumber,
        };
      }
    );

    progressCalculationLock = current;
    try {
      return await current;
    } finally {
      if (progressCalculationLock === current) {
        progressCalculationLock = null;
      }
    }
  }

  private async finalizeVerifiedCheckIn(
    venue: VenueLocation,
    method: CheckInVerificationMethod,
    tokenUsed: string,
    participantId: string,
    extra?: Partial<CheckIn>
  ): Promise<CheckInActionResult> {
    const progressBefore = await this.calculateQuestProgress();

    // Remove any superseded pending manual review record for this location
    const existingPending = await getPendingCheckInForLocation(venue.id);
    if (existingPending) {
      await deleteCheckInById(existingPending.id);
    }

    const isOnline = typeof navigator !== "undefined" ? navigator.onLine : true;
    const nowIso = new Date().toISOString();

    // Deterministic ID per (participantId, locationId) prevents duplicate records at storage level
    const checkIn: CheckIn = {
      id: `chk_${participantId}_${venue.id}`,
      participantId,
      locationId: venue.id,
      locationName: venue.name,
      timestamp: nowIso,
      syncStatus: isOnline ? "verified" : "captured_offline",
      verificationMethod: method,
      tokenUsed,
      verifiedAt: isOnline ? nowIso : undefined,
      ...extra,
    };

    await recordCheckIn(checkIn);

    const progressAfter = await this.calculateQuestProgress();
    const isQuestJustCompleted =
      !progressBefore.isCompleted && progressAfter.isCompleted;

    // Privacy-conscious analytics tracking
    trackEvent("culture_trail_checkin", {
      venueId: venue.id,
      method,
      count: progressAfter.totalCheckInsCount,
    });
    trackEvent("checkin_method_used", {
      method,
      status: "success",
      venueId: venue.id,
    });

    if (typeof window !== "undefined") {
      try {
        if (
          progressAfter.totalCheckInsCount >= 1 &&
          !localStorage.getItem(QUEST_STARTED_TRACKED_KEY)
        ) {
          localStorage.setItem(QUEST_STARTED_TRACKED_KEY, "true");
          trackEvent("quest_started", { firstVenueId: venue.id, method });
        }
        if (
          progressAfter.isCompleted &&
          !localStorage.getItem(QUEST_COMPLETED_TRACKED_KEY)
        ) {
          localStorage.setItem(QUEST_COMPLETED_TRACKED_KEY, "true");
          trackEvent("quest_completed", {
            totalLocations: progressAfter.totalCheckInsCount,
            finalMethod: method,
          });
        }
      } catch {
        // ignore storage errors
      }
    }

    return {
      success: true,
      checkIn,
      progress: progressAfter,
      isQuestJustCompleted,
      message: isOnline
        ? `Successfully checked in at ${venue.name}!`
        : `Checked in at ${venue.name} (saved offline — will sync when reconnected).`,
    };
  }

  /**
   * Method A — Existing QR Code Check-In.
   * Preserves all 8 distributed QR codes & validates the exact qrCodeToken for the establishment.
   */
  async submitCheckIn(
    locationId: string,
    token: string,
    participantId?: string
  ): Promise<CheckInActionResult> {
    return this.runWithLocationLock(locationId, async () => {
      const pid = participantId || getOrCreateParticipantId();
      const venue = await this.getVenueById(locationId);

      if (!venue) {
        return {
          success: false,
          message: "This location does not match an active KLiK 2026 participating venue.",
        };
      }

      // Check duplicate verified check-in first
      const existingVerified = await getVerifiedCheckInForLocation(locationId);
      if (existingVerified) {
        const progress = await this.calculateQuestProgress();
        return {
          success: false,
          alreadyCheckedIn: true,
          checkIn: existingVerified,
          progress,
          message: `You have already checked in at ${venue.name}. Each participating location counts once.`,
        };
      }

      // Validate that an event at this venue is currently live before permitting QR check-in
      const availability = getVenueCheckInAvailability(venue.id, this.events);
      if (!availability.isOpen) {
        trackEvent("checkin_method_used", {
          method: "qr",
          status: "failed",
          venueId: venue.id,
          reason: availability.reason,
        });
        return {
          success: false,
          message: availability.message,
        };
      }

      // Validate the scanned QR token matches the official distributed QR code for this venue
      const cleanToken = (token || "").trim();
      if (!cleanToken || cleanToken !== venue.qrCodeToken) {
        trackEvent("checkin_method_used", {
          method: "qr",
          status: "failed",
          venueId: venue.id,
        });
        return {
          success: false,
          message: `Invalid or missing QR code for ${venue.name}. Please scan the official KLiK QR poster on site, or use GPS Location Check-In or WhatsApp Selfie Verification below.`,
        };
      }

      return this.finalizeVerifiedCheckIn(venue, "qr", cleanToken, pid);
    });
  }

  /**
   * Method B — GPS Location Check-In.
   * Validates coordinates against verified venue coordinates, geofence radius, and GPS accuracy.
   * Never stores the participant's precise coordinates.
   */
  async submitGpsCheckIn(
    locationId: string,
    position: GpsVerificationInput,
    participantId?: string
  ): Promise<CheckInActionResult> {
    return this.runWithLocationLock(locationId, async () => {
      const pid = participantId || getOrCreateParticipantId();
      const venue = await this.getVenueById(locationId);

      if (!venue) {
        return {
          success: false,
          message: "Participating location not found.",
        };
      }

      const existingVerified = await getVerifiedCheckInForLocation(locationId);
      if (existingVerified) {
        const progress = await this.calculateQuestProgress();
        return {
          success: false,
          alreadyCheckedIn: true,
          checkIn: existingVerified,
          progress,
          message: `You have already checked in at ${venue.name}.`,
        };
      }

      // Validate that an event at this venue is currently live before permitting GPS check-in
      const availability = getVenueCheckInAvailability(venue.id, this.events);
      if (!availability.isOpen) {
        trackEvent("checkin_method_used", {
          method: "gps",
          status: "failed",
          venueId: venue.id,
          reason: availability.reason,
        });
        return {
          success: false,
          message: availability.message,
        };
      }

      const verification = verifyLocationAgainstVenue(position, venue);
      if (!verification.verified) {
        trackEvent("checkin_method_used", {
          method: "gps",
          status: "failed",
          venueId: venue.id,
          reason: verification.reason,
        });
        return {
          success: false,
          message: verification.message,
          gpsDetails: verification,
        };
      }

      // Note: Do NOT store raw latitude/longitude — only record verification method
      const result = await this.finalizeVerifiedCheckIn(
        venue,
        "gps",
        "gps-geofence-verified",
        pid,
        {
          notes: `Verified via GPS geofence (within ${verification.allowedRadiusMeters}m radius)`,
        }
      );
      return {
        ...result,
        gpsDetails: verification,
      };
    });
  }

  /**
   * Method C — Record a Pending Selfie / WhatsApp Manual Verification Request.
   * Explicitly does NOT count as a verified check-in until manually approved by an organiser.
   */
  async submitManualVerificationRequest(
    locationId: string,
    participantName?: string,
    participantId?: string
  ): Promise<CheckInActionResult> {
    return this.runWithLocationLock(locationId, async () => {
      const pid = participantId || getOrCreateParticipantId();
      const venue = await this.getVenueById(locationId);

      if (!venue) {
        return {
          success: false,
          message: "Participating location not found.",
        };
      }

      const existingVerified = await getVerifiedCheckInForLocation(locationId);
      if (existingVerified) {
        const progress = await this.calculateQuestProgress();
        return {
          success: false,
          alreadyCheckedIn: true,
          checkIn: existingVerified,
          progress,
          message: `You have already completed a verified check-in at ${venue.name}.`,
        };
      }

      const pendingCheckIn: CheckIn = {
        id: `chk_pending_${pid}_${venue.id}`,
        participantId: pid,
        locationId: venue.id,
        locationName: venue.name,
        timestamp: new Date().toISOString(),
        syncStatus: "pending_manual_review",
        verificationMethod: "manual_whatsapp_selfie",
        tokenUsed: "whatsapp-selfie-pending",
        notes: participantName?.trim()
          ? `Selfie verification requested via WhatsApp (${participantName.trim()}) — awaiting organiser approval.`
          : "Selfie verification requested via WhatsApp — awaiting organiser approval.",
      };

      await recordCheckIn(pendingCheckIn);
      trackEvent("checkin_method_used", {
        method: "manual_whatsapp_selfie",
        status: "pending",
        venueId: venue.id,
      });

      const progress = await this.calculateQuestProgress();
      return {
        success: true,
        checkIn: pendingCheckIn,
        progress,
        message: `Manual verification marked as pending for ${venue.name}. Remember to attach your selfie and tap Send in WhatsApp.`,
      };
    });
  }

  /**
   * Method C Completion — Participant opens the organiser-signed approval link sent back via WhatsApp.
   */
  async redeemManualApprovalLink(
    locationId: string,
    approvalToken: string,
    participantId?: string
  ): Promise<CheckInActionResult> {
    return this.runWithLocationLock(locationId, async () => {
      const pid = participantId || getOrCreateParticipantId();
      const venue = await this.getVenueById(locationId);

      if (!venue) {
        return {
          success: false,
          message: "Participating location not found.",
        };
      }

      const existingVerified = await getVerifiedCheckInForLocation(locationId);
      if (existingVerified) {
        const progress = await this.calculateQuestProgress();
        return {
          success: false,
          alreadyCheckedIn: true,
          checkIn: existingVerified,
          progress,
          message: `You have already checked in at ${venue.name}.`,
        };
      }

      const check = await verifyManualApprovalToken(approvalToken, locationId);
      if (!check.valid || !check.payload) {
        return {
          success: false,
          message:
            check.error ||
            "This manual approval link is invalid. Please contact KLiK Quest support on WhatsApp.",
        };
      }

      // Ensure the approval belongs to this participant reference
      if (check.payload.pid !== pid) {
        return {
          success: false,
          message:
            "This manual approval link was issued for a different participant reference. Please open it on the same phone and browser you used for KLiK Quest.",
        };
      }

      return this.finalizeVerifiedCheckIn(
        venue,
        check.payload.m || "manual_whatsapp_selfie",
        "manual-admin-approved",
        pid,
        {
          approvedBy: check.payload.by,
          approvedAt: new Date(check.payload.ts).toISOString(),
          notes: `Manually verified & approved by festival organiser (${check.payload.by}).`,
        }
      );
    });
  }

  // ----------------- Admin Methods -----------------

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

  async publishNotice(
    notice: Omit<FestivalNotice, "id" | "createdAt">
  ): Promise<FestivalNotice> {
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

  private readAuditTrail(): ManualCheckInAuditEntry[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(AUDIT_TRAIL_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as ManualCheckInAuditEntry[]) : [];
    } catch {
      return [];
    }
  }

  private writeAuditTrail(entries: ManualCheckInAuditEntry[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(AUDIT_TRAIL_STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // ignore
    }
  }

  async getManualCheckInAuditTrail(): Promise<ManualCheckInAuditEntry[]> {
    return this.readAuditTrail().sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp)
    );
  }

  async approveManualCheckIn(
    input: ManualApprovalInput
  ): Promise<ManualApprovalResult> {
    const cleanPid = input.participantId.trim();
    if (!cleanPid) {
      return { success: false, message: "Participant reference ID is required." };
    }

    const venue = await this.getVenueById(input.locationId);
    if (!venue) {
      return { success: false, message: "Selected establishment was not found." };
    }

    // Prevent duplicate approvals for the same participant + establishment
    const existingTrail = this.readAuditTrail();
    const alreadyApproved = existingTrail.find(
      (entry) =>
        entry.participantId.toLowerCase() === cleanPid.toLowerCase() &&
        entry.locationId === venue.id &&
        entry.action === "approved"
    );
    if (alreadyApproved) {
      return {
        success: false,
        message: `Manual check-in for ${cleanPid} at ${venue.shortName} was already approved on ${new Date(
          alreadyApproved.timestamp
        ).toLocaleString()}. Duplicate approvals are blocked.`,
        entry: alreadyApproved,
        approvalLink: alreadyApproved.approvalLink,
      };
    }

    const signedToken = await createManualApprovalToken({
      pid: cleanPid,
      loc: venue.id,
      m: input.verificationMethod,
      by: input.adminEmail,
    });

    const origin =
      typeof window !== "undefined" && window.location.origin
        ? window.location.origin
        : FESTIVAL_CONFIG.appUrl;
    const approvalLink = `${origin}/check-in/${venue.id}?manual_approval=${encodeURIComponent(
      signedToken
    )}`;

    const entry: ManualCheckInAuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      participantId: cleanPid,
      participantName: input.participantName?.trim() || undefined,
      locationId: venue.id,
      locationName: venue.name,
      action: "approved",
      verificationMethod: input.verificationMethod,
      adminEmail: input.adminEmail,
      adminName: input.adminName,
      notes: input.notes?.trim() || undefined,
      approvalLink,
      timestamp: new Date().toISOString(),
    };

    this.writeAuditTrail([entry, ...existingTrail]);

    // If the participant happens to be on this same device/browser, credit immediately as well
    if (typeof window !== "undefined") {
      const localPid = getOrCreateParticipantId();
      if (localPid === cleanPid) {
        const alreadyVerified = await getVerifiedCheckInForLocation(venue.id);
        if (!alreadyVerified) {
          await this.finalizeVerifiedCheckIn(
            venue,
            input.verificationMethod,
            "manual-admin-approved",
            cleanPid,
            {
              approvedBy: input.adminEmail,
              approvedAt: entry.timestamp,
              notes:
                input.notes?.trim() ||
                `Approved manually by ${input.adminName} (${input.adminEmail})`,
            }
          );
        }
      }
    }

    return {
      success: true,
      message: `Approved manual check-in for ${cleanPid} at ${venue.name}. Send the confirmation link below back to the participant via WhatsApp so their phone credits this stop immediately.`,
      entry,
      approvalLink,
    };
  }

  async rejectManualCheckIn(
    input: ManualApprovalInput
  ): Promise<ManualApprovalResult> {
    const cleanPid = input.participantId.trim();
    if (!cleanPid) {
      return { success: false, message: "Participant reference ID is required." };
    }

    const venue = await this.getVenueById(input.locationId);
    if (!venue) {
      return { success: false, message: "Selected establishment was not found." };
    }

    const existingTrail = this.readAuditTrail();
    const entry: ManualCheckInAuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      participantId: cleanPid,
      participantName: input.participantName?.trim() || undefined,
      locationId: venue.id,
      locationName: venue.name,
      action: "rejected",
      verificationMethod: input.verificationMethod,
      adminEmail: input.adminEmail,
      adminName: input.adminName,
      notes: input.notes?.trim() || "Photographic proof did not meet verification requirements.",
      timestamp: new Date().toISOString(),
    };

    this.writeAuditTrail([entry, ...existingTrail]);

    // If same browser has a pending review record, mark it rejected
    if (typeof window !== "undefined" && getOrCreateParticipantId() === cleanPid) {
      const pending = await getPendingCheckInForLocation(venue.id);
      if (pending) {
        await recordCheckIn({
          ...pending,
          syncStatus: "rejected",
          rejectionReason: entry.notes,
        });
      }
    }

    return {
      success: true,
      message: `Recorded manual check-in rejection for ${cleanPid} at ${venue.name}.`,
      entry,
    };
  }
}

export const repository: FestivalRepository = new LocalSeedRepository();
