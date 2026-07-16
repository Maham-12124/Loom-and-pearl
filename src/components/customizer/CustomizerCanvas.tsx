"use client";

import { useMemo, useRef, useState, useCallback } from "react";
import { useCustomizer } from "@/context/CustomizerContext";
import { cn } from "@/lib/utils";
import { BeadGradientDef, gradientIdFor } from "./bead-gradients";

const VIEWBOX = 320;
const CENTER = VIEWBOX / 2;
const LOOP_RADIUS = 118;

const BEAD_RADIUS_BY_MM: Record<string, number> = {
  MM6: 10,
  MM8: 13,
  MM10: 16,
};

/** Rounded to 2dp so server/client trig results serialize identically and
 * don't trigger a hydration mismatch on tiny floating-point differences. */
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

export function CustomizerCanvas({ className }: { className?: string }) {
  const { design, activeBeadIndex, setActiveBeadIndex, beadOptions, charmOptions } =
    useCustomizer();
  const total = design.beads.length;

  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 8, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const drag = useRef<{ startX: number; startY: number; rotX: number; rotY: number } | null>(
    null
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      drag.current = { startX: e.clientX, startY: e.clientY, rotX: rotation.x, rotY: rotation.y };
      setIsDragging(true);
      (e.target as Element).setPointerCapture(e.pointerId);
    },
    [rotation]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    setRotation({
      x: Math.max(-35, Math.min(35, drag.current.rotX - dy * 0.3)),
      y: Math.max(-50, Math.min(50, drag.current.rotY + dx * 0.3)),
    });
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current = null;
    setIsDragging(false);
  }, []);

  const resetTilt = useCallback(() => setRotation({ x: 8, y: 0 }), []);

  const charm = design.charmId
    ? charmOptions.find((c) => c.id === design.charmId)
    : undefined;

  const beadSizes = useMemo(
    () =>
      design.beads.map((slot) => {
        const inventory = slot.beadId ? beadOptions.find((b) => b.id === slot.beadId) : undefined;
        return BEAD_RADIUS_BY_MM[inventory?.size ?? "MM8"] ?? BEAD_RADIUS_BY_MM.MM8;
      }),
    [design.beads, beadOptions]
  );

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div
        ref={containerRef}
        className="relative aspect-square w-full max-w-[420px] touch-none select-none"
        style={{ perspective: "900px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onDoubleClick={resetTilt}
      >
        <svg
          viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
          className="h-full w-full drop-shadow-xl"
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transformStyle: "preserve-3d",
            transition: isDragging ? "none" : "transform 0.4s ease-out",
          }}
        >
          <defs>
            {design.beads.map((slot, i) => (
              <BeadGradientDef
                key={i}
                id={gradientIdFor(slot.finish, i)}
                hexCode={slot.hexCode}
                finish={slot.finish}
              />
            ))}
            <radialGradient id="charm-shine" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#fff" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#d8c39b" stopOpacity={0.4} />
            </radialGradient>
          </defs>

          {/* the connecting cord */}
          <circle
            cx={CENTER}
            cy={CENTER}
            r={LOOP_RADIUS}
            fill="none"
            stroke="var(--color-gold-soft, #fce49b)"
            strokeOpacity={0.5}
            strokeWidth={2}
          />

          {design.beads.map((slot, i) => {
            const { x, y } = beadPosition(i, total);
            const r = beadSizes[i];
            const isActive = activeBeadIndex === i;
            return (
              <g key={i}>
                {isActive && (
                  <circle
                    cx={x}
                    cy={y}
                    r={r + 5}
                    fill="none"
                    stroke="var(--color-primary, #b08d57)"
                    strokeWidth={2}
                  >
                    <animate
                      attributeName="r"
                      values={`${r + 4};${r + 7};${r + 4}`}
                      dur="1.6s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
                <circle
                  role="button"
                  aria-label={`Bead ${i + 1} of ${total}`}
                  tabIndex={0}
                  cx={x}
                  cy={y}
                  r={r}
                  fill={`url(#${gradientIdFor(slot.finish, i)})`}
                  fillOpacity={slot.beadId ? 1 : 0.5}
                  stroke={
                    isActive
                      ? "var(--color-primary, #b08d57)"
                      : slot.beadId
                        ? "rgba(0,0,0,0.12)"
                        : "rgba(0,0,0,0.3)"
                  }
                  strokeWidth={isActive ? 1.5 : 0.75}
                  strokeDasharray={slot.beadId ? undefined : "2 2"}
                  className="cursor-pointer transition-transform duration-150 hover:scale-110"
                  style={{ transformOrigin: `${x}px ${y}px` }}
                  onClick={() => setActiveBeadIndex(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setActiveBeadIndex(i);
                  }}
                />
              </g>
            );
          })}

          {charm && (
            <g
              className="cursor-pointer"
              onClick={() => setActiveBeadIndex(null)}
              transform={`translate(${CENTER}, ${CENTER + LOOP_RADIUS})`}
            >
              <circle r={20} fill="url(#charm-shine)" stroke="#b08d57" strokeWidth={1} />
              <image
                href={charm.imageUrl}
                x={-14}
                y={-14}
                width={28}
                height={28}
                preserveAspectRatio="xMidYMid slice"
                clipPath="circle(14px at 14px 14px)"
              />
            </g>
          )}
        </svg>
      </div>
      <p className="text-xs text-muted-foreground">
        Drag to rotate &middot; double-click to reset &middot; click a bead to edit it
      </p>
    </div>
  );
}
