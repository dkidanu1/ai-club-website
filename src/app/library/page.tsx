import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { VideoPlayerCard } from "@/app/library/video-player-card";
import { requireMember } from "@/lib/auth";
import { type LibraryItemRecord } from "@/lib/library";
import { getPublishedLibraryItems } from "@/lib/supabase/server";

function ArticleCard({ item }: { item: LibraryItemRecord }) {
  return (
    <a
      href={item.externalUrl ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group block overflow-hidden rounded-md border border-zinc-200 bg-white transition hover:border-zinc-400"
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.title}
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div className="grid aspect-video w-full place-items-center bg-zinc-100 text-xs text-zinc-500">
          No image
        </div>
      )}
      <div className="p-3">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500">
          {item.sourceName ?? "Article"}
        </p>
        <h3 className="mt-1 font-medium text-zinc-900 group-hover:underline">
          {item.title}
        </h3>
        {item.excerpt ? (
          <p className="mt-1 line-clamp-3 text-sm text-zinc-600">{item.excerpt}</p>
        ) : null}
        {item.tags.length > 0 ? (
          <p className="mt-2 text-[11px] text-zinc-500">
            {item.tags.map((t) => `#${t}`).join(" ")}
          </p>
        ) : null}
      </div>
    </a>
  );
}

export default async function LibraryPage() {
  await requireMember();
  const items = await getPublishedLibraryItems();

  const articles = items.filter((item) => item.type === "article");
  const videos = items.filter((item) => item.type === "video");

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Knowledge library"
        description="Articles we're reading and videos we're watching."
        eyebrow="Library"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title={`Articles (${articles.length})`}>
          {articles.length === 0 ? (
            <p className="text-sm text-zinc-600">No articles yet.</p>
          ) : (
            <div className="grid gap-3">
              {articles.map((item) => (
                <ArticleCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </Card>

        <Card title={`Videos (${videos.length})`}>
          {videos.length === 0 ? (
            <p className="text-sm text-zinc-600">No videos yet.</p>
          ) : (
            <div className="grid gap-3">
              {videos.map((item) => (
                <VideoPlayerCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </Card>
      </div>
    </section>
  );
}
