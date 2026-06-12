-- USInf / AI Growth OS
-- Initial Supabase schema for production persistence
-- Run in Supabase SQL Editor (single run).

begin;

create extension if not exists pgcrypto;

-- 1) App settings (singleton)
create table if not exists public.app_settings (
  id boolean primary key default true check (id = true),
  anti_loss jsonb not null default '{}'::jsonb,
  api_keys jsonb not null default '{}'::jsonb,
  features jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, anti_loss, api_keys, features)
values (
  true,
  jsonb_build_object(
    'maxRequestCostUsd', 0.12,
    'dailyGlobalAiBudgetUsd', 20,
    'freeDailyGenerations', 5,
    'proDailyGenerations', 60,
    'premiumPlusDailyGenerations', 180,
    'softStopPercent', 80
  ),
  '{}'::jsonb,
  jsonb_build_object(
    'oneClickPublishEnabled', true,
    'aiContentBrainEnabled', true
  )
)
on conflict (id) do nothing;

-- 2) Usage state (daily counters + top-up remaining)
create table if not exists public.usage_daily (
  day_key date primary key,
  global_spent_usd numeric(12,4) not null default 0,
  free_count integer not null default 0,
  pro_count integer not null default 0,
  premium_plus_count integer not null default 0,
  top_up_generations_remaining integer not null default 0,
  updated_at timestamptz not null default now()
);

-- 3) Top-up purchases history
create table if not exists public.top_up_purchases (
  id text primary key,
  pack_id text not null check (pack_id in ('boost_25', 'boost_75', 'boost_200')),
  generations integer not null check (generations > 0),
  amount_usd numeric(12,2) not null check (amount_usd >= 0),
  purchased_at timestamptz not null default now()
);

create index if not exists idx_top_up_purchases_purchased_at on public.top_up_purchases (purchased_at desc);

-- 4) Idempotent Stripe fulfillment tracking
create table if not exists public.stripe_fulfilled_sessions (
  session_id text primary key,
  pack_id text check (pack_id in ('boost_25', 'boost_75', 'boost_200')),
  amount_usd numeric(12,2),
  fulfilled_at timestamptz not null default now()
);

-- 5) Subscription entitlements
create table if not exists public.subscription_entitlements (
  email text primary key,
  plan_key text not null check (plan_key in ('free', 'pro', 'premium_plus')),
  status text not null check (status in ('active', 'past_due', 'canceled', 'incomplete', 'trialing', 'unpaid')),
  stripe_customer_id text,
  stripe_subscription_id text,
  updated_at timestamptz not null default now()
);

create index if not exists idx_subscription_entitlements_status on public.subscription_entitlements (status);

-- 6) Publish queue
create table if not exists public.publish_jobs (
  id text primary key,
  idempotency_key text not null unique,
  topic text not null,
  plan text not null,
  mode text not null check (mode in ('hybrid', 'safe_demo')),
  payload jsonb not null,
  platforms jsonb not null,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_publish_jobs_created_at on public.publish_jobs (created_at desc);

create table if not exists public.publish_dead_letters (
  id text primary key,
  job_id text not null references public.publish_jobs (id) on delete cascade,
  platform text not null check (platform in ('tiktok', 'youtube', 'instagram', 'facebook', 'x')),
  reason text not null,
  attempts integer not null default 1,
  failed_at timestamptz not null default now()
);

create index if not exists idx_publish_dead_letters_failed_at on public.publish_dead_letters (failed_at desc);

-- 7) Content Brain analytics events
create table if not exists public.content_brain_events (
  id text primary key,
  topic text not null,
  platform text not null check (platform in ('tiktok', 'youtube', 'instagram', 'facebook', 'x')),
  publish_hour smallint not null check (publish_hour between 0 and 23),
  views integer not null default 0,
  likes integer not null default 0,
  comments integer not null default 0,
  shares integer not null default 0,
  retention_rate numeric(5,4) not null default 0,
  conversions integer not null default 0,
  revenue_usd numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_content_brain_events_topic on public.content_brain_events (topic);
create index if not exists idx_content_brain_events_platform on public.content_brain_events (platform);
create index if not exists idx_content_brain_events_created_at on public.content_brain_events (created_at desc);

-- 8) Security audit log
create table if not exists public.security_audit_log (
  id bigint generated always as identity primary key,
  ts timestamptz not null default now(),
  action text not null,
  outcome text not null check (outcome in ('allow', 'deny', 'error')),
  ip text not null,
  user_agent text not null,
  admin_email text,
  admin_role text,
  details jsonb
);

create index if not exists idx_security_audit_log_ts on public.security_audit_log (ts desc);
create index if not exists idx_security_audit_log_action on public.security_audit_log (action);

-- 9) RLS (service-role writes, no public writes)
alter table public.app_settings enable row level security;
alter table public.usage_daily enable row level security;
alter table public.top_up_purchases enable row level security;
alter table public.stripe_fulfilled_sessions enable row level security;
alter table public.subscription_entitlements enable row level security;
alter table public.publish_jobs enable row level security;
alter table public.publish_dead_letters enable row level security;
alter table public.content_brain_events enable row level security;
alter table public.security_audit_log enable row level security;

drop policy if exists service_role_all_app_settings on public.app_settings;
create policy service_role_all_app_settings on public.app_settings
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists service_role_all_usage_daily on public.usage_daily;
create policy service_role_all_usage_daily on public.usage_daily
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists service_role_all_top_up_purchases on public.top_up_purchases;
create policy service_role_all_top_up_purchases on public.top_up_purchases
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists service_role_all_stripe_fulfilled_sessions on public.stripe_fulfilled_sessions;
create policy service_role_all_stripe_fulfilled_sessions on public.stripe_fulfilled_sessions
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists service_role_all_subscription_entitlements on public.subscription_entitlements;
create policy service_role_all_subscription_entitlements on public.subscription_entitlements
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists service_role_all_publish_jobs on public.publish_jobs;
create policy service_role_all_publish_jobs on public.publish_jobs
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists service_role_all_publish_dead_letters on public.publish_dead_letters;
create policy service_role_all_publish_dead_letters on public.publish_dead_letters
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists service_role_all_content_brain_events on public.content_brain_events;
create policy service_role_all_content_brain_events on public.content_brain_events
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists service_role_all_security_audit_log on public.security_audit_log;
create policy service_role_all_security_audit_log on public.security_audit_log
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

commit;
