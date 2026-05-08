import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { CreateMemberForm } from "@/app/admin/members/create-member-form";
import { MemberRow } from "@/app/admin/members/member-row";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { getMembersForAdmin } from "@/lib/supabase/server";

export default async function AdminMembersPage() {
  const members = await getMembersForAdmin();
  const isSupabaseConfigured = hasSupabasePublicEnv();

  const officers = members.filter(
    (m) => m.role === "officer" || m.role === "president"
  );
  const regularMembers = members.filter((m) => m.role === "member");

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Admin / Members"
        title="Members and officers"
        description="Add new officers, edit names, photos, LinkedIn URLs, roles, and titles."
      />

      <Card title="Add a member">
        {!isSupabaseConfigured ? (
          <p className="mb-3 text-sm text-amber-700">
            Supabase env vars are not set. Create/update actions are disabled.
          </p>
        ) : null}
        <CreateMemberForm disabled={!isSupabaseConfigured} />
      </Card>

      <Card title={`Officers and presidents (${officers.length})`}>
        <div className="space-y-3">
          {officers.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              disabled={!isSupabaseConfigured}
            />
          ))}
          {officers.length === 0 ? (
            <p className="text-sm text-zinc-600">No officers yet.</p>
          ) : null}
        </div>
      </Card>

      <Card title={`Members (${regularMembers.length})`}>
        <div className="space-y-3">
          {regularMembers.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              disabled={!isSupabaseConfigured}
            />
          ))}
          {regularMembers.length === 0 ? (
            <p className="text-sm text-zinc-600">
              No regular members yet. Members are added automatically when they sign in
              with their @stanford.edu account.
            </p>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
