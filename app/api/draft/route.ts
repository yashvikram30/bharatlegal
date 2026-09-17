import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import LegalDraftModel from "@/model/LegalDraft";
import UserModel from "@/model/User";
import { generateDeterministicDraft, DRAFT_TEMPLATES } from "@/lib/drafting/templates";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "",
  baseURL: "https://api.groq.com/openai/v1",
});

const DRAFTING_SYSTEM_PROMPT = `You are BharatLegal Drafting Counsel, an expert Indian legal drafting attorney.
You draft legally enforceable deeds, statutory notices, and applications under Indian Law.
Your drafts must strictly adhere to the relevant Indian statutory acts:
1. Residential Rent Agreements: Model Tenancy Act, 2021 & Registration Act 1908. Must include 24-hr inspection notice, 2-month deposit cap, and essential supply guarantees.
2. Cheque Bounce Notices: Section 138 & 142 of the Negotiable Instruments Act, 1881. Must strictly give the 15-day cure period and cite Section 318 BNS (formerly Sec 420 IPC) and criminal consequences.
3. Consumer Grievance Notices: Consumer Protection Act, 2019 (Sections 2(7), 2(11), 35, 84). Must clearly state deficiencies, demand refund/damages within 15 days, and warn of e-Daakhil filing.
4. RTI Applications: Section 6(1) of the Right to Information Act, 2005. Addressed to PIO with numbered questions and fee declarations.

Output ONLY the finalized legal document text. Do NOT wrap it in JSON. Do NOT include extraneous conversational filler before or after the deed. Use professional Indian legal formatting with uppercase title headings, recitals (WHEREAS), clear numbered covenants, and standard signature/witness blocks.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { draftType, formData, customInstructions, saveToDb = true, existingDraftId } = body;

    if (!draftType || !formData) {
      return NextResponse.json(
        { success: false, error: "draftType and formData are required" },
        { status: 400 }
      );
    }

    const template = DRAFT_TEMPLATES.find((t) => t.id === draftType);
    if (!template) {
      return NextResponse.json(
        { success: false, error: `Invalid draftType: ${draftType}` },
        { status: 400 }
      );
    }

    let generatedContent = "";
    let source: "groq-llm" | "deterministic-fallback" = "deterministic-fallback";

    // Attempt Groq LLM Generation if configured
    if (process.env.GROQ_API_KEY) {
      try {
        const userPrompt = `Please draft a formal, legally enforceable Indian ${template.title}.
Statutory Basis: ${template.statutoryBasis}

FORM DATA PROVIDED BY CITIZEN:
${JSON.stringify(formData, null, 2)}

${customInstructions ? `ADDITIONAL CITIZEN INSTRUCTIONS:\n${customInstructions}\n` : ""}

Draft the complete instrument with exact names, addresses, dates, figures in numbers and words, statutory citations, recitals, and execution/witness lines.`;

        let text = "";
        try {
          const completion = await openai.chat.completions.create({
            model: "openai/gpt-oss-120b",
            messages: [
              { role: "system", content: DRAFTING_SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.15,
            max_tokens: 3500,
          });
          text = completion.choices[0]?.message?.content?.trim() || "";
        } catch (primaryErr: any) {
          console.warn("[Drafting API] Primary Groq LLM (gpt-oss-120b) failed, attempting gpt-oss-20b:", primaryErr?.message);
          const fallbackCompletion = await openai.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
              { role: "system", content: DRAFTING_SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.15,
            max_tokens: 3500,
          });
          text = fallbackCompletion.choices[0]?.message?.content?.trim() || "";
        }

        if (text && text.length > 200) {
          generatedContent = text;
          source = "groq-llm";
        }
      } catch (llmErr) {
        console.warn("[Drafting API] Groq LLM failed or timed out, falling back to deterministic template engine:", llmErr);
      }
    }

    // High-precision deterministic fallback
    if (!generatedContent) {
      generatedContent = generateDeterministicDraft(draftType, formData);
      source = "deterministic-fallback";
    }

    // Determine readable title
    let title = `${template.shortTitle} - ${new Date().toLocaleDateString("en-IN")}`;
    if (formData.landlordName && formData.tenantName) {
      title = `Lease: ${formData.landlordName} & ${formData.tenantName}`;
    } else if (formData.drawerName) {
      title = `Sec 138 Notice to ${formData.drawerName}`;
    } else if (formData.companyName) {
      title = `Consumer Notice to ${formData.companyName}`;
    } else if (formData.publicAuthority) {
      title = `RTI to ${formData.publicAuthority}`;
    }

    // Persist to MongoDB if user is authenticated and saveToDb is requested
    let savedDraftId: string | null = null;
    let isSaved = false;

    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.email && saveToDb) {
        await dbConnect();
        const user = await UserModel.findOne({ email: session.user.email }).select("_id");
        if (user) {
          if (existingDraftId) {
            const updated = await LegalDraftModel.findOneAndUpdate(
              { _id: existingDraftId, userId: user._id },
              {
                title,
                draftType,
                formData,
                generatedContent,
              },
              { new: true }
            );
            if (updated) {
              savedDraftId = updated._id.toString();
              isSaved = true;
            }
          }

          if (!savedDraftId) {
            const created = await LegalDraftModel.create({
              userId: user._id,
              title,
              draftType,
              formData,
              generatedContent,
            });
            savedDraftId = created._id.toString();
            isSaved = true;
          }
        }
      }
    } catch (dbErr) {
      console.error("[Drafting API] Database persistence error:", dbErr);
    }

    return NextResponse.json({
      success: true,
      draft: {
        id: savedDraftId || undefined,
        _id: savedDraftId || undefined,
        title,
        draftType,
        generatedContent,
        formData,
        source,
        isSaved,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("[Drafting API] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate legal draft" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: true, drafts: [], authenticated: false });
    }

    await dbConnect();
    const user = await UserModel.findOne({ email: session.user.email }).select("_id");
    if (!user) {
      return NextResponse.json({ success: true, drafts: [], authenticated: false });
    }

    const drafts = await LegalDraftModel.find({ userId: user._id })
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      drafts,
      authenticated: true,
    });
  } catch (error: any) {
    console.error("[Drafting API] GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch drafts" },
      { status: 500 }
    );
  }
}
