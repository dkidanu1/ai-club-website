import { Card } from "@/components/card";
import { getSiteSettings } from "@/lib/supabase/server";

export default async function Home() {
  const settings = await getSiteSettings();

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Welcome / Hero
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            {settings.headline}
          </h1>
          <p className="mt-2 max-w-xl text-zinc-600">
            {settings.tagline}
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-sm">
            <button className="rounded-md bg-zinc-900 px-4 py-2 font-medium text-white">
              Join the club
            </button>
            <button className="rounded-md border border-zinc-300 px-4 py-2 font-medium">
              See next event
            </button>
            <button className="rounded-md border border-zinc-300 px-4 py-2 font-medium">
              Browse library
            </button>
          </div>
          <p className="mt-4 text-sm text-zinc-600">
            {settings.stats.members} members · {settings.stats.events} past events ·{" "}
            {settings.stats.partners} partners
          </p>
        </Card>

        <Card title="Team photo" className="lg:col-span-5">
          <div className="grid h-40 place-items-center rounded-md border border-dashed border-zinc-300 text-sm text-zinc-500">
            Photo placeholder
          </div>
          <p className="mt-3 text-sm text-zinc-600">Meet the team →</p>
        </Card>

        <Card title="Upcoming events" className="lg:col-span-4">
          <ul className="space-y-3 text-sm text-zinc-600">
            <li>Tue · May 5 · Fireside w/ Dr. Fei-Fei · Register</li>
            <li>Fri · May 9 · Hack night: agents · Register</li>
          </ul>
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
