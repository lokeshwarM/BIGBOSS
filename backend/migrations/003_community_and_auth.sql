-- ===================================================================
-- BIGBOSS COMMUNITY - AUTHENTICATION, SOCIAL POSTS, REACTIONS & MODERATION
-- Forward migration 003
-- ===================================================================

-- 1. AUTHENTICATED USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(256) UNIQUE NOT NULL,
    provider VARCHAR(32) NOT NULL DEFAULT 'google', -- 'google', 'dev', 'apple'
    provider_subject_id VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'user',        -- 'user', 'admin'
    public_nickname VARCHAR(64) NOT NULL,
    avatar_color VARCHAR(16) DEFAULT '#F59E0B',
    is_banned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(provider, provider_subject_id)
);

-- 2. USER DEVICE LINKS (Associates anonymous device identities with authenticated accounts)
CREATE TABLE IF NOT EXISTS user_device_links (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_id VARCHAR(128) NOT NULL,
    linked_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, device_id)
);

-- 3. PERSISTENT COMMUNITY POSTS (Opinions & Discussions by Authenticated Fans)
CREATE TABLE IF NOT EXISTS community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    show_slug VARCHAR(64) NOT NULL,
    season_id UUID NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
    week_id UUID REFERENCES nomination_weeks(id) ON DELETE SET NULL,
    author_nickname VARCHAR(64) NOT NULL,
    author_avatar_color VARCHAR(16) NOT NULL DEFAULT '#F59E0B',
    content VARCHAR(1000) NOT NULL,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_hidden BOOLEAN DEFAULT FALSE,
    likes_count INT DEFAULT 0,
    loves_count INT DEFAULT 0,
    agrees_count INT DEFAULT 0,
    disagrees_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMMUNITY COMMENTS / REPLIES
CREATE TABLE IF NOT EXISTS community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    author_nickname VARCHAR(64) NOT NULL,
    author_avatar_color VARCHAR(16) NOT NULL DEFAULT '#F59E0B',
    content VARCHAR(500) NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. POST REACTIONS (Like, Love, Agree, Disagree)
-- Enforces: 1 active reaction per user per post
CREATE TABLE IF NOT EXISTS post_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reaction_type VARCHAR(16) NOT NULL, -- 'like', 'love', 'agree', 'disagree'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- 6. MODERATION REPORTS
CREATE TABLE IF NOT EXISTS moderation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type VARCHAR(16) NOT NULL, -- 'post', 'comment'
    target_id UUID NOT NULL,
    reporter_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    reporter_device_id VARCHAR(128),
    reason VARCHAR(256) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'pending', -- 'pending', 'resolved', 'dismissed'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INDEXES FOR HIGH-PERFORMANCE COMMUNITY BROWSING
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, provider_subject_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_season ON community_posts(season_id, is_pinned DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_week ON community_posts(week_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_post_reactions_post ON post_reactions(post_id, reaction_type);
CREATE INDEX IF NOT EXISTS idx_moderation_reports_status ON moderation_reports(status, created_at DESC);
