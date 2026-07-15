import { prisma } from "@/lib/prisma";
import { BeadInventoryManager } from "@/components/admin/BeadInventoryManager";

export const dynamic = "force-dynamic";

export default async function AdminBeadsPage() {
  const [beads, finishTypes] = await Promise.all([
    prisma.bead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.finishType.findMany({ orderBy: { name: "asc" } }),
  ]);
  return <BeadInventoryManager initialBeads={beads} initialFinishTypes={finishTypes} />;
}
