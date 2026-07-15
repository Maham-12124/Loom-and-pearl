import { getBeadOptions, getCharmOptions, getPackagingOptions } from "@/lib/inventory";
import { prisma } from "@/lib/prisma";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [beadOptions, charmOptions, packagingOptions, storeSettings] = await Promise.all([
    getBeadOptions(),
    getCharmOptions(),
    getPackagingOptions(),
    prisma.storeSettings.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } }),
  ]);
  return (
    <CheckoutView
      beadOptions={beadOptions}
      charmOptions={charmOptions}
      packagingOptions={packagingOptions}
      storeSettings={storeSettings}
    />
  );
}
