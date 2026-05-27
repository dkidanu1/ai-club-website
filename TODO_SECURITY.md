# Security TODO

This site currently runs **without authentication and without Row Level Security (RLS)**.
That's fine for early development, but must be fixed before pointing real users at the site.

## Current state (as of 2026-04-28)

- `NEXT_PUBLIC_ENABLE_SUPABASE_AUTH=false` — auth is not wired up.
- All Supabase tables (`members`, `events`, `library_items`, `perks`, `site_settings`, `sync_log`)
  were created **without RLS enabled**.
- All client and server code uses the **publishable key** (`sb_publishable_...`), which is
  embedded in the public site bundle. Anyone visiting the site can read it from DevTools.
- The admin pages under `/admin/*` are **not protected** by anything other than being
  un-linked. The URL is guessable.

**Practical impact:** anyone who finds the publishable key (trivial — it's in the HTML) can
hit the Supabase REST API directly and insert / update / delete any row in any table.
They can deface the site, wipe events, etc.

## What to do before launch

Do these in order. Each step is independently safe to ship.

### 1. Wire up Supabase Auth for officers

- Set `NEXT_PUBLIC_ENABLE_SUPABASE_AUTH=true` in `web/.env.local`.
- Configure Google OAuth in the Supabase dashboard
  (Authentication → Providers → Google), restricted to the `stanford.edu` domain.
- Confirm `src/components/auth-button.tsx` and the `/auth/callback` route work.
- Add a server-side check on `/admin/*` pages that redirects to login if the
  signed-in user's email isn't in the `members` table with role `officer` or `president`.

### 2. Move admin writes to a secret key

The publishable key should never be allowed to write. For server-side admin actions:

- In the Supabase dashboard, generate a **secret key** (`sb_secret_...`).
- Add it to `web/.env.local` as `SUPABASE_SECRET_KEY=sb_secret_...` (note: **no**
  `NEXT_PUBLIC_` prefix — this must stay server-side).
- Update `src/lib/supabase/server-client.ts` (or add a new
  `src/lib/supabase/admin-client.ts`) to instantiate a client with the secret key,
  and have all `src/app/admin/**/actions.ts` files use it instead of the
  publishable-key client.
- Verify the secret key is **not** in `.env.example`, **not** committed, and
  **not** referenced from any `"use client"` file.

### 3. Enable RLS on every table

Run the SQL in `web/supabase/migrations/20260429_enable_rls.sql` (created alongside this
file). It:

- Enables RLS on all 6 tables.
- Adds `select` policies so the public site can still read published events,
  library items, perks, and site settings via the publishable key.
- Adds **no** write policies for `anon` — all writes must come from the secret-key
  server client (which bypasses RLS) once step 2 is done.

After running it, verify in the Supabase dashboard → Authentication → Policies that
each table shows policies and the "RLS enabled" badge is green.

### 4. Smoke test from an incognito window

- Open the site in incognito (no auth).
- Open DevTools and try a `POST` to
  `https://hoyfbyzmcnoqgjoehcfi.supabase.co/rest/v1/site_settings`
  with the publishable key. It should return `401` or `42501` (RLS).
- Visit `/admin/site-info` directly. It should redirect to login.
- Sign in as an officer. Editing the form should still work.

## Sanity checks to keep in CI later

- Grep guard: fail CI if any `"use client"` file imports `SUPABASE_SECRET_KEY` or
  references a key starting with `sb_secret_`.
- Periodic RLS audit: a simple test that hits every table with the publishable
  key and asserts it cannot insert/update/delete.
