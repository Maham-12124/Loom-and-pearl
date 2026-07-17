"use client";

import { useState } from "react";
import { formatPKR } from "@/lib/currency";

export interface RevenueDay {
  label: string;
  revenue: number;
}

const WIDTH = 720;
const HEIGHT = 220;
const PADDING_LEFT = 44;
const PADDING_BOTTOM = 24;
const PADDING_TOP = 12;

export function RevenueChart({ days }: { days: RevenueDay[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const max = Math.max(1, ...days.map((d) => d.revenue));
  const niceMax = Math.ceil(max / 500) * 500 || 500;

  const plotWidth = WIDTH - PADDING_LEFT - 8;
  const plotHeight = HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const slot = plotWidth / days.length;
  const barWidth = Math.min(24, slot * 0.55);

  const yFor = (value: number) => PADDING_TOP + plotHeight * (1 - value / niceMax);
  const ticks = [0, niceMax / 2, niceMax];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full overflow-visible">
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={PADDING_LEFT}
              x2={WIDTH}
              y1={yFor(t)}
              y2={yFor(t)}
              stroke="var(--color-border)"
              strokeWidth={1}
            />
            <text
              x={PADDING_LEFT - 8}
              y={yFor(t)}
              textAnchor="end"
              dominantBaseline="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {t >= 1000 ? `${t / 1000}k` : t}
            </text>
          </g>
        ))}

        {days.map((d, i) => {
          const cx = PADDING_LEFT + slot * i + slot / 2;
          const barHeight = (d.revenue / niceMax) * plotHeight;
          const y = PADDING_TOP + plotHeight - barHeight;
          const isHovered = hoverIndex === i;
          const showLabel = days.length <= 14 || i % Math.ceil(days.length / 10) === 0;

          return (
            <g key={i}>
              <rect
                x={cx - slot / 2}
                y={PADDING_TOP}
                width={slot}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              <rect
                x={cx - barWidth / 2}
                y={d.revenue > 0 ? y : PADDING_TOP + plotHeight - 1}
                width={barWidth}
                height={d.revenue > 0 ? Math.max(barHeight, 2) : 1}
                rx={4}
                fill={isHovered ? "var(--color-primary)" : "var(--color-gold-soft)"}
                className="transition-colors"
              />
              {showLabel && (
                <text
                  x={cx}
                  y={HEIGHT - 6}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10px]"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {hoverIndex !== null && (
        <div
          className="pointer-events-none absolute rounded-md border border-border bg-popover px-2 py-1 text-xs shadow-md"
          style={{
            left: `${((PADDING_LEFT + slot * hoverIndex + slot / 2) / WIDTH) * 100}%`,
            top: 0,
            transform: "translate(-50%, -110%)",
          }}
        >
          <p className="font-medium">{days[hoverIndex].label}</p>
          <p className="text-muted-foreground">{formatPKR(days[hoverIndex].revenue)}</p>
        </div>
      )}
    </div>
  );
}
