import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";

const rows = [
  "Fireside chat — Dr. Fei-Fei Li · May 5 · Published · 124/180",
  "Hack night: building agents · May 9 · Published · 41/100",
  "Reading group — RLHF papers · May 14 · Published · 22/—",
  "Talk: AI policy panel · TBD · Draft · —",
];

export default function AdminEventsPage() {
  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Admin / Events"
        title="Events manager"
        description="Create, edit, and publish events. Excel sync integration lands in a later step."
      />

      <Card title="Filters">
        <div className="flex flex-wrap gap-2 text-xs">
          {["All", "Upcoming", "Past", "Drafts", "Sort by date"].map((chip) => (
            <span key={chip} className="rounded-full border border-zinc-300 px-3 py-1">
              {chip}
            </span>
          ))}
        </div>
      </Card>

      <Card title="Event rows">
        <ul className="space-y-2 text-sm text-zinc-600">
          {rows.map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
