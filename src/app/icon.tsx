import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// 8 petal centers around (16,16) at radius 8.5, precomputed (Satori doesn't
// reliably support CSS rotate on nested divs, so we place shapes directly).
const PETAL_POSITIONS = [
  { x: 16, y: 7.5 },
  { x: 21.95, y: 10.05 },
  { x: 24.5, y: 16 },
  { x: 21.95, y: 21.95 },
  { x: 16, y: 24.5 },
  { x: 10.05, y: 21.95 },
  { x: 7.5, y: 16 },
  { x: 10.05, y: 10.05 },
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
              left: p.x - 5,
              top: p.y - 5,
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#33132A",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: 16 - 6.5,
            top: 16 - 6.5,
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: "#C48A9C",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
