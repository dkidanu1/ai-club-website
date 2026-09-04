import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabasePublicKey } from "@/lib/supabase/env";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  // Never run the session-refresh pass on the OAuth callback.
  //
  // supabase.auth.getUser() calls auth-js's _removeSession() whenever the
  // session cookie it finds is missing, expired, or otherwise unrefreshable —
  // and _removeSession() deletes `<storageKey>-code-verifier` along with the
  // session cookie itself. On /auth/callback that code-verifier cookie is the
  // one value exchangeCodeForSession() needs, so refreshing here deletes it
  // before the route handler ever reads it. The result is a sign-in that dies
  // with AuthPKCECodeVerifierMissingError ("PKCE code verifier not found in
  // storage") for exactly the people carrying a stale session cookie: returning
  // members whose refresh token has expired or was revoked.
  //
  // The callback route builds its own server client and writes the session
  // cookies itself, so it needs nothing from this proxy.
  if (request.nextUrl.pathname.startsWith("/auth/")) {
    return response;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = getSupabasePublicKey();
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Touching getUser refreshes the Supabase auth cookie when needed.
  // Cookie writes in proxy context are allowed, so the layout's later
  // call to getUser() finds a fresh session and never has to write.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Run on every path except Next.js internals and static assets.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
