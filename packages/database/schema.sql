CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('EMPLOYEE','MANAGER','HR','MD','CEO','ADMIN');
CREATE TYPE employee_status AS ENUM ('ACTIVE','INACTIVE');
CREATE TYPE attendance_status AS ENUM ('PRESENT','ABSENT','HALF_DAY','LEAVE','WORK_FROM_HOME','OFFICIAL_WORK','HOLIDAY');
CREATE TYPE project_status AS ENUM ('PLANNED','ACTIVE','COMPLETED','DELAYED','CANCELLED');
CREATE TYPE cycle_status AS ENUM ('OPEN','DATA_COLLECTION','REVIEW','CALCULATED','AI_ANALYSIS','PENDING_APPROVAL','FINALIZED');
CREATE TYPE bonus_status AS ENUM ('PENDING','APPROVED','PROCESSED','PAID');

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'EMPLOYEE',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES users(id),
  employee_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  designation TEXT,
  department_id UUID REFERENCES departments(id),
  manager_id UUID REFERENCES employees(id),
  joining_date DATE,
  profile_photo_url TEXT,
  status employee_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  attendance_date DATE NOT NULL,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  status attendance_status NOT NULL,
  correction_reason TEXT,
  corrected_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(employee_id, attendance_date)
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  client_id UUID REFERENCES clients(id),
  department_id UUID REFERENCES departments(id),
  start_date DATE,
  expected_completion_date DATE,
  actual_completion_date DATE,
  status project_status NOT NULL DEFAULT 'PLANNED',
  performance_score NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE project_members (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  PRIMARY KEY(project_id, employee_id)
);

CREATE TABLE client_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  project_id UUID REFERENCES projects(id),
  employee_id UUID REFERENCES employees(id),
  rating_technical SMALLINT CHECK (rating_technical BETWEEN 1 AND 5),
  rating_professionalism SMALLINT CHECK (rating_professionalism BETWEEN 1 AND 5),
  rating_communication SMALLINT CHECK (rating_communication BETWEEN 1 AND 5),
  rating_responsiveness SMALLINT CHECK (rating_responsiveness BETWEEN 1 AND 5),
  rating_quality SMALLINT CHECK (rating_quality BETWEEN 1 AND 5),
  rating_problem_solving SMALLINT CHECK (rating_problem_solving BETWEEN 1 AND 5),
  rating_overall SMALLINT CHECK (rating_overall BETWEEN 1 AND 5),
  comment TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  department_id UUID REFERENCES departments(id),
  designation TEXT,
  target_value NUMERIC(12,2),
  measurement_method TEXT,
  frequency TEXT NOT NULL DEFAULT 'MONTHLY',
  weight NUMERIC(5,2) NOT NULL CHECK (weight >= 0),
  cap NUMERIC(6,2) NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE performance_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_year INTEGER NOT NULL,
  cycle_month INTEGER CHECK (cycle_month BETWEEN 1 AND 12),
  type TEXT NOT NULL CHECK (type IN ('MONTHLY','ANNUAL')),
  status cycle_status NOT NULL DEFAULT 'OPEN',
  finalized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cycle_year, cycle_month, type)
);

CREATE TABLE kpi_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES performance_cycles(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  kpi_id UUID NOT NULL REFERENCES kpis(id),
  actual_value NUMERIC(12,2),
  normalized_score NUMERIC(6,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cycle_id, employee_id, kpi_id)
);

CREATE TABLE manager_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES performance_cycles(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  quality NUMERIC(4,2), productivity NUMERIC(4,2), teamwork NUMERIC(4,2),
  initiative NUMERIC(4,2), discipline NUMERIC(4,2), problem_solving NUMERIC(4,2),
  communication NUMERIC(4,2), client_handling NUMERIC(4,2),
  strengths TEXT, achievements TEXT, improvement_areas TEXT, comments TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE recognitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  given_by UUID NOT NULL REFERENCES users(id),
  category TEXT NOT NULL,
  reason TEXT NOT NULL,
  project_id UUID REFERENCES projects(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE performance_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES performance_cycles(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  kpi_score NUMERIC(6,2), manager_score NUMERIC(6,2), project_score NUMERIC(6,2),
  client_score NUMERIC(6,2), attendance_score NUMERIC(6,2), innovation_score NUMERIC(6,2),
  recognition_score NUMERIC(6,2), overall_score NUMERIC(6,2) NOT NULL,
  rank INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(cycle_id, employee_id)
);

CREATE TABLE awards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  cycle_id UUID NOT NULL REFERENCES performance_cycles(id),
  award_type TEXT NOT NULL CHECK (award_type IN ('EMPLOYEE_OF_MONTH','EMPLOYEE_OF_YEAR')),
  score NUMERIC(6,2) NOT NULL,
  recommended_employee_id UUID REFERENCES employees(id),
  approved_by UUID REFERENCES users(id),
  override_reason TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID NOT NULL UNIQUE REFERENCES awards(id),
  certificate_id TEXT NOT NULL UNIQUE,
  file_url TEXT,
  generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  award_id UUID NOT NULL UNIQUE REFERENCES awards(id),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  status bonus_status NOT NULL DEFAULT 'PENDING',
  approved_by UUID REFERENCES users(id),
  payment_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id UUID NOT NULL REFERENCES performance_cycles(id),
  employee_id UUID REFERENCES employees(id),
  insight_type TEXT NOT NULL,
  content TEXT NOT NULL,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  previous_value JSONB,
  new_value JSONB,
  reason TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attendance_employee_date ON attendance(employee_id, attendance_date);
CREATE INDEX idx_scores_cycle_rank ON performance_scores(cycle_id, rank);
CREATE INDEX idx_feedback_employee ON client_feedback(employee_id);
CREATE INDEX idx_audit_actor_date ON audit_logs(actor_user_id, created_at);
