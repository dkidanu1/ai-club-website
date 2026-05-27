import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { CreateEventForm } from "@/app/admin/events/create-event-form";
import { EventRow } from "@/app/admin/events/event-row";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import {
  getEventsForAdmin,
  type AdminEventRecord,
} from "@/lib/supabase/server";

function isPast(event: AdminEventRecord, now: number): boolean {
  if (event.status === "past") return true;
  if (event.status === "draft") return false;
  return new Date(event.startsAt).getTime() < now;
}

export default async function AdminEventsPage() {
  const events = await getEventsForAdmin();
  const isSupabaseConfigured = hasSupabasePublicEnv();
  const now = new Date().getTime();

  const past = events.filter((e) => isPast(e, now));
  const active = events.filter((e) => !isPast(e, now));

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
        <CreateEventForm disabled={!isSupabaseConfigured} />
      </Card>

      <Card title={`Upcoming and drafts (${active.length})`}>
        <div className="space-y-3">
          {active.map((event) => (
            <EventRow key={event.id} event={event} disabled={!isSupabaseConfigured} />
          ))}
          {active.length === 0 ? (
            <p className="text-sm text-zinc-600">
              No active or draft events. Create the first one above.
            </p>
          ) : null}
        </div>
      </Card>

      <Card title={`Past events (${past.length})`}>
        <p className="mb-3 text-xs text-zinc-600">
          Past events get a recap card, gallery, and transcript on their detail page.
          Fill in those fields here to publish the recap.
        </p>
        <div className="space-y-3">
          {past.map((event) => (
            <EventRow key={event.id} event={event} disabled={!isSupabaseConfigured} />
          ))}
          {past.length === 0 ? (
            <p className="text-sm text-zinc-600">
              No past events yet. Once an event&apos;s date passes (or you set its
              status to <code>past</code>), it shows up here.
            </p>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
