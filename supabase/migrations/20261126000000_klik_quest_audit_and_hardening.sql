-- KLiK 2026 Production Readiness & Security Hardening Migration
-- Additive, non-destructive forward migration (preserves all existing data & QR tokens).
-- BACKUP NOTICE: Always create a Supabase database snapshot before running migrations in production.

-- 1. Add missing enum values referenced by seed venues & events
ALTER TYPE venue_category ADD VALUE IF NOT EXISTS 'theatre';
ALTER TYPE event_category ADD VALUE IF NOT EXISTS 'outdoor';
ALTER TYPE checkin_sync_status ADD VALUE IF NOT EXISTS 'pending_manual_review';

-- 2. Add verification method enum for 3-method KLiK Quest check-ins
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'checkin_verification_method') THEN
    CREATE TYPE checkin_verification_method AS ENUM (
      'qr',
      'gps',
      'manual_whatsapp_selfie',
      'manual_staff_override'
    );
  END IF;
END $$;

-- 3. Add configurable geofence radius to venues (preserving existing coordinates & qr_code_token)
ALTER TABLE venues
  ADD COLUMN IF NOT EXISTS geofence_radius_meters INTEGER DEFAULT 150;

-- 4. Add verification metadata to check_ins (strictly no user GPS coordinate columns stored)
ALTER TABLE check_ins
  ADD COLUMN IF NOT EXISTS verification_method checkin_verification_method DEFAULT 'qr',
  ADD COLUMN IF NOT EXISTS approved_by TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 5. Enforce unique competition entry codes when issued
CREATE UNIQUE INDEX IF NOT EXISTS idx_challenge_progress_unique_ticket
  ON challenge_progress (reward_draw_ticket_number)
  WHERE reward_draw_ticket_number IS NOT NULL;

-- 6. Admin manual check-in audit trail table
CREATE TABLE IF NOT EXISTS manual_checkin_audit_logs (
  id TEXT PRIMARY KEY,
  participant_id TEXT NOT NULL,
  participant_name TEXT,
  venue_id TEXT NOT NULL REFERENCES venues(id) ON DELETE RESTRICT,
  action TEXT NOT NULL CHECK (action IN ('approved', 'rejected')),
  verification_method checkin_verification_method NOT NULL,
  admin_email TEXT NOT NULL,
  admin_name TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate manual approvals for the same participant + venue
CREATE UNIQUE INDEX IF NOT EXISTS idx_manual_audit_unique_approval
  ON manual_checkin_audit_logs (participant_id, venue_id)
  WHERE action = 'approved';

-- 7. Privacy-conscious aggregate analytics events table (no PII stored)
CREATE TABLE IF NOT EXISTS quest_analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  sponsor_id TEXT,
  venue_id TEXT,
  checkin_method TEXT,
  placement TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Harden Row-Level Security (RLS) policies — remove unsafe `OR true` clauses
ALTER TABLE manual_checkin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow participant to view their own profile" ON participants;
CREATE POLICY "Allow participant to view their own profile"
  ON participants FOR SELECT
  USING (id = auth.uid()::text OR auth.jwt() ->> 'role' = 'organizer');

DROP POLICY IF EXISTS "Allow check_ins select own" ON check_ins;
CREATE POLICY "Allow check_ins select own"
  ON check_ins FOR SELECT
  USING (participant_id = auth.uid()::text OR auth.jwt() ->> 'role' = 'organizer');

DROP POLICY IF EXISTS "Allow progress upsert" ON challenge_progress;
CREATE POLICY "Allow participant read own progress"
  ON challenge_progress FOR SELECT
  USING (participant_id = auth.uid()::text OR auth.jwt() ->> 'role' = 'organizer');

CREATE POLICY "Allow organizer manage manual audit logs"
  ON manual_checkin_audit_logs FOR ALL
  USING (auth.jwt() ->> 'role' = 'organizer');

CREATE POLICY "Allow anonymous insert privacy analytics"
  ON quest_analytics_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow organizer read privacy analytics"
  ON quest_analytics_events FOR SELECT
  USING (auth.jwt() ->> 'role' = 'organizer');
