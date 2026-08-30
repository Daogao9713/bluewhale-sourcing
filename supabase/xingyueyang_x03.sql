-- Xingyueyang Enterprise Edition X0.3
-- Run after the Blue Whale V0.25 schema on a NEW customer Supabase project.
create extension if not exists pgcrypto;

create table if not exists xy_products (
 id uuid primary key default gen_random_uuid(), model text not null unique, name text not null,
 category text, description text, specifications jsonb not null default '{}'::jsonb,
 status text not null default 'active', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists xy_customers (
 id uuid primary key default gen_random_uuid(), company_name text not null, contact_name text,
 phone text, email text, industry text, region text, notes text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists xy_sales_orders (
 id uuid primary key default gen_random_uuid(), order_no text not null unique, customer_id uuid references xy_customers(id) on delete set null,
 status text not null default 'draft', currency text not null default 'CNY', total numeric(18,2) not null default 0,
 promised_date date, content jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists xy_production_orders (
 id uuid primary key default gen_random_uuid(), production_no text not null unique, sales_order_id uuid references xy_sales_orders(id) on delete set null,
 product_id uuid references xy_products(id) on delete set null, quantity numeric(18,3), unit text,
 status text not null default 'planned', planned_start date, planned_finish date, mes_external_id text,
 progress numeric(5,2) not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists xy_quality_records (
 id uuid primary key default gen_random_uuid(), production_order_id uuid references xy_production_orders(id) on delete cascade,
 inspection_type text, result text, metrics jsonb not null default '{}'::jsonb, inspector text, inspected_at timestamptz default now(), created_at timestamptz not null default now()
);
create table if not exists xy_inventory (
 id uuid primary key default gen_random_uuid(), product_id uuid references xy_products(id) on delete cascade,
 location text, quantity numeric(18,3) not null default 0, unit text, safety_stock numeric(18,3) not null default 0, updated_at timestamptz not null default now(),
 unique(product_id,location)
);

alter table xy_products enable row level security;
alter table xy_customers enable row level security;
alter table xy_sales_orders enable row level security;
alter table xy_production_orders enable row level security;
alter table xy_quality_records enable row level security;
alter table xy_inventory enable row level security;

insert into xy_products(model,name,category,description) values
 ('NC-300','入炉煤煤质在线监测系统','煤质在线监测','面向工业现场的入炉煤煤质在线监测产品。'),
 ('NC-500','风粉在线监测系统','工业在线监测','面向工业现场的风粉在线监测产品。'),
 ('NC-700','润滑油在线监测系统','油液在线监测','面向工业现场的润滑油在线监测产品。')
on conflict(model) do update set name=excluded.name, category=excluded.category, description=excluded.description;
