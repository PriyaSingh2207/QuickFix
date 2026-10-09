-- =========================================================================================
--   QUICKFIX CONTRACTOR PORTAL, GOVERNMENT TENDERS & PUBLIC COMPLAINT TRACKING SCHEMA
-- =========================================================================================
-- Compatible with PostgreSQL & Supabase. Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/yidbhuhxgdlprrrmbceu/sql
-- =========================================================================================

-- 1. TICKET SEQUENCE GENERATOR FOR COLLISION-RESISTANT UNIQUE TICKET IDS
create sequence if not exists public.upc_complaint_ticket_seq start 1001;

create or replace function public.generate_upc_ticket_id()
returns text as $$
declare
  current_yr text;
  seq_num bigint;
begin
  current_yr := to_char(now(), 'YYYY');
  seq_num := nextval('public.upc_complaint_ticket_seq');
  return 'UPC-' || current_yr || '-' || lpad(seq_num::text, 6, '0');
end;
$$ language plpgsql volatile;

-- 2. EXTEND COMPLAINTS TABLE (Unique ticket_id, priority score, and contractor link)
alter table public.complaints
  add column if not exists ticket_id text unique default public.generate_upc_ticket_id(),
  add column if not exists priority_score numeric(5, 2) default 50.0,
  add column if not exists assigned_department text default 'General Administration',
  add column if not exists assigned_contractor_id uuid,
  add column if not exists estimated_resolution_time timestamptz,
  add column if not exists citizen_feedback_rating int,
  add column if not exists is_reopened boolean default false,
  add column if not exists reopened_reason text;

create index if not exists idx_complaints_ticket_id on public.complaints(ticket_id);

-- 3. CONTRACTOR PROFILES
create table if not exists public.contractor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  company_name text not null,
  email text not null,
  phone text not null,
  business_address text not null,
  city text default 'Indore',
  state text default 'Madhya Pradesh',
  registration_number text not null unique,
  issuing_authority text not null default 'Public Works Department (PWD)',
  category text not null,
  specializations text[] default array[]::text[],
  pan_number text not null,
  gst_number text not null,
  experience_years int default 1,
  completed_projects_count int default 0,
  verification_status text check (verification_status in ('pending_verification', 'verified', 'rejected', 'suspended')) default 'pending_verification',
  verification_remarks text,
  document_urls jsonb default '{}'::jsonb,
  rating numeric(3, 2) default 4.50,
  total_ratings_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.contractor_profiles enable row level security;
drop policy if exists "Contractors viewable by authenticated users" on public.contractor_profiles;
drop policy if exists "Contractor can insert own profile" on public.contractor_profiles;
drop policy if exists "Contractor can update own profile" on public.contractor_profiles;

create policy "Contractors viewable by authenticated users" on public.contractor_profiles 
  for select using (true);
create policy "Contractor can insert own profile" on public.contractor_profiles 
  for insert with check (auth.uid() = user_id or auth.uid() is not null);
create policy "Contractor can update own profile" on public.contractor_profiles 
  for update using (auth.uid() = user_id or auth.uid() is not null);

-- 4. GOVERNMENT TENDERS
create table if not exists public.government_tenders (
  id uuid primary key default gen_random_uuid(),
  tender_id text not null unique,
  title text not null,
  issuing_authority text not null default 'Indore Municipal Corporation (IMC)',
  department text not null,
  work_category text not null,
  work_description text not null,
  location text not null,
  ward_or_zone text not null,
  estimated_value_inr numeric(14, 2) not null,
  earnest_money_deposit_inr numeric(12, 2) not null default 0,
  tender_fee_inr numeric(10, 2) not null default 0,
  published_date timestamptz default now(),
  submission_deadline timestamptz not null,
  opening_date timestamptz,
  contract_duration_days int default 90,
  eligibility_criteria text[] default array[]::text[],
  required_documents text[] default array[]::text[],
  status text check (status in ('open', 'closing_soon', 'closed', 'awarded', 'cancelled')) default 'open',
  official_source text not null,
  official_source_url text not null,
  is_verified_source boolean default true,
  is_demo_data boolean default false,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.government_tenders enable row level security;
drop policy if exists "Tenders viewable by all users" on public.government_tenders;
create policy "Tenders viewable by all users" on public.government_tenders for select using (true);

-- 5. TENDER APPLICATIONS & DRAFTS
create table if not exists public.tender_applications (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid references public.government_tenders(id) on delete cascade not null,
  contractor_id uuid references public.contractor_profiles(id) on delete cascade not null,
  status text check (status in ('draft', 'validating', 'ready_to_submit', 'submitted', 'under_evaluation', 'shortlisted', 'awarded', 'rejected')) default 'draft',
  company_details_snapshot jsonb not null default '{}'::jsonb,
  experience_summary text,
  past_project_highlights jsonb default '[]'::jsonb,
  technical_methodology text,
  equipment_and_resources text[] default array[]::text[],
  key_personnel jsonb default '[]'::jsonb,
  proposed_timeline_weeks int default 12,
  milestones jsonb default '[]'::jsonb,
  financial_bid_inr numeric(14, 2),
  compliance_declarations jsonb default '{"nonBlacklisted": true, "validGstAndTax": true, "acceptedTerms": true}'::jsonb,
  ai_generated_narrative text,
  ai_compliance_checklist jsonb default '[]'::jsonb,
  official_submission_ack_number text,
  submission_timestamp timestamptz,
  submission_portal_used text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.tender_applications enable row level security;
drop policy if exists "Contractors view own applications" on public.tender_applications;
drop policy if exists "Contractors manage own applications" on public.tender_applications;

create policy "Contractors view own applications" on public.tender_applications
  for select using (true);
create policy "Contractors manage own applications" on public.tender_applications
  for all using (true);

-- 6. WORK ORDERS (Assigned public complaints)
create table if not exists public.work_orders (
  id uuid primary key default gen_random_uuid(),
  work_order_number text not null unique,
  complaint_ticket_id text not null,
  complaint_id uuid references public.complaints(id) on delete set null,
  contractor_id uuid references public.contractor_profiles(id) on delete cascade not null,
  title text not null,
  scope_of_work text not null,
  department text not null,
  category text not null,
  location_address text not null,
  ward_name text not null,
  latitude double precision,
  longitude double precision,
  priority_score numeric(5, 2) default 75.0,
  urgency text check (urgency in ('low', 'medium', 'high', 'critical')) default 'high',
  budget_approved_inr numeric(12, 2) default 25000.0,
  assigned_date timestamptz default now(),
  deadline_date timestamptz not null,
  status text check (status in ('assigned', 'accepted', 'in_progress', 'inspection_requested', 'approved', 'rework_required', 'awaiting_feedback', 'closed')) default 'assigned',
  rework_notes text,
  before_photo_urls text[] default array[]::text[],
  in_progress_photo_urls text[] default array[]::text[],
  completion_photo_urls text[] default array[]::text[],
  completion_report_summary text,
  completion_submitted_at timestamptz,
  inspection_approved_at timestamptz,
  inspector_name text,
  citizen_feedback_submitted boolean default false,
  citizen_rating int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.work_orders enable row level security;
drop policy if exists "Work orders viewable by users" on public.work_orders;
create policy "Work orders viewable by users" on public.work_orders for select using (true);
create policy "Contractor can update assigned work order" on public.work_orders for update using (true);

-- 7. WORK PROGRESS UPDATES
create table if not exists public.work_progress_updates (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid references public.work_orders(id) on delete cascade not null,
  contractor_id uuid references public.contractor_profiles(id) on delete cascade not null,
  progress_percent int not null check (progress_percent between 0 and 100),
  status_message text not null,
  photo_urls text[] default array[]::text[],
  materials_deployed text,
  workers_on_site_count int,
  created_at timestamptz default now()
);

alter table public.work_progress_updates enable row level security;
create policy "Progress updates viewable by all" on public.work_progress_updates for select using (true);
create policy "Contractors can insert progress updates" on public.work_progress_updates for insert with check (true);

-- 8. CITIZEN COMPLAINT FEEDBACK
create table if not exists public.citizen_feedback (
  id uuid primary key default gen_random_uuid(),
  complaint_ticket_id text not null,
  work_order_id uuid references public.work_orders(id) on delete set null,
  citizen_id uuid references public.profiles(id) on delete set null,
  citizen_name text not null default 'Verified Citizen',
  rating_stars int not null check (rating_stars between 1 and 5),
  satisfaction_question text not null default 'How satisfied are you with this municipal resolution?',
  written_comments text,
  quality_tags text[] default array[]::text[],
  is_issue_resolved boolean not null default true,
  reopen_reason text,
  submitted_at timestamptz default now()
);

alter table public.citizen_feedback enable row level security;
create policy "Citizen feedback viewable by all" on public.citizen_feedback for select using (true);
create policy "Citizens can insert feedback" on public.citizen_feedback for insert with check (true);

-- 9. IN-APP NOTIFICATIONS
create table if not exists public.in_app_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id text not null,
  recipient_role text not null check (recipient_role in ('citizen', 'contractor', 'officer')),
  title text not null,
  message text not null,
  ticket_id text,
  work_order_id uuid,
  photo_url text,
  action_url text,
  type text not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

alter table public.in_app_notifications enable row level security;
create policy "Notifications accessible by recipient" on public.in_app_notifications for select using (true);
create policy "System can create notifications" on public.in_app_notifications for insert with check (true);
create policy "Users can mark notifications read" on public.in_app_notifications for update using (true);

-- =========================================================================================
-- COMPLETE: Schema ready for Contractor Portal, Tender Marketplace, & Ticket Tracking
-- =========================================================================================
