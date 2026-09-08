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
          background: "#0B132B",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          border: "1.5px solid #F59E0B",
          color: "#F59E0B",
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
