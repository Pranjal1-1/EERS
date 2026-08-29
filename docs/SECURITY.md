# EERS Security Baseline

- Passwords must be securely hashed; plaintext passwords are prohibited.
- Secrets and API keys must remain in environment variables or secret storage.
- Authorization must be enforced server-side for every protected operation.
- Validate and sanitize all external input.
- Protect against common web vulnerabilities including injection, XSS, CSRF where applicable, insecure direct object references, and unsafe file uploads.
- Apply rate limiting to authentication and sensitive endpoints.
- Store only the minimum employee/client information needed for the product.
- Protect confidential employee performance information by role and ownership rules.
- Maintain an audit trail for sensitive administrative changes.
- AI requests must use only the minimum verified data required for analysis.
- AI failures must never block deterministic performance calculations.
- Production error responses must not expose stack traces, secrets, or internal implementation details.
