// KliK 2026 Domain Types & Model Definitions

export type FestivalEditionStatus = 'draft' | 'published' | 'live' | 'archived';

export interface Festival {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  quicketUrl: string;
}

export interface FestivalEdition {
  id: string;
  festivalId: string;
  editionYear: number;
  startDate: string; // ISO YYYY-MM-DD
  endDate: string;   // ISO YYYY-MM-DD
  locationName: string;
  status: FestivalEditionStatus;
}

export type VenueCategory =
  | 'performance'
  | 'theatre'
  | 'workshop'
  | 'market'
  | 'youth'
  | 'food_drink'
  | 'parking'
  | 'toilets'
  | 'first_aid'
  | 'info'
  | 'outdoor';

export interface VenueLocation {
  id: string;
  name: string;
  shortName: string;
  category: VenueCategory;
  address: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters?: number;
  accessibilityNotes: string;
  hasToilets: boolean;
  hasParking: boolean;
  hasFoodNearby: boolean;
  isWheelchairAccessible: boolean;
  capacity?: number;
  qrCodeToken: string; // Token embedded in physical QR check-in stands — DO NOT MODIFY
}

export type EventCategory =
  | 'music'
  | 'poetry'
  | 'theatre'
  | 'stories'
  | 'workshop'
  | 'art'
  | 'market'
  | 'youth'
  | 'community'
  | 'outdoor'
  | 'competition';

export type EventScheduleStatus = 'scheduled' | 'happening_now' | 'moved' | 'cancelled' | 'delayed';

export interface Artist {
  id: string;
  name: string;
  discipline: string;
  bio: string;
  affiliation?: string;
  websiteUrl?: string;
  imageUrl?: string;
}

export interface EventSubSession {
  time: string;
  title: string;
  artists?: string[];
  notes?: string;
}

export type FestivalHub = 'start_your_day' | 'around_kleinmond' | 'the_grail' | 'sunday_grail';

export interface FestivalEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  venueId: string;
  venueName?: string;
  subVenue?: string;
  category: EventCategory;
  language: 'af' | 'en' | 'bilingual' | 'multilingual';
  isTicketed: boolean;
  ticketPrice?: string;
  quicketUrl?: string;
  artists: Artist[];
  accessibilityInfo: string;
  scheduleStatus: EventScheduleStatus;
  statusNotice?: string;
  checkInAvailable: boolean;
  isFeatured?: boolean;
  venueHub?: FestivalHub;
  subSessions?: EventSubSession[];
  capacityNote?: string;
  ageGroup?: string;
  facilitatorDisplay?: string;
  affiliation?: string;
  hosts?: string[];
  highlights?: string[];
  isDraft?: boolean;
}

export interface Participant {
  id: string; // anonymous UUID like 'klik_anon_xxx'
  createdAt: string;
  name?: string;
  email?: string;
  deviceFingerprint?: string;
}

export interface SavedEvent {
  eventId: string;
  savedAt: string;
}

export type CheckInVerificationMethod =
  | 'qr'
  | 'gps'
  | 'manual_whatsapp_selfie'
  | 'manual_staff_override';

export type CheckInSyncStatus =
  | 'captured_offline'
  | 'pending_sync'
  | 'pending_manual_review'
  | 'verified'
  | 'rejected'
  | 'requires_staff_review';

export interface CheckIn {
  id: string;
  participantId: string;
  locationId: string;
  locationName: string;
  timestamp: string;
  syncStatus: CheckInSyncStatus;
  verificationMethod?: CheckInVerificationMethod;
  tokenUsed: string;
  verifiedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface ManualCheckInAuditEntry {
  id: string;
  participantId: string;
  participantName?: string;
  locationId: string;
  locationName: string;
  action: 'approved' | 'rejected';
  verificationMethod: CheckInVerificationMethod;
  adminEmail: string;
  adminName: string;
  notes?: string;
  approvalLink?: string;
  timestamp: string;
}

export interface ChallengeStep {
  id: string;
  title: string;
  description: string;
  targetCategory?: EventCategory | VenueCategory;
  targetLocationId?: string;
  isRequired: boolean;
  isCompleted?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  rulesDescription: string;
  requiredCheckInCount: number;
  requiredDistinctCategoriesCount: number;
  steps: ChallengeStep[];
  badgeName: string;
  badgeIcon: string;
}

export interface ChallengeProgress {
  challengeId: string;
  participantId: string;
  completedCheckInIds: string[];
  verifiedLocationIds: string[];
  pendingLocationIds: string[];
  distinctCategoriesMet: string[];
  totalCheckInsCount: number;
  isCompleted: boolean;
  completedAt?: string;
  isEligibleForReward: boolean;
  rewardDrawTicketNumber?: string;
}

export interface FestivalNotice {
  id: string;
  title: string;
  content: string;
  level: 'info' | 'important' | 'urgent';
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}

export interface OrganizerUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiresAt?: string;
  resetPasswordToken?: string;
  resetPasswordExpiresAt?: string;
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
  expiresAt: string;
}

export interface SentEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  actionUrl: string;
  actionText: string;
  type: 'activation' | 'password_reset';
  sentAt: string;
}

export interface QuestSponsor {
  id: 'pura-vida-kayaking' | 'emotion-ebike';
  name: string;
  shortName: string;
  tagline: string;
  description: string[];
  location: string;
  ctaLabel: string;
  whatsappMessage: string;
  /** Optional drop-in photo URL once supplied by organiser (e.g. /assets/sponsors/pura-vida-kayaking.jpg) */
  imageUrl?: string;
  /** Optional drop-in logo URL once supplied by organiser (e.g. /assets/sponsors/pura-vida-logo.png) */
  logoUrl?: string;
  expectedImageFilename: string;
  expectedLogoFilename: string;
}
