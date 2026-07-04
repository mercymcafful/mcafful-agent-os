-- ============================================================
-- McAfful Agent OS — lead capture
-- Run in the Supabase SQL editor.
-- ============================================================

create extension if not exists pgcrypto;

create table leads (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid not null,
  name        text,
  contact     text,
  suburb      text,
  timeline    text,
  source      text not null default 'website_valuation',
  temperature text not null default 'hot',
  status      text not null default 'new',
  created_at  timestamptz default now()
);

alter table leads enable row level security;

-- No public policy: inserts happen server-side with the service role key,
-- which bypasses RLS. Nothing else can read or write this table yet.
