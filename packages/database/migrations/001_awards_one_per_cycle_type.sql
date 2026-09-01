-- EOM/EOY defense-in-depth constraint.
-- Before applying in production, resolve any existing duplicate rows returned by:
-- SELECT cycle_id, award_type, COUNT(*) FROM awards GROUP BY cycle_id, award_type HAVING COUNT(*) > 1;
CREATE UNIQUE INDEX IF NOT EXISTS uq_awards_cycle_award_type
  ON awards(cycle_id, award_type);
