-- Blue Whale V0.25 Enterprise Platform
create extension if not exists pgcrypto;

create table if not exists business_documents (
  id uuid primary key default gen_random_uuid(),
  document_no text not null unique,
  document_type text not null check (document_type in ('quotation','contract','purchase_order','report')),
  title text not null,
  status text not null default 'draft' check (status in ('draft','issued','accepted','cancelled','archived')),
  project_id uuid null references projects(id) on delete set null,
  supplier_id uuid null references suppliers(id) on delete set null,
  inquiry_id uuid null,
  customer_name text,
  customer_email text,
  currency text not null default 'USD',
  subtotal numeric(18,2) not null default 0,
  tax numeric(18,2) not null default 0,
  total numeric(18,2) not null default 0,
  valid_until date,
  content jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists integration_connections (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  integration_type text not null check (integration_type in ('mes','erp','wms','crm','webhook','custom')),
  status text not null default 'planned' check (status in ('planned','configured','active','disabled','error')),
  base_url text,
  config jsonb not null default '{}'::jsonb,
  last_sync_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists integration_events (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid null references integration_connections(id) on delete cascade,
  direction text not null default 'outbound',
  event_type text not null,
  external_id text,
  status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor text not null default 'workspace-admin',
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_documents_type_status on business_documents(document_type,status);
create index if not exists idx_documents_project on business_documents(project_id);
create index if not exists idx_integrations_type on integration_connections(integration_type,status);
create index if not exists idx_audit_entity on audit_logs(entity_type,entity_id,created_at desc);

alter table business_documents enable row level security;
alter table integration_connections enable row level security;
alter table integration_events enable row level security;
alter table audit_logs enable row level security;

insert into integration_connections(code,name,integration_type,status,config)
values ('mes-primary','MES Connector','mes','planned','{"adapter":"http-json","version":"v1"}'::jsonb)
on conflict (code) do nothing;
