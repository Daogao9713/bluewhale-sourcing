-- Blue Whale V0.17 CMS Platform
-- Safe to run after V0.16. RLS remains enabled.
-- All CMS writes are performed server-side using SUPABASE_SERVICE_ROLE_KEY.

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
  status text not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.company_news
  drop constraint if exists company_news_status_check;

alter table public.company_news
  add constraint company_news_status_check
  check (status in ('draft', 'published', 'archived'));

create index if not exists company_news_status_published_idx
  on public.company_news(status, published_at desc);

create index if not exists company_news_updated_idx
  on public.company_news(updated_at desc);

alter table public.company_news enable row level security;

-- V0.17 deliberately creates no INSERT/UPDATE/DELETE policy for anon/authenticated users.
-- Browser clients therefore cannot write company_news.
-- The server-side service-role client bypasses RLS.

create table if not exists public.company_news_revisions (
  id uuid primary key default gen_random_uuid(),
  news_id uuid,
  snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists company_news_revisions_news_idx
  on public.company_news_revisions(news_id, created_at desc);

alter table public.company_news_revisions enable row level security;

-- Remove accidental permissive write policies if an earlier manual test created them.
-- Adjust names here only if you created custom policies with different names.
drop policy if exists "company_news_insert" on public.company_news;
drop policy if exists "company_news_update" on public.company_news;
drop policy if exists "company_news_delete" on public.company_news;
drop policy if exists "Allow public insert" on public.company_news;
drop policy if exists "Allow public update" on public.company_news;
drop policy if exists "Allow public delete" on public.company_news;
