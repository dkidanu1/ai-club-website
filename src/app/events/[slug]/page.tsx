import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { EVENT_TYPE_LABELS } from "@/lib/events";
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

  const isPast = new Date(event.startsAt).getTime() < new Date().getTime();
  const dateLabel = new Date(event.startsAt).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const endLabel = event.endsAt
    ? new Date(event.endsAt).toLocaleString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="Event detail"
        title={event.title}
        description={event.description}
      />

      <Card title="Key facts">
        <ul className="space-y-1 text-sm text-zinc-600">
          <li>Type: {EVENT_TYPE_LABELS[event.eventType]}</li>
          <li>
            Date: {dateLabel}
            {endLabel ? ` – ${endLabel}` : ""}
          </li>
          <li>Location: {event.location}</li>
          {event.guestName || event.guestCompany ? (
            <li>
              Guest:{" "}
              {[event.guestName, event.guestCompany].filter(Boolean).join(" · ")}
            </li>
          ) : null}
          {event.status === "cancelled" ? (
            <li className="font-medium text-red-700">This event was cancelled.</li>
          ) : null}
          {event.rsvpUrl && event.status !== "cancelled" && !isPast ? (
            <li>
              RSVP:{" "}
              <a
                href={event.rsvpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-red hover:underline"
              >
                Register
              </a>
            </li>
          ) : null}
        </ul>
      </Card>

      {event.summary ? (
        <Card title="Recap">
          <p className="whitespace-pre-line text-sm text-zinc-700">{event.summary}</p>
        </Card>
      ) : null}

      {event.galleryUrls.length > 0 ? (
        <Card title="Photos">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {event.galleryUrls.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
                aria-label="Open photo in new tab"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt=""
                  className="h-28 w-28 rounded-md object-cover ring-1 ring-zinc-200 transition hover:ring-brand-dusty sm:h-32 sm:w-32"
                />
              </a>
            ))}
          </div>
        </Card>
      ) : null}

      {event.transcript ? (
        <Card title="Transcript">
          <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-700">
            {event.transcript}
          </p>
        </Card>
      ) : null}

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
