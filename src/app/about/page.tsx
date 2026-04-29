import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { getSiteSettings } from "@/lib/supabase/server";

const officers = [
  "Priya Kumar — President",
  "Marcus Lee — VP Programming",
  "Lin Zhao — VP Education",
  "Sam Park — VP Partners",
];

export default async function AboutPage() {
  const settings = await getSiteSettings();

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

      <Card title="Officers (2025/26)">
        <ul className="mt-3 space-y-2 text-sm text-zinc-600">
          {officers.map((officer) => (
            <li key={officer}>{officer}</li>
          ))}
        </ul>
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
