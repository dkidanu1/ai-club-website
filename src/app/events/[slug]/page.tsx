import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { getEventBySlug } from "@/lib/supabase/server";

type EventDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) notFound();

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Event detail"
        title={event.title}
        description={event.description}
      />

      <Card title="Key facts">
        <ul className="space-y-1 text-sm text-zinc-600">
          <li>
            Date:{" "}
            {new Date(event.startsAt).toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </li>
          <li>Location: {event.location}</li>
          <li>
            RSVPs: {event.rsvpCount}
            {event.capacity ? `/${event.capacity}` : ""}
          </li>
        </ul>
      </Card>

      <Card title="Agenda">
        <ul className="space-y-2 text-sm text-zinc-600">
          {event.agenda.length > 0 ? (
            event.agenda.map((item) => (
              <li key={`${item.time}-${item.item}`}>
                {item.time} — {item.item}
              </li>
            ))
          ) : (
            <li>Agenda will be posted soon.</li>
          )}
        </ul>
      </Card>

      <Link href="/events" className="inline-block text-sm font-medium hover:underline">
        ← Back to events
      </Link>
    </section>
  );
}
