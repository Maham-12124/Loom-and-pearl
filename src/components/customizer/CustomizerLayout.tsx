"use client";

import { useState } from "react";
import { CustomizerCanvas } from "./CustomizerCanvas";
import { CustomizerControls } from "./CustomizerControls";
import { PriceDisplay } from "./PriceDisplay";
import { PriceBreakdownLines } from "./PriceBreakdownLines";
import { BraceletShowcase } from "./BraceletShowcase";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCustomizer } from "@/context/CustomizerContext";
import { useCartStore } from "@/store/cart-store";
import { SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { formatPKR } from "@/lib/currency";

export function CustomizerLayout({ productName = "Custom Bracelet" }: { productName?: string }) {
  const { design, price, charmOptions } = useCustomizer();
  const addItem = useCartStore((s) => s.addItem);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  const charmImageUrl = design.charmId
    ? charmOptions.find((c) => c.id === design.charmId)?.imageUrl
    : undefined;

  const confirmAddToBag = () => {
    addItem({
      productId: null,
      productName,
      productImageUrl: null,
      design,
      unitPrice: price.total,
    });
    toast.success("Added to bag", { description: `${productName} — ${formatPKR(price.total)}` });
    setSheetOpen(false);
    setReviewOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 lg:pb-10">
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Canvas column */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-2xl border border-border bg-card/60 p-6">
            <CustomizerCanvas />
          </div>
        </div>

        {/* Desktop controls column */}
        <div className="hidden lg:block">
          <CustomizerControls />
          <div className="mt-4 space-y-3">
            <PriceDisplay />
            <Button size="lg" className="w-full" onClick={() => setReviewOpen(true)}>
              Add to Bag
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile sticky bottom sheet trigger */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 p-3 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-heading text-xl text-gradient-gold">{formatPKR(price.total)}</p>
          </div>
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger render={<Button variant="outline" className="gap-2" />}>
              <SlidersHorizontal className="h-4 w-4" />
              Customize
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
              <SheetHeader>
                <SheetTitle className="font-heading">Design Your Bracelet</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 px-4 pb-6">
                <CustomizerControls />
                <PriceDisplay />
              </div>
            </SheetContent>
          </Sheet>
          <Button size="lg" onClick={() => setReviewOpen(true)}>
            Add to Bag
          </Button>
        </div>
      </div>

      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Your Bracelet</DialogTitle>
          </DialogHeader>
          <BraceletShowcase beads={design.beads} charmImageUrl={charmImageUrl} />
          <p className="text-center text-sm text-muted-foreground">
            {design.wristSize} · {design.beads.length} beads
          </p>
          <div className="space-y-1.5 rounded-lg border border-border px-3 py-2">
            <PriceBreakdownLines
              base={price.base}
              beads={price.beads}
              charm={price.charm}
              packaging={price.packaging}
            />
          </div>
          <p className="text-center font-heading text-2xl text-gradient-gold">
            {formatPKR(price.total)}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setReviewOpen(false)}>
              Keep Editing
            </Button>
            <Button className="flex-1" onClick={confirmAddToBag}>
              Confirm &amp; Add to Bag
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
