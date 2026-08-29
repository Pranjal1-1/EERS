BEGIN;
CREATE TABLE IF NOT EXISTS kpi_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_assignment_id UUID NOT NULL UNIQUE REFERENCES kpi_assignments(id) ON DELETE CASCADE,
  achieved NUMERIC(14,2) NOT NULL CHECK (achieved >= 0),
  score NUMERIC(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_kpi_results_assignment ON kpi_results(kpi_assignment_id);
COMMIT;
