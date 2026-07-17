"use client";

import { useCustomizer } from "@/context/CustomizerContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BEAD_FINISH_LABEL } from "@/types/customizer";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPKR } from "@/lib/currency";
import { beadSwatchBackground } from "@/lib/color-utils";

export function BeadEditorPanel() {
  const { activeBeadIndex, setActiveBeadIndex, beadOptions, setBeadAt, design } =
    useCustomizer();

  if (activeBeadIndex === null) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Click any bead on the loop to change its color, texture, or material.
        </CardContent>
      </Card>
    );
  }

  const activeSlot = design.beads[activeBeadIndex];
  const availableBeads = beadOptions.filter((b) => b.isActive && b.stock > 0);
  const grouped = availableBeads.reduce<Record<string, typeof availableBeads>>((acc, bead) => {
    (acc[bead.finish] ||= []).push(bead);
    return acc;
  }, {});

  /** How many other slots in this design already use each bead — used to stop
   * a bead being picked for more slots than its physical stock can cover. */
  const usedElsewhereById = design.beads.reduce<Record<string, number>>((acc, slot, i) => {
    if (i !== activeBeadIndex && slot.beadId) {
      acc[slot.beadId] = (acc[slot.beadId] ?? 0) + 1;
    }
    return acc;
  }, {});

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="font-heading text-lg">
          Editing Bead #{activeBeadIndex + 1}
        </CardTitle>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setActiveBeadIndex(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-5">
        {Object.entries(grouped).map(([finish, beads]) => (
          <div key={finish} className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {BEAD_FINISH_LABEL[finish] ?? finish}
            </p>
            <div className="flex flex-wrap gap-2">
              {beads.map((bead) => {
                const isSelected = activeSlot?.beadId === bead.id;
                const soldOut = !isSelected && (usedElsewhereById[bead.id] ?? 0) >= bead.stock;
                return (
                  <button
                    key={bead.id}
                    type="button"
                    disabled={soldOut}
                    title={
                      soldOut
                        ? `${bead.name} — no more in stock for this bracelet`
                        : `${bead.name} — ${formatPKR(bead.price)}`
                    }
                    onClick={() =>
                      setBeadAt(activeBeadIndex, bead.id, bead.hexCode ?? "#cccccc", bead.finish)
                    }
                    className={cn(
                      "relative flex h-9 w-9 items-center justify-center rounded-full border-2 shadow-sm transition-transform",
                      soldOut
                        ? "cursor-not-allowed border-border opacity-40"
                        : "hover:scale-110",
                      isSelected ? "border-primary ring-2 ring-primary/40" : "border-border"
                    )}
                    style={{
                      background: beadSwatchBackground(bead.hexCode ?? "#cccccc", bead.textureUrl),
                    }}
                  >
                    {isSelected && (
                      <Check
                        className="h-4 w-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
                        color="#ffffff"
                        strokeWidth={3}
                      />
                    )}
                    {soldOut && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="h-0.5 w-6 rotate-45 rounded-full bg-destructive" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {availableBeads.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No beads currently in stock. Please check back soon.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
