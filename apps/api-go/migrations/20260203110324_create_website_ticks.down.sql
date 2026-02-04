-- Drop foreign key constraints first
ALTER TABLE website_ticks DROP CONSTRAINT IF EXISTS website_ticks_region_id_fkey;
ALTER TABLE website_ticks DROP CONSTRAINT IF EXISTS website_ticks_website_id_fkey;

-- Drop table
DROP TABLE IF EXISTS website_ticks;

-- Drop enum
DROP TYPE IF EXISTS website_status;
