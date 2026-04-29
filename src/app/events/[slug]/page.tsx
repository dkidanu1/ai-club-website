type EventDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;

  return (
    <section className="space-y-6">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Event detail
        </p>
        <h1 className="text-3xl font-semibold tracking-tight capitalize">
          {slug.replaceAll("-", " ")}
        </h1>
        <p className="mt-2 text-zinc-600">
          This route is ready for Phase 2 when event data is connected to the
          database.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold">Agenda</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-600">
          <li>6:00 — Doors open + snacks</li>
          <li>6:15 — Intro from club leads</li>
          <li>6:25 — Main session + Q&A</li>
        </ul>
      </div>
    </section>
  );
}
