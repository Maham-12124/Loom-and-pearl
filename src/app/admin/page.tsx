import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const [beadCount, charmCount, productCount, orderCount, outOfStockBeads, outOfStockCharms] =
    await Promise.all([
      prisma.bead.count(),
      prisma.charm.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.bead.count({ where: { stock: 0 } }),
      prisma.charm.count({ where: { stock: 0 } }),
    ]);

  const stats = [
    { label: "Beads in Matrix", value: beadCount, href: "/admin/beads" },
    { label: "Charms", value: charmCount, href: "/admin/charms" },
    { label: "Ready-Made Products", value: productCount, href: "/admin/products" },
    { label: "Orders", value: orderCount, href: "/admin/orders" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Overview</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:bg-secondary/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">
                  {s.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-heading text-3xl">{s.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {(outOfStockBeads > 0 || outOfStockCharms > 0) && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-base">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {outOfStockBeads > 0 && <p>{outOfStockBeads} bead(s) are out of stock and hidden from customers.</p>}
            {outOfStockCharms > 0 && <p>{outOfStockCharms} charm(s) are out of stock and hidden from customers.</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
