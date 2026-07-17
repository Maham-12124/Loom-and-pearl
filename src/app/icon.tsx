import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// 8 petal centers around (16,16) at radius 7, precomputed (Satori doesn't
// reliably support CSS rotate on nested divs, so we place shapes directly).
const PETAL_POSITIONS = [
  { x: 16, y: 9 },
  { x: 20.9, y: 11.1 },
  { x: 23, y: 16 },
  { x: 20.9, y: 20.9 },
  { x: 16, y: 23 },
  { x: 11.1, y: 20.9 },
  { x: 9, y: 16 },
  { x: 11.1, y: 11.1 },
];

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
        }}
      >
        {PETAL_POSITIONS.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x - 4,
              top: p.y - 4,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#9CAF88",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 16 - 5.5,
            top: 16 - 5.5,
            width: 11,
            height: 11,
            borderRadius: "50%",
            background: "#C9B8E8",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
