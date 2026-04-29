export default function PerksPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Member perks</h1>
        <p className="mt-2 text-zinc-600">
          Locked for public visitors, unlocked for members after SUNet sign-in.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6">
        <p className="text-lg font-semibold">Members only</p>
        <p className="mt-2 text-sm text-zinc-600">
          Sign in with your Stanford email to reveal discount codes from club
          partners.
        </p>
        <button className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white">
          Sign in with SUNet
        </button>
      </div>
    </section>
  );
}
