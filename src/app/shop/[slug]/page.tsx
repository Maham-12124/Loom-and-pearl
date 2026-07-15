import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductActions } from "@/components/shop/ProductActions";
import type { PlacedBead, ProductSummary } from "@/types/customizer";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });

  if (!product || !product.isActive) notFound();

  const summary: ProductSummary = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    heroImageUrl: product.heroImageUrl,
    basePrice: product.basePrice,
    wristSize: product.wristSize as ProductSummary["wristSize"],
    beadConfig: product.beadConfig as unknown as PlacedBead[],
    charmId: product.charmId,
    isActive: product.isActive,
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 md:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card/60 p-6">
        <img
          src={product.heroImageUrl}
          alt={product.name}
          className="w-full rounded-xl object-cover"
        />
      </div>

      <div className="space-y-4">
        <h1 className="font-heading text-4xl">{product.name}</h1>
        <p className="text-muted-foreground">{product.description}</p>
        <ProductActions product={summary} />
      </div>
    </div>
  );
}
