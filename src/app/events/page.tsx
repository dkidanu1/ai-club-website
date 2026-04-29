import Link from "next/link";

import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";

const upcomingEvents = [
  {
    slug: "fireside-chat-dr-fei-fei-li",
    title: "Fireside chat — Dr. Fei-Fei Li",
    meta: "Tue, May 5 · 6:00 PM · Gates B01 + Zoom · 124 RSVPs",
  },
  {
    slug: "hack-night-building-agents",
    title: "Hack night: building agents",
    meta: "Fri, May 9 · 4:00 PM · Huang Center · 41 RSVPs",
  },
  {
    slug: "reading-group-rlhf-papers",
    title: "Reading group — RLHF papers",
    meta: "Wed, May 14 · 7:00 PM · Online · 22 RSVPs",
  },
];

export default function EventsPage() {
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
            <p className="text-sm text-zinc-600">{event.meta}</p>
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
