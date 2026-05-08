-- Drop granola transcripts from the library — they now live with events.
delete from library_items where type = 'granola';

alter table library_items drop constraint if exists library_items_type_check;
alter table library_items add constraint library_items_type_check
  check (type in ('article', 'video'));

-- image_url: OG image fetched from the article URL, or thumbnail for videos.
alter table library_items
  add column if not exists image_url text;
