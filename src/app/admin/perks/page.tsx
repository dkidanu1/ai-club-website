import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { createPerkAction, updatePerkStatusAction } from "@/app/admin/perks/actions";
import { getPerksForAdmin } from "@/lib/supabase/server";

export default async function AdminPerksPage() {
  const perks = await getPerksForAdmin();
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const active = perks.filter((perk) => perk.status === "active").length;
  const expiring = perks.filter((perk) => perk.status === "expiring").length;
  const archived = perks.filter((perk) => perk.status === "archived").length;

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Admin / Perks"
        title="Perks manager"
        description="Add, edit, and archive partner offers and discount codes."
      />

      <Card title="Status overview">
        <p className="text-sm text-zinc-600">
          {active} active · {expiring} expiring soon · {archived} archived
        </p>
      </Card>

      <Card title="Add new perk">
        {!isSupabaseConfigured ? (
          <p className="mb-3 text-sm text-amber-700">Supabase env vars are not set.</p>
        ) : null}
        <form action={createPerkAction} className="grid gap-2 md:grid-cols-2">
          <input
            name="partnerName"
            required
            placeholder="Partner name"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <select
            name="category"
            defaultValue="tools"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          >
            <option value="api">API credits</option>
            <option value="compute">Compute</option>
            <option value="tools">Tools</option>
            <option value="learning">Learning</option>
          </select>
          <input
            name="offer"
            required
            placeholder="Offer"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="code"
            required
            placeholder="Code"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="redemptionUrl"
            placeholder="Redemption URL"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="expiresAt"
            type="date"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <textarea
            name="memberNotes"
            rows={2}
            placeholder="Member notes"
            disabled={!isSupabaseConfigured}
            className="md:col-span-2 rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <button
            disabled={!isSupabaseConfigured}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:bg-zinc-400"
          >
            Add perk
          </button>
        </form>
      </Card>

      <Card title="Perk rows">
        <div className="space-y-2 text-sm text-zinc-700">
          {perks.map((perk) => (
            <div key={perk.id} className="rounded-md border border-zinc-200 p-3">
              <p className="font-medium">
                {perk.partnerName} · {perk.offer}
              </p>
              <p className="text-zinc-600">
                {perk.category} · code: {perk.code}
              </p>
              <p className="text-zinc-600">
                expires: {perk.expiresAt ? new Date(perk.expiresAt).toLocaleDateString() : "rolling"}
              </p>
              <form action={updatePerkStatusAction} className="mt-2 flex gap-2">
                <input type="hidden" name="id" value={perk.id} />
                <select
                  name="status"
                  defaultValue={perk.status}
                  disabled={!isSupabaseConfigured}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
                >
                  <option value="active">active</option>
                  <option value="expiring">expiring</option>
                  <option value="archived">archived</option>
                </select>
                <button
                  disabled={!isSupabaseConfigured}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:text-zinc-400"
                >
                  Update
                </button>
              </form>
            </div>
          ))}
          {perks.length === 0 ? <p className="text-zinc-600">No perks yet.</p> : null}
        </div>
      </Card>
    </section>
  );
}
