-- ============================================================
-- McAfful Agent OS — leads RLS: agent can read/update their own leads
-- Run in the Supabase SQL editor.
-- ============================================================

create policy "leads_select_own" on leads
  for select
  using (agent_id = auth.uid());

create policy "leads_update_own" on leads
  for update
  using (agent_id = auth.uid())
  with check (agent_id = auth.uid());

-- No insert policy: inserts still happen server-side via the service
-- role key, which bypasses RLS.
