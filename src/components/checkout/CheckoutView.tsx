"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore, cartTotal, CartLineItem } from "@/store/cart-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BraceletShowcase } from "@/components/customizer/BraceletShowcase";
import { PriceBreakdownLines } from "@/components/customizer/PriceBreakdownLines";
import { ImageUrlField } from "@/components/admin/ImageUrlField";
import { calculatePrice } from "@/lib/design";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatPKR } from "@/lib/currency";
import { Banknote, Smartphone, CreditCard } from "lucide-react";
import { DELIVERY_CHARGE } from "@/types/customizer";
import type { BeadOption, CharmOption, PackagingOptionData } from "@/types/customizer";
import type { StoreSettingsData } from "@/components/admin/StoreSettingsManager";

type PaymentMethod = "COD" | "JAZZCASH_EASYPAISA";

const PAYMENT_OPTIONS: {
  value: PaymentMethod;
  label: string;
  icon: typeof Banknote;
}[] = [
  { value: "COD", label: "Cash on Delivery", icon: Banknote },
  { value: "JAZZCASH_EASYPAISA", label: "JazzCash / EasyPaisa", icon: Smartphone },
];

function ItemPriceBreakdown({
  item,
  beadOptions,
  charmOptions,
  packagingOptions,
}: {
  item: CartLineItem;
  beadOptions: BeadOption[];
  charmOptions: CharmOption[];
  packagingOptions: PackagingOptionData[];
}) {
  if (item.productId === null) {
    const price = calculatePrice(item.design, beadOptions, charmOptions, packagingOptions);
    return (
      <PriceBreakdownLines
        base={price.base}
        beads={price.beads}
        charm={price.charm}
        packaging={price.packaging}
      />
    );
  }

  const packagingPrice = item.design.packaging.packagingId
    ? packagingOptions.find((p) => p.id === item.design.packaging.packagingId)?.price ?? 0
    : 0;
  const braceletPrice = item.unitPrice - packagingPrice;

  return (
    <>
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Bracelet price</span>
        <span>{formatPKR(braceletPrice)}</span>
      </div>
      {packagingPrice > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Packaging</span>
          <span>{formatPKR(packagingPrice)}</span>
        </div>
      )}
    </>
  );
}

export function CheckoutView({
  beadOptions,
  charmOptions,
  packagingOptions,
  storeSettings,
}: {
  beadOptions: BeadOption[];
  charmOptions: CharmOption[];
  packagingOptions: PackagingOptionData[];
  storeSettings: StoreSettingsData;
}) {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const router = useRouter();
  const [form, setForm] = useState({
    shippingName: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPostal: "",
    shippingCountry: "",
    paymentMethod: "" as PaymentMethod | "",
    paymentReference: "",
    paymentScreenshotUrl: "",
  });
  const [placing, setPlacing] = useState(false);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentReference: form.paymentReference || null,
          paymentScreenshotUrl: form.paymentScreenshotUrl || null,
          items,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.formErrors?.[0] ?? data.error ?? "Could not place your order.");
        return;
      }
      clear();
      router.push(`/order-confirmation/${data.orderId}`);
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="font-heading text-2xl">Your bag is empty</p>
      </div>
    );
  }

  const itemsTotal = cartTotal(items);
  const total = itemsTotal + DELIVERY_CHARGE;
  const isJazzCash = form.paymentMethod === "JAZZCASH_EASYPAISA";
  const formComplete =
    ["shippingName", "shippingAddress", "shippingCity", "shippingPostal", "shippingCountry"].every(
      (k) => form[k as keyof typeof form].toString().trim().length > 0
    ) &&
    form.paymentMethod !== "" &&
    (!isJazzCash || form.paymentScreenshotUrl.trim().length > 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 font-heading text-3xl">Checkout</h1>
      <div className="grid gap-8 md:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Shipping Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input
                  value={form.shippingName}
                  onChange={(e) => setForm({ ...form, shippingName: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Input
                  value={form.shippingAddress}
                  onChange={(e) => setForm({ ...form, shippingAddress: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input
                    value={form.shippingCity}
                    onChange={(e) => setForm({ ...form, shippingCity: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Postal Code</Label>
                  <Input
                    value={form.shippingPostal}
                    onChange={(e) => setForm({ ...form, shippingPostal: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Country</Label>
                <Input
                  value={form.shippingCountry}
                  onChange={(e) => setForm({ ...form, shippingCountry: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_OPTIONS.map(({ value, label, icon: Icon }) => {
                  const selected = form.paymentMethod === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, paymentMethod: value })}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-lg border px-3 py-3 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:bg-secondary/40"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  );
                })}
                <button
                  type="button"
                  disabled
                  aria-disabled
                  className="flex cursor-not-allowed flex-col items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-3 text-sm text-muted-foreground opacity-60"
                >
                  <CreditCard className="h-4 w-4" />
                  Card / Online
                  <Badge variant="secondary" className="mt-0.5">
                    Coming Soon
                  </Badge>
                </button>
              </div>

              {form.paymentMethod === "COD" && (
                <div className="rounded-lg border border-border bg-secondary/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    You may pay in cash when your order is delivered.
                  </p>
                </div>
              )}

              {isJazzCash && (
                <div className="space-y-3 rounded-lg border border-border bg-secondary/30 p-3">
                  {storeSettings.jazzcashAccountNumber ? (
                    <div className="rounded-lg border border-border bg-card p-3 text-center">
                      <p className="text-xs text-muted-foreground">JazzCash Account Number</p>
                      <p className="font-heading text-xl">{storeSettings.jazzcashAccountNumber}</p>
                      {storeSettings.jazzcashAccountName && (
                        <p className="text-xs text-muted-foreground">
                          Account Name: {storeSettings.jazzcashAccountName}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      You&apos;ll receive our payment details after placing your order.
                    </p>
                  )}

                  <ImageUrlField
                    label="Transaction Screenshot *"
                    value={form.paymentScreenshotUrl}
                    onChange={(url) => setForm({ ...form, paymentScreenshotUrl: url })}
                    uploadEndpoint="/api/checkout/upload-screenshot"
                  />

                  <div className="space-y-1.5">
                    <Label>Transaction ID / Reference (optional)</Label>
                    <Input
                      value={form.paymentReference}
                      onChange={(e) => setForm({ ...form, paymentReference: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="font-heading text-lg">Order Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => {
              const charmImageUrl = item.design.charmId
                ? charmOptions.find((c) => c.id === item.design.charmId)?.imageUrl
                : undefined;
              return (
                <div key={item.id} className="space-y-2 border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {item.productImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.productImageUrl}
                        alt={item.productName}
                        className="h-14 w-14 shrink-0 rounded-2xl object-cover"
                      />
                    ) : (
                      <BraceletShowcase
                        className="h-14 w-14 shrink-0"
                        beads={item.design.beads}
                        charmImageUrl={charmImageUrl}
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                    </div>
                  </div>
                  <ItemPriceBreakdown
                    item={item}
                    beadOptions={beadOptions}
                    charmOptions={charmOptions}
                    packagingOptions={packagingOptions}
                  />
                  <div className="flex justify-between text-sm font-medium">
                    <span>Item total</span>
                    <span>{formatPKR(item.unitPrice * item.quantity)}</span>
                  </div>
                </div>
              );
            })}
            <div className="flex justify-between border-t border-border pt-2 text-sm text-muted-foreground">
              <span>Delivery</span>
              <span>{formatPKR(DELIVERY_CHARGE)}</span>
            </div>
            <div className="flex justify-between font-heading text-xl">
              <span>Total</span>
              <span className="text-gradient-gold">{formatPKR(total)}</span>
            </div>
            <Button
              className="mt-3 w-full"
              size="lg"
              disabled={!formComplete || placing}
              onClick={handlePlaceOrder}
            >
              {placing ? "Placing Order…" : "Place Order"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
