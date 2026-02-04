-- Ensure pgcrypto is available for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum for website status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'website_status') THEN
        CREATE TYPE website_status AS ENUM ('up', 'down', 'unknown');
    END IF;
END$$;

-- Create website_ticks table
CREATE TABLE IF NOT EXISTS website_ticks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL,
    region_id UUID NOT NULL,
    status website_status NOT NULL,
    response_time_ms INTEGER NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT website_ticks_website_id_fkey FOREIGN KEY (website_id)
        REFERENCES website(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT website_ticks_region_id_fkey FOREIGN KEY (region_id)
        REFERENCES region(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ticks_website_id ON website_ticks(website_id);
CREATE INDEX IF NOT EXISTS idx_ticks_region_id ON website_ticks(region_id);
CREATE INDEX IF NOT EXISTS idx_ticks_created_at ON website_ticks(created_at);
