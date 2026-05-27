-- Add fields needed to render officers on the public /about page.
-- linkedin_url: profile link for the photo on the team grid
-- display_order: low numbers render first; ties broken by full_name

alter table members
  add column if not exists linkedin_url text,
  add column if not exists display_order integer not null default 0;
