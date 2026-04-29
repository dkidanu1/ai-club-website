import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";

const libraryItems = [
  "▶ Video · Agents at scale — 48 min · Apr 24 · agents, tools",
  "≡ Granola · LLM internals transcript — 12k words · Apr 18 · llms",
  "📄 Article · Eval beyond benchmarks — 6 min · Apr 16 · eval",
  "▶ Video · Robotics demo day recap — 22 min · Apr 11 · robotics",
];

export default function LibraryPage() {
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
          {libraryItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>
    </section>
  );
}
