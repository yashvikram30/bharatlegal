import { NextRequest, NextResponse } from "next/server";
import { parseCNR, findLiveOrderPdf } from "@/lib/courts/cnr";

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

    // Attempt to resolve verified S3 judgment PDF
    const liveS3Pdf = await findLiveOrderPdf(cnr);
    const orderPdfUrl = liveS3Pdf || cnrDetails.orderPdfUrl || null;
    const isPdfLive = Boolean(liveS3Pdf);

    return NextResponse.json({
      success: true,
      cnrDetails: {
        ...cnrDetails,
        orderPdfUrl,
      },
      orderPdfUrl,
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
