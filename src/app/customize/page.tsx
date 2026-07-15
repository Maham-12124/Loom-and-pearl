import { CustomizerProvider } from "@/context/CustomizerContext";
import { CustomizerLayout } from "@/components/customizer/CustomizerLayout";
import { getBeadOptions, getCharmOptions, getPackagingOptions } from "@/lib/inventory";
import { parseDesignFromParams } from "@/lib/design";
import { prisma } from "@/lib/prisma";
import type { DesignState, PlacedBead } from "@/types/customizer";

export const metadata = {
  title: "Customize Your Bracelet — Loom & Pearl",
};

export default async function CustomizePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === "string") urlParams.set(key, value);
  }

  const [beadOptions, charmOptions, packagingOptions] = await Promise.all([
    getBeadOptions(),
    getCharmOptions(),
    getPackagingOptions(),
  ]);

  let initialDesign: Partial<DesignState> = {};
  let productName: string | undefined;

  const productSlug = typeof params.product === "string" ? params.product : undefined;
  if (productSlug) {
    const product = await prisma.product.findUnique({ where: { slug: productSlug } });
    if (product) {
      initialDesign = {
        wristSize: product.wristSize as DesignState["wristSize"],
        beads: product.beadConfig as unknown as PlacedBead[],
        charmId: product.charmId,
      };
      productName = product.name;
    }
  } else {
    initialDesign = parseDesignFromParams(urlParams);
  }

  return (
    <CustomizerProvider
      beadOptions={beadOptions}
      charmOptions={charmOptions}
      packagingOptions={packagingOptions}
      initialDesign={initialDesign}
    >
      <CustomizerLayout productName={productName ?? "Custom Bracelet"} />
    </CustomizerProvider>
  );
}
