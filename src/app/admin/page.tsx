import { AttentionList } from "@/app/admin/attention-list";
import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { requireOfficer } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/supabase/server";

function firstName(fullName: string | null, email: string): string {
  if (fullName && fullName.trim()) return fullName.trim().split(/\s+/)[0]!;
  return email.split("@")[0]!;
}

export default async function AdminDashboardPage() {
  const member = await requireOfficer();
  const { stats, attention } = await getAdminDashboardData();
  const name = firstName(member.full_name, member.email);

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Admin / Dashboard"
        title={`Welcome back, ${name}`}
        description="Quick actions and high-level club operations metrics."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Members">
          <p className="text-2xl font-semibold">{stats.membersCount}</p>
          <p className="text-sm text-zinc-600">
            Stanford accounts in the directory
          </p>
        </Card>
        <Card title="Upcoming events">
          <p className="text-2xl font-semibold">{stats.upcomingEventsCount}</p>
          <p className="text-sm text-zinc-600">
            {stats.nextEventLabel ? `Next: ${stats.nextEventLabel}` : "Nothing scheduled"}
          </p>
        </Card>
        <Card title="Library items">
          <p className="text-2xl font-semibold">{stats.libraryItemsCount}</p>
          <p className="text-sm text-zinc-600">
            {stats.newLibraryThisWeek > 0
              ? `+${stats.newLibraryThisWeek} this week`
              : "Published articles + videos"}
          </p>
        </Card>
        <Card title="Active perks">
          <p className="text-2xl font-semibold">{stats.activePerksCount}</p>
          <p className="text-sm text-zinc-600">
            {stats.perksExpiringSoonCount > 0
              ? `${stats.perksExpiringSoonCount} expiring soon`
              : "Currently available"}
          </p>
        </Card>
      </div>

      <Card title="Needs your attention">
        <AttentionList items={attention} />
      </Card>
    </section>
  );
}
