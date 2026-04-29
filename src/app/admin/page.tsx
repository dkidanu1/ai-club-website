import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";

export default function AdminDashboardPage() {
  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Admin / Dashboard"
        title="Welcome back, Priya"
        description="Quick actions and high-level club operations metrics."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Members">
          <p className="text-2xl font-semibold">240</p>
          <p className="text-sm text-zinc-600">+12 this week</p>
        </Card>
        <Card title="Upcoming events">
          <p className="text-2xl font-semibold">3</p>
          <p className="text-sm text-zinc-600">Next: tonight at 6pm</p>
        </Card>
        <Card title="Library items">
          <p className="text-2xl font-semibold">87</p>
          <p className="text-sm text-zinc-600">+4 this week</p>
        </Card>
        <Card title="Active perks">
          <p className="text-2xl font-semibold">12</p>
          <p className="text-sm text-zinc-600">2 expiring in &lt;30d</p>
        </Card>
      </div>

      <Card title="Needs your attention">
        <ul className="space-y-2 text-sm text-zinc-600">
          <li>Fireside event is missing Zoom link.</li>
          <li>Apr 24 transcript is ready to review and publish.</li>
          <li>Cursor partner perk expires in 3 days.</li>
        </ul>
      </Card>
    </section>
  );
}
