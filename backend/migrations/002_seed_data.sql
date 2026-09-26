-- ===================================================================
-- BIGBOSS PULSE - SEED DATA FOR ALL 7 REGIONAL SHOWS
-- ===================================================================

-- 1. INSERT SHOWS WITH SHORT CLEAN SLUGS
INSERT INTO shows (id, slug, name, language, broadcaster, host_name, accent_color, display_order)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'telugu', 'Bigg Boss Telugu', 'Telugu', 'Star Maa & Disney+ Hotstar', 'Nagarjuna', '#3B82F6', 1),
    ('22222222-2222-2222-2222-222222222222', 'tamil', 'Bigg Boss Tamil', 'Tamil', 'Vijay TV & Disney+ Hotstar', 'Vijay Sethupathi', '#EC4899', 2),
    ('33333333-3333-3333-3333-333333333333', 'hindi', 'Bigg Boss Hindi', 'Hindi', 'Colors TV & JioCinema', 'Salman Khan', '#F59E0B', 3),
    ('44444444-4444-4444-4444-444444444444', 'kannada', 'Bigg Boss Kannada', 'Kannada', 'Colors Kannada & JioCinema', 'Kichcha Sudeep', '#10B981', 4),
    ('55555555-5555-5555-5555-555555555555', 'malayalam', 'Bigg Boss Malayalam', 'Malayalam', 'Asianet & Disney+ Hotstar', 'Mohanlal', '#8B5CF6', 5),
    ('66666666-6666-6666-6666-666666666666', 'marathi', 'Bigg Boss Marathi', 'Marathi', 'Colors Marathi & JioCinema', 'Riteish Deshmukh', '#F97316', 6),
    ('77777777-7777-7777-7777-777777777777', 'bangla', 'Bigg Boss Bangla', 'Bengali', 'Colors Bangla & JioCinema', 'Sourav Ganguly', '#06B6D4', 7)
ON CONFLICT (slug) DO NOTHING;

-- 2. INSERT CURRENT SEASONS
INSERT INTO seasons (id, show_id, season_number, title, tagline, year, status, total_contestants, remaining_contestants)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 10, 'Bigg Boss Telugu Season 10', 'Entertainment Ki Baap', 2026, 'ongoing', 16, 14),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 10, 'Bigg Boss Tamil Season 10', 'Aadalam, Velalam', 2026, 'ongoing', 18, 16),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '33333333-3333-3333-3333-333333333333', 20, 'Bigg Boss Hindi Season 20', 'Ek Vardaan, Poora Raaz', 2026, 'ongoing', 16, 15),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '44444444-4444-4444-4444-444444444444', 13, 'Bigg Boss Kannada Season 13', 'Gedde Gelthivi', 2026, 'ongoing', 17, 16),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555', 8, 'Bigg Boss Malayalam Season 8', 'Ini Kali Marum', 2026, 'ongoing', 16, 16),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', '66666666-6666-6666-6666-666666666666', 6, 'Bigg Boss Marathi Season 6', 'Dhamakedar Entertainment', 2026, 'completed', 16, 0),
    ('10101010-1010-1010-1010-101010101010', '77777777-7777-7777-7777-777777777777', 3, 'Bigg Boss Bangla Season 3', 'Khel Hobe', 2026, 'upcoming', 14, 14)
ON CONFLICT (show_id, season_number) DO NOTHING;

-- 3. INSERT CONTESTANTS FOR TELUGU SEASON 10
INSERT INTO contestants (id, season_id, name, native_name, slug, photo_url, bio, occupation, status)
VALUES
    ('c1010000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sivaji', 'శివాజీ', 'sivaji', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'Senior actor known for strong leadership and outspoken opinions.', 'Actor & Politician', 'in_house'),
    ('c1010000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Pallavi Prashanth', 'పల్లవి ప్రశాంత్', 'pallavi-prashanth', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'Common man representative and digital creator with massive grassroots support.', 'Rythu Bidda, Creator', 'in_house'),
    ('c1010000-0000-0000-0000-000000000003', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Shobha Shetty', 'శోభా శెట్టి', 'shobha-shetty', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', 'Popular television leading actress from Karthika Deepam.', 'Serial Actress', 'in_house'),
    ('c1010000-0000-0000-0000-000000000004', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Prince Yawar', 'ప్రిన్స్ యావర్', 'prince-yawar', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'High-energy physical task master and fitness model.', 'Model, Athlete', 'in_house'),
    ('c1010000-0000-0000-0000-000000000005', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Amardeep Chowdary', 'అమర్‌దీప్ చౌదరి', 'amardeep-chowdary', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80', 'Dynamic television actor and dancer with passionate fanbase.', 'TV Actor & Dancer', 'in_house'),
    ('c1010000-0000-0000-0000-000000000006', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Kiran Rathore', 'కిరణ్ రాథోడ్', 'kiran-rathore', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 'Glamorous cinema actress and stage performer.', 'Actress', 'evicted')
ON CONFLICT (season_id, slug) DO NOTHING;

-- 4. INSERT TELUGU SEASON 10 NOMINATION WEEKS
INSERT INTO nomination_weeks (id, season_id, week_number, title, description, starts_at, ends_at, is_active, is_closed, official_eviction_announced, total_votes)
VALUES
    -- Completed Week 1
    ('d1010000-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, 'Week 1 Eviction Poll', 'First elimination round of Season 10.', NOW() - INTERVAL '14 days', NOW() - INTERVAL '10 days', FALSE, TRUE, TRUE, 28400),
    -- Current Active Week 2
    ('d1010000-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 'Week 2 Elimination Voting: Save Your Favourite', 'Official public vote to save housemates from mid-season eviction.', NOW() - INTERVAL '1 day', NOW() + INTERVAL '3 days', TRUE, FALSE, FALSE, 46920)
ON CONFLICT (season_id, week_number) DO NOTHING;

-- 5. INSERT NOMINEES FOR TELUGU ACTIVE WEEK 2
INSERT INTO weekly_nominations (week_id, contestant_id, vote_count, is_evicted)
VALUES
    ('d1010000-0000-0000-0000-000000000002', 'c1010000-0000-0000-0000-000000000002', 19450, FALSE), -- Pallavi Prashanth
    ('d1010000-0000-0000-0000-000000000002', 'c1010000-0000-0000-0000-000000000001', 14200, FALSE), -- Sivaji
    ('d1010000-0000-0000-0000-000000000002', 'c1010000-0000-0000-0000-000000000005', 8120, FALSE),  -- Amardeep
    ('d1010000-0000-0000-0000-000000000002', 'c1010000-0000-0000-0000-000000000003', 5150, FALSE)   -- Shobha Shetty
ON CONFLICT (week_id, contestant_id) DO NOTHING;

-- 6. INSERT NOMINEES FOR COMPLETED TELUGU WEEK 1
INSERT INTO weekly_nominations (week_id, contestant_id, vote_count, is_evicted, eviction_reason)
VALUES
    ('d1010000-0000-0000-0000-000000000001', 'c1010000-0000-0000-0000-000000000004', 16200, FALSE, NULL),
    ('d1010000-0000-0000-0000-000000000001', 'c1010000-0000-0000-0000-000000000006', 12200, TRUE, 'public_vote')
ON CONFLICT (week_id, contestant_id) DO NOTHING;

UPDATE nomination_weeks
SET official_evicted_contestant_id = 'c1010000-0000-0000-0000-000000000006'
WHERE id = 'd1010000-0000-0000-0000-000000000001';

-- 7. CHAT MESSAGES FOR TELUGU ACTIVE WEEK 2
INSERT INTO chat_messages (week_id, device_id, nickname, avatar_color, content, is_pinned, created_at)
VALUES
    ('d1010000-0000-0000-0000-000000000002', 'admin-mod', 'BB_Host', '#3B82F6', '🌟 Welcome to Bigg Boss Telugu Season 10 Week 2 Live Poll! Daily voting is open until Friday midnight.', TRUE, NOW() - INTERVAL '1 day'),
    ('d1010000-0000-0000-0000-000000000002', 'telugu-fan-1', 'Prashanth_Army', '#10B981', 'Prashanth played the physical task purely with heart. 100% voting for Rythu Bidda!', FALSE, NOW() - INTERVAL '2 hours'),
    ('d1010000-0000-0000-0000-000000000002', 'telugu-fan-2', 'Vizag_Tiger', '#F59E0B', 'Sivaji garu leadership is guiding the youngsters in the house. Well played!', FALSE, NOW() - INTERVAL '45 minutes'),
    ('d1010000-0000-0000-0000-000000000002', 'telugu-fan-3', 'HydBBFan', '#EC4899', 'Amar needs to control temper during nominations, but game is entertaining.', FALSE, NOW() - INTERVAL '10 minutes')
ON CONFLICT DO NOTHING;

-- 8. INSERT CONTESTANTS FOR HINDI SEASON 20
INSERT INTO contestants (id, season_id, name, native_name, slug, photo_url, bio, occupation, status)
VALUES
    ('c2010000-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Harsh Vijay Machare (Yung DSA)', 'हर्ष विजय मचारे', 'harsh-vijay-machare', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Pune underground rapper blending street slang with hip-hop.', 'Rapper, Songwriter', 'in_house'),
    ('c2010000-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Isha Rikhi', 'ईशा रिखी', 'isha-rikhi', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 'Popular Punjabi film actress and renowned fashion model.', 'Actress, Model', 'in_house'),
    ('c2010000-0000-0000-0000-000000000003', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Aasif Khan', 'आसिफ खान', 'aasif-khan', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'Acclaimed theatre artist and OTT actor from Panchayat.', 'Actor', 'in_house'),
    ('c2010000-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Tanmay Singh (ScoutOP)', 'तन्मय सिंह', 'tanmay-singh-scoutop', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80', 'Leading Esports champion and YouTube gaming creator.', 'Esports Athlete', 'in_house')
ON CONFLICT (season_id, slug) DO NOTHING;

-- 9. INSERT HINDI SEASON 20 ACTIVE WEEK
INSERT INTO nomination_weeks (id, season_id, week_number, title, description, starts_at, ends_at, is_active, is_closed, official_eviction_announced, total_votes)
VALUES
    ('d2010000-0000-0000-0000-000000000001', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 1, 'Hindi Week 1 Eviction Poll', 'Save your favourite housemate.', NOW() - INTERVAL '1 day', NOW() + INTERVAL '3 days', TRUE, FALSE, FALSE, 34500)
ON CONFLICT (season_id, week_number) DO NOTHING;

INSERT INTO weekly_nominations (week_id, contestant_id, vote_count, is_evicted)
VALUES
    ('d2010000-0000-0000-0000-000000000001', 'c2010000-0000-0000-0000-000000000001', 19800, FALSE),
    ('d2010000-0000-0000-0000-000000000001', 'c2010000-0000-0000-0000-000000000002', 14700, FALSE)
ON CONFLICT (week_id, contestant_id) DO NOTHING;

-- 10. INSERT CONTESTANTS FOR TAMIL SEASON 10
INSERT INTO contestants (id, season_id, name, native_name, slug, photo_url, bio, occupation, status)
VALUES
    ('c3010000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Soundariya Nanjundan', 'சௌந்தர்யா நஞ்சுண்டன்', 'soundariya-nanjundan', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80', 'Popular actress and model with strong screen presence.', 'Actress', 'in_house'),
    ('c3010000-0000-0000-0000-000000000002', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Muthukumaran Jegatheesan', 'முத்துக்குமரன் ஜெகதீசன்', 'muthukumaran', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80', 'Debater and public speaker with fiery verbal counters.', 'Speaker & Writer', 'in_house')
ON CONFLICT (season_id, slug) DO NOTHING;

INSERT INTO nomination_weeks (id, season_id, week_number, title, description, starts_at, ends_at, is_active, is_closed, official_eviction_announced, total_votes)
VALUES
    ('d3010000-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 1, 'Tamil Week 1 Eviction Poll', 'Save your favourite contestant.', NOW() - INTERVAL '1 day', NOW() + INTERVAL '3 days', TRUE, FALSE, FALSE, 29100)
ON CONFLICT (season_id, week_number) DO NOTHING;

INSERT INTO weekly_nominations (week_id, contestant_id, vote_count, is_evicted)
VALUES
    ('d3010000-0000-0000-0000-000000000001', 'c3010000-0000-0000-0000-000000000001', 17200, FALSE),
    ('d3010000-0000-0000-0000-000000000001', 'c3010000-0000-0000-0000-000000000002', 11900, FALSE)
ON CONFLICT (week_id, contestant_id) DO NOTHING;

-- 11. INSERT CONTESTANTS FOR KANNADA SEASON 13
INSERT INTO contestants (id, season_id, name, native_name, slug, photo_url, bio, occupation, status)
VALUES
    ('c4010000-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Gauthami Jadav', 'ಗೌತಮಿ ಜಾದವ್', 'gauthami-jadav', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', 'Beloved TV serial actress from Sathya.', 'TV Actress', 'in_house'),
    ('c4010000-0000-0000-0000-000000000002', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Mokshitha Pai', 'ಮೋಕ್ಷಿತಾ ಪೈ', 'mokshitha-pai', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80', 'Renowned television star from Paaru serial.', 'TV Star', 'in_house')
ON CONFLICT (season_id, slug) DO NOTHING;

INSERT INTO nomination_weeks (id, season_id, week_number, title, description, starts_at, ends_at, is_active, is_closed, official_eviction_announced, total_votes)
VALUES
    ('d4010000-0000-0000-0000-000000000001', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 'Kannada Week 1 Eviction Poll', 'Save your favourite contestant.', NOW() - INTERVAL '1 day', NOW() + INTERVAL '3 days', TRUE, FALSE, FALSE, 21400)
ON CONFLICT (season_id, week_number) DO NOTHING;

INSERT INTO weekly_nominations (week_id, contestant_id, vote_count, is_evicted)
VALUES
    ('d4010000-0000-0000-0000-000000000001', 'c4010000-0000-0000-0000-000000000001', 11900, FALSE),
    ('d4010000-0000-0000-0000-000000000001', 'c4010000-0000-0000-0000-000000000002', 9500, FALSE)
ON CONFLICT (week_id, contestant_id) DO NOTHING;
