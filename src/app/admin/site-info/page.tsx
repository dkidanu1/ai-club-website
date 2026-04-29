import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";

export default function AdminSiteInfoPage() {
  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Admin / Site info"
        title="Public site content settings"
        description="Edit hero copy, mission text, contact links, and officer profile content."
      />

      <Card title="Hero and mission">
        <p className="text-sm text-zinc-600">
          Headline, tagline, mission paragraph, and team photo upload are ready
          for form wiring.
        </p>
      </Card>

      <Card title="Contact and social">
        <ul className="space-y-2 text-sm text-zinc-600">
          <li>Email: hello@aiclub</li>
          <li>Discord: discord.gg/aiclub</li>
          <li>Instagram: @stanford.aiclub</li>
        </ul>
      </Card>
    </section>
  );
}
