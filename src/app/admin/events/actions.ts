"use server";

import { revalidatePath } from "next/cache";

import { requireOfficer } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { ActionState } from "@/app/admin/events/types";

const EVENT_TYPES = ["talk", "hack", "reading", "social"] as const;
const STATUSES = ["draft", "published", "past", "cancelled"] as const;
type EventType = (typeof EVENT_TYPES)[number];
type Status = (typeof STATUSES)[number];

function isEventType(value: string): value is EventType {
  return (EVENT_TYPES as readonly string[]).includes(value);
}

function isStatus(value: string): value is Status {
  return (STATUSES as readonly string[]).includes(value);
}

function parseStartsAt(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function parseAgendaJson(value: string):
  | { ok: true; agenda: Array<{ time: string; item: string }> }
  | { ok: false } {
  if (!value.trim()) return { ok: true, agenda: [] };
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return { ok: false };
  }
  if (!Array.isArray(parsed)) return { ok: false };
  const agenda = parsed
    .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      time: String(entry.time ?? "").trim(),
      item: String(entry.item ?? "").trim(),
    }))
    .filter((entry) => entry.time || entry.item);
  return { ok: true, agenda };
}

export async function createEventAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const title = String(formData.get("title") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const eventTypeRaw = String(formData.get("eventType") ?? "talk");
  const statusRaw = String(formData.get("status") ?? "draft");

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Title is required.";
  const startsAt = parseStartsAt(startsAtRaw);
  if (!startsAt) fieldErrors.startsAt = "Provide a valid start date and time.";
  if (!isEventType(eventTypeRaw)) fieldErrors.eventType = "Invalid event type.";
  if (!isStatus(statusRaw)) fieldErrors.status = "Invalid status.";
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const { error } = await supabase.from("events").insert({
    title,
    starts_at: startsAt,
    location: location || null,
    event_type: eventTypeRaw as EventType,
    status: statusRaw as Status,
    description_md: null,
    agenda: [],
  });

  if (error) {
    console.error("createEventAction failed:", error);
    return { ok: false, error: `Failed to create event: ${error.message}` };
  }
  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { ok: true };
}

export async function updateEventStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const id = String(formData.get("id") ?? "");
  const statusRaw = String(formData.get("status") ?? "");
  if (!id) return { ok: false, error: "Missing event id." };
  if (!isStatus(statusRaw)) return { ok: false, error: "Invalid status." };

  const { error } = await supabase.from("events").update({ status: statusRaw }).eq("id", id);
  if (error) {
    console.error("updateEventStatusAction failed:", error);
    return { ok: false, error: `Failed to update status: ${error.message}` };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { ok: true };
}

export async function updateEventDetailsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rsvpUrlRaw = String(formData.get("rsvpUrl") ?? "").trim();
  const eventTypeRaw = String(formData.get("eventType") ?? "talk");
  const rsvpCountRaw = formData.get("rsvpCount");
  const capacityRaw = String(formData.get("capacity") ?? "").trim();
  const agendaJson = String(formData.get("agendaJson") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!id) return { ok: false, error: "Missing event id." };
  if (!title) fieldErrors.title = "Title is required.";
  const startsAt = parseStartsAt(startsAtRaw);
  if (!startsAt) fieldErrors.startsAt = "Provide a valid start date and time.";
  if (!isEventType(eventTypeRaw)) fieldErrors.eventType = "Invalid event type.";

  const rsvpCount = Number(rsvpCountRaw ?? 0);
  if (Number.isNaN(rsvpCount) || rsvpCount < 0) {
    fieldErrors.rsvpCount = "RSVP count must be a non-negative number.";
  }

  let capacity: number | null = null;
  if (capacityRaw !== "") {
    const parsed = Number(capacityRaw);
    if (Number.isNaN(parsed) || parsed < 0) {
      fieldErrors.capacity = "Capacity must be a non-negative number.";
    } else {
      capacity = parsed;
    }
  }

  const agendaResult = parseAgendaJson(agendaJson);
  if (!agendaResult.ok) {
    fieldErrors.agendaJson = "Agenda must be valid JSON: an array of {time, item} objects.";
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const { error } = await supabase
    .from("events")
    .update({
      title,
      starts_at: startsAt,
      location: location || null,
      event_type: eventTypeRaw as EventType,
      description_md: description || null,
      rsvp_url: rsvpUrlRaw || null,
      rsvp_count: Math.floor(rsvpCount),
      capacity,
      agenda: agendaResult.ok ? agendaResult.agenda : [],
    })
    .eq("id", id);

  if (error) {
    console.error("updateEventDetailsAction failed:", error);
    return { ok: false, error: `Failed to update event: ${error.message}` };
  }

  revalidatePath("/admin/events");
  revalidatePath("/events");
  return { ok: true };
}
