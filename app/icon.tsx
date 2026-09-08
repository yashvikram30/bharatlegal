import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 20,
          background: "#0F2B20",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          border: "1.5px solid #B8860B",
          color: "#B8860B",
          fontWeight: 800,
        }}
      >
        ⚖
      </div>
    ),
    {
      ...size,
    }
  );
}
