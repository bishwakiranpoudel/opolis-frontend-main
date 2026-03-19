import { ImageResponse } from "next/og";

export const alt = "Opolis — Independent work. Collective power.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0D0D0D",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.05em",
            marginBottom: 16,
          }}
        >
          OPOLIS
        </div>
        <div
          style={{
            fontSize: 32,
            color: "#C8C8C8",
            marginBottom: 8,
          }}
        >
          Independent work. Collective power.
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#777777",
            maxWidth: 640,
            textAlign: "center",
          }}
        >
          Employment infrastructure for independent professionals.
        </div>
      </div>
    ),
    { ...size }
  );
}
