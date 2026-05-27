type SectionHeaderProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export function SectionHeader({ title, description, eyebrow }: SectionHeaderProps) {
  return (
    <header className="mb-2">
      {eyebrow ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-3xl text-base text-zinc-600 sm:text-lg">{description}</p>
    </header>
  );
}
