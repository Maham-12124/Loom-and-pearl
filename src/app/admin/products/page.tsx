import { prisma } from "@/lib/prisma";
import { ProductListManager } from "@/components/admin/ProductListManager";
import type { PlacedBead } from "@/types/customizer";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  const summaries = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    heroImageUrl: p.heroImageUrl,
    basePrice: p.basePrice,
    wristSize: p.wristSize as "SMALL" | "MEDIUM" | "LARGE",
    beadConfig: p.beadConfig as unknown as PlacedBead[],
    charmId: p.charmId,
    isActive: p.isActive,
  }));

  return <ProductListManager initialProducts={summaries} />;
}
