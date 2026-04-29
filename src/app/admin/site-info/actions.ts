"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

function toNumberOr(value: string, fallback: number): number {
  const num = Number(value);
  return Number.isNaN(num) ? fallback : num;
}

export async function saveSiteSettingsAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const headline = String(formData.get("headline") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const mission = String(formData.get("mission") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const discordUrl = String(formData.get("discordUrl") ?? "").trim();
  const instagramHandle = String(formData.get("instagramHandle") ?? "").trim();
  const calendarFeedUrl = String(formData.get("calendarFeedUrl") ?? "").trim();
  const members = String(formData.get("members") ?? "").trim();
  const events = String(formData.get("events") ?? "").trim();
  const partners = String(formData.get("partners") ?? "").trim();
  const newsletter = String(formData.get("newsletter") ?? "").trim();

  const payload = {
    id: "default-site-settings",
    headline: headline || null,
    tagline: tagline || null,
    mission_md: mission || null,
    email: email || null,
    discord_url: discordUrl || null,
    instagram_handle: instagramHandle || null,
    calendar_feed_url: calendarFeedUrl || null,
    stats: {
      members: toNumberOr(members, 0),
      events: toNumberOr(events, 0),
      partners: toNumberOr(partners, 0),
      newsletter: newsletter || "0",
    },
  };

  const { error } = await supabase.from("site_settings").upsert(payload, {
    onConflict: "id",
  });
  if (error) {
    console.error("saveSiteSettingsAction failed:", error);
    throw new Error(`Failed to save site settings: ${error.message}`);
  }

  revalidatePath("/");
  revalidatePath("/about");
  revalidatePath("/admin/site-info");
}
