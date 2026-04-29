const officers = [
  "Priya Kumar — President",
  "Marcus Lee — VP Programming",
  "Lin Zhao — VP Education",
  "Sam Park — VP Partners",
];

export default function AboutPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">About AI Club</h1>
        <p className="mt-2 max-w-3xl text-zinc-600">
          Founded in 2022. We host weekly events, run reading groups, and build
          projects together.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="font-semibold">Officers (2025/26)</h2>
        <ul className="mt-3 space-y-2 text-sm text-zinc-600">
          {officers.map((officer) => (
            <li key={officer}>{officer}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
