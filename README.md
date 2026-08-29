# EERS — Employee Excellence & Recognition System

EERS is a production-oriented web application for employee performance, recognition, awards, attendance, client feedback, and AI-assisted performance analysis.

## V1 goals

- Company-wide Employee of the Month
- Company-wide Employee of the Year
- Configurable KPIs and scoring weights
- Attendance management
- Manager/management reviews
- Client feedback
- Management recognition
- Certificates and bonuses
- AI-assisted analysis and anomaly detection
- Role-based access control
- Audit logging

## Initial company model

- Sales & Presales
- Installation / Engineering & Service
- Payment Follow-up

The application is intentionally configurable so the company can add departments, roles, KPIs, scoring rules, and approval authorities without code changes.

## Architecture

V1 is designed as a TypeScript web application with a relational database and a server-side AI integration boundary. Business-critical calculations remain deterministic and independent of AI availability.

See:

- `docs/ARCHITECTURE.md`
- `docs/SCORING.md`
- `docs/SECURITY.md`
- `docs/DEVELOPMENT.md`

## Development status

Phase 1 — foundation: in progress.
