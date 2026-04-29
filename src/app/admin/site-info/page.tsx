import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { saveSiteSettingsAction } from "@/app/admin/site-info/actions";
import { getSiteSettings } from "@/lib/supabase/server";

export default async function AdminSiteInfoPage() {
  const settings = await getSiteSettings();
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Admin / Site info"
        title="Public site content settings"
        description="Edit hero copy, mission text, contact links, and officer profile content."
      />

      <Card title="Edit public site settings">
        {!isSupabaseConfigured ? (
          <p className="mb-3 text-sm text-amber-700">Supabase env vars are not set.</p>
        ) : null}
        <form action={saveSiteSettingsAction} className="grid gap-2 md:grid-cols-2">
          <input
            name="headline"
            defaultValue={settings.headline}
            placeholder="Headline"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="tagline"
            defaultValue={settings.tagline}
            placeholder="Tagline"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <textarea
            name="mission"
            rows={4}
            defaultValue={settings.mission}
            placeholder="Mission text"
            disabled={!isSupabaseConfigured}
            className="md:col-span-2 rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="email"
            defaultValue={settings.email}
            placeholder="Email"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="discordUrl"
            defaultValue={settings.discordUrl}
            placeholder="Discord URL"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="instagramHandle"
            defaultValue={settings.instagramHandle}
            placeholder="Instagram"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="calendarFeedUrl"
            defaultValue={settings.calendarFeedUrl}
            placeholder="Calendar feed URL"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="members"
            type="number"
            min={0}
            defaultValue={settings.stats.members}
            placeholder="Members"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="events"
            type="number"
            min={0}
            defaultValue={settings.stats.events}
            placeholder="Events"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="partners"
            type="number"
            min={0}
            defaultValue={settings.stats.partners}
            placeholder="Partners"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="newsletter"
            defaultValue={settings.stats.newsletter}
            placeholder="Newsletter count label"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <button
            disabled={!isSupabaseConfigured}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:bg-zinc-400"
          >
            Save settings
          </button>
        </form>
      </Card>
    </section>
  );
}
