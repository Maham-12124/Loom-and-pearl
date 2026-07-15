import {
  BASE_BRACELET_PRICE,
  BeadOption,
  CharmOption,
  DesignState,
  PackagingOptionData,
  PlacedBead,
  WRIST_SIZE_BEAD_COUNT,
  WristSize,
  makeDefaultBead,
} from "@/types/customizer";

/** Live price calculator: base + sum(bead prices) + charm + packaging. */
export function calculatePrice(
  design: DesignState,
  beadOptions: BeadOption[],
  charmOptions: CharmOption[],
  packagingOptions: PackagingOptionData[]
): { base: number; beads: number; charm: number; packaging: number; total: number } {
  const beadById = new Map(beadOptions.map((b) => [b.id, b]));
  const beadsTotal = design.beads.reduce((sum, slot) => {
    if (!slot.beadId) return sum;
    const bead = beadById.get(slot.beadId);
    return sum + (bead ? bead.price : 0);
  }, 0);

  const charm = design.charmId
    ? charmOptions.find((c) => c.id === design.charmId)?.price ?? 0
    : 0;

  const packaging = design.packaging.packagingId
    ? packagingOptions.find((p) => p.id === design.packaging.packagingId)?.price ?? 0
    : 0;

  const base = BASE_BRACELET_PRICE;
  return { base, beads: beadsTotal, charm, packaging, total: base + beadsTotal + charm + packaging };
}

/** Reconstructs a design from URL search params. Falls back to defaults for
 * anything malformed so a corrupted link never crashes the canvas. */
export function parseDesignFromParams(params: URLSearchParams): Partial<DesignState> {
  const result: Partial<DesignState> = {};

  const size = params.get("size");
  if (size === "SMALL" || size === "MEDIUM" || size === "LARGE") {
    result.wristSize = size as WristSize;
  }

  const beadsParam = params.get("beads");
  if (beadsParam) {
    const beads: PlacedBead[] = beadsParam.split(",").map((token) => {
      const [hex, code] = token.split(".");
      const finish = code ? decodeURIComponent(code) : "MATTE";
      const valid = /^[0-9a-fA-F]{6}$/.test(hex) ? `#${hex}` : makeDefaultBead().hexCode;
      return { beadId: null, hexCode: valid, finish };
    });
    result.beads = beads;
  }

  const charm = params.get("charm");
  if (charm) result.charmId = charm;

  result.symmetryEnabled = params.get("sym") === "1";

  return result;
}

/** Resizes a bead array to `targetCount`, preserving as much of the existing
 * pattern as possible: truncates or repeats the tail pattern when growing. */
export function resizeBeads(current: PlacedBead[], targetCount: number): PlacedBead[] {
  if (current.length === targetCount) return current;
  if (current.length > targetCount) return current.slice(0, targetCount);

  const result = [...current];
  while (result.length < targetCount) {
    const source = current[result.length % current.length] ?? makeDefaultBead();
    result.push({ ...source });
  }
  return result;
}

export function beadCountForSize(size: WristSize): number {
  return WRIST_SIZE_BEAD_COUNT[size];
}
