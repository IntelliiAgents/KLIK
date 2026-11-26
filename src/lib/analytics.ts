// KliK 2026 Anonymous Interaction Analytics Hooks
// Non-intrusive, privacy-first event tracking without personal identifiers or cookies.

export type AnalyticsEventName =
  | 'app_open'
  | 'home_view'
  | 'programme_view'
  | 'youth_programme_view'
  | 'artists_view'
  | 'artist_profile_view'
  | 'poster_view'
  | 'event_view'
  | 'event_save'
  | 'event_unsave'
  | 'event_share'
  | 'directions_click'
  | 'map_view'
  | 'venue_view'
  | 'ticket_click'
  | 'ride_request'
  | 'ride_request_started'
  | 'ride_request_whatsapp_opened'
  | 'culture_trail_open'
  | 'culture_trail_checkin'
  | 'things_to_do_view'
  | 'home_quest_banner_click'
  | 'quest_started'
  | 'quest_completed'
  | 'quest_entry_whatsapp_click'
  | 'checkin_method_used'
  | 'sponsor_impression'
  | 'sponsor_card_click'
  | 'sponsor_whatsapp_click';

export interface AnalyticsEventPayload {
  name: AnalyticsEventName;
  properties?: Record<string, string | number | boolean | undefined>;
  timestamp: string;
}

export interface PrivacyAnalyticsSummary {
  updatedAt: string;
  homeQuestBannerClicks: number;
  questStarts: number;
  questCompletions: number;
  questEntryWhatsAppClicks: number;
  checkInMethods: {
    qr: number;
    gps: number;
    manual_whatsapp_selfie: number;
    manual_staff_override: number;
  };
  sponsors: Record<
    string,
    {
      impressions: number;
      cardClicks: number;
      whatsappClicks: number;
    }
  >;
}

const ANALYTICS_SUMMARY_KEY = 'klik_privacy_analytics_summary_v1';

function createEmptySummary(): PrivacyAnalyticsSummary {
  return {
    updatedAt: new Date().toISOString(),
    homeQuestBannerClicks: 0,
    questStarts: 0,
    questCompletions: 0,
    questEntryWhatsAppClicks: 0,
    checkInMethods: {
      qr: 0,
      gps: 0,
      manual_whatsapp_selfie: 0,
      manual_staff_override: 0,
    },
    sponsors: {
      'pura-vida-kayaking': { impressions: 0, cardClicks: 0, whatsappClicks: 0 },
      'emotion-ebike': { impressions: 0, cardClicks: 0, whatsappClicks: 0 },
    },
  };
}

export function getAnalyticsSummary(): PrivacyAnalyticsSummary {
  if (typeof window === 'undefined') return createEmptySummary();
  try {
    const raw = localStorage.getItem(ANALYTICS_SUMMARY_KEY);
    if (!raw) return createEmptySummary();
    const parsed = JSON.parse(raw) as Partial<PrivacyAnalyticsSummary>;
    const base = createEmptySummary();
    return {
      ...base,
      ...parsed,
      checkInMethods: {
        ...base.checkInMethods,
        ...(parsed.checkInMethods || {}),
      },
      sponsors: {
        ...base.sponsors,
        ...(parsed.sponsors || {}),
      },
    };
  } catch {
    return createEmptySummary();
  }
}

function recordAggregatedMetric(
  name: AnalyticsEventName,
  properties?: Record<string, string | number | boolean | undefined>
): void {
  if (typeof window === 'undefined') return;
  try {
    const summary = getAnalyticsSummary();
    let changed = false;

    if (name === 'home_quest_banner_click') {
      summary.homeQuestBannerClicks += 1;
      changed = true;
    } else if (name === 'quest_started') {
      summary.questStarts += 1;
      changed = true;
    } else if (name === 'quest_completed') {
      summary.questCompletions += 1;
      changed = true;
    } else if (name === 'quest_entry_whatsapp_click') {
      summary.questEntryWhatsAppClicks += 1;
      changed = true;
    } else if (name === 'checkin_method_used' && properties?.status === 'success') {
      const method = String(properties.method || '');
      if (
        method === 'qr' ||
        method === 'gps' ||
        method === 'manual_whatsapp_selfie' ||
        method === 'manual_staff_override'
      ) {
        summary.checkInMethods[method] += 1;
        changed = true;
      }
    } else if (
      name === 'sponsor_impression' ||
      name === 'sponsor_card_click' ||
      name === 'sponsor_whatsapp_click'
    ) {
      const sponsorId = String(properties?.sponsorId || '');
      if (sponsorId) {
        if (!summary.sponsors[sponsorId]) {
          summary.sponsors[sponsorId] = {
            impressions: 0,
            cardClicks: 0,
            whatsappClicks: 0,
          };
        }
        if (name === 'sponsor_impression') {
          summary.sponsors[sponsorId].impressions += 1;
        } else if (name === 'sponsor_card_click') {
          summary.sponsors[sponsorId].cardClicks += 1;
        } else if (name === 'sponsor_whatsapp_click') {
          summary.sponsors[sponsorId].whatsappClicks += 1;
        }
        changed = true;
      }
    }

    if (changed) {
      summary.updatedAt = new Date().toISOString();
      localStorage.setItem(ANALYTICS_SUMMARY_KEY, JSON.stringify(summary));
    }
  } catch {
    // Fail silently if storage is unavailable
  }
}

/**
 * Record an anonymous attendee interaction event.
 * Dispatches a DOM CustomEvent, updates privacy-safe aggregate counters, and logs in non-production.
 */
export function trackEvent(
  name: AnalyticsEventName,
  properties?: Record<string, string | number | boolean | undefined>
): void {
  if (typeof window === 'undefined') return;

  const payload: AnalyticsEventPayload = {
    name,
    properties,
    timestamp: new Date().toISOString(),
  };

  try {
    recordAggregatedMetric(name, properties);

    // Dispatch custom event for extensible third-party or local listeners
    window.dispatchEvent(
      new CustomEvent('klik_analytics_event', { detail: payload })
    );

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[Analytics] ${name}:`, properties || {});
    }
  } catch {
    // Fail silently to prevent impacting UX
  }
}
