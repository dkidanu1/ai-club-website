import Link from "next/link";

import { Card } from "@/components/card";
import { JoinClubButton } from "@/components/join-club-button";
import { OfficerTile } from "@/components/officer-tile";
import { getCurrentMember } from "@/lib/auth";
import {
  getOfficers,
  getPublishedLibraryItems,
  getSiteSettings,
  getUpcomingEvents,
} from "@/lib/supabase/server";

export default async function Home() {
  const [settings, member, officers, upcoming, libraryItems] = await Promise.all([
    getSiteSettings(),
    getCurrentMember(),
    getOfficers(),
    getUpcomingEvents(3),
    getPublishedLibraryItems(),
  ]);
  const recentLibrary = libraryItems.slice(0, 4);
  const authEnabled = process.env.NEXT_PUBLIC_ENABLE_SUPABASE_AUTH === "true";

  return (
    <section className="space-y-10">
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="lg:col-span-7 flex flex-col justify-between rounded-2xl bg-white p-8 sm:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-dusty">
              Stanford GSB · AI Club
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
              {settings.headline}
            </h1>
            <p className="mt-4 max-w-2xl text-base text-zinc-600 sm:text-lg">
              {settings.tagline}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <JoinClubButton isSignedIn={Boolean(member)} authEnabled={authEnabled} />
            </div>
          </div>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-zinc-200/70 pt-6 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Members</dt>
              <dd className="mt-1 text-2xl font-semibold text-zinc-900">
                {settings.stats.members}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Past events</dt>
              <dd className="mt-1 text-2xl font-semibold text-zinc-900">
                {settings.stats.events}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-zinc-500">Partners</dt>
              <dd className="mt-1 text-2xl font-semibold text-zinc-900">
                {settings.stats.partners}
              </dd>
            </div>
          </dl>
        </section>

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
          {recentLibrary.length === 0 ? (
            <p className="text-sm text-zinc-600">Nothing in the library yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {recentLibrary.map((item) => {
                const icon = item.type === "video" ? "▶" : "📄";
                // Articles open externally; videos go to /library where they
                // play inline via the click-to-play card.
                if (item.type === "article" && item.externalUrl) {
                  return (
                    <li key={item.id}>
                      <a
                        href={item.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-700 hover:underline"
                      >
                        <span className="mr-1 text-zinc-500">{icon}</span>
                        {item.title}
                      </a>
                    </li>
                  );
                }
                return (
                  <li key={item.id}>
                    <Link href="/library" className="text-zinc-700 hover:underline">
                      <span className="mr-1 text-zinc-500">{icon}</span>
                      {item.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          <Link
            href="/library"
            className="mt-3 inline-block text-sm text-zinc-600 hover:underline"
          >
            Open library →
          </Link>
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

        {settings.featuredHeadline ? (
          <Card title="Featured today" className="lg:col-span-8">
            {settings.featuredUrl ? (
              <a
                href={settings.featuredUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium text-zinc-900 hover:underline"
              >
                {settings.featuredHeadline}
              </a>
            ) : (
              <p className="text-base font-medium text-zinc-900">
                {settings.featuredHeadline}
              </p>
            )}
          </Card>
        ) : null}

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
