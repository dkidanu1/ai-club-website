type SectionHeaderProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

export function SectionHeader({ title, description, eyebrow }: SectionHeaderProps) {
  return (
    <header>
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-3xl text-zinc-600">{description}</p>
    </header>
  );
}
