ALTER TABLE website
ADD COLUMN slug TEXT;

UPDATE website
SET slug = id::text
WHERE slug IS NULL;

ALTER TABLE website
ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX idx_website_slug_unique ON website(slug);