# EERS database

PostgreSQL is the production persistence target.

## Local setup

1. Create a PostgreSQL 15+ database.
2. Set `DATABASE_URL` in the application environment.
3. Run `schema.sql`, followed by `seed.sql` (or the initial migration).
4. Never commit `DATABASE_URL`, credentials, or production exports.

The schema is designed so employee performance history, award decisions, bonuses, certificates, AI insights, and audit records remain traceable.