import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";

const officers = [
  "Priya Kumar — President",
  "Marcus Lee — VP Programming",
  "Lin Zhao — VP Education",
  "Sam Park — VP Partners",
];

export default function AboutPage() {
  return (
    <section className="space-y-6">
      <SectionHeader
        title="About AI Club"
        description="Founded in 2022. Open to all Stanford students. We host weekly events, run reading groups, and ship side projects together."
        eyebrow="About / Team"
      />

      <Card title="Club stats">
        <p className="text-sm text-zinc-600">
          240 members · 38 events hosted · 12 partners · 1.2k newsletter readers
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
          <li>hello@aiclub</li>
          <li>discord.gg/aiclub</li>
          <li>@stanford.aiclub</li>
        </ul>
      </Card>
    </section>
  );
}
