import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";

export default function AdminPerksPage() {
  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Admin / Perks"
        title="Perks manager"
        description="Add, edit, and archive partner offers and discount codes."
      />

      <Card title="Status overview">
        <p className="text-sm text-zinc-600">
          12 active · 2 expiring soon · 4 archived
        </p>
      </Card>

      <Card title="Recent perks">
        <ul className="space-y-2 text-sm text-zinc-600">
          <li>Anthropic · $200 credits · active</li>
          <li>OpenAI · 50% off Pro · active</li>
          <li>Cursor · Free Pro 6mo · expiring</li>
        </ul>
      </Card>
    </section>
  );
}
