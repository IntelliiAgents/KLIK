// KliK 2026 Anonymous Interaction Analytics Hooks
// Non-intrusive, privacy-first event tracking without user accounts.

export type AnalyticsEventName =
  | 'app_open'
  | 'home_view'
  | 'programme_view'
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
  | 'things_to_do_view';

export interface AnalyticsEventPayload {
  name: AnalyticsEventName;
  properties?: Record<string, string | number | boolean | undefined>;
  timestamp: string;
}

/**
 * Record an anonymous attendee interaction event.
 * Dispatches a DOM CustomEvent and logs in non-production.
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
