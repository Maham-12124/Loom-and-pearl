"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import type { DesignState, ProductSummary } from "@/types/customizer";
import { Wand2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { formatPKR } from "@/lib/currency";

export function ProductActions({ product }: { product: ProductSummary }) {
  const addItem = useCartStore((s) => s.addItem);

  const design: DesignState = {
    wristSize: product.wristSize,
    beads: product.beadConfig,
    charmId: product.charmId,
    symmetryEnabled: false,
    packaging: { packagingId: null, note: "" },
  };

  const handleAddToBag = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      productImageUrl: product.heroImageUrl,
      design,
      unitPrice: product.basePrice,
    });
    toast.success("Added to bag", { description: `${product.name} — ${formatPKR(product.basePrice)}` });
  };

  return (
    <div className="space-y-3">
      <p className="font-heading text-3xl text-gradient-gold">{formatPKR(product.basePrice)}</p>
      <Button size="lg" className="w-full gap-2" onClick={handleAddToBag}>
        <ShoppingBag className="h-4 w-4" />
        Add to Bag
      </Button>
      <Link
        href={`/customize?product=${product.slug}`}
        className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <Wand2 className="h-3.5 w-3.5" />
        Prefer different colors? Customize this design
      </Link>
    </div>
  );
}
