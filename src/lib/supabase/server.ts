import { createClient } from "@supabase/supabase-js";

import { fallbackEvents, toSlug, type EventRecord } from "@/lib/events";
import { fallbackLibraryItems, type LibraryItemRecord } from "@/lib/library";
import { fallbackPerks, type PerkRecord } from "@/lib/perks";
import { fallbackSiteSettings, type SiteSettingsRecord } from "@/lib/site-settings";

type DbEvent = {
  id: string;
  title: string;
  starts_at: string;
  location: string | null;
  rsvp_count: number | null;
  capacity: number | null;
  rsvp_url: string | null;
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
    rsvpUrl: event.rsvp_url,
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
      "id,title,starts_at,location,rsvp_count,capacity,rsvp_url,event_type,description_md,agenda,status"
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

export type AdminEventRecord = {
  id: string;
  title: string;
  startsAt: string;
  location: string;
  eventType: "talk" | "hack" | "reading" | "social";
  status: "draft" | "published" | "past" | "cancelled";
  rsvpCount: number;
  capacity: number | null;
  rsvpUrl: string | null;
  description: string;
  agenda: Array<{ time: string; item: string }>;
};

export async function getEventsForAdmin(): Promise<AdminEventRecord[]> {
  if (!hasSupabaseEnv()) {
    return fallbackEvents.map((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.startsAt,
      location: event.location,
      eventType: event.eventType,
      status: "published",
      rsvpCount: event.rsvpCount,
      capacity: event.capacity,
      rsvpUrl: event.rsvpUrl,
      description: event.description,
      agenda: event.agenda,
    }));
  }

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const { data, error } = await client
    .from("events")
    .select(
      "id,title,starts_at,location,event_type,status,rsvp_count,capacity,rsvp_url,description_md,agenda"
    )
    .order("starts_at", { ascending: false });

  if (error || !data) return [];

  return (data as DbEvent[]).map((event) => ({
    id: event.id,
    title: event.title,
    startsAt: event.starts_at,
    location: event.location ?? "TBD",
    eventType: event.event_type,
    status: event.status,
    rsvpCount: event.rsvp_count ?? 0,
    capacity: event.capacity,
    rsvpUrl: event.rsvp_url,
    description: event.description_md ?? "",
    agenda:
      event.agenda?.map((entry) => ({
        time: entry.time ?? "",
        item: entry.item ?? "",
      })) ?? [],
  }));
}

type DbLibraryItem = {
  id: string;
  title: string;
  type: "granola" | "article";
  full_text: string | null;
  word_count: number | null;
  external_url: string | null;
  source_name: string | null;
  excerpt: string | null;
  tags: string[] | null;
  status: "draft" | "published";
  published_at: string | null;
};

function mapDbLibraryItem(item: DbLibraryItem): LibraryItemRecord {
  return {
    id: item.id,
    slug: toSlug(item.title),
    title: item.title,
    type: item.type,
    excerpt: item.excerpt ?? "No excerpt yet.",
    fullText: item.full_text,
    wordCount: item.word_count,
    externalUrl: item.external_url,
    sourceName: item.source_name,
    tags: item.tags ?? [],
    status: item.status,
    publishedAt: item.published_at,
  };
}

export async function getPublishedLibraryItems(): Promise<LibraryItemRecord[]> {
  if (!hasSupabaseEnv()) return fallbackLibraryItems;

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const { data, error } = await client
    .from("library_items")
    .select(
      "id,title,type,full_text,word_count,external_url,source_name,excerpt,tags,status,published_at"
    )
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error || !data) return fallbackLibraryItems;
  return (data as DbLibraryItem[]).map(mapDbLibraryItem);
}

export async function getLibraryItemsForAdmin(): Promise<LibraryItemRecord[]> {
  if (!hasSupabaseEnv()) return fallbackLibraryItems;

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const { data, error } = await client
    .from("library_items")
    .select(
      "id,title,type,full_text,word_count,external_url,source_name,excerpt,tags,status,published_at"
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as DbLibraryItem[]).map(mapDbLibraryItem);
}

export async function getLibraryItemBySlug(
  slug: string
): Promise<LibraryItemRecord | null> {
  const items = await getPublishedLibraryItems();
  return items.find((item) => item.slug === slug) ?? null;
}

type DbPerk = {
  id: string;
  partner_name: string;
  category: "api" | "compute" | "tools" | "learning";
  offer: string;
  code: string;
  redemption_url: string | null;
  expires_at: string | null;
  member_notes: string | null;
  status: "active" | "expiring" | "archived";
};

function resolvePerkStatus(perk: DbPerk): "active" | "expiring" | "archived" {
  if (!perk.expires_at) return perk.status;

  const now = Date.now();
  const expiry = new Date(perk.expires_at).getTime();
  if (Number.isNaN(expiry)) return perk.status;
  if (expiry < now) return "archived";
  if (expiry - now <= 1000 * 60 * 60 * 24 * 30) return "expiring";
  return perk.status === "archived" ? "active" : perk.status;
}

function mapDbPerk(perk: DbPerk): PerkRecord {
  return {
    id: perk.id,
    partnerName: perk.partner_name,
    category: perk.category,
    offer: perk.offer,
    code: perk.code,
    redemptionUrl: perk.redemption_url,
    expiresAt: perk.expires_at,
    memberNotes: perk.member_notes,
    status: resolvePerkStatus(perk),
  };
}

export async function getActivePerksForMembers(): Promise<PerkRecord[]> {
  const base =
    !hasSupabaseEnv()
      ? fallbackPerks
      : await (async () => {
          const client = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
          );
          const { data, error } = await client
            .from("perks")
            .select(
              "id,partner_name,category,offer,code,redemption_url,expires_at,member_notes,status"
            )
            .order("expires_at", { ascending: true, nullsFirst: false });
          if (error || !data) return fallbackPerks;
          return (data as DbPerk[]).map(mapDbPerk);
        })();

  return base.filter((perk) => perk.status !== "archived");
}

export async function getPerksForAdmin(): Promise<PerkRecord[]> {
  if (!hasSupabaseEnv()) return fallbackPerks;

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const { data, error } = await client
    .from("perks")
    .select("id,partner_name,category,offer,code,redemption_url,expires_at,member_notes,status")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as DbPerk[]).map(mapDbPerk);
}

type DbSiteSettings = {
  id: string;
  headline: string | null;
  tagline: string | null;
  mission_md: string | null;
  email: string | null;
  discord_url: string | null;
  instagram_handle: string | null;
  calendar_feed_url: string | null;
  stats:
    | {
        members?: number;
        events?: number;
        partners?: number;
        newsletter?: string;
      }
    | null;
};

export async function getSiteSettings(): Promise<SiteSettingsRecord> {
  if (!hasSupabaseEnv()) return fallbackSiteSettings;

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );

  const { data, error } = await client
    .from("site_settings")
    .select(
      "id,headline,tagline,mission_md,email,discord_url,instagram_handle,calendar_feed_url,stats"
    )
    .limit(1)
    .maybeSingle();

  if (error || !data) return fallbackSiteSettings;

  const row = data as DbSiteSettings;
  return {
    headline: row.headline ?? fallbackSiteSettings.headline,
    tagline: row.tagline ?? fallbackSiteSettings.tagline,
    mission: row.mission_md ?? fallbackSiteSettings.mission,
    email: row.email ?? fallbackSiteSettings.email,
    discordUrl: row.discord_url ?? fallbackSiteSettings.discordUrl,
    instagramHandle: row.instagram_handle ?? fallbackSiteSettings.instagramHandle,
    calendarFeedUrl: row.calendar_feed_url ?? fallbackSiteSettings.calendarFeedUrl,
    stats: {
      members: row.stats?.members ?? fallbackSiteSettings.stats.members,
      events: row.stats?.events ?? fallbackSiteSettings.stats.events,
      partners: row.stats?.partners ?? fallbackSiteSettings.stats.partners,
      newsletter: row.stats?.newsletter ?? fallbackSiteSettings.stats.newsletter,
    },
  };
}
