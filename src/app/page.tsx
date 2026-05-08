import Link from "next/link";

import { Card } from "@/components/card";
import { JoinClubButton } from "@/components/join-club-button";
import { OfficerTile } from "@/components/officer-tile";
import { getCurrentMember } from "@/lib/auth";
import {
  getOfficers,
  getSiteSettings,
  getUpcomingEvents,
} from "@/lib/supabase/server";

export default async function Home() {
  const [settings, member, officers, upcoming] = await Promise.all([
    getSiteSettings(),
    getCurrentMember(),
    getOfficers(),
    getUpcomingEvents(3),
  ]);
  const authEnabled = process.env.NEXT_PUBLIC_ENABLE_SUPABASE_AUTH === "true";

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Welcome
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {settings.headline}
          </h1>
          <p className="mt-2 max-w-xl text-zinc-600">
            {settings.tagline}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <JoinClubButton isSignedIn={Boolean(member)} authEnabled={authEnabled} />
          </div>
          <p className="mt-4 text-sm text-zinc-600">
            {settings.stats.members} members · {settings.stats.events} past events ·{" "}
            {settings.stats.partners} partners
          </p>
        </Card>

        <Card title="Team" className="lg:col-span-5">
          {officers.length === 0 ? (
            <p className="text-sm text-zinc-600">No officers listed yet.</p>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {officers.map((officer) => (
                <OfficerTile key={officer.id} officer={officer} />
              ))}
            </div>
          )}
          <Link
            href="/about"
            className="mt-3 inline-block text-sm text-zinc-600 hover:underline"
          >
            Meet the team →
          </Link>
        </Card>

        <Card title="Upcoming events" className="lg:col-span-4">
          {upcoming.length === 0 ? (
            <p className="text-sm text-zinc-600">No upcoming events scheduled.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {upcoming.map((event) => {
                const date = new Date(event.startsAt);
                const dateLabel = date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                });
                const guestLine = [event.guestName, event.guestCompany]
                  .filter(Boolean)
                  .join(" · ");
                return (
                  <li key={event.id} className="text-zinc-600">
                    <p>
                      <span className="font-medium text-zinc-700">{dateLabel}</span>
                      {" · "}
                      <Link href={`/events/${event.slug}`} className="hover:underline">
                        {event.title}
                      </Link>
                      {event.status === "cancelled" ? (
                        <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-800">
                          Cancelled
                        </span>
                      ) : null}
                    </p>
                    {guestLine ? (
                      <p className="text-xs text-zinc-600">{guestLine}</p>
                    ) : null}
                    {event.rsvpUrl && event.status !== "cancelled" ? (
                      <a
                        href={event.rsvpUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-brand-red underline-offset-2 hover:underline"
                      >
                        Register →
                      </a>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href="/events"
            className="mt-3 inline-block text-sm text-zinc-600 hover:underline"
          >
            See all events →
          </Link>
        </Card>

        <Card title="Knowledge library" className="lg:col-span-4">
          <ul className="space-y-2 text-sm text-zinc-600">
            <li>▶ How agents actually plan</li>
            <li>📄 Eval beyond benchmarks</li>
            <li>≡ Apr 24 · LLM internals transcript</li>
          </ul>
        </Card>

        <Card title="Member perks" className="lg:col-span-4">
          <p className="text-sm text-zinc-600">
            Members-only partner offers and discount codes.
          </p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Locked preview
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-zinc-500">
            <span className="rounded bg-zinc-100 p-2">40% off</span>
            <span className="rounded bg-zinc-100 p-2">$200 credits</span>
            <span className="rounded bg-zinc-100 p-2">Free year</span>
            <span className="rounded bg-zinc-100 p-2">50% off</span>
          </div>
        </Card>

        <Card title="Featured this week" className="lg:col-span-8">
          <p className="text-sm text-zinc-600">
            New article: &quot;What we learned hosting 30 events&quot; by Priya · 6
            min.
          </p>
        </Card>

        <Card title="Join us" className="lg:col-span-4">
          <p className="text-sm text-zinc-600">Officer applications are open.</p>
          <button className="mt-3 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium">
            Apply →
          </button>
        </Card>
      </div>
    </section>
  );
}
