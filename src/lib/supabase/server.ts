import { createClient } from "@supabase/supabase-js";

import { fallbackEvents, toSlug, type EventRecord } from "@/lib/events";
import { fallbackLibraryItems, type LibraryItemRecord } from "@/lib/library";
import { fallbackPerks, type PerkRecord } from "@/lib/perks";
import { fallbackSiteSettings, type SiteSettingsRecord } from "@/lib/site-settings";
import { getSupabasePublicKey, hasSupabasePublicEnv } from "@/lib/supabase/env";

type DbEvent = {
  id: string;
  title: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  rsvp_count: number | null;
  capacity: number | null;
  rsvp_url: string | null;
  event_type: "talk" | "hack" | "reading" | "social";
  description_md: string | null;
  agenda: Array<{ time?: string; item?: string }> | null;
  status: "draft" | "published" | "past" | "cancelled";
  guest_name: string | null;
  guest_company: string | null;
  summary: string | null;
  photo_url: string | null;
};

function hasSupabaseEnv() {
  return hasSupabasePublicEnv();
}

function mapDbEvent(event: DbEvent): EventRecord {
  return {
    id: event.id,
    slug: toSlug(event.title),
    title: event.title,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
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
    guestName: event.guest_name,
    guestCompany: event.guest_company,
    status: event.status,
    summary: event.summary,
    photoUrl: event.photo_url,
  };
}

export async function getPublishedEvents(): Promise<EventRecord[]> {
  if (!hasSupabaseEnv()) return fallbackEvents;

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    getSupabasePublicKey() as string
  );

  const { data, error } = await client
    .from("events")
    .select(
      "id,title,starts_at,ends_at,location,rsvp_count,capacity,rsvp_url,event_type,description_md,agenda,status,guest_name,guest_company,summary,photo_url"
    )
    .in("status", ["published", "past", "cancelled"])
    .order("starts_at", { ascending: true });

  if (error || !data) return fallbackEvents;
  return (data as DbEvent[]).map(mapDbEvent);
}

export async function getEventBySlug(slug: string): Promise<EventRecord | null> {
  const events = await getPublishedEvents();
  return events.find((event) => event.slug === slug) ?? null;
}

export async function getUpcomingEvents(limit = 5): Promise<EventRecord[]> {
  if (!hasSupabaseEnv()) return [];

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    getSupabasePublicKey() as string
  );

  const { data, error } = await client
    .from("events")
    .select(
      "id,title,starts_at,ends_at,location,rsvp_count,capacity,rsvp_url,event_type,description_md,agenda,status,guest_name,guest_company,summary,photo_url"
    )
    .in("status", ["published", "past", "cancelled"])
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true })
    .limit(limit);

  if (error || !data) return [];
  return (data as DbEvent[]).map(mapDbEvent);
}

export type AdminEventRecord = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  location: string;
  eventType: "talk" | "hack" | "reading" | "social";
  status: "draft" | "published" | "past" | "cancelled";
  rsvpUrl: string | null;
  description: string;
  agenda: Array<{ time: string; item: string }>;
  guestName: string | null;
  guestCompany: string | null;
  summary: string | null;
  photoUrl: string | null;
};

export async function getEventsForAdmin(): Promise<AdminEventRecord[]> {
  if (!hasSupabaseEnv()) {
    return fallbackEvents.map((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      location: event.location,
      eventType: event.eventType,
      status: "published",
      rsvpUrl: event.rsvpUrl,
      description: event.description,
      agenda: event.agenda,
      guestName: event.guestName,
      guestCompany: event.guestCompany,
      summary: event.summary,
      photoUrl: event.photoUrl,
    }));
  }

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    getSupabasePublicKey() as string
  );

  const { data, error } = await client
    .from("events")
    .select(
      "id,title,starts_at,ends_at,location,event_type,status,rsvp_count,capacity,rsvp_url,description_md,agenda,guest_name,guest_company,summary,photo_url"
    )
    .order("starts_at", { ascending: false });

  if (error || !data) return [];

  return (data as DbEvent[]).map((event) => ({
    id: event.id,
    title: event.title,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    location: event.location ?? "TBD",
    eventType: event.event_type,
    status: event.status,
    rsvpUrl: event.rsvp_url,
    description: event.description_md ?? "",
    agenda:
      event.agenda?.map((entry) => ({
        time: entry.time ?? "",
        item: entry.item ?? "",
      })) ?? [],
    guestName: event.guest_name,
    guestCompany: event.guest_company,
    summary: event.summary,
    photoUrl: event.photo_url,
  }));
}

type DbOfficer = {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  linkedin_url: string | null;
  role: "officer" | "president";
  officer_title: string | null;
  display_order: number | null;
};

export type OfficerRecord = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  role: "officer" | "president";
  officerTitle: string | null;
  displayOrder: number;
};

export async function getOfficers(): Promise<OfficerRecord[]> {
  if (!hasSupabaseEnv()) return [];

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    getSupabasePublicKey() as string
  );

  const { data, error } = await client
    .from("members")
    .select(
      "id,full_name,email,avatar_url,linkedin_url,role,officer_title,display_order"
    )
    .in("role", ["officer", "president"])
    .order("display_order", { ascending: true })
    .order("full_name", { ascending: true });

  if (error || !data) return [];

  return (data as DbOfficer[]).map((row) => ({
    id: row.id,
    fullName: row.full_name ?? "",
    email: row.email,
    avatarUrl: row.avatar_url,
    linkedinUrl: row.linkedin_url,
    role: row.role,
    officerTitle: row.officer_title,
    displayOrder: row.display_order ?? 0,
  }));
}

export type AdminMemberRecord = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  role: "member" | "officer" | "president";
  officerTitle: string | null;
  displayOrder: number;
};

export async function getMembersForAdmin(): Promise<AdminMemberRecord[]> {
  if (!hasSupabaseEnv()) return [];

  const client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    getSupabasePublicKey() as string
  );

  const { data, error } = await client
    .from("members")
    .select("id,email,full_name,avatar_url,linkedin_url,role,officer_title,display_order")
    .order("role", { ascending: true })
    .order("display_order", { ascending: true })
    .order("full_name", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    email: row.email,
    fullName: row.full_name ?? "",
    avatarUrl: row.avatar_url,
    linkedinUrl: row.linkedin_url,
    role: row.role,
    officerTitle: row.officer_title,
    displayOrder: row.display_order ?? 0,
  }));
}

type DbLibraryItem = {
  id: string;
  title: string;
  type: "article" | "video";
  external_url: string | null;
  image_url: string | null;
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
    excerpt: item.excerpt ?? "",
    externalUrl: item.external_url,
    imageUrl: item.image_url,
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
    getSupabasePublicKey() as string
  );

  const { data, error } = await client
    .from("library_items")
    .select(
      "id,title,type,external_url,image_url,source_name,excerpt,tags,status,published_at"
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
    getSupabasePublicKey() as string
  );

  const { data, error } = await client
    .from("library_items")
    .select(
      "id,title,type,external_url,image_url,source_name,excerpt,tags,status,published_at"
    )
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return (data as DbLibraryItem[]).map(mapDbLibraryItem);
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
            getSupabasePublicKey() as string
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
    getSupabasePublicKey() as string
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
    getSupabasePublicKey() as string
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
