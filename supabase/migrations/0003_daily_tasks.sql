-- ============================================================
-- McAfful Agent OS — daily task ticks for the Success Plan
-- Run in the Supabase SQL editor.
-- ============================================================

create table daily_tasks (
  id         uuid primary key default gen_random_uuid(),
  agent_id   uuid not null,
  task_date  date not null default current_date,
  task_key   text not null,
  done       boolean not null default false,
  done_at    timestamptz,
  unique (agent_id, task_date, task_key)
);

alter table daily_tasks enable row level security;

create policy "daily_tasks_agent_all" on daily_tasks
  for all
  using (agent_id = auth.uid())
  with check (agent_id = auth.uid());
