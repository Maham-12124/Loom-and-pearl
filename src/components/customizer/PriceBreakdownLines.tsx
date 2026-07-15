import { formatPKR } from "@/lib/currency";

function Line({ label, value }: { label: string; value: number }) {
  if (value === 0) return null;
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>{label}</span>
      <span>{formatPKR(value)}</span>
    </div>
  );
}

/** Beads / Charm / Making / Packaging line items — shared between the live
 * customizer's PriceDisplay and checkout's itemized Order Review so both
 * present the same breakdown identically. */
export function PriceBreakdownLines({
  base,
  beads,
  charm,
  packaging,
  baseLabel = "Making",
}: {
  base: number;
  beads: number;
  charm: number;
  packaging: number;
  baseLabel?: string;
}) {
  return (
    <>
      <Line label={baseLabel} value={base} />
      <Line label="Beads" value={beads} />
      <Line label="Charm" value={charm} />
      <Line label="Packaging" value={packaging} />
    </>
  );
}
