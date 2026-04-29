import Link from "next/link";

const adminNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/library", label: "Library" },
  { href: "/admin/perks", label: "Perks" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/site-info", label: "Site info" },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Back office
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">AI Club Admin</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-zinc-200 bg-white p-3">
          <nav className="space-y-1">
            {adminNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 border-t border-zinc-200 pt-3 text-sm text-zinc-500">
            Signed in: Officer
          </div>
        </aside>

        <div className="space-y-4">{children}</div>
      </div>
    </section>
  );
}
