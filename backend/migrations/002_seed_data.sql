-- ===================================================================
-- BIGBOSS - REGIONAL SHOWS INITIALIZATION (NO MOCK SEASONS/CONTESTANTS)
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
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    language = EXCLUDED.language,
    broadcaster = EXCLUDED.broadcaster,
    accent_color = EXCLUDED.accent_color,
    display_order = EXCLUDED.display_order;
