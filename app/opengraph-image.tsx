import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "LegalEase - Simplifying Legal Access for All Indians";
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
          backgroundColor: "#060A17",
          backgroundImage: "radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.15) 0%, transparent 50%), radial-gradient(circle at 10% 90%, rgba(14, 165, 233, 0.12) 0%, transparent 40%)",
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
              backgroundColor: "#101B3D",
              border: "2px solid #F59E0B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "#F59E0B",
            }}
          >
            ⚖
          </div>
          <div style={{ display: "flex", fontSize: "36px", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.5px" }}>
            Legal<span style={{ color: "#F59E0B" }}>Ease</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "950px" }}>
          <div
            style={{
              fontSize: "56px",
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
            }}
          >
            Demystifying the Indian Justice System with AI
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#94A3B8",
              lineHeight: 1.4,
            }}
          >
            Plain-language rights guidance, verified BNS/CrPC citations, real-time case tracking, and smart document analysis.
          </div>
        </div>

        <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
          {["⚖ BNS / CrPC Grounded", "📄 Document Simplifier", "⚡ Case Tracker", "🔍 Legal Help Directory"].map((badge) => (
            <div
              key={badge}
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.07)",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                padding: "10px 18px",
                borderRadius: "30px",
                fontSize: "18px",
                color: "#E2E8F0",
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
