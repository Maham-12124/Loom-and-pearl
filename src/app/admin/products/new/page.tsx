import { CustomizerProvider } from "@/context/CustomizerContext";
import { ProductDesignForm } from "@/components/admin/ProductDesignForm";
import { getBeadOptions, getCharmOptions, getPackagingOptions } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [beadOptions, charmOptions, packagingOptions] = await Promise.all([
    getBeadOptions(),
    getCharmOptions(),
    getPackagingOptions(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl">New Ready-Made Product</h1>
      <CustomizerProvider
        beadOptions={beadOptions}
        charmOptions={charmOptions}
        packagingOptions={packagingOptions}
      >
        <ProductDesignForm />
      </CustomizerProvider>
    </div>
  );
}
