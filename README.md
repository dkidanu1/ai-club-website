## Stanford GSB AI Club Website

Next.js app for the AI Club public website and officer back office.

## Local setup

1. Copy env file and fill in Supabase values:

```bash
cp .env.example .env.local
```

2. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

If Supabase env vars are missing, public events pages automatically use fallback demo data.
Auth-gated pages also run in local-dev bypass mode until env vars are set.

## Auth setup notes

- Enable Google provider in Supabase Auth.
- Restrict access to `@stanford.edu` users in your Supabase/Auth configuration.
- Add callback URL: `http://localhost:3000/auth/callback` (and your production URL).

## Database schema

Initial SQL schema is in:

`supabase/migrations/20260428_initial_schema.sql`

It includes:
- `events`
- `library_items`
- `perks`
- `members`
- `site_settings`
- `sync_log`

## Current implemented routing

Public:
- `/`
- `/events`
- `/events/[slug]`
- `/library`
- `/perks`
- `/about`

Back office shell:
- `/admin`
- `/admin/events`
- `/admin/library`
- `/admin/perks`
- `/admin/members`
- `/admin/site-info`

## Lint

```bash
npm run lint
```
