"use server";

import { revalidatePath } from "next/cache";

import { requireOfficer } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin-client";
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

function parseDateTime(value: string): string | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function revalidateEventSurfaces() {
  revalidatePath("/admin/events");
  revalidatePath("/events");
  revalidatePath("/");
}

export async function createEventAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const title = String(formData.get("title") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  const endsAtRaw = String(formData.get("endsAt") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const eventTypeRaw = String(formData.get("eventType") ?? "talk");
  const statusRaw = String(formData.get("status") ?? "draft");

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Title is required.";

  const startsAt = parseDateTime(startsAtRaw);
  if (!startsAt) fieldErrors.startsAt = "Provide a valid start date and time.";

  let endsAt: string | null = null;
  if (endsAtRaw) {
    endsAt = parseDateTime(endsAtRaw);
    if (!endsAt) {
      fieldErrors.endsAt = "Provide a valid end date and time.";
    } else if (startsAt && new Date(endsAt) <= new Date(startsAt)) {
      fieldErrors.endsAt = "End time must be after start time.";
    }
  }

  if (!isEventType(eventTypeRaw)) fieldErrors.eventType = "Invalid event type.";
  if (!isStatus(statusRaw)) fieldErrors.status = "Invalid status.";
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const { error } = await supabase.from("events").insert({
    title,
    starts_at: startsAt,
    ends_at: endsAt,
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
  revalidateEventSurfaces();
  return { ok: true };
}

export async function updateEventStatusAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = createSupabaseAdminClient();
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

  revalidateEventSurfaces();
  return { ok: true };
}

export async function updateEventDetailsAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const startsAtRaw = String(formData.get("startsAt") ?? "").trim();
  const endsAtRaw = String(formData.get("endsAt") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const rsvpUrlRaw = String(formData.get("rsvpUrl") ?? "").trim();
  const eventTypeRaw = String(formData.get("eventType") ?? "talk");
  const guestName = String(formData.get("guestName") ?? "").trim();
  const guestCompany = String(formData.get("guestCompany") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const photoUrl = String(formData.get("photoUrl") ?? "").trim();
  const transcript = String(formData.get("transcript") ?? "").trim();
  const galleryUrlsRaw = String(formData.get("galleryUrls") ?? "");
  const galleryUrls = galleryUrlsRaw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const fieldErrors: Record<string, string> = {};
  if (!id) return { ok: false, error: "Missing event id." };
  if (!title) fieldErrors.title = "Title is required.";

  const startsAt = parseDateTime(startsAtRaw);
  if (!startsAt) fieldErrors.startsAt = "Provide a valid start date and time.";

  let endsAt: string | null = null;
  if (endsAtRaw) {
    endsAt = parseDateTime(endsAtRaw);
    if (!endsAt) {
      fieldErrors.endsAt = "Provide a valid end date and time.";
    } else if (startsAt && new Date(endsAt) <= new Date(startsAt)) {
      fieldErrors.endsAt = "End time must be after start time.";
    }
  }

  if (!isEventType(eventTypeRaw)) fieldErrors.eventType = "Invalid event type.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const { error } = await supabase
    .from("events")
    .update({
      title,
      starts_at: startsAt,
      ends_at: endsAt,
      location: location || null,
      event_type: eventTypeRaw as EventType,
      description_md: description || null,
      rsvp_url: rsvpUrlRaw || null,
      guest_name: guestName || null,
      guest_company: guestCompany || null,
      summary: summary || null,
      photo_url: photoUrl || null,
      gallery_urls: galleryUrls,
      transcript: transcript || null,
    })
    .eq("id", id);

  if (error) {
    console.error("updateEventDetailsAction failed:", error);
    return { ok: false, error: `Failed to update event: ${error.message}` };
  }

  revalidateEventSurfaces();
  return { ok: true };
}

export async function deleteEventAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireOfficer();
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing event id." };

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) {
    console.error("deleteEventAction failed:", error);
    return { ok: false, error: `Failed to delete event: ${error.message}` };
  }

  revalidateEventSurfaces();
  return { ok: true };
}
