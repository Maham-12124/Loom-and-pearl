import { prisma } from "@/lib/prisma";
import { PackagingManager } from "@/components/admin/PackagingManager";

export const dynamic = "force-dynamic";

export default async function AdminPackagingPage() {
  const [options, packagingTypes] = await Promise.all([
    prisma.packagingOption.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.packagingType.findMany({ orderBy: { name: "asc" } }),
  ]);
  return <PackagingManager initialOptions={options} initialPackagingTypes={packagingTypes} />;
}
