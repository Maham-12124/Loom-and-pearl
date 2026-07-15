"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore, cartTotal } from "@/store/cart-store";
import { Button, buttonVariants } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, Minus, Plus } from "lucide-react";
import { BraceletShowcase } from "@/components/customizer/BraceletShowcase";
import type { CharmOption, PackagingOptionData } from "@/types/customizer";
import { formatPKR } from "@/lib/currency";

export function CartView({
  packagingOptions,
  charmOptions,
}: {
  packagingOptions: PackagingOptionData[];
  charmOptions: CharmOption[];
}) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const updatePackaging = useCartStore((s) => s.updatePackaging);
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-heading text-2xl">Your bag is empty</p>
        <p className="mt-2 text-muted-foreground">Start designing something beautiful.</p>
        <Link href="/customize" className={buttonVariants({ className: "mt-6" })}>
          Start Designing
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 font-heading text-3xl">Your Bag</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id}>
            <CardContent className="space-y-4 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  {item.productImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.productImageUrl}
                      alt={item.productName}
                      className="h-16 w-16 shrink-0 rounded-2xl object-cover"
                    />
                  ) : (
                    <BraceletShowcase
                      className="h-16 w-16 shrink-0"
                      beads={item.design.beads}
                      charmImageUrl={
                        item.design.charmId
                          ? charmOptions.find((c) => c.id === item.design.charmId)?.imageUrl
                          : undefined
                      }
                    />
                  )}
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.design.wristSize} · {item.design.beads.length} beads
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(item.id, item.quantity - 1)}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="ml-auto font-heading text-lg">
                    {formatPKR(item.unitPrice * item.quantity)}
                  </span>
                </div>

                <Select
                  value={item.design.packaging.packagingId ?? "none"}
                  onValueChange={(v) =>
                    updatePackaging(
                      item.id,
                      v === "none" ? null : v,
                      item.design.packaging.note,
                      packagingOptions
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Gift packaging" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No packaging</SelectItem>
                    {packagingOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} (+{formatPKR(p.price)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                placeholder="Add a handwritten gift note for this item…"
                value={item.design.packaging.note}
                onChange={(e) =>
                  updatePackaging(
                    item.id,
                    item.design.packaging.packagingId,
                    e.target.value,
                    packagingOptions
                  )
                }
                rows={2}
                maxLength={240}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
        <span className="font-heading text-xl">Total</span>
        <span className="font-heading text-3xl text-gradient-gold">
          {formatPKR(cartTotal(items))}
        </span>
      </div>
      <Button size="lg" className="mt-4 w-full" onClick={() => router.push("/checkout")}>
        Proceed to Checkout
      </Button>
    </div>
  );
}
