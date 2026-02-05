-- =====================
-- Drop foreign key constraints
-- =====================

ALTER TABLE refresh_tokens
    DROP CONSTRAINT IF EXISTS refresh_tokens_user_id_fkey;

ALTER TABLE website_ticks
    DROP CONSTRAINT IF EXISTS website_ticks_region_id_fkey;

ALTER TABLE website_ticks
    DROP CONSTRAINT IF EXISTS website_ticks_website_id_fkey;

ALTER TABLE website
    DROP CONSTRAINT IF EXISTS website_user_id_fkey;

-- =====================
-- Drop tables (children → parents)
-- =====================

DROP TABLE IF EXISTS website_ticks;
DROP TABLE IF EXISTS website;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS region;
DROP TABLE IF EXISTS users;

-- =====================
-- Drop enums
-- =====================

DROP TYPE IF EXISTS website_status;
DROP TYPE IF EXISTS role;

-- =====================
-- Drop extension (optional)
-- =====================

DROP EXTENSION IF EXISTS "pgcrypto";
