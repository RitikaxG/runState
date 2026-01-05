-- Drop foreign key constraints first
ALTER TABLE website_ticks DROP CONSTRAINT IF EXISTS website_ticks_region_id_fkey;
ALTER TABLE website_ticks DROP CONSTRAINT IF EXISTS website_ticks_website_id_fkey;
ALTER TABLE website DROP CONSTRAINT IF EXISTS website_user_id_fkey;

-- Drop tables (children first)
DROP TABLE IF EXISTS website_ticks;
DROP TABLE IF EXISTS website;
DROP TABLE IF EXISTS region;
DROP TABLE IF EXISTS users;

-- Drop enum
DROP TYPE IF EXISTS website_status;

-- Drop extension (optional, safe)
DROP EXTENSION IF EXISTS "pgcrypto";
