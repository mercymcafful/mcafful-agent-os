-- ============================================================
-- McAfful Agent OS — CMA generator (comps entered manually for now)
-- Run in the Supabase SQL editor.
-- ============================================================

create table cmas (
  id         uuid primary key default gen_random_uuid(),
  agent_id   uuid not null,
  lead_id    uuid references leads(id) on delete set null,
  subject    jsonb not null, -- {address, suburb, beds, baths, garages, erf_size, condition, notes}
  comps      jsonb not null, -- array of {address, suburb, sold_price, beds, baths, sold_date, notes}
  result     jsonb,          -- {low, recommended, high, rationale, marketing_note}
  created_at timestamptz default now()
);

alter table cmas enable row level security;

create policy "cmas_agent_all" on cmas
  for all
  using (agent_id = auth.uid())
  with check (agent_id = auth.uid());
