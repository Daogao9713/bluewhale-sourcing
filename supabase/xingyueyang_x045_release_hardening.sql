-- ============================================================
-- X0.45 Release Hardening
-- P0-B
-- Atomic database-backed rate limiting
--
-- Existing schema compatibility:
--   bucket      text
--   count       integer
--   expires_at  timestamptz
-- ============================================================

begin;

-- ------------------------------------------------------------
-- 1. Ensure the existing table exists
-- ------------------------------------------------------------

create table if not exists public.xy_rate_limits (
  bucket text primary key,
  count integer not null default 0,
  expires_at timestamptz not null
);

-- Defensive constraint.
-- Existing X0.45 schema is preserved.
alter table public.xy_rate_limits
  drop constraint if exists
  xy_rate_limits_count_nonnegative;

alter table public.xy_rate_limits
  add constraint
  xy_rate_limits_count_nonnegative
  check (count >= 0);

-- ------------------------------------------------------------
-- 2. Browser roles must not access rate-limit state directly
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
-- 3. Atomic fixed-window rate limiter
--
-- Existing table semantics:
--
-- bucket
--   hashed rate-limit identity
--
-- count
--   requests made during current window
--
-- expires_at
--   end of current window
--
-- ON CONFLICT performs the increment/reset atomically.
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
  v_count integer;
  v_expires_at timestamptz;
begin

  -- ----------------------------------------------------------
  -- Input validation
  -- ----------------------------------------------------------

  if p_bucket is null
     or length(trim(p_bucket)) = 0
     or length(p_bucket) > 256 then
    raise exception
      'Invalid rate-limit bucket';
  end if;

  if p_limit is null
     or p_limit < 1
     or p_limit > 100000 then
    raise exception
      'Invalid rate-limit limit';
  end if;

  if p_window_seconds is null
     or p_window_seconds < 1
     or p_window_seconds > 2592000 then
    raise exception
      'Invalid rate-limit window';
  end if;

  -- ----------------------------------------------------------
  -- Atomic UPSERT
  --
  -- New bucket:
  --   count = 1
  --   expires_at = now + window
  --
  -- Existing active bucket:
  --   count = count + 1
  --
  -- Expired bucket:
  --   count = 1
  --   expires_at = now + new window
  -- ----------------------------------------------------------

  insert into public.xy_rate_limits as rl (
    bucket,
    count,
    expires_at
  )
  values (
    trim(p_bucket),
    1,
    v_now
      + make_interval(
          secs => p_window_seconds
        )
  )

  on conflict (bucket)
  do update
  set
    count =
      case
        when rl.expires_at <= v_now
          then 1
        else rl.count + 1
      end,

    expires_at =
      case
        when rl.expires_at <= v_now
          then
            v_now
            + make_interval(
                secs => p_window_seconds
              )
        else rl.expires_at
      end

  returning
    count,
    expires_at
  into
    v_count,
    v_expires_at;

  -- ----------------------------------------------------------
  -- Result
  -- ----------------------------------------------------------

  allowed :=
    v_count <= p_limit;

  remaining :=
    greatest(
      p_limit - v_count,
      0
    );

  reset_at :=
    v_expires_at;

  return next;
end;
$$;

-- ------------------------------------------------------------
-- 4. RPC permissions
--
-- SECURITY DEFINER is intentionally used because browser
-- roles have no access to xy_rate_limits.
--
-- Only service_role may execute this function.
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