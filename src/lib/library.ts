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
  thumbnailUrl: string | null;
  provider: "youtube" | "vimeo" | "loom";
};

function youtubeThumbnail(id: string): string {
  // hqdefault is universally available; sd/maxres aren't always.
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

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
    if (id) {
      return {
        embedUrl: `https://www.youtube.com/embed/${id}`,
        thumbnailUrl: youtubeThumbnail(id),
        provider: "youtube",
      };
    }
  }
  if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
    const id = parsed.searchParams.get("v");
    if (id) {
      return {
        embedUrl: `https://www.youtube.com/embed/${id}`,
        thumbnailUrl: youtubeThumbnail(id),
        provider: "youtube",
      };
    }
    // Already an /embed/<id> URL
    if (parsed.pathname.startsWith("/embed/")) {
      const embedId = parsed.pathname.replace("/embed/", "").split("/")[0];
      return {
        embedUrl: parsed.toString(),
        thumbnailUrl: embedId ? youtubeThumbnail(embedId) : null,
        provider: "youtube",
      };
    }
  }
  if (host.endsWith("vimeo.com")) {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    if (id && /^\d+$/.test(id)) {
      // Vimeo thumbnail URLs require an API hit; not derivable from the URL.
      return {
        embedUrl: `https://player.vimeo.com/video/${id}`,
        thumbnailUrl: null,
        provider: "vimeo",
      };
    }
  }
  if (host.endsWith("loom.com")) {
    const id = parsed.pathname.split("/").filter(Boolean).pop();
    if (id) {
      return {
        embedUrl: `https://www.loom.com/embed/${id}`,
        thumbnailUrl: null,
        provider: "loom",
      };
    }
  }
  return null;
}

/**
 * Resolve the best thumbnail to render for a library item. Priority:
 *   1. Manually set image_url
 *   2. Derived thumbnail (YouTube only — Vimeo/Loom return null)
 *   3. null
 */
export function resolveLibraryItemThumbnail(
  imageUrl: string | null,
  externalUrl: string | null
): string | null {
  if (imageUrl) return imageUrl;
  if (!externalUrl) return null;
  const embed = getVideoEmbed(externalUrl);
  return embed?.thumbnailUrl ?? null;
}
