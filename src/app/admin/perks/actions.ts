"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

function isCategory(value: string): value is "api" | "compute" | "tools" | "learning" {
  return ["api", "compute", "tools", "learning"].includes(value);
}

function isStatus(value: string): value is "active" | "expiring" | "archived" {
  return ["active", "expiring", "archived"].includes(value);
}

export async function createPerkAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const partnerName = String(formData.get("partnerName") ?? "").trim();
  const category = String(formData.get("category") ?? "");
  const offer = String(formData.get("offer") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const redemptionUrl = String(formData.get("redemptionUrl") ?? "").trim();
  const expiresAt = String(formData.get("expiresAt") ?? "").trim();
  const memberNotes = String(formData.get("memberNotes") ?? "").trim();

  if (!partnerName || !offer || !code || !isCategory(category)) return;

  const { error } = await supabase.from("perks").insert({
    partner_name: partnerName,
    category,
    offer,
    code,
    redemption_url: redemptionUrl || null,
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    member_notes: memberNotes || null,
    status: "active",
  });

  if (error) return;
  revalidatePath("/admin/perks");
  revalidatePath("/perks");
}

export async function updatePerkStatusAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !isStatus(status)) return;

  const { error } = await supabase.from("perks").update({ status }).eq("id", id);
  if (error) return;

  revalidatePath("/admin/perks");
  revalidatePath("/perks");
}
