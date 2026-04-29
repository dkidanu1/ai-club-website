import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";

export default function AdminLibraryPage() {
  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Admin / Library"
        title="Knowledge library manager"
        description="Manage transcript and article records, status, tags, and linked events."
      />

      <Card title="Quick add">
        <div className="grid gap-2 text-sm text-zinc-600 sm:grid-cols-3">
          <div className="rounded-md bg-zinc-100 p-3">▶ Add video link</div>
          <div className="rounded-md bg-zinc-100 p-3">📄 Add article link</div>
          <div className="rounded-md bg-zinc-100 p-3">≡ Paste granola transcript</div>
        </div>
      </Card>

      <Card title="Queue">
        <ul className="space-y-2 text-sm text-zinc-600">
          <li>Transcript — LLM internals night · Review</li>
          <li>Eval beyond benchmarks · Published</li>
          <li>Reading list: April · Draft</li>
        </ul>
      </Card>
    </section>
  );
}
