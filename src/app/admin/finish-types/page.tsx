import { prisma } from "@/lib/prisma";
import { FinishTypeManager } from "@/components/admin/FinishTypeManager";

export const dynamic = "force-dynamic";

export default async function AdminFinishTypesPage() {
  const types = await prisma.finishType.findMany({ orderBy: { createdAt: "desc" } });
  return <FinishTypeManager initialTypes={types} />;
}
