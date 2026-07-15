// Shared domain types for the interactive bracelet customizer.

export type WristSize = "SMALL" | "MEDIUM" | "LARGE";

export const WRIST_SIZE_BEAD_COUNT: Record<WristSize, number> = {
  SMALL: 16,
  MEDIUM: 20,
  LARGE: 22,
};

export const WRIST_SIZE_LABEL: Record<WristSize, string> = {
  SMALL: "Small — 16 beads (~6.0\")",
  MEDIUM: "Medium — 20 beads (~7.0\")",
  LARGE: "Large — 22 beads (~7.75\")",
};

/** Free text — admins can add custom finishes beyond the built-in ones below. */
export type BeadFinish = string;

/** The 6 finishes with bespoke SVG gradient rendering (src/components/customizer/bead-gradients.tsx).
 * Any other admin-added finish falls back to the MATTE-style gradient. */
export const KNOWN_BEAD_FINISHES = [
  "PEARLESCENT",
  "GLOSSY_CANDY",
  "MATTE",
  "METALLIC",
  "WOOD",
  "GEMSTONE",
] as const;

export const BEAD_FINISH_LABEL: Record<string, string> = {
  PEARLESCENT: "Pearlescent Gleam",
  GLOSSY_CANDY: "Glossy Candy",
  MATTE: "Matte",
  METALLIC: "Metallic",
  WOOD: "Wood",
  GEMSTONE: "Gemstone",
};

export type BeadMM = "MM6" | "MM8" | "MM10";

/** A bead as defined in the admin inventory matrix. */
export interface BeadOption {
  id: string;
  name: string;
  hexCode: string | null;
  textureUrl: string | null;
  finish: BeadFinish;
  size: BeadMM;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface CharmOption {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  stock: number;
  isActive: boolean;
}

/** Free text — admins can add custom packaging types beyond the built-in ones. */
export type PackagingType = string;

export interface PackagingOptionData {
  id: string;
  type: PackagingType;
  name: string;
  imageUrl: string | null;
  price: number;
  isActive: boolean;
}

/** One slot in the circular loop. Always resolved to a concrete color + finish
 *  so the canvas can render even if the referenced inventory bead later changes. */
export interface PlacedBead {
  beadId: string | null;
  hexCode: string;
  finish: BeadFinish;
}

export type PatternMode = "SOLID" | "ALTERNATE" | "OMBRE" | "CUSTOM";

export interface GiftPackagingSelection {
  packagingId: string | null;
  note: string;
}

/** The full, serializable state of a bracelet design. */
export interface DesignState {
  wristSize: WristSize;
  beads: PlacedBead[];
  charmId: string | null;
  symmetryEnabled: boolean;
  packaging: GiftPackagingSelection;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  heroImageUrl: string;
  basePrice: number;
  wristSize: WristSize;
  beadConfig: PlacedBead[];
  charmId: string | null;
  isActive: boolean;
}

export const BASE_BRACELET_PRICE = 250;

/** Flat per-order delivery fee, shown at checkout and stored on Order.deliveryCharge. */
export const DELIVERY_CHARGE = 250;

export const DEFAULT_BEAD_HEX = "#e4d9c4";
export const DEFAULT_BEAD_FINISH: BeadFinish = "MATTE";

export function makeDefaultBead(): PlacedBead {
  return { beadId: null, hexCode: DEFAULT_BEAD_HEX, finish: DEFAULT_BEAD_FINISH };
}

export function makeDefaultBeads(count: number): PlacedBead[] {
  return Array.from({ length: count }, () => makeDefaultBead());
}
