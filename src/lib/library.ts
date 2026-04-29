import { toSlug } from "@/lib/events";

export type LibraryItemRecord = {
  id: string;
  slug: string;
  title: string;
  type: "granola" | "article";
  excerpt: string;
  fullText: string | null;
  wordCount: number | null;
  externalUrl: string | null;
  sourceName: string | null;
  tags: string[];
  status: "draft" | "published";
  publishedAt: string | null;
};

export const fallbackLibraryItems: LibraryItemRecord[] = [
  {
    id: "lib-1",
    slug: toSlug("Transcript — LLM internals night"),
    title: "Transcript — LLM internals night",
    type: "granola",
    excerpt: "A full transcript from our Apr 24 event with timestamps and sections.",
    fullText:
      "00:02 — Marcus: Welcome everyone... 00:18 — Lin: Today we break down tokenization...",
    wordCount: 12148,
    externalUrl: null,
    sourceName: null,
    tags: ["llms", "agents"],
    status: "published",
    publishedAt: "2026-04-24T08:00:00.000Z",
  },
  {
    id: "lib-2",
    slug: toSlug("Eval beyond benchmarks"),
    title: "Eval beyond benchmarks",
    type: "article",
    excerpt: "A curated article on practical evaluation methods.",
    fullText: null,
    wordCount: null,
    externalUrl: "https://example.com/eval-beyond-benchmarks",
    sourceName: "AI Club Blog",
    tags: ["eval"],
    status: "published",
    publishedAt: "2026-04-16T08:00:00.000Z",
  },
];
