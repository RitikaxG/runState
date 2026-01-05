CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enum
CREATE TYPE website_status AS ENUM ('up', 'down', 'unknown');

-- Users
CREATE TABLE users (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Regions
CREATE TABLE region (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    CONSTRAINT region_pkey PRIMARY KEY (id)
);

-- Websites
CREATE TABLE website (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    url TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    time_added TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT website_pkey PRIMARY KEY (id),
    CONSTRAINT website_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Website ticks
CREATE TABLE website_ticks (
    id UUID NOT NULL DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL,
    region_id UUID NOT NULL,
    status website_status NOT NULL,
    response_time_ms INTEGER NOT NULL,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT website_ticks_pkey PRIMARY KEY (id),
    CONSTRAINT website_ticks_website_id_fkey FOREIGN KEY (website_id)
        REFERENCES website(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT website_ticks_region_id_fkey FOREIGN KEY (region_id)
        REFERENCES region(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX idx_website_user_id ON website(user_id);
CREATE INDEX idx_ticks_website_id ON website_ticks(website_id);
CREATE INDEX idx_ticks_region_id ON website_ticks(region_id);
