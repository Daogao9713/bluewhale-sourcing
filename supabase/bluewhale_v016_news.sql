-- Blue Whale V0.16 Company News CMS

create extension if not exists pgcrypto;

create table if not exists public.company_news (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,

  title_zh text not null,
  title_ja text not null default '',
  title_en text not null default '',

  summary_zh text,
  summary_ja text,
  summary_en text,

  content_zh text,
  content_ja text,
  content_en text,

  cover_url text,
  status text not null default 'draft'
    check (status in ('draft', 'published')),

  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_news_status_published_idx
  on public.company_news(status, published_at desc);

alter table public.company_news enable row level security;

-- No public table policies are required in V0.16.
-- Public pages read through server-side Next.js routes using the service role.
-- CMS writes are guarded by BLUEWHALE_ADMIN_KEY and performed server-side.
