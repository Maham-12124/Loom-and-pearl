import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCharmOptions } from "@/lib/inventory";
import { parseDesignSnapshot } from "@/lib/design-snapshot";
import { BraceletShowcase } from "@/components/customizer/BraceletShowcase";
import { OrderTrackingTimeline } from "@/components/account/OrderTrackingTimeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { formatPKR } from "@/lib/currency";
import { PAYMENT_METHOD_LABEL } from "@/lib/payment";

export const dynamic = "force-dynamic";

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account");

  const { id } = await params;
  const [order, charmOptions] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    getCharmOptions(),
  ]);
  if (!order || order.userId !== session.user.id) notFound();

  const productIds = [...new Set(order.items.map((i) => i.productId).filter((v): v is string => v !== null))];
  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } } })
    : [];
  const productImageById = new Map(products.map((p) => [p.id, p.heroImageUrl]));

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div>
        <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to Account
        </Link>
        <h1 className="mt-2 font-heading text-3xl">Order #{order.id.slice(-8).toUpperCase()}</h1>
        <p className="text-sm text-muted-foreground">
          Placed {new Date(order.createdAt).toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
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
              <CardTitle className="font-heading text-xl">Shipping To</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{order.shippingName}</p>
              <p className="text-muted-foreground">{order.shippingAddress}</p>
              <p className="text-muted-foreground">
                {order.shippingCity}, {order.shippingPostal}, {order.shippingCountry}
              </p>
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
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={order.paymentScreenshotUrl}
                  alt="Payment screenshot"
                  className="mt-1 h-24 w-24 rounded-lg border border-border object-cover"
                />
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
              <CardTitle className="font-heading text-xl">Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderTrackingTimeline
                status={order.status}
                trackingNumber={order.trackingNumber}
                carrier={order.carrier}
                shippedAt={order.shippedAt}
                deliveredAt={order.deliveredAt}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Link href="/shop" className={buttonVariants({ variant: "outline" })}>
        Continue Shopping
      </Link>
    </div>
  );
}
