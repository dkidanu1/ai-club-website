import Link from "next/link";

import { requireOfficer } from "@/lib/auth";

const adminNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/library", label: "Library" },
  { href: "/admin/perks", label: "Perks" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/site-info", label: "Site info" },
];

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const officer = await requireOfficer();

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Back office
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">AI Club Admin</h1>
          <p className="text-sm text-zinc-500">Signed in: {officer.full_name ?? officer.email}</p>
        </div>
      </div>

      <nav className="rounded-xl border border-zinc-200 bg-white p-3">
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {adminNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-center text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="space-y-4">{children}</div>
    </section>
  );
}
