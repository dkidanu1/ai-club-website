import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import {
  CreateArticleForm,
  CreateVideoForm,
  FeaturedHeadlineForm,
  LibraryItemRow,
} from "@/app/admin/library/library-forms";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import {
  getLibraryItemsForAdmin,
  getSiteSettings,
} from "@/lib/supabase/server";

export default async function AdminLibraryPage() {
  const [items, settings] = await Promise.all([
    getLibraryItemsForAdmin(),
    getSiteSettings(),
  ]);
  const isSupabaseConfigured = hasSupabasePublicEnv();

  const articles = items.filter((item) => item.type === "article");
  const videos = items.filter((item) => item.type === "video");

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Admin / Library"
        title="Knowledge library manager"
        description="Drop article URLs (we auto-fetch the OG image) or paste YouTube/Vimeo/Loom links."
      />

      {!isSupabaseConfigured ? (
        <Card>
          <p className="text-sm text-amber-700">
            Supabase env vars are not set. Create/update actions are disabled.
          </p>
        </Card>
      ) : null}

      <Card title="Featured headline (home page)">
        <FeaturedHeadlineForm
          disabled={!isSupabaseConfigured}
          initialHeadline={settings.featuredHeadline}
          initialUrl={settings.featuredUrl}
        />
      </Card>

      <Card title="Add article">
        <CreateArticleForm disabled={!isSupabaseConfigured} />
      </Card>

      <Card title="Add video">
        <CreateVideoForm disabled={!isSupabaseConfigured} />
      </Card>

      <Card title={`Articles (${articles.length})`}>
        <div className="space-y-2">
          {articles.map((item) => (
            <LibraryItemRow
              key={item.id}
              item={item}
              disabled={!isSupabaseConfigured}
            />
          ))}
          {articles.length === 0 ? (
            <p className="text-sm text-zinc-600">No articles yet.</p>
          ) : null}
        </div>
      </Card>

      <Card title={`Videos (${videos.length})`}>
        <div className="space-y-2">
          {videos.map((item) => (
            <LibraryItemRow
              key={item.id}
              item={item}
              disabled={!isSupabaseConfigured}
            />
          ))}
          {videos.length === 0 ? (
            <p className="text-sm text-zinc-600">No videos yet.</p>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
