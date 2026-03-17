CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL,
    region_id UUID NULL,
    started_at TIMESTAMP NOT NULL,
    resolved_at TIMESTAMP NULL,
    current_status website_status NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT incidents_website_id_fkey
        FOREIGN KEY (website_id)
        REFERENCES websites(id)
        ON DELETE CASCADE,

    CONSTRAINT incidents_region_id_fkey
        FOREIGN KEY (region_id)
        REFERENCES region(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_incidents_website_id ON incidents(website_id);
CREATE INDEX idx_incidents_website_id_is_active ON incidents(website_id, is_active);
CREATE INDEX idx_incidents_started_at_desc ON incidents(started_at DESC);