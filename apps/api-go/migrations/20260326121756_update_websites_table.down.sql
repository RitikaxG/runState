DROP INDEX IF EXISTS idx_website_slug_unique;

ALTER TABLE website
DROP COLUMN IF EXISTS slug;