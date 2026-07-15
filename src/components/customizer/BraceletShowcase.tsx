import { BeadGradientDef, gradientIdFor } from "./bead-gradients";
import { cn } from "@/lib/utils";
import type { PlacedBead } from "@/types/customizer";

const VIEWBOX = 320;
const CENTER = VIEWBOX / 2;
const LOOP_RADIUS = 112;
const BEAD_RADIUS = 15;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function beadPosition(index: number, total: number) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2;
  return {
    x: round2(CENTER + LOOP_RADIUS * Math.cos(angle)),
    y: round2(CENTER + LOOP_RADIUS * Math.sin(angle)),
  };
}

/** Small deterministic per-bead jitter so the loop reads as beads laid out on
 * fabric rather than a perfect geometric ring. */
function jitterFor(index: number) {
  const n = Math.sin(index * 12.9898) * 43758.5453;
  const frac = n - Math.floor(n);
  return {
    scale: 0.92 + frac * 0.16,
    offset: (frac - 0.5) * 6,
  };
}

export interface BraceletShowcaseProps {
  beads: PlacedBead[];
  charmImageUrl?: string | null;
  className?: string;
}

/** A static, styled "product photo" render of a bracelet design — soft
 * fabric backdrop, per-bead shadow/highlight, no drag/rotate interaction. */
export function BraceletShowcase({ beads, charmImageUrl, className }: BraceletShowcaseProps) {
  const total = beads.length;

  return (
    <div
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-2xl",
        className
      )}
      style={{
        background:
          "radial-gradient(120% 120% at 30% 20%, #3a5a63 0%, #1f3b42 55%, #142a30 100%)",
      }}
    >
      {/* soft blurred fabric folds */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 2px, transparent 2px, transparent 26px)",
          filter: "blur(6px)",
        }}
      />
      <svg viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} className="relative h-full w-full">
        <defs>
          {beads.map((slot, i) => (
            <BeadGradientDef
              key={i}
              id={gradientIdFor(slot.finish, i, "showcase")}
              hexCode={slot.hexCode}
              finish={slot.finish}
            />
          ))}
          <radialGradient id="showcase-contact-shadow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#000000" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="showcase-charm-shine" cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#e8cdd2" stopOpacity={0.4} />
          </radialGradient>
        </defs>

        {/* contact shadow beneath the loop */}
        <ellipse
          cx={CENTER}
          cy={CENTER + LOOP_RADIUS + 14}
          rx={LOOP_RADIUS * 0.8}
          ry={16}
          fill="url(#showcase-contact-shadow)"
        />

        {/* the connecting cord */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={LOOP_RADIUS}
          fill="none"
          stroke="#e8cdd2"
          strokeOpacity={0.35}
          strokeWidth={2}
        />

        {beads.map((slot, i) => {
          const { x, y } = beadPosition(i, total);
          const { scale, offset } = jitterFor(i);
          const r = BEAD_RADIUS * scale;
          return (
            <g key={i} style={{ filter: "drop-shadow(0 3px 3px rgba(0,0,0,0.35))" }}>
              <circle
                cx={x}
                cy={y + offset}
                r={r}
                fill={`url(#${gradientIdFor(slot.finish, i, "showcase")})`}
                stroke="rgba(0,0,0,0.15)"
                strokeWidth={0.75}
              />
            </g>
          );
        })}

        {charmImageUrl && (
          <g
            transform={`translate(${CENTER}, ${CENTER + LOOP_RADIUS + 2})`}
            style={{ filter: "drop-shadow(0 4px 4px rgba(0,0,0,0.4))" }}
          >
            <circle r={26} fill="url(#showcase-charm-shine)" stroke="#e8cdd2" strokeWidth={1} />
            <image
              href={charmImageUrl}
              x={-19}
              y={-19}
              width={38}
              height={38}
              preserveAspectRatio="xMidYMid slice"
              clipPath="circle(19px at 19px 19px)"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
