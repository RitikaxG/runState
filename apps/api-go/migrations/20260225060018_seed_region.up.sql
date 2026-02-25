-- Seed regions (idempotent)
INSERT INTO region (name)
VALUES
  ('ap-south-1'),
  ('us-east-1'),
  ('eu-west-1')
ON CONFLICT (name) DO NOTHING;