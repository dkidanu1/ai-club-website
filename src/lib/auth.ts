import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";

export type MemberProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: "member" | "officer" | "president";
};

function isAuthConfigured(): boolean {
  return hasSupabasePublicEnv() && process.env.NEXT_PUBLIC_ENABLE_SUPABASE_AUTH === "true";
}

export async function getCurrentMember(): Promise<MemberProfile | null> {
  if (!isAuthConfigured()) {
    return {
      id: "local-dev",
      email: "dev@stanford.edu",
      full_name: "Local Dev",
      role: "president",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;

  const { data } = await supabase
    .from("members")
    .select("id,email,full_name,role")
    .eq("email", user.email)
    .maybeSingle();

  if (!data) return null;
  return data as MemberProfile;
}

export async function requireMember() {
  const member = await getCurrentMember();
  if (!member) redirect("/?auth_required=1");
  return member;
}

export async function requireOfficer() {
  const member = await requireMember();
  if (member.role !== "officer" && member.role !== "president") {
    redirect("/?auth_error=not_officer");
  }
  return member;
}
