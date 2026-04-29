import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";

export default function PerksPage() {
  return (
    <section className="space-y-6">
      <SectionHeader
        title="Perks & discount codes"
        description="Public locked state now; full member grid unlocks after SUNet sign-in."
        eyebrow="Perks"
      />

      <Card>
        <p className="text-lg font-semibold">Members only</p>
        <p className="mt-2 text-sm text-zinc-600">
          Sign in with your Stanford email to reveal discount codes from club
          partners.
        </p>
        <button className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Sign in with SUNet
        </button>
      </Card>

      <Card title="Preview">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {["Anthropic", "OpenAI", "Modal", "Cursor"].map((partner) => (
            <div key={partner} className="rounded-md bg-zinc-100 p-3 text-sm text-zinc-600">
              {partner} · hidden
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
