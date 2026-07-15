import { getCharmOptions } from "@/lib/inventory";
import { CharmManager } from "@/components/admin/CharmManager";

export const dynamic = "force-dynamic";

export default async function AdminCharmsPage() {
  const charms = await getCharmOptions();
  return <CharmManager initialCharms={charms} />;
}
