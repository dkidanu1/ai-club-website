import { SectionHeader } from "@/components/section-header";
import { EventsList } from "@/app/events/events-list";
import { getPublishedEvents } from "@/lib/supabase/server";

export default async function EventsPage() {
  const allEvents = await getPublishedEvents();
  const now = new Date().getTime();

  const upcoming = allEvents.filter(
    (event) => new Date(event.startsAt).getTime() >= now
  );
  // Past = explicitly marked past, OR a published/cancelled event whose start
  // is in the past. Newest first for the past list.
  const past = allEvents
    .filter((event) => {
      const t = new Date(event.startsAt).getTime();
      return event.status === "past" || t < now;
    })
    .sort(
      (a, b) =>
        new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()
    );

  return (
    <section className="space-y-6">
      <SectionHeader
        title="Events"
        description="What's on, and what we've already done."
        eyebrow="Events"
      />
      <EventsList upcoming={upcoming} past={past} />
    </section>
  );
}
