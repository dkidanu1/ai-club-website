import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (!code) return NextResponse.redirect(`${origin}/`);

  const supabase = await createSupabaseServerClient();
  if (!supabase) return NextResponse.redirect(`${origin}/`);

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(`${origin}/`);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user?.email?.endsWith("@stanford.edu")) {
    await supabase.from("members").upsert(
      {
        email: user.email,
        full_name: user.user_metadata?.full_name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "email" }
    );
  }

  return NextResponse.redirect(`${origin}/`);
}
