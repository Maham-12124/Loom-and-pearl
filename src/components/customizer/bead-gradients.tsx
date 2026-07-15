import type { BeadFinish } from "@/types/customizer";

export function gradientIdFor(finish: BeadFinish, index: number, prefix = "bead-finish") {
  return `${prefix}-${finish}-${index}`;
}

/** Per-finish SVG gradient defs so each bead reads as pearlescent, glossy
 * candy, matte, metallic, wood, or gemstone rather than a flat circle. */
export function BeadGradientDef({
  id,
  hexCode,
  finish,
}: {
  id: string;
  hexCode: string;
  finish: BeadFinish;
}) {
  switch (finish) {
    case "PEARLESCENT":
      return (
        <radialGradient id={id} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="30%" stopColor={hexCode} stopOpacity={0.55} />
          <stop offset="75%" stopColor={hexCode} stopOpacity={0.95} />
          <stop offset="100%" stopColor="#ffffff" stopOpacity={0.25} />
        </radialGradient>
      );
    case "GLOSSY_CANDY":
      return (
        <radialGradient id={id} cx="32%" cy="26%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.9} />
          <stop offset="18%" stopColor={hexCode} stopOpacity={0.5} />
          <stop offset="60%" stopColor={hexCode} stopOpacity={1} />
          <stop offset="100%" stopColor={hexCode} stopOpacity={1} />
        </radialGradient>
      );
    case "METALLIC":
      return (
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.8} />
          <stop offset="45%" stopColor={hexCode} stopOpacity={1} />
          <stop offset="100%" stopColor="#3a3a3a" stopOpacity={0.7} />
        </linearGradient>
      );
    case "WOOD":
      return (
        <radialGradient id={id} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={hexCode} stopOpacity={0.85} />
          <stop offset="100%" stopColor="#3d2b1f" stopOpacity={0.55} />
        </radialGradient>
      );
    case "GEMSTONE":
      return (
        <radialGradient id={id} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="25%" stopColor={hexCode} stopOpacity={0.7} />
          <stop offset="70%" stopColor={hexCode} stopOpacity={1} />
          <stop offset="100%" stopColor="#000000" stopOpacity={0.15} />
        </radialGradient>
      );
    case "MATTE":
    default:
      return (
        <radialGradient id={id} cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
          <stop offset="100%" stopColor={hexCode} stopOpacity={1} />
        </radialGradient>
      );
  }
}
