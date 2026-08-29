INSERT INTO departments (name) VALUES
  ('Sales & Presales'),
  ('Installation / Engineering & Service'),
  ('Payment Follow-up')
ON CONFLICT (name) DO NOTHING;

-- Development/demo data intentionally excludes real employee identities.
-- Application-level seeding will create password hashes and user accounts.
