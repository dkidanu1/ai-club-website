import { createClient } from "@supabase/supabase-js";

import { fallbackEvents, toSlug, type EventRecord } from "@/lib/events";

type DbEvent = {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
  rsvp_count: number | null;
  capacity: number | null;
  event_type: "talk" | "hack" | "reading" | "social";
  description_md: string | null;
  agenda: Array<{ time?: string; item?: string }> | null;
  status: "draft" | "published" | "past" | "cancelled";
};

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function mapDbEvent(event: DbEvent): EventRecord {
  return {
    id: event.id,
    slug: toSlug(event.title),
    title: event.title,
    startsAt: event.starts_at,
    location: event.location ?? "TBD",
    rsvpCount: event.rsvp_count ?? 0,
    capacity: event.capacity,
    eventType: event.event_type,
    description:
      event.description_md ??
      "Details coming soon. Officers can update this from the back office.",
    agenda:
      event.agenda?.map((entry) => ({
        time: entry.time ?? "TBD",
        item: entry.item ?? "Details coming soon",
      })) ?? [],
  };
}

export async function getPublishedEvents(): Promise<EventRecord[]> {
  if (!hasSupabaseEnv()) return fallbackEvents;

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const { data, error } = await client
    .from("events")
    .select(
      "id,title,starts_at,location,rsvp_count,capacity,event_type,description_md,agenda,status"
    )
    .in("status", ["published", "past"])
    .order("starts_at", { ascending: true });

  if (error || !data) return fallbackEvents;
  return (data as DbEvent[]).map(mapDbEvent);
}

export async function getEventBySlug(slug: string): Promise<EventRecord | null> {
  const events = await getPublishedEvents();
  return events.find((event) => event.slug === slug) ?? null;
}
