-- Add a column so the public event surfaces can show the guest's
-- affiliation alongside their name (e.g. "Fei-Fei Li · Stanford HAI").
alter table events
  add column if not exists guest_company text;
