import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

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

  const supabase = await createSupabaseServerClient();
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

  const { error: upsertError } = await supabase.from("members").upsert(
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

  return NextResponse.redirect(`${origin}${next}`);
}
