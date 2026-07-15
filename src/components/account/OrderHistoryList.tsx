import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/currency";

export interface OrderHistoryItem {
  id: string;
  status: string;
  total: number;
  createdAt: Date;
  itemCount: number;
}

export function OrderHistoryList({ orders }: { orders: OrderHistoryItem[] }) {
  if (orders.length === 0) {
    return <p className="text-sm text-muted-foreground">No orders yet.</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link key={order.id} href={`/account/orders/${order.id}`}>
          <Card className="transition-colors hover:bg-secondary/40">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <p className="font-medium">Order #{order.id.slice(-8).toUpperCase()}</p>
                <p className="text-xs text-muted-foreground">
                  {order.itemCount} item(s) · {order.createdAt.toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">{order.status}</Badge>
                <span className="font-heading text-lg">{formatPKR(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
