"use client";

import { useState } from "react";
import { useCustomizer } from "@/context/CustomizerContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { beadSwatchBackground } from "@/lib/color-utils";
import type { BeadOption } from "@/types/customizer";

function BeadSwatchPicker({
  beads,
  selectedId,
  onSelect,
}: {
  beads: BeadOption[];
  selectedId?: string;
  onSelect: (bead: BeadOption) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {beads.map((bead) => (
        <button
          key={bead.id}
          type="button"
          title={bead.name}
          onClick={() => onSelect(bead)}
          className={cn(
            "h-8 w-8 rounded-full border-2 shadow-sm transition-transform hover:scale-110",
            selectedId === bead.id ? "border-primary ring-2 ring-primary/40" : "border-border"
          )}
          style={{
            background: beadSwatchBackground(bead.hexCode ?? "#ccc", bead.textureUrl),
          }}
        />
      ))}
    </div>
  );
}

export function PatternPresetsPanel() {
  const { beadOptions, design, applySolid, applyAlternate, applyOmbre, toggleSymmetry } =
    useCustomizer();
  const availableBeads = beadOptions.filter((b) => b.isActive && b.stock > 0);

  const [solidId, setSolidId] = useState<string | undefined>();
  const [altAId, setAltAId] = useState<string | undefined>();
  const [altBId, setAltBId] = useState<string | undefined>();
  const [ombreStart, setOmbreStart] = useState("#d8c39b");
  const [ombreEnd, setOmbreEnd] = useState("#b08d57");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">Pattern Presets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <Tabs defaultValue="solid">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="solid">Solid</TabsTrigger>
            <TabsTrigger value="alternate">Alternate</TabsTrigger>
            <TabsTrigger value="ombre">Ombre</TabsTrigger>
          </TabsList>

          <TabsContent value="solid" className="space-y-3 pt-3">
            <p className="text-sm text-muted-foreground">Apply one bead to the entire loop.</p>
            <BeadSwatchPicker
              beads={availableBeads}
              selectedId={solidId}
              onSelect={(bead) => {
                setSolidId(bead.id);
                applySolid(bead.id, bead.hexCode ?? "#ccc", bead.finish);
              }}
            />
          </TabsContent>

          <TabsContent value="alternate" className="space-y-4 pt-3">
            <p className="text-sm text-muted-foreground">Pick two beads to alternate A / B.</p>
            <div className="space-y-1.5">
              <Label className="text-xs">Color A</Label>
              <BeadSwatchPicker beads={availableBeads} selectedId={altAId} onSelect={(b) => setAltAId(b.id)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Color B</Label>
              <BeadSwatchPicker beads={availableBeads} selectedId={altBId} onSelect={(b) => setAltBId(b.id)} />
            </div>
            <Button
              size="sm"
              disabled={!altAId || !altBId}
              onClick={() => {
                const a = availableBeads.find((b) => b.id === altAId);
                const b = availableBeads.find((b) => b.id === altBId);
                if (!a || !b) return;
                applyAlternate(
                  { beadId: a.id, hexCode: a.hexCode ?? "#ccc", finish: a.finish },
                  { beadId: b.id, hexCode: b.hexCode ?? "#ccc", finish: b.finish }
                );
              }}
            >
              Apply Alternating Pattern
            </Button>
          </TabsContent>

          <TabsContent value="ombre" className="space-y-4 pt-3">
            <p className="text-sm text-muted-foreground">
              Blend smoothly from a start color to an end color across the loop.
            </p>
            <div className="flex items-center gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Start</Label>
                <input
                  type="color"
                  value={ombreStart}
                  onChange={(e) => setOmbreStart(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded border border-border bg-transparent"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End</Label>
                <input
                  type="color"
                  value={ombreEnd}
                  onChange={(e) => setOmbreEnd(e.target.value)}
                  className="h-9 w-14 cursor-pointer rounded border border-border bg-transparent"
                />
              </div>
            </div>
            <Button size="sm" onClick={() => applyOmbre(ombreStart, ombreEnd, "PEARLESCENT")}>
              Apply Ombre Gradient
            </Button>
          </TabsContent>
        </Tabs>

        <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
          <div>
            <Label htmlFor="symmetry" className="text-sm">
              Symmetry Mode
            </Label>
            <p className="text-xs text-muted-foreground">Mirror edits across the loop</p>
          </div>
          <Switch
            id="symmetry"
            checked={design.symmetryEnabled}
            onCheckedChange={() => toggleSymmetry()}
          />
        </div>
      </CardContent>
    </Card>
  );
}
