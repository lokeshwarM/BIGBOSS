-- 004_seasons_host.sql
-- Add host_name to seasons table and configure ON DELETE SET NULL on nomination_weeks

ALTER TABLE seasons ADD COLUMN IF NOT EXISTS host_name VARCHAR(128);

ALTER TABLE nomination_weeks DROP CONSTRAINT IF EXISTS nomination_weeks_official_evicted_contestant_id_fkey;
ALTER TABLE nomination_weeks ADD CONSTRAINT nomination_weeks_official_evicted_contestant_id_fkey
FOREIGN KEY (official_evicted_contestant_id) REFERENCES contestants(id) ON DELETE SET NULL;
