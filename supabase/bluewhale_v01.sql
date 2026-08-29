-- Blue Whale Sourcing OS V0.1
-- Run this in the Supabase SQL editor connected to the same project used by the website.

create extension if not exists pgcrypto;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text,
  country text,
  category text,
  target_budget numeric,
  currency text not null default 'USD',
  status text not null default 'active'
    check (status in ('active', 'waiting', 'won', 'lost', 'closed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  country text,
  categories text[] not null default '{}',
  contact_name text,
  email text,
  phone text,
  rating numeric check (rating is null or (rating >= 0 and rating <= 5)),
  risk_level text not null default 'unknown'
    check (risk_level in ('unknown', 'low', 'medium', 'high')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rfqs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  specification text,
  quantity text,
  target_price numeric,
  currency text not null default 'USD',
  status text not null default 'draft'
    check (status in ('draft', 'sent', 'waiting', 'quoted', 'closed', 'won', 'lost')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_status_idx
  on public.projects(status);

create index if not exists suppliers_risk_level_idx
  on public.suppliers(risk_level);

create index if not exists rfqs_project_id_idx
  on public.rfqs(project_id);

create index if not exists rfqs_status_idx
  on public.rfqs(status);

alter table public.projects enable row level security;
alter table public.suppliers enable row level security;
alter table public.rfqs enable row level security;

-- Intentionally no anon/authenticated policies in V0.1.
-- The internal Next.js API uses SUPABASE_SERVICE_ROLE_KEY server-side.
-- Never expose SUPABASE_SERVICE_ROLE_KEY through NEXT_PUBLIC_* variables.
