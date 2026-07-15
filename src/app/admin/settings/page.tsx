import { prisma } from "@/lib/prisma";
import { StoreSettingsManager } from "@/components/admin/StoreSettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.storeSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return <StoreSettingsManager initialSettings={settings} />;
}
