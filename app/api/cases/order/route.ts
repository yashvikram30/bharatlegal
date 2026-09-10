import { NextRequest, NextResponse } from "next/server";
import { parseCNR } from "@/lib/courts/cnr";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cnr = searchParams.get("cnr");

    if (!cnr) {
      return NextResponse.json(
        { success: false, error: "CNR number query parameter is required" },
        { status: 400 }
      );
    }

    const cnrDetails = parseCNR(cnr);
    if (!cnrDetails) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid 16-character eCourts CNR format. Expected: 2-char State + 2-char Court + 2-char Bench + 6-digit Number + 4-digit Year (e.g. DLHC01-004521-2023)",
        },
        { status: 400 }
      );
    }

    let isPdfLive = false;
    if (cnrDetails.orderPdfUrl) {
      try {
        const checkRes = await fetch(cnrDetails.orderPdfUrl, {
          method: "HEAD",
          next: { revalidate: 3600 },
        });
        isPdfLive = checkRes.ok;
      } catch (headErr) {
        // If S3 HEAD check fails, still return URL for client fallback
        isPdfLive = false;
      }
    }

    return NextResponse.json({
      success: true,
      cnrDetails,
      orderPdfUrl: cnrDetails.orderPdfUrl,
      isPdfLive,
      officialOrderUrl: cnrDetails.officialOrderUrl,
      message: isPdfLive
        ? "Certified judgment copy verified on AWS Open Data archive."
        : "Order metadata resolved. Official court archive available.",
    });
  } catch (error: any) {
    console.error("[CNR Order Fetch Error]:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch court order" },
      { status: 500 }
    );
  }
}
