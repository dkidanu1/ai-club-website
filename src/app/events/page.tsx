const upcomingEvents = [
  {
    title: "Fireside chat — Dr. Fei-Fei Li",
    meta: "Tue, May 5 · 6:00 PM · Gates B01 + Zoom",
  },
  {
    title: "Hack night: building agents",
    meta: "Fri, May 9 · 4:00 PM · Huang Center",
  },
];

export default function EventsPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
        <p className="mt-2 text-zinc-600">
          Upcoming and past events with details, agenda, and RSVP links.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["All", "Talks", "Hack nights", "Reading group", "Socials"].map(
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
          <article
            key={event.title}
            className="rounded-xl border border-zinc-200 bg-white p-4"
          >
            <h2 className="font-semibold">{event.title}</h2>
            <p className="text-sm text-zinc-600">{event.meta}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
