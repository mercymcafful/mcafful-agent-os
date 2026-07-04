-- ============================================================
-- McAfful Agent OS — listings (posted from the cockpit, shown publicly)
-- Run in the Supabase SQL editor.
-- ============================================================

create table listings (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid not null,
  title       text not null,
  suburb      text,
  address     text,
  price       numeric,
  beds        int,
  baths       int,
  garages     int,
  status      text not null default 'active', -- active | under_offer | sold | draft
  description text,
  views       int default 0,
  enquiries   int default 0,
  listed_at   timestamptz default now()
);

alter table listings enable row level security;

-- Agent manages their own listings (insert/select/update/delete).
create policy "listings_agent_all" on listings
  for all
  using (agent_id = auth.uid())
  with check (agent_id = auth.uid());

-- Public (including signed-out visitors) can read active listings only.
-- This is the one table that's deliberately half-public.
create policy "listings_public_read_active" on listings
  for select
  using (status = 'active');
