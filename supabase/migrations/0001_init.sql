-- ============================================================
-- McAfful Agent OS — Phase 1 schema (embedded CRM + success engine)
-- Run in Supabase SQL editor or via `supabase db push`.
-- ============================================================

create extension if not exists pgcrypto;

-- ---------- enums ----------
do $$ begin
  create type lead_source   as enum ('website_valuation','whatsapp','google_call','google_profile','property24','private_property','referral','other');
  create type lead_type     as enum ('seller','buyer','unknown');
  create type temperature   as enum ('hot','warm','cold');
  create type lead_status   as enum ('new','contacted','appraisal_booked','mandate','nurture','lost');
  create type listing_status as enum ('draft','active','under_offer','sold');
  create type mandate_type  as enum ('sole','open');
  create type deal_stage    as enum ('new_lead','valuation','mandate','live','otp','transfer','registered','lost');
  create type task_block    as enum ('power_hour','sellers','buyers','deals','growth');
exception when duplicate_object then null; end $$;

-- ---------- agent profile (one row = Mercy; ready for a firm later) ----------
create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default 'Mercy McAfful',
  brand       text not null default 'McAfful',
  ffc_expiry  date,
  gci_goal    numeric default 460000,
  created_at  timestamptz default now()
);

-- ---------- CRM core ----------
create table contacts (
  id         uuid primary key default gen_random_uuid(),
  agent_id   uuid not null references auth.users(id) on delete cascade,
  name       text,
  phone      text,
  email      text,
  suburb     text,
  notes      text,
  created_at timestamptz default now()
);

create table leads (
  id           uuid primary key default gen_random_uuid(),
  agent_id     uuid not null references auth.users(id) on delete cascade,
  contact_id   uuid references contacts(id) on delete set null,
  name         text,
  phone        text,
  email        text,
  suburb       text,
  source       lead_source not null default 'other',
  lead_type    lead_type   not null default 'unknown',
  timeline     text,
  temperature  temperature not null default 'warm',
  status       lead_status not null default 'new',
  summary      text,
  raw          jsonb,
  created_at   timestamptz default now()
);
create index on leads (agent_id, status);
create index on leads (agent_id, created_at desc);

create table listings (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  suburb      text,
  address     text,
  price       numeric,
  beds        int, baths int, garages int,
  status      listing_status not null default 'draft',
  description text,
  media       jsonb default '[]'::jsonb,
  views       int default 0,
  enquiries   int default 0,
  listed_at   timestamptz default now()
);
create index on listings (agent_id, status);

create table mandates (
  id            uuid primary key default gen_random_uuid(),
  agent_id      uuid not null references auth.users(id) on delete cascade,
  listing_id    uuid references listings(id) on delete cascade,
  seller_id     uuid references contacts(id) on delete set null,
  type          mandate_type not null default 'sole',
  term_days     int default 90,
  mandate_price numeric,
  start_date    date default current_date,
  end_date      date,
  active        boolean default true
);

create table deals (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid not null references auth.users(id) on delete cascade,
  listing_id  uuid references listings(id) on delete set null,
  buyer_id    uuid references contacts(id) on delete set null,
  stage       deal_stage not null default 'new_lead',
  otp_amount  numeric,
  commission  numeric,
  created_at  timestamptz default now()
);

create table deal_conditions (
  id          uuid primary key default gen_random_uuid(),
  deal_id     uuid not null references deals(id) on delete cascade,
  description text not null,
  due_date    date,
  met         boolean default false
);

create table activities (
  id         uuid primary key default gen_random_uuid(),
  agent_id   uuid not null references auth.users(id) on delete cascade,
  type       text not null,            -- call | whatsapp | note | task_done | feedback_sent ...
  lead_id    uuid references leads(id) on delete set null,
  contact_id uuid references contacts(id) on delete set null,
  deal_id    uuid references deals(id) on delete set null,
  body       text,
  created_at timestamptz default now()
);

-- ---------- inbound channels (WhatsApp / Google Business Profile) ----------
create table channel_messages (
  id           uuid primary key default gen_random_uuid(),
  agent_id     uuid not null references auth.users(id) on delete cascade,
  channel      text not null default 'whatsapp',
  direction    text not null default 'in',       -- in | out
  wa_from      text,
  wa_message_id text,
  body         text,
  payload      jsonb,
  lead_id      uuid references leads(id) on delete set null,
  created_at   timestamptz default now()
);

-- ============================================================
-- SUCCESS ENGINE — step-by-step top-agent daily activities
-- ============================================================
create table success_activity_templates (
  id          uuid primary key default gen_random_uuid(),
  block       task_block not null,
  sort        int not null,
  time_label  text,
  title       text not null,
  detail      text,               -- static fallback detail
  impact      text not null,      -- North-Star metric this action moves
  action      text,               -- quick-action label (Call / Send / Draft ...)
  is_dynamic  boolean default false,
  dynamic_key text,               -- resolver key when detail is computed from live data
  active      boolean default true
);

create table daily_tasks (
  id          uuid primary key default gen_random_uuid(),
  agent_id    uuid not null references auth.users(id) on delete cascade,
  template_id uuid references success_activity_templates(id) on delete set null,
  task_date   date not null default current_date,
  block       task_block not null,
  sort        int not null,
  time_label  text,
  title       text not null,
  detail      text,
  impact      text not null,
  action      text,
  done        boolean default false,
  done_at     timestamptz,
  created_at  timestamptz default now(),
  unique (agent_id, template_id, task_date)
);
create index on daily_tasks (agent_id, task_date);

-- ---------- seed the top-agent daily playbook ----------
insert into success_activity_templates (block, sort, time_label, title, detail, impact, action, is_dynamic, dynamic_key) values
('power_hour',1,'8:00 – 9:00','Call your 3 hottest leads first','Fresh hot leads waiting — call before they call another agent.','Mandate pipeline','Call',true,'hot_leads'),
('power_hour',2,'8:00 – 9:00','5 sphere / past-client calls','Check in, ask each for one referral.','Referrals','Start',false,null),
('power_hour',3,'8:00 – 9:00','10 circle-prospecting messages','"Just listed / just sold" WhatsApp to neighbours of your active listings.','Seller leads','Send',false,null),
('power_hour',4,'8:00 – 9:00','Contact 2 private sellers / expired listings','They already want to sell — just not with the right agent yet.','Mandate pipeline','Open list',false,null),
('power_hour',5,'8:00 – 9:00','Add 5 new prospects to the CRM','Keep the top of the funnel full.','Database','Add',false,null),
('sellers',1,'9:00 – 11:00','Send feedback to all active mandates','Auto-drafted — one tap to send to every seller.','Retention','Review & send',true,'mandate_feedback'),
('sellers',2,'9:00 – 11:00','Finish the next CMA','Comps are pulled for your upcoming listing appointment.','Win the mandate','Open CMA',false,null),
('sellers',3,'9:00 – 11:00','Confirm tomorrow''s listing presentation','Send the confirmation so it doesn''t slip.','Mandate pipeline','Confirm',false,null),
('buyers',1,'11:00 – 14:00','Match new listings to your buyer database','Alert every registered buyer whose brief fits.','Faster sale','Match',true,'new_listings'),
('buyers',2,'11:00 – 14:00','Confirm today''s viewings','Reconfirm so no one no-shows.','Offers','Confirm',true,'viewings_today'),
('buyers',3,'11:00 – 14:00','Follow up everyone who viewed yesterday','Get honest feedback and gauge intent.','Offers','Follow up',false,null),
('deals',1,'14:00 – 16:00','Check suspensive-condition deadlines','Deals die on missed bond/OTP dates — chase what''s due this week.','Save the deal','Chase',true,'deadlines'),
('deals',2,'14:00 – 16:00','Chase an attorney/originator on a live transfer','Keep registration on track.','Registrations','Call',false,null),
('growth',1,'16:00 – 17:00','Post one piece of content','"Just sold / just listed" builds the McAfful brand.','Inbound','Post',false,null),
('growth',2,'16:00 – 17:00','Ask one happy client for a testimonial','Perfect right after a registration.','Brand equity','Ask',false,null);

-- ============================================================
-- ROW LEVEL SECURITY — every row scoped to its agent
-- ============================================================
alter table profiles enable row level security;
alter table contacts enable row level security;
alter table leads enable row level security;
alter table listings enable row level security;
alter table mandates enable row level security;
alter table deals enable row level security;
alter table deal_conditions enable row level security;
alter table activities enable row level security;
alter table channel_messages enable row level security;
alter table daily_tasks enable row level security;
alter table success_activity_templates enable row level security;

create policy "own profile" on profiles for all using (id = auth.uid()) with check (id = auth.uid());

-- agent-scoped tables
do $$
declare t text;
begin
  foreach t in array array['contacts','leads','listings','mandates','deals','activities','channel_messages','daily_tasks']
  loop
    execute format('create policy "agent rw" on %I for all using (agent_id = auth.uid()) with check (agent_id = auth.uid());', t);
  end loop;
end $$;

-- deal_conditions inherit via parent deal
create policy "agent rw conditions" on deal_conditions for all
  using (exists (select 1 from deals d where d.id = deal_id and d.agent_id = auth.uid()))
  with check (exists (select 1 from deals d where d.id = deal_id and d.agent_id = auth.uid()));

-- templates are shared/read-only to authed users
create policy "read templates" on success_activity_templates for select using (auth.role() = 'authenticated');
