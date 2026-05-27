-- Daily/weekly featured headline shown on the home page.
-- Edited from /admin/library.
alter table site_settings
  add column if not exists featured_headline text,
  add column if not exists featured_url text;
