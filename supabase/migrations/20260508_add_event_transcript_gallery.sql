-- For past events: a full transcript of the talk and a gallery of photos.
-- photo_url stays as the single hero image; gallery_urls is additional photos.
alter table events
  add column if not exists transcript text,
  add column if not exists gallery_urls text[] not null default '{}';
