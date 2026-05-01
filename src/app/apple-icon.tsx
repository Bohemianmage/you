import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch icon — alineado al isotipo público (`/logo-you-mark.png`). */
export default function AppleIcon() {
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
          background: "#ffffff",
        }}
      >
        <div style={{ fontSize: 54, fontWeight: 700, color: "#2f2e2e", letterSpacing: "-0.02em" }}>YOU</div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#616e89",
            letterSpacing: "0.22em",
            marginTop: 6,
          }}
        >
          SOLUCIONES
        </div>
      </div>
    ),
    { ...size },
  );
}
