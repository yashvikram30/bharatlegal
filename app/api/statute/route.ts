import { NextRequest, NextResponse } from "next/server";
import { lookupSection, convertProvision, getSectionMarkdown } from "@/lib/legal-api/indiacode";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const act = searchParams.get("act");
  const section = searchParams.get("section");
  const format = searchParams.get("format");
  const convertFrom = searchParams.get("convertFrom");

  try {
    // 1. Provision conversion mode
    if (convertFrom && section) {
      const conversion = await convertProvision(convertFrom, section);
      if (!conversion) {
        return NextResponse.json(
          { error: "No corresponding provision found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, conversion });
    }

    if (!act || !section) {
      return NextResponse.json(
        { error: "Missing required query parameters: 'act' and 'section'" },
        { status: 400 }
      );
    }

    // 2. Markdown output mode
    if (format === "markdown" || format === "md") {
      const markdown = await getSectionMarkdown(act, section);
      if (!markdown) {
        return NextResponse.json(
          { error: "Statute markdown not found" },
          { status: 404 }
        );
      }
      return new Response(markdown, {
        headers: { "Content-Type": "text/markdown; charset=utf-8" },
      });
    }

    // 3. Default JSON section detail lookup
    const detail = await lookupSection(act, section);
    if (!detail) {
      return NextResponse.json(
        { error: `Provision not found for ${act} Section ${section}` },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: detail });
  } catch (error: any) {
    console.error("[API Statute] Error:", error);
    return NextResponse.json(
      { error: "Internal server error looking up statute provision" },
      { status: 500 }
    );
  }
}
