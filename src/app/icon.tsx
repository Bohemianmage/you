import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon — marca YOU sobre fondo blanco (legible a 16px). */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        <span style={{ fontSize: 19, fontWeight: 700, color: "#2f2e2e", letterSpacing: "-0.04em" }}>YOU</span>
      </div>
    ),
    { ...size },
  );
}
