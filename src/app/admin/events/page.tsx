import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import {
  createEventAction,
  updateEventDetailsAction,
  updateEventStatusAction,
} from "@/app/admin/events/actions";
import { getEventsForAdmin } from "@/lib/supabase/server";

const statuses = ["draft", "published", "past", "cancelled"] as const;
const eventTypeOptions = [
  { value: "talk", label: "Fireside Chat" },
  { value: "hack", label: "Company Visit" },
  { value: "reading", label: "Major Event" },
  { value: "social", label: "Community Event" },
] as const;

export default async function AdminEventsPage() {
  const events = await getEventsForAdmin();
  const isSupabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return (
    <section className="space-y-4">
      <SectionHeader
        eyebrow="Admin / Events"
        title="Events manager"
        description="Club leadership can create, edit, and publish events manually from this dashboard."
      />

      <Card title="Create new event">
        {!isSupabaseConfigured ? (
          <p className="mb-3 text-sm text-amber-700">
            Supabase env vars are not set. Create/update actions are disabled.
          </p>
        ) : null}
        <form action={createEventAction} className="grid gap-3 md:grid-cols-2">
          <input
            name="title"
            required
            placeholder="Event title"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="startsAt"
            required
            type="datetime-local"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="location"
            placeholder="Location"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <select
            name="eventType"
            defaultValue="talk"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {eventTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue="draft"
            className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="past">Past</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button
            disabled={!isSupabaseConfigured}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            Create event
          </button>
        </form>
      </Card>

      <Card title="Event rows">
        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-md border border-zinc-200 p-3 text-sm text-zinc-700"
            >
              <p className="font-medium">{event.title}</p>
              <p className="text-zinc-600">
                {new Date(event.startsAt).toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}{" "}
                · {event.location} · {event.rsvpCount}
                {event.capacity ? `/${event.capacity}` : ""} RSVPs
              </p>
              <form action={updateEventStatusAction} className="mt-2 flex items-center gap-2">
                <input type="hidden" name="id" value={event.id} />
                <select
                  name="status"
                  defaultValue={event.status}
                  disabled={!isSupabaseConfigured}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  disabled={!isSupabaseConfigured}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:text-zinc-400"
                >
                  Update status
                </button>
              </form>

              <form action={updateEventDetailsAction} className="mt-3 grid gap-2 md:grid-cols-2">
                <input type="hidden" name="id" value={event.id} />
                <input
                  name="title"
                  required
                  defaultValue={event.title}
                  disabled={!isSupabaseConfigured}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
                />
                <input
                  name="startsAt"
                  required
                  type="datetime-local"
                  defaultValue={new Date(event.startsAt).toISOString().slice(0, 16)}
                  disabled={!isSupabaseConfigured}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
                />
                <input
                  name="location"
                  defaultValue={event.location}
                  disabled={!isSupabaseConfigured}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
                />
                <select
                  name="eventType"
                  defaultValue={event.eventType}
                  disabled={!isSupabaseConfigured}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
                >
                  {eventTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <input
                  name="rsvpCount"
                  type="number"
                  min={0}
                  defaultValue={event.rsvpCount}
                  disabled={!isSupabaseConfigured}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
                />
                <input
                  name="capacity"
                  type="number"
                  min={0}
                  defaultValue={event.capacity ?? ""}
                  disabled={!isSupabaseConfigured}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
                />
                <input
                  name="rsvpUrl"
                  placeholder="RSVP URL"
                  defaultValue={event.rsvpUrl ?? ""}
                  disabled={!isSupabaseConfigured}
                  className="md:col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
                />
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Event description"
                  defaultValue={event.description}
                  disabled={!isSupabaseConfigured}
                  className="md:col-span-2 rounded-md border border-zinc-300 px-2 py-1 text-xs disabled:bg-zinc-100"
                />
                <textarea
                  name="agendaJson"
                  rows={4}
                  defaultValue={JSON.stringify(event.agenda, null, 2)}
                  disabled={!isSupabaseConfigured}
                  className="md:col-span-2 rounded-md border border-zinc-300 px-2 py-1 font-mono text-xs disabled:bg-zinc-100"
                />
                <button
                  disabled={!isSupabaseConfigured}
                  className="rounded-md border border-zinc-300 px-2 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:text-zinc-400"
                >
                  Save details
                </button>
              </form>
            </div>
          ))}
          {events.length === 0 ? (
            <p className="text-sm text-zinc-600">No events yet. Create the first one above.</p>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
