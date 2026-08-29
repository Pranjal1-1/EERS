# EERS Architecture

## Principles

1. Business rules are configurable.
2. Performance scores are deterministic and reproducible.
3. AI is advisory only.
4. Final awards require authorized human approval.
5. Finalized performance cycles are immutable.
6. Confidential employee data is protected by role-based access control.
7. Every sensitive administrative change is auditable.

## Logical components

```text
Web UI
  |
Application API
  |
+----------------------+-------------------+
|                      |                   |
Domain services     Auth/RBAC        AI service boundary
|                      |                   |
+----------------------+-------------------+
|
Relational database
|
File/object storage (certificates, company assets)
```

## Core domains

- Identity and access
- Employees and organization
- Attendance
- KPIs
- Projects and client feedback
- Performance cycles
- Awards and rewards
- AI insights
- Notifications
- Audit
- Reporting

## Scoring boundary

The scoring engine must not call AI to calculate scores. It consumes verified persisted inputs and produces deterministic score components and totals. AI receives the relevant verified results only after calculation and returns advisory insights.

## Historical integrity

When a monthly or annual cycle is finalized, the exact scoring configuration and input snapshot used for the result must be retained. Later configuration changes must not mutate historical results.
