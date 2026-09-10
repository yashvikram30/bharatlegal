import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BharatLegal: Simplifying Legal Access for All Indians";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#0F2B20",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(184, 134, 11, 0.18) 0%, transparent 45%), radial-gradient(circle at 10% 90%, rgba(63, 107, 84, 0.25) 0%, transparent 40%)",
          padding: "70px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "12px",
              backgroundColor: "#173D2E",
              border: "2px solid #B8860B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "#B8860B",
            }}
          >
            ⚖
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "36px",
              fontWeight: 800,
              color: "#F7F5EF",
              letterSpacing: "-0.5px",
            }}
          >
            Bharat<span style={{ color: "#B8860B" }}>Legal</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            maxWidth: "960px",
          }}
        >
          <div
            style={{
              fontSize: "54px",
              fontWeight: 800,
              color: "#F7F5EF",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
            }}
          >
            Demystifying the Indian Justice System with AI
          </div>
          <div
            style={{
              fontSize: "24px",
              color: "#E7EFE9",
              lineHeight: 1.4,
            }}
          >
            Plain-language rights guidance, verified BNS/CrPC citations, real-time case tracking, and smart document analysis.
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          {[
            "⚖ BNS / CrPC Grounded",
            "📄 Document Simplifier",
            "⚡ Case Tracker",
            "🔍 Legal Help Directory",
          ].map((badge) => (
            <div
              key={badge}
              style={{
                backgroundColor: "rgba(231, 239, 233, 0.12)",
                border: "1px solid rgba(231, 239, 233, 0.25)",
                padding: "10px 18px",
                borderRadius: "30px",
                fontSize: "17px",
                color: "#F7F5EF",
                fontWeight: 600,
              }}
            >
              {badge}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
