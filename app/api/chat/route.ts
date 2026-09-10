import { NextRequest } from "next/server";
import OpenAI from "openai";
import { lookupSection, convertProvision } from "@/lib/legal-api/indiacode";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import ConversationModel from "@/model/Conversation";
import MessageModel, { IMessageSource } from "@/model/Message";
import mongoose from "mongoose";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `You are BharatLegal AI, an authoritative, highly articulate Indian legal research and intelligence assistant.
Your responses MUST be deeply structured, authoritative, and strictly formatted in clean GitHub Flavored Markdown (GFM).

### REQUIRED RESPONSE STRUCTURE & MARKDOWN SPECIFICATION:
Format your entire response using the following exact Markdown headings, tables, blockquotes, and lists:

## 📌 Executive Summary
Provide a direct, plain-English legal answer in 1-2 concise, punchy sentences. Answer the user's question immediately without preamble or conversational filler.

---

## ⚖️ Statutory Matrix
Provide a clean, valid Markdown comparison table summarizing the applicable provisions:

**If addressing criminal / penal law (comparing new criminal codes vs historical predecessor):**

| Metric | Current Law (BNS / BNSS / BSA) | Historical Predecessor (IPC / CrPC / IEA) |
| :--- | :--- | :--- |
| **Section & Offence** | [Act §Number](#citation:act_slug:number) - Title | [OldAct §Number](#citation:oldact_slug:number) - Title |
| **Classification** | Cognizable / Non-Cognizable, Bailable / Non-Bailable | Historical Classification |
| **Maximum Penalty** | Imprisonment term, fine, or both | Historical Penalty |
| **Court of Trial** | Magistrate Court / Sessions Court | Historical Trial Court |

**If addressing civil, commercial, consumer, property, contract, or constitutional law:**

| Parameter / Issue | Governing Statutory Provision | Legal Standard & Practical Effect |
| :--- | :--- | :--- |
| **Applicable Section** | [Act §Number](#citation:act_slug:number) - Title | Statutory mandate and legal obligation |
| **Jurisdictional Forum** | Appropriate tribunal, commission, or court | Mandatory statutory limitation timeline |
| **Statutory Remedy** | Concrete remedy or relief granted by statute | Essential legal prerequisite for relief |

---

## 📜 Bare Act Provision Text
Quote the active statutory section text verbatim inside a Markdown blockquote, citing the provision with an interactive citation link:
> **[ActName §Number](#citation:act_slug:number)**: "(1) Verbatim bare act provision text..."

Highlight the specific sub-sections, clauses, or statutory illustrations that directly apply to the user's inquiry.

---

## 🔍 Essential Legal Ingredients
Break down the necessary legal ingredients that the prosecution, complainant, or claimant must establish to succeed:
- **Ingredient 1 (e.g. Mens Rea / Dishonest Intention):** Explanation of the statutory standard.
- **Ingredient 2 (e.g. Actus Reus / Inducement or Delivery of Property):** Explanation of statutory test.
- **Ingredient 3 (e.g. Damage / Harm / Contractual Breach):** Explanation of statutory requirement.

---

## 🏛️ Landmark Judicial Precedents & Ratio Decidendi
Detail 1-3 landmark Supreme Court or High Court judgments that interpret this provision:
- **Case Title & Citation**: *Case Name v. State*, Citation.
  - **Court & Bench**: Supreme Court of India / High Court of Jurisdictional State.
  - **Ratio Decidendi**: The exact core legal principle or binding test formulated by the court.
  - **Precedential Value**: Binding across India under Article 141 of the Constitution (Supreme Court) or Persuasive (High Court).

---

## 🛠️ Actionable Citizen Guidance (Next Steps)
Provide concrete, numbered practical steps for the citizen or advocate:
1. **Document & Preserve Evidence**: Specific records, communication logs, agreements, bank statements, or notices to collect.
2. **Statutory Notice Requirement (if applicable)**: Exact notice timeline (e.g., 15-day mandatory demand notice under NI Act §138).
3. **Filing / Police Complaint / FIR**: Approach jurisdictional police station under BNSS §173, e-FIR portal, or file complaint.
4. **Appellate & Tribunal Recourse**: E-Daakhil consumer commission, RERA regulatory authority, or Magistrate Court.

---

## ℹ️ Disclaimer
*BharatLegal provides educational statutory intelligence and legal literacy; it does not constitute formal legal counsel or create an attorney-client relationship.*

### MANDATORY MARKDOWN FORMATTING RULES:
1. **Never enclose entire response in code blocks**: DO NOT wrap your entire output in \`\`\`markdown ... \`\`\` or \`\`\` ... \`\`\`. Output raw Markdown directly, beginning immediately with \`## 📌 Executive Summary\`.
2. **Double Blank Lines**: Always include a blank line (\`\\n\\n\`) before and after every Heading (\`##\`), Table, Blockquote (\`>\`), List (\`-\`, \`1.\`), and Horizontal Rule (\`---\`). Markdown tables and blockquotes fail to parse if there is no blank line above them!
3. **Table Syntax**: Always use standard GFM table syntax with pipe delimiters \`|\` and an alignment row \`| :--- | :--- |\`. Ensure every row is on its own line.
4. **Interactive Citation Links**: Every statutory section mentioned MUST be formatted as: \`[Act §Number](#citation:act_slug:number)\`. Valid slugs include:
   - \`bns\`, \`bnss\`, \`bsa\`
   - \`ipc\`, \`crpc\`, \`iea\`
   - \`consumer-protection-act-2019\`
   - \`negotiable-instruments-act-1881\`
   - \`transfer-of-property-act-1882\`
   - \`indian-contract-act-1872\`
   - \`constitution-of-india\`
   - \`specific-relief-act-1963\`
   - \`arbitration-and-conciliation-act-1996\`
   - \`information-technology-act-2000\`
   - \`motor-vehicles-act-1988\`
5. **Bold Prefixes**: In lists, always bold the lead key term, e.g. \`- **Term:** detail\` or \`1. **Action:** detail\`.
6. **Zero Hallucinations**: Always quote real statutory numbers and Bare Act text. If referencing old IPC/CrPC law, always state the corresponding modern BNS/BNSS law.`;


const legalTools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "lookup_statute",
      description:
        "Lookup statutory bare act text, penalties, illustrations, IPC/BNS correspondence, and landmark precedents from IndiaCode.",
      parameters: {
        type: "object",
        properties: {
          act: {
            type: "string",
            description:
              "Act slug: 'bns', 'bnss', 'bsa', 'ipc', 'crpc', 'consumer-protection-act-2019', 'negotiable-instruments-act-1881', 'transfer-of-property-act-1882', etc.",
          },
          section: {
            type: "string",
            description: "Section number, e.g., '103', '318', '35', '138', '106'.",
          },
        },
        required: ["act", "section"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_penalties",
      description:
        "Lookup statutory penalties, bail classification, and sentencing guidelines for a legal section.",
      parameters: {
        type: "object",
        properties: {
          act: { type: "string" },
          section: { type: "string" },
        },
        required: ["act", "section"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "convert_penal_provision",
      description:
        "Convert between old (IPC, CrPC, IEA) and new (BNS, BNSS, BSA) criminal law provisions.",
      parameters: {
        type: "object",
        properties: {
          sourceAct: {
            type: "string",
            description: "Source act abbreviation: 'ipc', 'crpc', 'iea', 'bns', 'bnss', 'bsa'.",
          },
          section: {
            type: "string",
            description: "Section number to convert.",
          },
        },
        required: ["sourceAct", "section"],
      },
    },
  },
];

export async function POST(req: NextRequest) {
  try {
    const { messages, model, conversationId } = await req.json();

    const chosenModel =
      model && (model.startsWith("openai/") || model.startsWith("qwen/"))
        ? model
        : "openai/gpt-oss-120b";

    // Keep system prompt + at most the last 6 messages (3 user/assistant turns) to prevent token bloat
    const recentMessages = Array.isArray(messages) ? messages.slice(-6) : [];

    const conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...recentMessages,
    ];

    // Auth verification for conversation persistence
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;
    const isValidConvo =
      userId &&
      conversationId &&
      typeof conversationId === "string" &&
      mongoose.Types.ObjectId.isValid(conversationId);

    // If authenticated and valid conversationId, persist user turn
    const lastUserMsg = recentMessages.filter((m: any) => m.role === "user").pop();
    if (isValidConvo && lastUserMsg?.content) {
      try {
        await dbConnect();
        await MessageModel.create({
          conversationId,
          role: "user",
          content: lastUserMsg.content,
        });
      } catch (dbUserSaveErr) {
        console.warn("[Chat Route] Could not pre-save user message:", dbUserSaveErr);
      }
    }

    let toolExecuted = false;
    const sources: IMessageSource[] = [];

    // Multi-turn agentic tool execution loop (up to 2 rounds)
    for (let round = 0; round < 2; round++) {
      let response: any;
      try {
        response = await createCompletionWithRetry({
          model: chosenModel,
          messages: conversationHistory,
          tools: legalTools,
          tool_choice: "auto",
        });
      } catch (err: any) {
        // Fallback model if primary model is rate limited
        if (err?.status === 429 && chosenModel === "openai/gpt-oss-120b") {
          console.warn("[Chat Route] Rate limit on 120b, falling back to 20b...");
          response = await createCompletionWithRetry({
            model: "openai/gpt-oss-20b",
            messages: conversationHistory,
            tools: legalTools,
            tool_choice: "auto",
          });
        } else {
          throw err;
        }
      }

      const message = response.choices[0]?.message;
      if (!message?.tool_calls || message.tool_calls.length === 0) {
        break;
      }

      toolExecuted = true;
      conversationHistory.push(message);

      for (const toolCall of message.tool_calls) {
        let toolOutput = "";
        try {
          const args = JSON.parse(toolCall.function.arguments || "{}");
          const fnName = toolCall.function.name;

          if (fnName === "lookup_statute" || fnName === "search_penalties") {
            const detail = await lookupSection(args.act || "bns", args.section);
            if (detail) {
              // Record source citation for RAG re-rendering
              sources.push({
                act: detail.act.id,
                section: detail.section.number,
                title: `${detail.act.short_title} §${detail.section.number}`,
              });

              // Compact token-efficient representation to avoid Groq 8000 TPM limit
              toolOutput = JSON.stringify({
                found: true,
                act_slug: detail.act.id,
                act_title: detail.act.short_title,
                section_number: detail.section.number,
                section_title: detail.section.title,
                bare_text:
                  detail.section.text.length > 2000
                    ? detail.section.text.slice(0, 2000) + "... [truncated]"
                    : detail.section.text,
                bailable: detail.section.bailable,
                cognizable: detail.section.cognizable,
                court_triable: detail.section.court_triable,
                corresponds_to: detail.corresponds_to,
                landmark_precedents: detail.judgments.slice(0, 2).map((j) => ({
                  title: j.title,
                  court: j.court_name,
                  date: j.date,
                  ratio_decidendi: j.ratio_decidendi,
                  precedential_value: j.precedential_value,
                })),
              });
            } else {
              toolOutput = JSON.stringify({
                found: false,
                message: `No statutory provision found for ${args.act} Section ${args.section}`,
              });
            }
          } else if (fnName === "convert_penal_provision") {
            const conversion = await convertProvision(args.sourceAct, args.section);
            toolOutput = JSON.stringify({
              success: !!conversion,
              source: `${args.sourceAct} ${args.section}`,
              converted: conversion,
            });
          }
        } catch (toolError: any) {
          console.error("[Chat Route] Tool execution error:", toolError);
          toolOutput = JSON.stringify({ error: toolError.message || "Failed to execute tool" });
        }

        conversationHistory.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolOutput,
        });
      }
    }

    if (toolExecuted) {
      conversationHistory.push({
        role: "system",
        content:
          "TOOL EXECUTION FINISHED. Output your final grounded, structured legal answer in exact GitHub Flavored Markdown (GFM) format as specified in the system instructions (Executive Summary, Statutory Matrix table, Bare Act blockquote with [#citation:act:section] links, Legal Ingredients, Landmark Precedents with ratio decidendi, Actionable Next Steps, and Disclaimer). Begin directly with '## 📌 Executive Summary'. Ensure blank lines before and after every table, blockquote, and heading. Do NOT wrap your output in ```markdown code fences or call any more tools.",
      });
    }

    // Stream final response to client with backoff and fallback
    let stream: any;
    try {
      stream = await createCompletionWithRetry({
        model: chosenModel,
        stream: true,
        messages: conversationHistory,
      });
    } catch (streamErr: any) {
      if (streamErr?.status === 429 && chosenModel === "openai/gpt-oss-120b") {
        console.warn("[Chat Route] Rate limit on final stream 120b, falling back to 20b...");
        stream = await createCompletionWithRetry({
          model: "openai/gpt-oss-20b",
          stream: true,
          messages: conversationHistory,
        });
      } else {
        throw streamErr;
      }
    }

    // Return unbuffered chunked stream and asynchronously persist assistant turn
    return streamToResponse(stream, async (assistantText: string) => {
      if (isValidConvo && assistantText) {
        try {
          await dbConnect();
          await MessageModel.create({
            conversationId,
            role: "assistant",
            content: assistantText,
            sources,
          });

          await ConversationModel.findByIdAndUpdate(conversationId, {
            updatedAt: new Date(),
          });

          // Trigger automatic titling if conversation has default title
          if (lastUserMsg?.content) {
            await autoTitleConversation(conversationId, lastUserMsg.content, assistantText);
          }
        } catch (saveErr) {
          console.error("[Chat Route] Post-stream persistence error:", saveErr);
        }
      }
    });
  } catch (error: any) {
    console.error("[Chat API Error]:", error);
    const isRateLimit = error?.status === 429 || error?.code === "rate_limit_exceeded";
    const userMessage = isRateLimit
      ? "BharatLegal AI is currently experiencing high statutory query volume under the free tier rate limit. Please pause for 3 seconds and retry your query."
      : `Error generating legal response: ${error.message || "Unknown error"}`;

    return new Response(userMessage, {
      status: isRateLimit ? 429 : 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}

/**
 * Automatically summarize conversation into a concise 3-5 word title
 */
async function autoTitleConversation(
  conversationId: string,
  userPrompt: string,
  assistantReply: string
) {
  try {
    const convo = await ConversationModel.findById(conversationId);
    if (!convo || (convo.title !== "New consultation" && convo.title !== "New chat")) {
      return;
    }

    const titleRes = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are an Indian legal editor. Generate a concise 3-5 word title summarizing this legal consultation. Do not include quotes, periods, or extra words. Example: Cheating Penalty Under BNS 318",
        },
        {
          role: "user",
          content: `Query: ${userPrompt.slice(0, 200)}\nSummary: ${assistantReply.slice(0, 200)}`,
        },
      ],
      max_tokens: 15,
    });

    const generated = titleRes.choices[0]?.message?.content?.trim().replace(/^["']|["']$/g, "");
    if (generated && generated.length > 2) {
      await ConversationModel.findByIdAndUpdate(conversationId, {
        title: generated.slice(0, 80),
      });
    }
  } catch (err) {
    console.warn("[Auto-title Warning]:", err);
  }
}

/**
 * Execute chat completion with automatic exponential backoff on 429 rate limit
 */
async function createCompletionWithRetry(
  params: OpenAI.Chat.Completions.ChatCompletionCreateParams,
  maxRetries = 2
): Promise<any> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await openai.chat.completions.create(params);
    } catch (err: any) {
      if (err?.status === 429 && attempt < maxRetries) {
        attempt++;
        const waitMs = attempt * 1000;
        console.warn(
          `[Groq 429 Rate Limit]: Retrying in ${waitMs}ms (attempt ${attempt}/${maxRetries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, waitMs));
        continue;
      }
      throw err;
    }
  }
}

function streamToResponse(
  stream: any,
  onCompletion?: (fullText: string) => Promise<void>
) {
  const encoder = new TextEncoder();
  let fullText = "";

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            fullText += content;
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();

        if (onCompletion) {
          onCompletion(fullText).catch((err) =>
            console.error("[Post-stream Callback Error]:", err)
          );
        }
      } catch (err: any) {
        console.error("[Stream Controller Error]:", err);
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
      "Transfer-Encoding": "chunked",
    },
  });
}

