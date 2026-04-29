import Link from "next/link";

import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { getPublishedEvents } from "@/lib/supabase/server";

function formatEventMeta(startsAt: string, location: string, rsvpCount: number): string {
  const date = new Date(startsAt).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  return `${date} · ${location} · ${rsvpCount} RSVPs`;
}

export default async function EventsPage() {
  const upcomingEvents = await getPublishedEvents();
  return (
    <section className="space-y-6">
      <SectionHeader
        title="Upcoming events"
        description="What's on. RSVP early - most events fill up."
        eyebrow="Events"
      />

      <div className="flex flex-wrap gap-2">
        {["All", "Talks", "Hack nights", "Reading group", "Socials", "In-person", "Online"].map(
          (filter) => (
            <span
              key={filter}
              className="rounded-full border border-zinc-300 bg-white px-3 py-1 text-sm"
            >
              {filter}
            </span>
          )
        )}
      </div>

      <div className="space-y-3">
        {upcomingEvents.map((event) => (
          <Card key={event.title}>
            <h2 className="font-semibold">{event.title}</h2>
            <p className="text-sm text-zinc-600">
              {formatEventMeta(event.startsAt, event.location, event.rsvpCount)}
            </p>
            <Link
              href={`/events/${event.slug}`}
              className="mt-3 inline-block text-sm font-medium text-zinc-900 hover:underline"
            >
              View details →
            </Link>
          </Card>
        ))}
      </div>

      <Card title="Past events">
        <ul className="space-y-2 text-sm text-zinc-600">
          <li>Apr 24 · LLM internals · video + transcript</li>
          <li>Apr 18 · Eval workshop · video + transcript</li>
          <li>Apr 11 · Vision panel · video + transcript</li>
        </ul>
      </Card>
    </section>
  );
}
