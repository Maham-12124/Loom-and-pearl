import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/currency";
import { RevenueChart, type RevenueDay } from "@/components/admin/RevenueChart";

export const dynamic = "force-dynamic";

const DAYS_SHOWN = 14;

export default async function AnalyticsPage() {
  const [orders, items, lowStockBeads, lowStockCharms] = await Promise.all([
    prisma.order.findMany({
      where: { status: { not: "CANCELLED" } },
      select: { total: true, createdAt: true },
    }),
    prisma.orderItem.findMany({
      where: { order: { status: { not: "CANCELLED" } } },
      select: { productId: true, quantity: true, lineTotal: true },
    }),
    prisma.bead.findMany({ where: { stock: { lte: 3 } }, orderBy: { stock: "asc" } }),
    prisma.charm.findMany({ where: { stock: { lte: 3 } }, orderBy: { stock: "asc" } }),
  ]);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const orderCount = orders.length;
  const avgOrderValue = orderCount ? totalRevenue / orderCount : 0;

  const startOfMonth = new Date();
  startOfMonth.setHours(0, 0, 0, 0);
  startOfMonth.setDate(1);
  const monthRevenue = orders
    .filter((o) => o.createdAt >= startOfMonth)
    .reduce((sum, o) => sum + o.total, 0);

  const days: (RevenueDay & { date: string })[] = [];
  for (let i = DAYS_SHOWN - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      revenue: 0,
    });
  }
  const dayIndexByDate = new Map(days.map((d, i) => [d.date, i]));
  for (const order of orders) {
    const key = order.createdAt.toISOString().slice(0, 10);
    const idx = dayIndexByDate.get(key);
    if (idx !== undefined) days[idx].revenue += order.total;
  }

  const productTotals = new Map<string, { quantity: number; revenue: number }>();
  let customQuantity = 0;
  let customRevenue = 0;
  for (const item of items) {
    if (item.productId) {
      const cur = productTotals.get(item.productId) ?? { quantity: 0, revenue: 0 };
      cur.quantity += item.quantity;
      cur.revenue += item.lineTotal;
      productTotals.set(item.productId, cur);
    } else {
      customQuantity += item.quantity;
      customRevenue += item.lineTotal;
    }
  }
  const productIds = [...productTotals.keys()];
  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } } })
    : [];
  const bestSellers = products
    .map((p) => ({ id: p.id, name: p.name, ...productTotals.get(p.id)! }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const readyMadeRevenue = [...productTotals.values()].reduce((s, v) => s + v.revenue, 0);
  const totalItemRevenue = readyMadeRevenue + customRevenue;
  const customSharePct = totalItemRevenue ? Math.round((customRevenue / totalItemRevenue) * 100) : 0;

  const stats = [
    { label: "Total Revenue", value: formatPKR(totalRevenue) },
    { label: "This Month", value: formatPKR(monthRevenue) },
    { label: "Orders", value: orderCount.toLocaleString("en-PK") },
    { label: "Avg. Order Value", value: formatPKR(avgOrderValue) },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Analytics</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-normal text-muted-foreground">
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">
            Revenue — last {DAYS_SHOWN} days
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart days={days} />
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Best Sellers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bestSellers.length === 0 && (
              <p className="text-sm text-muted-foreground">No ready-made product sales yet.</p>
            )}
            {bestSellers.map((p, i) => (
              <Link
                key={p.id}
                href={`/admin/products/${p.id}/edit`}
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-secondary/40"
              >
                <div className="flex items-center gap-3">
                  <span className="font-heading text-lg text-muted-foreground">{i + 1}</span>
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.quantity} sold</p>
                  </div>
                </div>
                <p className="font-heading">{formatPKR(p.revenue)}</p>
              </Link>
            ))}
            {totalItemRevenue > 0 && (
              <p className="pt-1 text-xs text-muted-foreground">
                Custom-built bracelets make up {customSharePct}% of item revenue ({customQuantity}{" "}
                sold, {formatPKR(customRevenue)}).
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Low Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockBeads.length === 0 && lowStockCharms.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Everything is comfortably stocked.
              </p>
            )}
            {lowStockBeads.map((b) => (
              <Link
                key={b.id}
                href="/admin/beads"
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-secondary/40"
              >
                <p className="font-medium">{b.name} (bead)</p>
                <Badge variant={b.stock === 0 ? "destructive" : "secondary"}>
                  {b.stock} left
                </Badge>
              </Link>
            ))}
            {lowStockCharms.map((c) => (
              <Link
                key={c.id}
                href="/admin/charms"
                className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-secondary/40"
              >
                <p className="font-medium">{c.name} (charm)</p>
                <Badge variant={c.stock === 0 ? "destructive" : "secondary"}>
                  {c.stock} left
                </Badge>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
