-- ===================================================================
-- BIGBOSS PULSE - PRODUCTION DATABASE SCHEMA
-- Compatible with Neon Serverless PostgreSQL
-- ===================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SHOWS (All 7 Regional Languages)
CREATE TABLE IF NOT EXISTS shows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    language VARCHAR(64) NOT NULL,
    broadcaster VARCHAR(128) NOT NULL,
    host_name VARCHAR(128),
    logo_url TEXT,
    banner_url TEXT,
    accent_color VARCHAR(16) DEFAULT '#F59E0B',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SEASONS
CREATE TABLE IF NOT EXISTS seasons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
    season_number INT NOT NULL,
    title VARCHAR(128) NOT NULL,
    tagline VARCHAR(256),
    year INT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'ongoing', -- 'upcoming', 'ongoing', 'completed'
    start_date DATE,
    end_date DATE,
    total_contestants INT DEFAULT 0,
    remaining_contestants INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(show_id, season_number)
);

-- 4. CONTESTANTS
CREATE TABLE IF NOT EXISTS contestants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    native_name VARCHAR(128),
    slug VARCHAR(128) NOT NULL,
    photo_url TEXT,
    bio TEXT,
    occupation VARCHAR(128),
    city VARCHAR(128),
    instagram_handle VARCHAR(128),
    status VARCHAR(32) NOT NULL DEFAULT 'in_house', -- 'in_house', 'evicted', 'winner', 'runner_up', 'walkout'
    entry_type VARCHAR(32) NOT NULL DEFAULT 'original', -- 'original', 'wildcard', 'guest'
    entry_day INT DEFAULT 1,
    eviction_day INT,
    nominations_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(season_id, slug)
);

-- 5. NOMINATION WEEKS (Monday Night to Friday Night Cycle)
CREATE TABLE IF NOT EXISTS nomination_weeks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    week_number INT NOT NULL,
    title VARCHAR(128) NOT NULL,
    description TEXT,
    starts_at TIMESTAMPTZ NOT NULL, -- Monday night
    ends_at TIMESTAMPTZ NOT NULL,   -- Friday night
    is_active BOOLEAN DEFAULT FALSE,
    is_closed BOOLEAN DEFAULT FALSE,
    official_eviction_announced BOOLEAN DEFAULT FALSE,
    official_evicted_contestant_id UUID REFERENCES contestants(id),
    total_votes BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(season_id, week_number)
);

-- 6. WEEKLY NOMINATIONS (Contestants up for eviction in a specific week)
CREATE TABLE IF NOT EXISTS weekly_nominations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID NOT NULL REFERENCES nomination_weeks(id) ON DELETE CASCADE,
    contestant_id UUID NOT NULL REFERENCES contestants(id) ON DELETE CASCADE,
    vote_count BIGINT DEFAULT 0,
    is_evicted BOOLEAN DEFAULT FALSE,
    eviction_reason VARCHAR(64) DEFAULT 'public_vote', -- 'public_vote', 'emergency_exit', 'walkout', 'ejection'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(week_id, contestant_id)
);

-- 7. ANONYMOUS DEVICE ACCOUNTS
CREATE TABLE IF NOT EXISTS device_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(128) UNIQUE NOT NULL, -- Client-generated persistent UUID
    nickname VARCHAR(64) NOT NULL DEFAULT 'BB_Fan',
    avatar_color VARCHAR(16) DEFAULT '#F59E0B',
    email VARCHAR(256),                     -- Optional email linking
    is_verified BOOLEAN DEFAULT FALSE,
    last_active_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VOTES (1 vote per day per device per nomination week)
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID NOT NULL REFERENCES nomination_weeks(id) ON DELETE CASCADE,
    contestant_id UUID NOT NULL REFERENCES contestants(id) ON DELETE CASCADE,
    device_id VARCHAR(128) NOT NULL,
    ip_hash VARCHAR(128),
    voted_date DATE NOT NULL DEFAULT CURRENT_DATE, -- Day tracking for 1 vote/day constraint
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Strict constraint: One vote per day per device for any given active week
    CONSTRAINT unique_daily_device_vote UNIQUE (week_id, device_id, voted_date)
);

-- 9. LIVE COMMUNITY CHAT & DISCUSSIONS
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    week_id UUID NOT NULL REFERENCES nomination_weeks(id) ON DELETE CASCADE,
    device_id VARCHAR(128) NOT NULL,
    nickname VARCHAR(64) NOT NULL,
    avatar_color VARCHAR(16) DEFAULT '#F59E0B',
    content VARCHAR(500) NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INDEXES FOR PERFORMANCE & HIGH CONCURRENCY
CREATE INDEX IF NOT EXISTS idx_seasons_show_id ON seasons(show_id);
CREATE INDEX IF NOT EXISTS idx_contestants_season_id ON contestants(season_id);
CREATE INDEX IF NOT EXISTS idx_nomination_weeks_season ON nomination_weeks(season_id);
CREATE INDEX IF NOT EXISTS idx_nomination_weeks_active ON nomination_weeks(is_active);
CREATE INDEX IF NOT EXISTS idx_weekly_nominations_week ON weekly_nominations(week_id);
CREATE INDEX IF NOT EXISTS idx_votes_week_contestant ON votes(week_id, contestant_id);
CREATE INDEX IF NOT EXISTS idx_votes_daily_lookup ON votes(week_id, device_id, voted_date);
CREATE INDEX IF NOT EXISTS idx_chat_messages_week_created ON chat_messages(week_id, created_at DESC);
