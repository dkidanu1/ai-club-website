const libraryItems = [
  "Video · Agents at scale — Apr 24",
  "Transcript · LLM internals night — Apr 18",
  "Article · Eval beyond benchmarks — Apr 16",
];

export default function LibraryPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">
          Knowledge library
        </h1>
        <p className="mt-2 text-zinc-600">
          Members-only mixed feed with filters, search, and transcript viewer.
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <p className="text-sm font-medium text-zinc-700">Preview items</p>
        <ul className="mt-3 space-y-2 text-sm text-zinc-600">
          {libraryItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
