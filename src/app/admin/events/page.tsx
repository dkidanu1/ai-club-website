import { Card } from "@/components/card";
import { SectionHeader } from "@/components/section-header";
import { CreateEventForm } from "@/app/admin/events/create-event-form";
import { EventRow } from "@/app/admin/events/event-row";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import { getEventsForAdmin } from "@/lib/supabase/server";

export default async function AdminEventsPage() {
  const events = await getEventsForAdmin();
  const isSupabaseConfigured = hasSupabasePublicEnv();

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

      <Card title="Event rows">
        <div className="space-y-3">
          {events.map((event) => (
            <EventRow key={event.id} event={event} disabled={!isSupabaseConfigured} />
          ))}
          {events.length === 0 ? (
            <p className="text-sm text-zinc-600">No events yet. Create the first one above.</p>
          ) : null}
        </div>
      </Card>
    </section>
  );
}
