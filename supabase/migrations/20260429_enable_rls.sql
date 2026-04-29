-- Enable Row Level Security on all tables and add public read policies.
--
-- IMPORTANT: Do NOT apply this until both of the following are true:
--   1. Supabase Auth is wired up (NEXT_PUBLIC_ENABLE_SUPABASE_AUTH=true).
--   2. Server actions in src/app/admin/**/actions.ts use a SECRET key
--      (sb_secret_...) instead of the publishable key. The secret key
--      bypasses RLS, so admin writes will keep working. The publishable
--      key — which is what the public site bundle ships with — will be
--      restricted to the SELECT policies below.
--
-- See web/TODO_SECURITY.md for the full migration plan.

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table members        enable row level security;
alter table events         enable row level security;
alter table library_items  enable row level security;
alter table perks          enable row level security;
alter table site_settings  enable row level security;
alter table sync_log       enable row level security;

-- ---------------------------------------------------------------------------
-- Public read policies (anon + authenticated)
-- ---------------------------------------------------------------------------

-- Site settings: the whole row is meant to be public site copy.
create policy "site_settings public read"
  on site_settings
  for select
  to anon, authenticated
  using (true);

-- Events: only published or past events are visible to the public.
create policy "events public read"
  on events
  for select
  to anon, authenticated
  using (status in ('published', 'past'));

-- Library items: only published items are visible to the public.
create policy "library_items public read"
  on library_items
  for select
  to anon, authenticated
  using (status = 'published');

-- Perks: visible to signed-in members only (perks include redemption codes).
-- If you want them public, change `to authenticated` to `to anon, authenticated`.
create policy "perks members read"
  on perks
  for select
  to authenticated
  using (status in ('active', 'expiring'));

-- Members: only the signed-in user can read their own member row.
-- Adjust if you want officers/presidents to see all members.
create policy "members self read"
  on members
  for select
  to authenticated
  using (auth.email() = email);

-- sync_log: no public read policy. Only the service_role / secret key can read it.

-- ---------------------------------------------------------------------------
-- No write policies for anon or authenticated.
-- All inserts/updates/deletes must go through the secret-key server client,
-- which bypasses RLS. This is intentional.
-- ---------------------------------------------------------------------------
