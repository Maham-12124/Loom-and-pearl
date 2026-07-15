"use client";

import { useCustomizer } from "@/context/CustomizerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/currency";

export function GiftPackagingPanel() {
  const { packagingOptions, design, setPackagingId, setGiftNote } = useCustomizer();
  const available = packagingOptions.filter((p) => p.isActive);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Gift Packaging</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setPackagingId(null)}
            className={cn(
              "rounded-lg border px-3 py-3 text-left text-sm transition-colors",
              design.packaging.packagingId === null
                ? "border-primary bg-secondary/60"
                : "border-border hover:bg-secondary/30"
            )}
          >
            <p className="font-medium">Standard</p>
            <p className="text-xs text-muted-foreground">No gift packaging</p>
          </button>
          {available.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPackagingId(option.id)}
              className={cn(
                "rounded-lg border px-3 py-3 text-left text-sm transition-colors",
                design.packaging.packagingId === option.id
                  ? "border-primary bg-secondary/60"
                  : "border-border hover:bg-secondary/30"
              )}
            >
              <p className="font-medium">{option.name}</p>
              <p className="text-xs text-muted-foreground">+{formatPKR(option.price)}</p>
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gift-note" className="text-xs uppercase tracking-wide text-muted-foreground">
            Handwritten Message (optional)
          </Label>
          <Textarea
            id="gift-note"
            placeholder="Write a short note for the recipient…"
            maxLength={240}
            value={design.packaging.note}
            onChange={(e) => setGiftNote(e.target.value)}
            rows={3}
          />
          <p className="text-right text-xs text-muted-foreground">
            {design.packaging.note.length}/240
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
