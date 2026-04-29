create extension if not exists pgcrypto;

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email like '%@stanford.edu'),
  full_name text,
  avatar_url text,
  role text not null default 'member' check (role in ('member', 'officer', 'president')),
  officer_title text,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  excel_row_id text unique,
  title text not null,
  event_type text not null check (event_type in ('talk', 'hack', 'reading', 'social')),
  starts_at timestamptz not null,
  ends_at timestamptz,
  location text,
  guest_name text,
  host_officer_id uuid references members(id),
  capacity integer,
  description_md text,
  agenda jsonb default '[]'::jsonb,
  zoom_url text,
  rsvp_url text,
  status text not null default 'draft' check (status in ('draft', 'published', 'past', 'cancelled')),
  rsvp_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists library_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('granola', 'article')),
  event_id uuid references events(id) on delete set null,
  full_text text,
  word_count integer,
  sections jsonb,
  external_url text,
  source_name text,
  excerpt text,
  tags text[] not null default '{}'::text[],
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists perks (
  id uuid primary key default gen_random_uuid(),
  partner_name text not null,
  partner_logo_url text,
  category text not null check (category in ('api', 'compute', 'tools', 'learning')),
  offer text not null,
  code text not null,
  redemption_url text,
  expires_at timestamptz,
  member_notes text,
  status text not null default 'active' check (status in ('active', 'expiring', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists site_settings (
  id uuid primary key default gen_random_uuid(),
  headline text,
  tagline text,
  mission_md text,
  team_photo_url text,
  email text,
  discord_url text,
  instagram_handle text,
  calendar_feed_url text,
  stats jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sync_log (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  rows_added integer not null default 0,
  rows_updated integer not null default 0,
  conflicts jsonb default '[]'::jsonb,
  errors jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
