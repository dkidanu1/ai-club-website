import { Card } from "@/components/card";
import { OfficerTile } from "@/components/officer-tile";
import { SectionHeader } from "@/components/section-header";
import { getOfficers, getSiteSettings } from "@/lib/supabase/server";

export default async function AboutPage() {
  const [settings, officers] = await Promise.all([getSiteSettings(), getOfficers()]);

  return (
    <section className="space-y-6">
      <SectionHeader
        title="About AI Club"
        description={settings.mission}
        eyebrow="About / Team"
      />

      <Card title="Club stats">
        <p className="text-sm text-zinc-600">
          {settings.stats.members} members · {settings.stats.events} events hosted ·{" "}
          {settings.stats.partners} partners · {settings.stats.newsletter} newsletter readers
        </p>
      </Card>

      <Card title="Team">
        {officers.length === 0 ? (
          <p className="text-sm text-zinc-600">
            No officers listed yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {officers.map((officer) => (
              <OfficerTile key={officer.id} officer={officer} />
            ))}
          </div>
        )}
      </Card>

      <Card title="Get in touch">
        <ul className="space-y-1 text-sm text-zinc-600">
          <li>{settings.email}</li>
          <li>{settings.discordUrl}</li>
          <li>{settings.instagramHandle}</li>
        </ul>
      </Card>
    </section>
  );
}
