import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabasePublicKey } from "@/lib/supabase/env";

// Matches the Supabase session cookie and its chunks — sb-<ref>-auth-token,
// sb-<ref>-auth-token.0, .1, ... — but deliberately NOT the PKCE cookie
// sb-<ref>-auth-token-code-verifier, which must survive.
const SESSION_COOKIE = /^sb-.+-auth-token(\.\d+)?$/;

/**
 * Supabase client for the OAuth callback route, and only that route.
 *
 * Same as createSupabaseServerClient() except that any pre-existing session
 * cookie is dropped before the client is built, and hidden from auth-js after.
 *
 * Why: auth-js recovers whatever session cookie it can see when it initializes.
 * If that session is stale — a returning member whose refresh token expired or
 * was revoked — the refresh fails and auth-js calls _removeSession(), which
 * deletes `<storageKey>-code-verifier` along with the dead session. That is the
 * one cookie exchangeCodeForSession() is about to need, so sign-in dies with
 * AuthPKCECodeVerifierMissingError ("PKCE code verifier not found in storage").
 *
 * We are about to mint a brand-new session here, so the old one is worthless.
 * Deleting it also clears stale chunks, so the new session writes clean ones.
 */
export async function createSupabaseCallbackClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabasePublicKey();

  if (!url || !key) return null;

  for (const { name } of cookieStore.getAll()) {
    if (SESSION_COOKIE.test(name)) {
      try {
        cookieStore.delete(name);
      } catch {
        // Deletion is best-effort; the getAll filter below is what guarantees
        // auth-js never sees the stale session.
      }
    }
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore
          .getAll()
          .filter(({ name }) => !SESSION_COOKIE.test(name));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabasePublicKey();

  if (!url || !key) return null;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll was called from a Server Component, which can't
          // mutate cookies. Safe to ignore — the session will be
          // refreshed on the next Server Action or Route Handler call.
        }
      },
    },
  });
}
