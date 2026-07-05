-- ============================================================
-- McAfful Agent OS — AI qualification fields on leads
-- Run in the Supabase SQL editor.
-- ============================================================

alter table leads
  add column if not exists lead_type text default 'unknown',
  add column if not exists summary text;
