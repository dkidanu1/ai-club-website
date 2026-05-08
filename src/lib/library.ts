import { toSlug } from "@/lib/events";

export type LibraryItemType = "article" | "video";

export type LibraryItemRecord = {
  id: string;
  slug: string;
  title: string;
  type: LibraryItemType;
  excerpt: string;
  externalUrl: string | null;
  imageUrl: string | null;
  sourceName: string | null;
  tags: string[];
  status: "draft" | "published";
  publishedAt: string | null;
};

export const fallbackLibraryItems: LibraryItemRecord[] = [
  {
    id: "lib-1",
    slug: toSlug("Eval beyond benchmarks"),
    title: "Eval beyond benchmarks",
    type: "article",
    excerpt: "A curated article on practical evaluation methods.",
    externalUrl: "https://example.com/eval-beyond-benchmarks",
    imageUrl: null,
    sourceName: "AI Club Blog",
    tags: ["eval"],
    status: "published",
    publishedAt: "2026-04-16T08:00:00.000Z",
  },
];

export type VideoEmbed = {
  embedUrl: string;
  provider: "youtube" | "vimeo" | "loom";
};

export function getVideoEmbed(url: string): VideoEmbed | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  const host = parsed.hostname.toLowerCase();

  if (host === "youtu.be") {
    const id = parsed.pathname.replace(/^\//, "").split("/")[0];
    if (id) return { embedUrl: `https://www.youtube.com/embed/${id}`, provider: "youtube" };
  }
  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const id = parsed.searchParams.get("v");
    if (id) return { embedUrl: `https://www.youtube.com/embed/${id}`, provider: "youtube" };
    // Already an /embed/ URL
    if (parsed.pathname.startsWith("/embed/")) {
      return { embedUrl: parsed.toString(), provider: "youtube" };
    }
  }
  if (host.endsWith("vimeo.com")) {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    if (id && /^\d+$/.test(id)) {
      return { embedUrl: `https://player.vimeo.com/video/${id}`, provider: "vimeo" };
    }
  }
  if (host.endsWith("loom.com")) {
    const id = parsed.pathname.split("/").filter(Boolean).pop();
    if (id) return { embedUrl: `https://www.loom.com/embed/${id}`, provider: "loom" };
  }
  return null;
}
