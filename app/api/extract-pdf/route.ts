import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name || "document";
    const fileExtension = fileName.split(".").pop()?.toLowerCase();
    const mimeType = file.type;

    let extractedText = "";

    // 1. Handle Plain Text (.txt)
    if (fileExtension === "txt" || mimeType === "text/plain") {
      extractedText = await file.text();
    }
    // 2. Handle Microsoft Word (.docx)
    else if (
      fileExtension === "docx" ||
      mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value || "";
    }
    // 3. Handle PDF (.pdf) or default binary parsing
    else if (fileExtension === "pdf" || mimeType === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const data = await pdfParse(buffer);
      extractedText = data.text || "";
    }
    // 4. Fallback: attempt text read
    else {
      try {
        extractedText = await file.text();
      } catch {
        return NextResponse.json(
          {
            error:
              "Unsupported file format. Please upload a PDF (.pdf), Word document (.docx), or plain text (.txt) file.",
          },
          { status: 400 }
        );
      }
    }

    const cleanedText = extractedText.trim();
    if (!cleanedText) {
      return NextResponse.json(
        {
          error:
            "No readable text could be extracted from this document. It may be an image-only scan or password-protected.",
        },
        { status: 422 }
      );
    }

    const wordCount = cleanedText.split(/\s+/).filter(Boolean).length;

    return NextResponse.json({
      success: true,
      text: cleanedText,
      fileName,
      fileExtension,
      fileSize: file.size,
      wordCount,
    });
  } catch (error: any) {
    console.error("[Extract API] Extraction error:", error);
    return NextResponse.json(
      {
        error: "Failed to extract text from document",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
