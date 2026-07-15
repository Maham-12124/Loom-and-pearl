// Color math helpers for pattern presets (alternate, ombre) in the customizer.

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

/** Linear interpolation between two hex colors, t in [0, 1]. */
export function lerpHex(hexA: string, hexB: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(hexA);
  const [r2, g2, b2] = hexToRgb(hexB);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

/** Smooth ombre gradient across `count` slots from startHex to endHex. */
export function generateOmbre(
  startHex: string,
  endHex: string,
  count: number
): string[] {
  if (count <= 1) return [startHex];
  return Array.from({ length: count }, (_, i) => lerpHex(startHex, endHex, i / (count - 1)));
}

/** Alternating [A, B, A, B, ...] across `count` slots. */
export function generateAlternate(
  hexA: string,
  hexB: string,
  count: number
): string[] {
  return Array.from({ length: count }, (_, i) => (i % 2 === 0 ? hexA : hexB));
}

/** Mirrors index `i` in a loop of `count` beads onto its symmetric counterpart
 * across the vertical axis (slot 0 stays fixed, the rest fold left/right). */
export function symmetricIndex(i: number, count: number): number {
  if (i === 0) return 0;
  return (count - i) % count;
}

/** A glossy, 3D-looking swatch background so bead pickers read as real beads
 * rather than flat solid-color dots. Uses a photo texture when available,
 * otherwise a highlighted radial gradient matching the canvas bead render. */
export function beadSwatchBackground(hexCode: string, textureUrl?: string | null): string {
  if (textureUrl) return `url(${textureUrl}) center/cover`;
  return `radial-gradient(circle at 32% 28%, #ffffff 0%, ${hexCode}cc 30%, ${hexCode} 70%, ${hexCode} 100%)`;
}
