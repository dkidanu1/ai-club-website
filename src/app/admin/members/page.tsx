import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";

export default function AdminMembersPage() {
  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Admin / Members"
        title="Members and officers"
        description="Search members, manage roles, and approve pending Stanford sign-ins."
      />

      <Card title="Summary">
        <p className="text-sm text-zinc-600">
          240 members · 9 officers · 8 pending approvals
        </p>
      </Card>

      <Card title="Member list preview">
        <ul className="space-y-2 text-sm text-zinc-600">
          <li>Priya Kumar · priya@stanford.edu · President</li>
          <li>Marcus Lee · mlee@stanford.edu · VP Programming</li>
          <li>Ana Rivera · ana@stanford.edu · Pending approval</li>
        </ul>
      </Card>
    </section>
  );
}
