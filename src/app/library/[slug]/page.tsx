import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { requireMember } from "@/lib/auth";
import { getLibraryItemBySlug } from "@/lib/supabase/server";

type LibraryItemPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LibraryItemPage({ params }: LibraryItemPageProps) {
  await requireMember();
  const { slug } = await params;
  const item = await getLibraryItemBySlug(slug);

  if (!item || item.type !== "granola") notFound();

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Library / Granola"
        title={item.title}
        description={item.excerpt}
      />

      <Card title="Transcript">
        <p className="whitespace-pre-wrap text-sm text-zinc-700">
          {item.fullText ?? "Transcript is not available yet."}
        </p>
      </Card>

      <Link href="/library" className="inline-block text-sm font-medium hover:underline">
        ← Back to library
      </Link>
    </section>
  );
}
