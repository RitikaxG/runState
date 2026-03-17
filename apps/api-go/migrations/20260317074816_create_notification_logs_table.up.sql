CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    website_id UUID NOT NULL,
    incident_id UUID NULL,
    region_id UUID NULL,
    channel TEXT NOT NULL,
    recipient TEXT NOT NULL,
    prev_status website_status NOT NULL,
    current_status website_status NOT NULL,
    delivery_status TEXT NOT NULL,
    provider_message_id TEXT NULL,
    sent_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT notification_logs_website_id_fkey
        FOREIGN KEY (website_id)
        REFERENCES websites(id)
        ON DELETE CASCADE,

    CONSTRAINT notification_logs_incident_id_fkey
        FOREIGN KEY (incident_id)
        REFERENCES incidents(id)
        ON DELETE SET NULL,

    CONSTRAINT notification_logs_region_id_fkey
        FOREIGN KEY (region_id)
        REFERENCES region(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_notification_logs_website_id
    ON notification_logs(website_id);

CREATE INDEX idx_notification_logs_incident_id
    ON notification_logs(incident_id);

CREATE INDEX idx_notification_logs_sent_at_desc
    ON notification_logs(sent_at DESC);