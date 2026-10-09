-- ==============================================================================
-- Quickfix: Urban Intelligence Engine - Comprehensive Municipal Database Schema
-- Compatible with PostgreSQL 15+ and Supabase with PostGIS / pgvector support
-- ==============================================================================

-- Enable PostGIS & UUID extensions if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. WARDS: Municipal administrative jurisdictions
CREATE TABLE IF NOT EXISTS public.wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_code VARCHAR(20) UNIQUE NOT NULL,
  ward_name VARCHAR(100) NOT NULL,
  zone_name VARCHAR(100),
  population INTEGER DEFAULT 50000,
  area_sq_km NUMERIC(6, 2) DEFAULT 4.5,
  boundary_geom geometry(Polygon, 4326),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. DEPARTMENTS: Municipal service divisions
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(30) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  sla_hours INTEGER DEFAULT 24,
  head_officer_name VARCHAR(100),
  contact_email VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES EXTENSION: Roles (citizen, officer, supervisor, admin, field_worker)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urban_role') THEN
    CREATE TYPE urban_role AS ENUM ('citizen', 'officer', 'supervisor', 'admin', 'field_worker');
  END IF;
END$$;

-- 4. INCIDENTS: Consolidated urban problems
CREATE TABLE IF NOT EXISTS public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_number VARCHAR(30) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  ward_id UUID REFERENCES public.wards(id),
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  location_geom geometry(Point, 4326),
  address TEXT,
  status VARCHAR(30) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'assigned', 'in_progress', 'resolved', 'closed')),
  urgency VARCHAR(20) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  priority_score NUMERIC(5, 2) DEFAULT 50.0,
  factor_urgency NUMERIC(5, 2) DEFAULT 50.0,
  factor_impact NUMERIC(5, 2) DEFAULT 50.0,
  factor_safety NUMERIC(5, 2) DEFAULT 50.0,
  factor_waiting_time NUMERIC(5, 2) DEFAULT 10.0,
  factor_confidence NUMERIC(5, 2) DEFAULT 80.0,
  factor_environmental NUMERIC(5, 2) DEFAULT 40.0,
  score_explanation TEXT,
  complaint_count INTEGER DEFAULT 1,
  affected_population_estimate INTEGER DEFAULT 500,
  nearby_critical_infrastructure TEXT[],
  root_cause_hypothesis TEXT,
  weather_escalation_risk VARCHAR(20) DEFAULT 'none',
  sla_breach_risk_percent INTEGER DEFAULT 20,
  first_reported_at TIMESTAMPTZ DEFAULT NOW(),
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 5. COMPLAINTS: Raw citizen reports
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  citizen_name VARCHAR(100),
  phone VARCHAR(20),
  language VARCHAR(10) DEFAULT 'en',
  raw_text TEXT NOT NULL,
  translated_text TEXT,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  ward_id UUID REFERENCES public.wards(id),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  address TEXT,
  photo_url TEXT,
  confidence_score NUMERIC(5, 2) DEFAULT 85.0,
  missing_details TEXT[],
  follow_up_questions TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. COMPLAINT_RELATIONS: Duplicate and related complaint links
CREATE TABLE IF NOT EXISTS public.complaint_relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  target_complaint_id UUID REFERENCES public.complaints(id) ON DELETE CASCADE,
  relation_type VARCHAR(30) CHECK (relation_type IN ('exact_duplicate', 'related_cluster', 'split_off')),
  similarity_score NUMERIC(5, 2),
  distance_meters NUMERIC(10, 2),
  detected_by VARCHAR(50) DEFAULT 'AI_SEMANTIC_FUSION',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PRIORITY_EVENTS: Explainable score modification history
CREATE TABLE IF NOT EXISTS public.priority_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  previous_score NUMERIC(5, 2) NOT NULL,
  new_score NUMERIC(5, 2) NOT NULL,
  reason TEXT NOT NULL,
  author_type VARCHAR(50) NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INFRASTRUCTURE_ASSETS: Critical city assets
CREATE TABLE IF NOT EXISTS public.infrastructure_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_name VARCHAR(150) NOT NULL,
  asset_type VARCHAR(50) CHECK (asset_type IN ('hospital', 'school', 'water_pipeline', 'drainage_culvert', 'transformer', 'bridge', 'emergency_corridor')),
  ward_id UUID REFERENCES public.wards(id),
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  criticality_level VARCHAR(20) DEFAULT 'high',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TEAMS: Field municipal crews
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  contact_number VARCHAR(20),
  skills TEXT[],
  equipment TEXT[],
  current_status VARCHAR(30) DEFAULT 'available' CHECK (current_status IN ('available', 'on_site', 'dispatched', 'off_duty')),
  active_assignments INTEGER DEFAULT 0,
  base_latitude NUMERIC(10, 7),
  base_longitude NUMERIC(10, 7),
  zone VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. INCIDENT_ASSIGNMENTS: Dispatch allocations
CREATE TABLE IF NOT EXISTS public.incident_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.incidents(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id),
  assigned_by UUID REFERENCES auth.users(id),
  status VARCHAR(30) DEFAULT 'dispatched' CHECK (status IN ('dispatched', 'en_route', 'on_site', 'completed')),
  dispatched_at TIMESTAMPTZ DEFAULT NOW(),
  arrived_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  officer_notes TEXT
);

-- 11. FAIRNESS_METRICS: Ward equity metrics
CREATE TABLE IF NOT EXISTS public.fairness_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id UUID REFERENCES public.wards(id) ON DELETE CASCADE,
  evaluation_date DATE DEFAULT CURRENT_DATE,
  avg_wait_hours NUMERIC(6, 2),
  avg_resolution_hours NUMERIC(6, 2),
  complaints_per_capita NUMERIC(6, 4),
  potential_under_reporting BOOLEAN DEFAULT FALSE,
  equity_disparity_score NUMERIC(5, 2) DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AUDIT_LOGS: Governance & override trail
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  incident_id UUID REFERENCES public.incidents(id) ON DELETE SET NULL,
  performed_by UUID REFERENCES auth.users(id),
  performed_by_name VARCHAR(100),
  previous_state JSONB,
  new_state JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Incidents are viewable by all authenticated users"
  ON public.incidents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Incidents can be updated by municipal officers"
  ON public.incidents FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Complaints are viewable by authenticated users"
  ON public.complaints FOR SELECT TO authenticated USING (true);

CREATE POLICY "Complaints can be inserted by citizens"
  ON public.complaints FOR INSERT TO authenticated WITH CHECK (true);
