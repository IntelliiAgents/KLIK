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
  accessibilityNotes: string;
  hasToilets: boolean;
  hasParking: boolean;
  hasFoodNearby: boolean;
  isWheelchairAccessible: boolean;
  capacity?: number;
  qrCodeToken: string; // Token embedded in physical QR check-in stands
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
  websiteUrl?: string;
  imageUrl?: string;
}

export interface FestivalEvent {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  venueId: string;
  venueName?: string;
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

export type CheckInSyncStatus = 
  | 'captured_offline'
  | 'pending_sync'
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
  tokenUsed: string;
  verifiedAt?: string;
  notes?: string;
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
