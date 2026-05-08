import type { OfficerRecord } from "@/lib/supabase/server";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

type Props = { officer: OfficerRecord };

export function OfficerTile({ officer }: Props) {
  const title = officer.officerTitle ?? (officer.role === "president" ? "President" : "Officer");
  const inner = (
    <div className="flex flex-col items-center gap-2 text-center">
      {officer.avatarUrl ? (
        // Using a plain img keeps us free of next.config remotePatterns plumbing.
        // Photos are small (64px) so optimization payoff is minimal.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={officer.avatarUrl}
          alt={officer.fullName}
          className="h-16 w-16 rounded-full object-cover ring-2 ring-zinc-200 group-hover:ring-zinc-400"
        />
      ) : (
        <div className="grid h-16 w-16 place-items-center rounded-full bg-zinc-100 text-sm font-medium text-zinc-700 ring-2 ring-zinc-200 group-hover:ring-zinc-400">
          {initials(officer.fullName)}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-zinc-900">{officer.fullName || officer.email}</p>
        <p className="text-xs text-zinc-600">{title}</p>
      </div>
    </div>
  );

  if (officer.linkedinUrl) {
    return (
      <a
        href={officer.linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-md"
      >
        {inner}
      </a>
    );
  }

  return <div className="group">{inner}</div>;
}
