import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { requireMember } from "@/lib/auth";
import { getActivePerksForMembers } from "@/lib/supabase/server";

export default async function PerksPage() {
  await requireMember();
  const perks = await getActivePerksForMembers();

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Perks & discount codes"
        description="Public locked state now; full member grid unlocks after SUNet sign-in."
        eyebrow="Perks"
      />

      <Card>
        <p className="text-lg font-semibold">Member codes</p>
        <p className="mt-2 text-sm text-zinc-600">
          Active and expiring perks are shown below. Expired perks are hidden automatically.
        </p>
      </Card>

      <Card title="Available perks">
        <div className="grid gap-3 md:grid-cols-2">
          {perks.map((perk) => (
            <div key={perk.id} className="rounded-md border border-zinc-200 p-3 text-sm">
              <p className="font-semibold text-zinc-900">{perk.partnerName}</p>
              <p className="text-zinc-700">{perk.offer}</p>
              <p className="text-zinc-600">Category: {perk.category}</p>
              <p className="text-zinc-600">Code: {perk.code}</p>
              <p className="text-zinc-600">
                Expires: {perk.expiresAt ? new Date(perk.expiresAt).toLocaleDateString() : "rolling"}
              </p>
              {perk.redemptionUrl ? (
                <a
                  href={perk.redemptionUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-medium text-zinc-900 hover:underline"
                >
                  Redeem →
                </a>
              ) : null}
              {perk.memberNotes ? <p className="mt-2 text-xs text-zinc-500">{perk.memberNotes}</p> : null}
            </div>
          ))}
        </div>
        {perks.length === 0 ? (
          <p className="text-sm text-zinc-600">No active perks available right now.</p>
        ) : null}
      </Card>
    </section>
  );
}
