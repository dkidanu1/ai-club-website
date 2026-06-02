-- Allow the public (anon key) to read officer/president member rows.
--
-- Why: The public "Team" section on the home page and /about renders
-- officers via getOfficers() in src/lib/supabase/server.ts, which queries
-- the `members` table using the publishable/anon key. The RLS migration
-- (20260429_enable_rls.sql) enabled RLS on `members` but only added a
-- "members self read" policy scoped to `authenticated` users reading their
-- own row. With no anon read policy, the public query returned zero rows
-- and the Team section rendered "No officers listed yet" on the live site.
--
-- This policy exposes ONLY officer/president rows to the public — regular
-- member rows remain readable only by the signed-in member themselves
-- (via the existing "members self read" policy). Policies are OR'd together,
-- so both continue to apply.
--
-- NOTE: getOfficers() selects the `email` column, so officer emails become
-- publicly readable through this policy. If that is not desired, remove
-- `email` from the select list in getOfficers() (and OfficerRecord usage).

create policy "members officer public read"
  on members
  for select
  to anon, authenticated
  using (role in ('officer', 'president'));
