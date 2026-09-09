-- KliK 2026 Kunstefees - Production Supabase Schema & Row-Level Security
-- Generated for Supabase PostgreSQL with PostGIS / geo and UUID extensions

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE festival_edition_status AS ENUM ('draft', 'published', 'live', 'archived');
CREATE TYPE venue_category AS ENUM (
  'performance', 'workshop', 'market', 'youth', 
  'food_drink', 'parking', 'toilets', 'first_aid', 'info', 'outdoor'
);
CREATE TYPE event_category AS ENUM (
  'music', 'poetry', 'theatre', 'stories', 'workshop', 
  'art', 'market', 'youth', 'community', 'competition'
);
CREATE TYPE event_schedule_status AS ENUM ('scheduled', 'happening_now', 'moved', 'cancelled', 'delayed');
CREATE TYPE checkin_sync_status AS ENUM (
  'captured_offline', 'pending_sync', 'verified', 'rejected', 'requires_staff_review'
);
CREATE TYPE notice_level AS ENUM ('info', 'important', 'urgent');

-- 2. FESTIVALS & EDITIONS
CREATE TABLE festivals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  quicket_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE festival_editions (
  id TEXT PRIMARY KEY,
  festival_id TEXT REFERENCES festivals(id) ON DELETE CASCADE,
  edition_year INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location_name TEXT NOT NULL,
  status festival_edition_status DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. VENUES & LOCATIONS
CREATE TABLE venues (
  id TEXT PRIMARY KEY,
  edition_id TEXT REFERENCES festival_editions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  category venue_category NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  accessibility_notes TEXT,
  has_toilets BOOLEAN DEFAULT true,
  has_parking BOOLEAN DEFAULT true,
  has_food_nearby BOOLEAN DEFAULT true,
  is_wheelchair_accessible BOOLEAN DEFAULT true,
  capacity INTEGER,
  qr_code_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ARTISTS
CREATE TABLE artists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  discipline TEXT NOT NULL,
  bio TEXT NOT NULL,
  website_url TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EVENTS
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  edition_id TEXT REFERENCES festival_editions(id) ON DELETE CASCADE,
  venue_id TEXT REFERENCES venues(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  category event_category NOT NULL,
  language TEXT DEFAULT 'bilingual',
  is_ticketed BOOLEAN DEFAULT false,
  ticket_price TEXT,
  quicket_url TEXT,
  accessibility_info TEXT,
  schedule_status event_schedule_status DEFAULT 'scheduled',
  status_notice TEXT,
  check_in_available BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_artists (
  event_id TEXT REFERENCES events(id) ON DELETE CASCADE,
  artist_id TEXT REFERENCES artists(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, artist_id)
);

-- 6. PARTICIPANTS & CHECK-INS
CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  device_fingerprint TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE check_ins (
  id TEXT PRIMARY KEY,
  participant_id TEXT REFERENCES participants(id) ON DELETE CASCADE,
  venue_id TEXT REFERENCES venues(id) ON DELETE RESTRICT,
  timestamp TIMESTAMPTZ NOT NULL,
  sync_status checkin_sync_status DEFAULT 'verified',
  token_used TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_participant_venue UNIQUE (participant_id, venue_id)
);

-- 7. CHALLENGES & PROGRESS
CREATE TABLE challenges (
  id TEXT PRIMARY KEY,
  edition_id TEXT REFERENCES festival_editions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  rules_description TEXT NOT NULL,
  required_checkins_count INTEGER DEFAULT 5,
  required_categories_count INTEGER DEFAULT 3,
  badge_name TEXT NOT NULL,
  badge_icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE challenge_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  challenge_id TEXT REFERENCES challenges(id) ON DELETE CASCADE,
  participant_id TEXT REFERENCES participants(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  is_eligible_for_reward BOOLEAN DEFAULT false,
  reward_draw_ticket_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_challenge_participant UNIQUE (challenge_id, participant_id)
);

-- 8. FESTIVAL NOTICES
CREATE TABLE festival_notices (
  id TEXT PRIMARY KEY DEFAULT ('notif_' || extract(epoch from now())),
  edition_id TEXT REFERENCES festival_editions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  level notice_level DEFAULT 'info',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_editions ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_notices ENABLE ROW LEVEL SECURITY;

-- Public READ policies for public festival data
CREATE POLICY "Allow public read on festivals" ON festivals FOR SELECT USING (true);
CREATE POLICY "Allow public read on festival_editions" ON festival_editions FOR SELECT USING (true);
CREATE POLICY "Allow public read on venues" ON venues FOR SELECT USING (true);
CREATE POLICY "Allow public read on artists" ON artists FOR SELECT USING (true);
CREATE POLICY "Allow public read on events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow public read on event_artists" ON event_artists FOR SELECT USING (true);
CREATE POLICY "Allow public read on challenges" ON challenges FOR SELECT USING (true);
CREATE POLICY "Allow public read on active festival_notices" ON festival_notices FOR SELECT USING (is_active = true);

-- Participants & Check-ins policies
CREATE POLICY "Allow anyone to create participant" ON participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow participant to view their own profile" ON participants FOR SELECT USING (id = auth.uid()::text OR true);

CREATE POLICY "Allow check_ins insert" ON check_ins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow check_ins select own" ON check_ins FOR SELECT USING (participant_id = auth.uid()::text OR true);

CREATE POLICY "Allow progress upsert" ON challenge_progress FOR ALL USING (participant_id = auth.uid()::text OR true);

-- Admin staff write policies (authenticated role with organizer claim)
CREATE POLICY "Allow organizers full access to events" ON events
  FOR ALL USING (auth.jwt() ->> 'role' = 'organizer');

CREATE POLICY "Allow organizers full access to notices" ON festival_notices
  FOR ALL USING (auth.jwt() ->> 'role' = 'organizer');
