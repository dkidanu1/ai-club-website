import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import {
  createArticleItemAction,
  createGranolaItemAction,
  updateLibraryItemStatusAction,
} from "@/app/admin/library/actions";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { getLibraryItemsForAdmin } from "@/lib/supabase/server";

export default async function AdminLibraryPage() {
  const items = await getLibraryItemsForAdmin();
  const isSupabaseConfigured = hasSupabasePublicEnv();

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Admin / Library"
        title="Knowledge library manager"
        description="Manage transcript and article records, status, tags, and linked events."
      />

      <Card title="Add article link">
        {!isSupabaseConfigured ? (
          <p className="mb-3 text-sm text-amber-700">Supabase env vars are not set.</p>
        ) : null}
        <form action={createArticleItemAction} className="grid gap-2 md:grid-cols-2">
          <input
            name="title"
            required
            placeholder="Article title"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="externalUrl"
            required
            placeholder="https://..."
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="sourceName"
            placeholder="Source name"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="tags"
            placeholder="tags, comma, separated"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <textarea
            name="excerpt"
            rows={3}
            placeholder="Short excerpt"
            disabled={!isSupabaseConfigured}
            className="md:col-span-2 rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <button
            disabled={!isSupabaseConfigured}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:bg-zinc-400"
          >
            Add article draft
          </button>
        </form>
      </Card>

      <Card title="Paste granola transcript">
        <form action={createGranolaItemAction} className="grid gap-2">
          <input
            name="title"
            required
            placeholder="Transcript title"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <input
            name="tags"
            placeholder="tags, comma, separated"
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <textarea
            name="fullText"
            rows={6}
            required
            placeholder="Paste transcript text here..."
            disabled={!isSupabaseConfigured}
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
          />
          <button
            disabled={!isSupabaseConfigured}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:bg-zinc-400"
          >
            Add transcript draft
          </button>
        </form>
      </Card>

      <Card title="Library queue">
        <div className="space-y-2 text-sm text-zinc-700">
          {items.map((item) => (
            <div key={item.id} className="rounded-md border border-zinc-200 p-3">
              <p className="font-medium">
                {item.type === "granola" ? "≡ " : "📄 "}
                {item.title}
              </p>
              <p className="text-zinc-600">
                {item.status} · {item.tags.join(", ") || "no tags"}
              </p>
              <form action={updateLibraryItemStatusAction} className="mt-2 flex gap-2">
                <input type="hidden" name="id" value={item.id} />
                <select
                  name="status"
                  defaultValue={item.status}
                  disabled={!isSupabaseConfigured}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
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
          {items.length === 0 ? <p className="text-zinc-600">No library items yet.</p> : null}
        </div>
      </Card>
    </section>
  );
}
