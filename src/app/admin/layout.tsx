import Link from "next/link";
import { ReactNode } from "react";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/beads", label: "Bead Inventory" },
  { href: "/admin/finish-types", label: "Finish Types" },
  { href: "/admin/charms", label: "Charms" },
  { href: "/admin/packaging", label: "Packaging" },
  { href: "/admin/packaging-types", label: "Packaging Types" },
  { href: "/admin/products", label: "Ready-Made Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-[220px_1fr]">
      <aside className="space-y-1">
        <p className="mb-3 px-2 font-heading text-lg">Studio Admin</p>
        <nav className="flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <div>{children}</div>
    </div>
  );
}
