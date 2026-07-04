-- ============================================================
-- McAfful Agent OS — deal pipeline (kanban) + suspensive conditions
-- Run in the Supabase SQL editor.
--
-- NOTE: named "pipeline_deals" instead of "deals" because a "deals" table
-- already exists in this project from the original (abandoned) CRM build,
-- with an incompatible schema (user_id, enum stage, generated commission
-- column) and dependent tables (mandates, otps, activities, tasks) still
-- pointing at it. Renaming avoids colliding with that leftover data.
-- ============================================================

create table pipeline_deals (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid not null,
  listing_id  uuid references listings(id) on delete set null,
  stage       text not null default 'new_lead',
    -- new_lead | valuation | mandate | live | otp | transfer | registered | lost
  otp_amount  numeric,
  commission  numeric,
  created_at  timestamptz default now()
);

create table deal_conditions (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references pipeline_deals(id) on delete cascade,
  description text not null,
  due_date    date,
  met         boolean not null default false
);

alter table pipeline_deals enable row level security;
alter table deal_conditions enable row level security;

create policy "pipeline_deals_agent_all" on pipeline_deals
  for all
  using (agent_id = auth.uid())
  with check (agent_id = auth.uid());

create policy "deal_conditions_agent_all" on deal_conditions
  for all
  using (
    exists (
      select 1 from pipeline_deals
      where pipeline_deals.id = deal_conditions.deal_id
        and pipeline_deals.agent_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from pipeline_deals
      where pipeline_deals.id = deal_conditions.deal_id
        and pipeline_deals.agent_id = auth.uid()
    )
  );
