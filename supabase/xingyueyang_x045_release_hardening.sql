-- ============================================================
-- X0.45 Release Hardening
-- P0-B: Database-backed atomic rate limiting
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Rate-limit bucket storage
-- ------------------------------------------------------------

create table if not exists public.xy_rate_limits (
  bucket text primary key,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0,
  updated_at timestamptz not null default now(),

  constraint xy_rate_limits_request_count_nonnegative
    check (request_count >= 0)
);

comment on table public.xy_rate_limits is
  'Server-side rate-limit buckets for X0.45 public/API protection.';

-- ------------------------------------------------------------
-- 2. Protect the table
--
-- The browser must never directly read or modify rate limits.
-- Server APIs use the Supabase service role.
-- ------------------------------------------------------------

alter table public.xy_rate_limits
  enable row level security;

revoke all
  on table public.xy_rate_limits
  from public;

revoke all
  on table public.xy_rate_limits
  from anon;

revoke all
  on table public.xy_rate_limits
  from authenticated;

-- ------------------------------------------------------------
-- 3. Atomic rate-limit RPC
--
-- Each call:
--   - creates a bucket when missing
--   - resets it when the window has expired
--   - otherwise increments it atomically
--   - returns whether the request is allowed
--
-- request_count may exceed p_limit. This is intentional:
-- repeated blocked attempts continue to be observable.
-- ------------------------------------------------------------

create or replace function public.xy_check_rate_limit(
  p_bucket text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := clock_timestamp();
  v_window_started_at timestamptz;
  v_request_count integer;
begin
  -- ----------------------------------------------------------
  -- Defensive input validation
  -- ----------------------------------------------------------

  if p_bucket is null
     or length(trim(p_bucket)) = 0
     or length(p_bucket) > 256 then
    raise exception 'Invalid rate-limit bucket';
  end if;

  if p_limit is null
     or p_limit < 1
     or p_limit > 100000 then
    raise exception 'Invalid rate-limit limit';
  end if;

  if p_window_seconds is null
     or p_window_seconds < 1
     or p_window_seconds > 2592000 then
    raise exception 'Invalid rate-limit window';
  end if;

  -- ----------------------------------------------------------
  -- Atomic UPSERT
  --
  -- PostgreSQL performs the conflicting-row update while
  -- holding the required row lock. Concurrent requests to the
  -- same bucket therefore cannot perform a simple lost update.
  -- ----------------------------------------------------------

  insert into public.xy_rate_limits as rl (
    bucket,
    window_started_at,
    request_count,
    updated_at
  )
  values (
    trim(p_bucket),
    v_now,
    1,
    v_now
  )
  on conflict (bucket)
  do update
  set
    window_started_at =
      case
        when
          rl.window_started_at
          + make_interval(secs => p_window_seconds)
          <= v_now
        then v_now
        else rl.window_started_at
      end,

    request_count =
      case
        when
          rl.window_started_at
          + make_interval(secs => p_window_seconds)
          <= v_now
        then 1
        else rl.request_count + 1
      end,

    updated_at = v_now

  returning
    xy_rate_limits.window_started_at,
    xy_rate_limits.request_count
  into
    v_window_started_at,
    v_request_count;

  -- ----------------------------------------------------------
  -- Result
  -- ----------------------------------------------------------

  allowed := v_request_count <= p_limit;

  remaining :=
    greatest(
      p_limit - v_request_count,
      0
    );

  reset_at :=
    v_window_started_at
    + make_interval(
        secs => p_window_seconds
      );

  return next;
end;
$$;

comment on function public.xy_check_rate_limit(
  text,
  integer,
  integer
) is
  'Atomic server-side fixed-window rate limiter for X0.45.';

-- ------------------------------------------------------------
-- 4. RPC permissions
--
-- SECURITY DEFINER is intentional, but execution is restricted
-- to service_role. Public browser roles cannot invoke it.
-- ------------------------------------------------------------

revoke all
  on function public.xy_check_rate_limit(
    text,
    integer,
    integer
  )
  from public;

revoke all
  on function public.xy_check_rate_limit(
    text,
    integer,
    integer
  )
  from anon;

revoke all
  on function public.xy_check_rate_limit(
    text,
    integer,
    integer
  )
  from authenticated;

grant execute
  on function public.xy_check_rate_limit(
    text,
    integer,
    integer
  )
  to service_role;

commit;