import Link from "next/link";

import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { requireMember } from "@/lib/auth";
import { getPublishedLibraryItems } from "@/lib/supabase/server";

export default async function LibraryPage() {
  await requireMember();
  const items = await getPublishedLibraryItems();

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Knowledge library"
        description="Talks, articles, and granola transcripts in one mixed feed."
        eyebrow="Library"
      />

      <Card>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {["All", "Video", "Article", "Granola", "Newest"].map((filter) => (
            <span
              key={filter}
              className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-xs"
            >
              {filter}
            </span>
          ))}
        </div>
        <ul className="mt-3 space-y-2 text-sm text-zinc-600">
          {items.map((item) => (
            <li key={item.id} className="rounded-md border border-zinc-200 p-3">
              <p className="font-medium text-zinc-900">
                {item.type === "granola" ? "≡ " : "📄 "}
                {item.title}
              </p>
              <p>{item.excerpt}</p>
              <p className="mt-1 text-xs">
                {item.tags.join(", ") || "untagged"}
                {item.wordCount ? ` · ${item.wordCount} words` : ""}
              </p>
              {item.type === "article" && item.externalUrl ? (
                <a
                  href={item.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-medium text-zinc-900 hover:underline"
                >
                  Open article →
                </a>
              ) : (
                <Link
                  href={`/library/${item.slug}`}
                  className="mt-2 inline-block font-medium text-zinc-900 hover:underline"
                >
                  Open transcript →
                </Link>
              )}
            </li>
          ))}
          {items.length === 0 ? <li>No published items yet.</li> : null}
        </ul>
      </Card>
    </section>
  );
}
