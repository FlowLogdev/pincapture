-- ─────────────────────────────────────────
-- PinCapture — Billing schema additions
-- Run this in the Supabase SQL editor for the
-- project backing pincapturetool.com.
-- Idempotent: safe to run more than once.
-- ─────────────────────────────────────────

alter table profiles add column if not exists stripe_customer_id text;
alter table profiles add column if not exists plan text default 'none';
alter table profiles add column if not exists subscription_status text default 'none';
alter table profiles add column if not exists subscription_id text;
alter table profiles add column if not exists current_period_end timestamptz;

create index if not exists profiles_stripe_customer_id_idx
  on profiles (stripe_customer_id);
