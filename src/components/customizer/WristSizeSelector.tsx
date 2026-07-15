"use client";

import { useCustomizer } from "@/context/CustomizerContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { WRIST_SIZE_LABEL, WristSize } from "@/types/customizer";

export function WristSizeSelector() {
  const { design, setWristSize } = useCustomizer();

  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">
        Wrist Size
      </Label>
      <Select value={design.wristSize} onValueChange={(v) => setWristSize(v as WristSize)}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(WRIST_SIZE_LABEL) as WristSize[]).map((size) => (
            <SelectItem key={size} value={size}>
              {WRIST_SIZE_LABEL[size]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
