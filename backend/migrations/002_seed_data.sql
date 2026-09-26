-- ===================================================================
-- BIGBOSS PULSE - SEED DATA FOR ALL 7 REGIONAL SHOWS
-- ===================================================================

-- 1. INSERT SHOWS
INSERT INTO shows (id, slug, name, language, broadcaster, host_name, accent_color, display_order)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'bigg-boss-hindi', 'Bigg Boss Hindi', 'Hindi', 'Colors TV & JioCinema', 'Salman Khan', '#F59E0B', 1),
    ('22222222-2222-2222-2222-222222222222', 'bigg-boss-tamil', 'Bigg Boss Tamil', 'Tamil', 'Vijay TV & Disney+ Hotstar', 'Vijay Sethupathi', '#EC4899', 2),
    ('33333333-3333-3333-3333-333333333333', 'bigg-boss-telugu', 'Bigg Boss Telugu', 'Telugu', 'Star Maa & Disney+ Hotstar', 'Nagarjuna', '#3B82F6', 3),
    ('44444444-4444-4444-4444-444444444444', 'bigg-boss-kannada', 'Bigg Boss Kannada', 'Kannada', 'Colors Kannada & JioCinema', 'Kichcha Sudeep', '#10B981', 4),
    ('55555555-5555-5555-5555-555555555555', 'bigg-boss-malayalam', 'Bigg Boss Malayalam', 'Malayalam', 'Asianet & Disney+ Hotstar', 'Mohanlal', '#8B5CF6', 5),
    ('66666666-6666-6666-6666-666666666666', 'bigg-boss-marathi', 'Bigg Boss Marathi', 'Marathi', 'Colors Marathi & JioCinema', 'Riteish Deshmukh', '#F97316', 6),
    ('77777777-7777-7777-7777-777777777777', 'bigg-boss-bangla', 'Bigg Boss Bangla', 'Bengali', 'Colors Bangla & JioCinema', 'Sourav Ganguly', '#06B6D4', 7)
ON CONFLICT (slug) DO NOTHING;

-- 2. INSERT CURRENT SEASONS
INSERT INTO seasons (id, show_id, season_number, title, tagline, year, status, total_contestants, remaining_contestants)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 20, 'Bigg Boss Hindi Season 20', 'Ek Vardaan, Poora Raaz', 2026, 'ongoing', 16, 15),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 10, 'Bigg Boss Tamil Season 10', 'Aadalam, Velalam', 2026, 'ongoing', 18, 16),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 10, 'Bigg Boss Telugu Season 10', 'Entertainment Ki Baap', 2026, 'ongoing', 16, 14),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 13, 'Bigg Boss Kannada Season 13', 'Gedde Gelthivi', 2026, 'ongoing', 17, 16)
ON CONFLICT (show_id, season_number) DO NOTHING;

-- 3. INSERT CONTESTANTS FOR HINDI SEASON 20
INSERT INTO contestants (id, season_id, name, native_name, slug, photo_url, bio, occupation, status)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Harsh Vijay Machare (Yung DSA)', 'हर्ष विजय मचारे (यंग डीएसए)', 'harsh-vijay-machare-yung-dsa', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Pune underground rapper blending Marathi street slang with modern trap.', 'Rapper, Songwriter', 'in_house'),
    ('c2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Isha Rikhi', 'ईशा रिखी', 'isha-rikhi', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 'Popular Punjabi film actress and renowned fashion model.', 'Actress, Model', 'in_house'),
    ('c3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Aasif Khan', 'आसिफ खान', 'aasif-khan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'Acclaimed theatre artist and OTT actor from Panchayat & Mirzapur.', 'Actor, Casting Director', 'in_house'),
    ('c4444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tanmay Singh (ScoutOP)', 'तन्मय सिंह (स्काउटओपी)', 'tanmay-singh-scoutop', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'India leading Esports champion and YouTube gaming icon.', 'Esports Athlete, Gaming Creator', 'in_house'),
    ('c5555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sayyed Arishfa Khan', 'सैयद अरिशफा खान', 'sayyed-arishfa-khan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', 'Television child star turned digital creator with 30M+ followers.', 'Actress, Digital Creator', 'in_house'),
    ('c6666666-6666-6666-6666-666666666666', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Rohed Khan', 'रोहेद खान', 'rohed-khan', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80', 'Fitness influencer and television actor.', 'Actor, Model', 'evicted')
ON CONFLICT (season_id, slug) DO NOTHING;

-- 4. INSERT NOMINATION WEEKS (Active Week 3 + Completed Past Weeks 1 and 2)
INSERT INTO nomination_weeks (id, season_id, week_number, title, description, starts_at, ends_at, is_active, is_closed, official_eviction_announced, total_votes)
VALUES
    -- Completed Week 1
    ('w1111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 'Week 1 Eviction Poll', 'Opening nomination week of Season 20.', NOW() - INTERVAL '14 days', NOW() - INTERVAL '10 days', FALSE, TRUE, TRUE, 4210),
    -- Completed Week 2
    ('w2222222-2222-2222-2222-222222222222', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 'Week 2 Eviction Poll', 'Direct nomination task after rule violations.', NOW() - INTERVAL '7 days', NOW() - INTERVAL '3 days', FALSE, TRUE, TRUE, 8950),
    -- Current Active Week 3 (Runs from Monday night to Friday midnight)
    ('w3333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 3, 'Week 3 Eviction Poll: Save Harsh or Isha', 'Reverse nominations: Only housemates who received no save votes face eviction.', NOW() - INTERVAL '2 days', NOW() + INTERVAL '2 days', TRUE, FALSE, FALSE, 14280)
ON CONFLICT (season_id, week_number) DO NOTHING;

-- 5. INSERT WEEKLY NOMINEES FOR WEEK 3
INSERT INTO weekly_nominations (week_id, contestant_id, vote_count, is_evicted)
VALUES
    ('w3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 8920, FALSE), -- Harsh (Yung DSA)
    ('w3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 5360, FALSE)  -- Isha Rikhi
ON CONFLICT (week_id, contestant_id) DO NOTHING;

-- 6. INSERT WEEKLY NOMINEES FOR COMPLETED WEEK 2
INSERT INTO weekly_nominations (week_id, contestant_id, vote_count, is_evicted, eviction_reason)
VALUES
    ('w2222222-2222-2222-2222-222222222222', 'c4444444-4444-4444-4444-444444444444', 4810, FALSE, NULL),
    ('w2222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', 2410, FALSE, NULL),
    ('w2222222-2222-2222-2222-222222222222', 'c6666666-6666-6666-6666-666666666666', 1730, TRUE, 'public_vote') -- Rohed Khan evicted
ON CONFLICT (week_id, contestant_id) DO NOTHING;

-- Set Rohed Khan as official evicted in Week 2
UPDATE nomination_weeks 
SET official_evicted_contestant_id = 'c6666666-6666-6666-6666-666666666666'
WHERE id = 'w2222222-2222-2222-2222-222222222222';

-- 7. INITIAL SAMPLE CHAT MESSAGES FOR ACTIVE WEEK 3
INSERT INTO chat_messages (week_id, device_id, nickname, avatar_color, content, is_pinned, created_at)
VALUES
    ('w3333333-3333-3333-3333-333333333333', 'system-admin', 'Mod_Pulse', '#EF4444', '🔥 Welcome to Week 3 Live Fan Discussion! Who are you saving this week? Keep discussions respectful.', TRUE, NOW() - INTERVAL '1 day'),
    ('w3333333-3333-3333-3333-333333333333', 'dev-fan-1', 'YungSquad_MH', '#F59E0B', 'Voted for Yung DSA! Yerawada hip-hop representation in the house 🚀', FALSE, NOW() - INTERVAL '3 hours'),
    ('w3333333-3333-3333-3333-333333333333', 'dev-fan-2', 'PunjabSherni', '#EC4899', 'Isha played so calmly this week, she definitely deserves to stay over him.', FALSE, NOW() - INTERVAL '1 hour'),
    ('w3333333-3333-3333-3333-333333333333', 'dev-fan-3', 'BB_Guru', '#10B981', 'Remember you can vote once every day from this device until Friday night!', FALSE, NOW() - INTERVAL '25 minutes')
ON CONFLICT DO NOTHING;
