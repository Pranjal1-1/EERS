# EERS Scoring Model

## Monthly default weights

| Component | Weight |
|---|---:|
| KPI Achievement | 30% |
| Manager Evaluation | 20% |
| Project Performance | 15% |
| Client Feedback | 15% |
| Attendance & Discipline | 10% |
| Innovation / Initiative | 5% |
| Management Recognition | 5% |
| **Total** | **100%** |

## Annual default weights

| Component | Weight |
|---|---:|
| Monthly Performance | 40% |
| Annual KPI Achievement | 20% |
| Project Contribution | 10% |
| Client Satisfaction | 10% |
| Attendance & Discipline | 5% |
| Consistency | 5% |
| Innovation | 5% |
| Management Recognition | 5% |
| **Total** | **100%** |

These are initial defaults and must be configurable by an authorized administrator.

## Rules

- All component scores are normalized to 0–100 before weighting.
- Approved leave must not be treated as an attendance failure.
- Historical finalized scores must preserve the weights and inputs used at finalization.
- AI cannot alter scores.
- Management can override the recommended winner only through the configured approval workflow and with a mandatory reason.
- A score must be reproducible from its stored inputs and scoring configuration.

## Monthly selection

The system ranks eligible employees by final monthly score. It produces one company-wide recommendation. Ties must be resolved by a deterministic, configurable tie-break policy rather than random selection.

## Annual selection

The annual calculation rewards sustained performance and must include a consistency component. It must not simply select the employee with the greatest number of monthly awards.
