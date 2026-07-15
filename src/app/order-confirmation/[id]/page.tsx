import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCharmOptions } from "@/lib/inventory";
import { parseDesignSnapshot } from "@/lib/design-snapshot";
import { buttonVariants } from "@/components/ui/button";
import { BraceletShowcase } from "@/components/customizer/BraceletShowcase";
import { CheckCircle2 } from "lucide-react";
import { formatPKR } from "@/lib/currency";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, charmOptions] = await Promise.all([
    prisma.order.findUnique({ where: { id }, include: { items: true } }),
    getCharmOptions(),
  ]);
  if (!order) notFound();

  const productIds = [...new Set(order.items.map((i) => i.productId).filter((v): v is string => v !== null))];
  const products = productIds.length
    ? await prisma.product.findMany({ where: { id: { in: productIds } } })
    : [];
  const productImageById = new Map(products.map((p) => [p.id, p.heroImageUrl]));

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
      <h1 className="mt-4 font-heading text-3xl">Thank you, {order.shippingName.split(" ")[0]}</h1>
      <p className="mt-2 text-muted-foreground">
        Order #{order.id.slice(-8).toUpperCase()} has been placed. We&apos;ll begin crafting your
        piece shortly.
      </p>

      <div className="mt-6 space-y-4">
        {order.items.map((item) => {
          const productImageUrl = item.productId ? productImageById.get(item.productId) : undefined;
          if (productImageUrl) {
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={item.id}
                src={productImageUrl}
                alt=""
                className="mx-auto max-w-55 rounded-2xl object-cover"
              />
            );
          }
          const design = parseDesignSnapshot(item.designSnapshot);
          const charmImageUrl = design.charmId
            ? charmOptions.find((c) => c.id === design.charmId)?.imageUrl
            : undefined;
          return (
            <BraceletShowcase
              key={item.id}
              className="mx-auto max-w-55"
              beads={design.beads}
              charmImageUrl={charmImageUrl}
            />
          );
        })}
      </div>

      <p className="mt-4 font-heading text-2xl text-gradient-gold">{formatPKR(order.total)}</p>
      <Link href="/shop" className={buttonVariants({ className: "mt-8" })}>
        Continue Shopping
      </Link>
    </div>
  );
}
