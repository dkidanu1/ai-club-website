-- summary: short recap text shown on past-event tiles
-- photo_url: hero image for past events (and optionally upcoming)
alter table events
  add column if not exists summary text,
  add column if not exists photo_url text;
