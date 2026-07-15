import { notFound } from "next/navigation";
import { CustomizerProvider } from "@/context/CustomizerContext";
import { ProductDesignForm } from "@/components/admin/ProductDesignForm";
import { getBeadOptions, getCharmOptions, getPackagingOptions } from "@/lib/inventory";
import { prisma } from "@/lib/prisma";
import type { DesignState, PlacedBead } from "@/types/customizer";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, beadOptions, charmOptions, packagingOptions] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    getBeadOptions(),
    getCharmOptions(),
    getPackagingOptions(),
  ]);

  if (!product) notFound();

  const initialDesign: Partial<DesignState> = {
    wristSize: product.wristSize as DesignState["wristSize"],
    beads: product.beadConfig as unknown as PlacedBead[],
    charmId: product.charmId,
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">Edit {product.name}</h1>
      <CustomizerProvider
        beadOptions={beadOptions}
        charmOptions={charmOptions}
        packagingOptions={packagingOptions}
        initialDesign={initialDesign}
      >
        <ProductDesignForm
          initialMeta={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            heroImageUrl: product.heroImageUrl,
            basePrice: product.basePrice,
            isActive: product.isActive,
          }}
        />
      </CustomizerProvider>
    </div>
  );
}
