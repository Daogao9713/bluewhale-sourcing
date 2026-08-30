create table if not exists xy_cases (
 id uuid primary key default gen_random_uuid(), slug text not null unique, title text not null,
 industry text, summary text, content text, image_url text, location text, related_product text,
 featured boolean not null default false, sort_order integer not null default 0,
 status text not null default 'draft' check(status in ('draft','published','archived')),
 published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table xy_cases enable row level security;
create index if not exists idx_xy_cases_public on xy_cases(status,featured,sort_order,published_at desc);
