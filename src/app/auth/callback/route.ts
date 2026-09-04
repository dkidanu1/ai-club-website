import { NextResponse } from "next/server";

import { createSupabaseCallbackClient } from "@/lib/supabase/server-client";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";

const ALLOWED_DOMAIN = "stanford.edu";

function safeNext(value: string | null): string {
  if (!value) return "/";
  // Only allow same-origin paths. Reject absolute URLs or protocol-relative (//evil.com).
  if (!value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNext(requestUrl.searchParams.get("next"));
  const origin = requestUrl.origin;

  if (!code) return NextResponse.redirect(`${origin}/?auth_error=missing_code`);

  const supabase = await createSupabaseCallbackClient();
  if (!supabase) return NextResponse.redirect(`${origin}/?auth_error=not_configured`);

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error("OAuth exchange failed:", exchangeError);
    return NextResponse.redirect(`${origin}/?auth_error=oauth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/?auth_error=no_email`);
  }

  if (!user.email.endsWith(`@${ALLOWED_DOMAIN}`)) {
    // Sign the cookie out so a non-Stanford account doesn't sit in the browser.
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/?auth_error=domain`);
  }

  // Provisioning the member row is a privileged write: with RLS enabled the
  // anon/cookie client cannot insert into `members`. Use the secret-key admin
  // client (bypasses RLS) for this upsert only — auth itself stays on the
  // cookie-backed client above.
  const admin = createSupabaseAdminClient();
  if (!admin) {
    console.error("Member upsert skipped: SUPABASE_SECRET_KEY is not configured.");
  } else {
    const { error: upsertError } = await admin.from("members").upsert(
      {
        email: user.email,
        full_name: user.user_metadata?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );
    if (upsertError) {
      console.error("Member upsert failed:", upsertError);
      // Continue — they're authenticated even if the row write hiccupped.
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
