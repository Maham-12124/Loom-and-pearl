"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomizer } from "@/context/CustomizerContext";
import { WristSizeSelector } from "@/components/customizer/WristSizeSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ImageUrlField } from "@/components/admin/ImageUrlField";
import { toast } from "sonner";

interface ProductMeta {
  id?: string;
  name: string;
  slug: string;
  description: string;
  heroImageUrl: string;
  basePrice: number;
  isActive: boolean;
}

export function ProductDesignForm({ initialMeta }: { initialMeta?: ProductMeta }) {
  const { design } = useCustomizer();
  const router = useRouter();
  const [meta, setMeta] = useState<ProductMeta>(
    initialMeta ?? {
      name: "",
      slug: "",
      description: "",
      heroImageUrl: "",
      basePrice: 250,
      isActive: true,
    }
  );
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(meta.id);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: meta.name,
      slug: meta.slug,
      description: meta.description,
      heroImageUrl: meta.heroImageUrl,
      basePrice: Number(meta.basePrice),
      isActive: meta.isActive,
      wristSize: design.wristSize,
      beadConfig: design.beads,
      charmId: design.charmId,
    };
    try {
      const res = await fetch(isEdit ? `/api/admin/products/${meta.id}` : "/api/admin/products", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error?.formErrors?.[0] ?? data.error ?? "Could not save product.");
        return;
      }
      toast.success(isEdit ? "Product updated" : "Product created");
      router.push("/admin/products");
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={meta.name} onChange={(e) => setMeta({ ...meta, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input
                value={meta.slug}
                onChange={(e) => setMeta({ ...meta, slug: e.target.value })}
                placeholder="ivory-gold-classic"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                value={meta.description}
                onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                rows={3}
              />
            </div>
            <ImageUrlField
              label="Hero Image"
              value={meta.heroImageUrl}
              onChange={(url) => setMeta({ ...meta, heroImageUrl: url })}
            />
            <div className="space-y-1.5">
              <Label>Base Price (Rs.)</Label>
              <Input
                type="number"
                step="10"
                value={meta.basePrice}
                onChange={(e) => setMeta({ ...meta, basePrice: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <Label>Active / Listed</Label>
              <Switch
                checked={meta.isActive}
                onCheckedChange={(v) => setMeta({ ...meta, isActive: v })}
              />
            </div>
          </CardContent>
        </Card>

        <WristSizeSelector />

        <Button
          size="lg"
          className="w-full"
          onClick={handleSave}
          disabled={saving || !meta.name || !meta.slug || !meta.heroImageUrl}
        >
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </div>
  );
}
