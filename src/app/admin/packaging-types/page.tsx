import { prisma } from "@/lib/prisma";
import { PackagingTypeManager } from "@/components/admin/PackagingTypeManager";

export const dynamic = "force-dynamic";

export default async function AdminPackagingTypesPage() {
  const types = await prisma.packagingType.findMany({ orderBy: { createdAt: "desc" } });
  return <PackagingTypeManager initialTypes={types} />;
}
