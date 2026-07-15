import { getPackagingOptions, getCharmOptions } from "@/lib/inventory";
import { CartView } from "@/components/cart/CartView";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [packagingOptions, charmOptions] = await Promise.all([
    getPackagingOptions(),
    getCharmOptions(),
  ]);
  return <CartView packagingOptions={packagingOptions} charmOptions={charmOptions} />;
}
