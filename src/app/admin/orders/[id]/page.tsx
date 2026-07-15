import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCharmOptions } from "@/lib/inventory";
import { parseDesignSnapshot } from "@/lib/design-snapshot";
import { BraceletShowcase } from "@/components/customizer/BraceletShowcase";
import { OrderStatusUpdateForm } from "@/components/admin/OrderStatusUpdateForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPKR } from "@/lib/currency";
import { PAYMENT_METHOD_LABEL } from "@/lib/payment";
import { TriangleAlert } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, charmOptions] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true, user: true } }),
    getCharmOptions(),
  ]);
  if (!order) notFound();

  const productIds = [...new Set(order.items.map((i) => i.productId).filter((v): v is string => v !== null))];
  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } } })
    : [];
  const productImageById = new Map(products.map((p) => [p.id, p.heroImageUrl]));

  const duplicateScreenshotOrders = order.paymentScreenshotUrl
    ? await prisma.order.findMany({
        where: { paymentScreenshotUrl: order.paymentScreenshotUrl, id: { not: order.id } },
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl">Order #{order.id.slice(-8).toUpperCase()}</h1>
        <p className="text-sm text-muted-foreground">
          {order.user?.email ?? order.shippingName} · Placed{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => {
                const design = parseDesignSnapshot(item.designSnapshot);
                const charmImageUrl = design.charmId
                  ? charmOptions.find((c) => c.id === design.charmId)?.imageUrl
                  : undefined;
                const productImageUrl = item.productId ? productImageById.get(item.productId) : undefined;
                return (
                  <div key={item.id} className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                    {productImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={productImageUrl} alt="" className="h-24 w-24 shrink-0 rounded-2xl object-cover" />
                    ) : (
                      <BraceletShowcase className="h-24 w-24 shrink-0" beads={design.beads} charmImageUrl={charmImageUrl} />
                    )}
                    <div className="flex-1">
                      <p className="font-medium">{design.wristSize} · {design.beads.length} beads</p>
                      <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                    </div>
                    <p className="font-heading text-lg">{formatPKR(item.lineTotal)}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">Shipping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{order.shippingName}</p>
              <p className="text-muted-foreground">{order.shippingAddress}</p>
              <p className="text-muted-foreground">
                {order.shippingCity}, {order.shippingPostal}, {order.shippingCountry}
              </p>
              {order.giftNote && (
                <p className="mt-2 text-muted-foreground">Gift note: “{order.giftNote}”</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}</p>
              {order.paymentReference && (
                <p className="text-muted-foreground">Reference: {order.paymentReference}</p>
              )}
              {order.paymentScreenshotUrl && (
                <>
                  <a href={order.paymentScreenshotUrl} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={order.paymentScreenshotUrl}
                      alt="Payment screenshot"
                      className="mt-1 h-32 w-32 rounded-lg border border-border object-cover"
                    />
                  </a>

                  {duplicateScreenshotOrders.length > 0 && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-destructive">
                      <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>
                        This exact screenshot was already used on{" "}
                        {duplicateScreenshotOrders.map((o, i) => (
                          <span key={o.id}>
                            {i > 0 && ", "}
                            <Link href={`/admin/orders/${o.id}`} className="underline">
                              #{o.id.slice(-8).toUpperCase()}
                            </Link>
                          </span>
                        ))}
                        . Double-check this isn&apos;t a reused payment proof.
                      </p>
                    </div>
                  )}

                  <div className="rounded-lg border border-border bg-secondary/30 p-3 text-xs text-muted-foreground">
                    This screenshot isn&apos;t verified automatically — confirm the transfer in
                    your JazzCash/EasyPaisa account before marking this order as Paid.
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">Total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Delivery</span>
                <span>{formatPKR(order.deliveryCharge)}</span>
              </div>
              <p className="font-heading text-2xl text-gradient-gold">{formatPKR(order.total)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-xl">Fulfillment</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusUpdateForm
                orderId={order.id}
                initialStatus={order.status}
                initialTrackingNumber={order.trackingNumber}
                initialCarrier={order.carrier}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
