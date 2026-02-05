CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================
-- Enums
-- =====================

CREATE TYPE role AS ENUM ('USER', 'ADMIN');

CREATE TYPE website_status AS ENUM ('up', 'down', 'unknown');

-- =====================
-- Users
-- =====================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role role NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- =====================
-- Refresh Tokens
-- =====================

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT refresh_tokens_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- =====================
-- Regions
-- =====================

CREATE TABLE region (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE
);

-- =====================
-- Websites
-- =====================

CREATE TABLE website (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    url TEXT NOT NULL,
    user_id UUID NOT NULL,
    current_status website_status,
    time_added TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT website_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT website_user_url_unique UNIQUE (user_id, url)
);

CREATE INDEX idx_website_user_id ON website(user_id);

-- =====================
-- Website Ticks
-- =====================

CREATE TABLE website_ticks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL,
    region_id UUID NOT NULL,
    status website_status NOT NULL,
    response_time_ms INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT website_ticks_website_id_fkey
        FOREIGN KEY (website_id)
        REFERENCES website(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT website_ticks_region_id_fkey
        FOREIGN KEY (region_id)
        REFERENCES region(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

CREATE INDEX idx_ticks_website_id ON website_ticks(website_id);
CREATE INDEX idx_ticks_region_id ON website_ticks(region_id);
CREATE INDEX idx_ticks_created_at ON website_ticks(created_at);
