"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server-client";

function isValidEventType(value: string): value is "talk" | "hack" | "reading" | "social" {
  return ["talk", "hack", "reading", "social"].includes(value);
}

function isValidStatus(
  value: string
): value is "draft" | "published" | "past" | "cancelled" {
  return ["draft", "published", "past", "cancelled"].includes(value);
}

function parseAgendaJson(value: string): Array<{ time: string; item: string }> {
  if (!value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => typeof entry === "object" && entry !== null)
      .map((entry) => ({
        time: String((entry as { time?: string }).time ?? "").trim(),
        item: String((entry as { item?: string }).item ?? "").trim(),
      }))
      .filter((entry) => entry.time || entry.item);
  } catch {
    return [];
  }
}

export async function createEventAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const title = String(formData.get("title") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const eventTypeRaw = String(formData.get("eventType") ?? "talk");
  const statusRaw = String(formData.get("status") ?? "draft");

  if (!title || !startsAt || !isValidEventType(eventTypeRaw) || !isValidStatus(statusRaw)) {
    return;
  }

  const { error } = await supabase.from("events").insert({
    title,
    starts_at: new Date(startsAt).toISOString(),
    location: location || null,
    event_type: eventTypeRaw,
    status: statusRaw,
    description_md: "Event details coming soon.",
    agenda: [],
  });

  if (error) return;
  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function updateEventStatusAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  if (!id || !isValidStatus(statusRaw)) return;

  const { error } = await supabase.from("events").update({ status: statusRaw }).eq("id", id);
  if (error) return;

  revalidatePath("/admin/events");
  revalidatePath("/events");
}

export async function updateEventDetailsAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const startsAt = String(formData.get("startsAt") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rsvpUrlRaw = String(formData.get("rsvpUrl") ?? "").trim();
  const eventTypeRaw = String(formData.get("eventType") ?? "talk");
  const rsvpCountRaw = Number(formData.get("rsvpCount") ?? 0);
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  const agendaJson = String(formData.get("agendaJson") ?? "");

  if (!id || !title || !startsAt || !isValidEventType(eventTypeRaw)) return;

  const capacity = capacityRaw === "" ? null : Number(capacityRaw);
  const safeCapacity = Number.isNaN(capacity) ? null : capacity;
  const safeRsvpCount = Number.isNaN(rsvpCountRaw) ? 0 : Math.max(0, rsvpCountRaw);
  const agenda = parseAgendaJson(agendaJson);

  const { error } = await supabase
    .from("events")
    .update({
      title,
      starts_at: new Date(startsAt).toISOString(),
      location: location || null,
      event_type: eventTypeRaw,
      description_md: description || null,
      rsvp_url: rsvpUrlRaw || null,
      rsvp_count: safeRsvpCount,
      capacity: safeCapacity,
      agenda,
    })
    .eq("id", id);

  if (error) return;

  revalidatePath("/admin/events");
  revalidatePath("/events");
}
