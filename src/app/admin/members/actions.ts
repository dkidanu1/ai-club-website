"use server";

import { revalidatePath } from "next/cache";

import { requireOfficer } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
import type { ActionState } from "@/app/admin/members/types";

const ROLES = ["member", "officer", "president"] as const;
type Role = (typeof ROLES)[number];

function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

function isStanfordEmail(value: string): boolean {
  return /^[^\s@]+@stanford\.edu$/i.test(value);
}

function isHttpUrl(value: string): boolean {
  if (!value) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function revalidateMemberSurfaces() {
  revalidatePath("/admin/members");
  revalidatePath("/about");
  revalidatePath("/");
}

export async function createMemberAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "member");
  const officerTitle = String(formData.get("officerTitle") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();
  const linkedinUrl = String(formData.get("linkedinUrl") ?? "").trim();
  const displayOrderRaw = String(formData.get("displayOrder") ?? "0").trim();

  const fieldErrors: Record<string, string> = {};
  if (!email) fieldErrors.email = "Email is required.";
  else if (!isStanfordEmail(email)) fieldErrors.email = "Must be a @stanford.edu address.";
  if (!isRole(roleRaw)) fieldErrors.role = "Invalid role.";
  if (avatarUrl && !isHttpUrl(avatarUrl)) fieldErrors.avatarUrl = "Must be a valid http(s) URL.";
  if (linkedinUrl && !isHttpUrl(linkedinUrl)) fieldErrors.linkedinUrl = "Must be a valid http(s) URL.";
  const displayOrder = Number(displayOrderRaw);
  if (Number.isNaN(displayOrder)) fieldErrors.displayOrder = "Must be a number.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const { error } = await supabase.from("members").insert({
    email,
    full_name: fullName || null,
    role: roleRaw as Role,
    officer_title: officerTitle || null,
    avatar_url: avatarUrl || null,
    linkedin_url: linkedinUrl || null,
    display_order: displayOrder,
  });

  if (error) {
    console.error("createMemberAction failed:", error);
    return { ok: false, error: `Failed to create member: ${error.message}` };
  }
  revalidateMemberSurfaces();
  return { ok: true };
}

export async function updateMemberAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const id = String(formData.get("id") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const roleRaw = String(formData.get("role") ?? "member");
  const officerTitle = String(formData.get("officerTitle") ?? "").trim();
  const avatarUrl = String(formData.get("avatarUrl") ?? "").trim();
  const linkedinUrl = String(formData.get("linkedinUrl") ?? "").trim();
  const displayOrderRaw = String(formData.get("displayOrder") ?? "0").trim();

  if (!id) return { ok: false, error: "Missing member id." };

  const fieldErrors: Record<string, string> = {};
  if (!isRole(roleRaw)) fieldErrors.role = "Invalid role.";
  if (avatarUrl && !isHttpUrl(avatarUrl)) fieldErrors.avatarUrl = "Must be a valid http(s) URL.";
  if (linkedinUrl && !isHttpUrl(linkedinUrl)) fieldErrors.linkedinUrl = "Must be a valid http(s) URL.";
  const displayOrder = Number(displayOrderRaw);
  if (Number.isNaN(displayOrder)) fieldErrors.displayOrder = "Must be a number.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const { error } = await supabase
    .from("members")
    .update({
      full_name: fullName || null,
      role: roleRaw as Role,
      officer_title: officerTitle || null,
      avatar_url: avatarUrl || null,
      linkedin_url: linkedinUrl || null,
      display_order: displayOrder,
    })
    .eq("id", id);

  if (error) {
    console.error("updateMemberAction failed:", error);
    return { ok: false, error: `Failed to update member: ${error.message}` };
  }
  revalidateMemberSurfaces();
  return { ok: true };
}

export async function deleteMemberAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing member id." };

  const { error } = await supabase.from("members").delete().eq("id", id);
  if (error) {
    console.error("deleteMemberAction failed:", error);
    return { ok: false, error: `Failed to delete member: ${error.message}` };
  }
  revalidateMemberSurfaces();
  return { ok: true };
}
