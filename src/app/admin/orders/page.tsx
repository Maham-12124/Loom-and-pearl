import { prisma } from "@/lib/prisma";
import { OrderListTable } from "@/components/admin/OrderListTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true, user: true },
    take: 50,
  });

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-3xl">Orders</h1>
      <OrderListTable
        orders={orders.map((order) => ({
          id: order.id,
          status: order.status,
          total: order.total,
          createdAt: order.createdAt,
          itemCount: order.items.length,
          customerLabel: order.user?.email ?? order.shippingName,
        }))}
      />
    </div>
  );
}
