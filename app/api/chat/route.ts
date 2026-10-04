import { NextRequest } from "next/server";
import OpenAI from "openai";
import { lookupSection, convertProvision } from "@/lib/legal-api/indiacode";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import ConversationModel, { DEFAULT_CONVERSATION_TITLE } from "@/model/Conversation";
import MessageModel, { IMessageSource } from "@/model/Message";
import mongoose from "mongoose";
import { buildMatterContext } from "@/lib/matter-context";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `You are BharatLegal AI, a careful assistant that explains Indian law to ordinary people in plain English. You give legal information, not legal advice. Be accurate, calm, and brief.

## OUTPUT FORMAT
Write GitHub-flavoured Markdown. Never wrap the whole reply in a code block.

Line 1 must be a 3-4 word heading for the consultation, then a blank line:
# Title: Security Deposit Refund Dispute

Then use ONLY the sections below, in this order, with these exact headings (no emojis). Include a section only when the rule says so.

## Short answer
ALWAYS. One to three plain sentences that answer the question directly. No preamble, no "Great question".

## What to do next
Include when the user describes a situation or asks what to do (most questions). A numbered list of 2-4 concrete steps, most urgent first. Each step is one sentence. Do not suggest filing a complaint, going to the police, or sending a notice unless the facts and the law support it.

## Deadlines
Only when there is a verified time limit, or the user risks missing a step. One or two sentences naming the exact period and where it comes from. If you cannot verify a deadline, omit this section entirely. For immediate danger write "Seek emergency help now" and name the official channel (112 for police and emergencies, 15100 for free legal aid) only if it applies.

## Keep these records
Only for disputes or anything where evidence matters. A bulleted list of 2-4 specific items.

## The law
Include when a particular provision decides the answer. Use a short bulleted list OR one table, never both. Each item has a citation link and says in plain English what the provision means for this user. Quote bare-act text only if the user asked for it or a single sentence of under 40 words is decisive; never quote whole sections.
Use a table only for comparing old and new criminal law (IPC/CrPC/IEA against BNS/BNSS/BSA), or when comparing two or more provisions side by side:

| | Current law | Earlier law |
| :--- | :--- | :--- |
| **Section** | [BNS §318](#citation:bns:318) | [IPC §420](#citation:ipc:420) |
| **Penalty** | ... | ... |

## Court decisions
Only if the verified material provided to you includes a judgment directly on point. At most two. Give the case name, court, and the principle it decided in one sentence. Never invent or guess a case; if none is provided, omit this section.

## Other options
Only when there is a genuinely different route (for example mediation instead of a court complaint). Omit otherwise.

## One thing to confirm
Only when a missing fact would change your advice. Ask at most two short questions.

## STYLE RULES
1. **Match depth to the question.** A general "what is X" question gets Short answer and The law only, in under 150 words. A personal situation gets Short answer and What to do next, plus other sections only if they add something. Never pad. Most replies are 150-300 words. Never exceed 450 words.
2. **Say everything once.** Do not repeat the short answer, a step, a deadline, or a provision in a later section. If a point is already made, leave it out. A court decision appears only under "Court decisions", never also under "The law". Include a court decision only if it speaks directly to this user's situation; a loosely related case should be left out.
3. **Plain English first.** Put the legal term in brackets after the plain words, for example "keep the deposit without proof of damage (forfeiture)".
4. **Citations.** Every statutory section you name must be a link in the form [Act §Number](#citation:act_slug:number). Valid slugs: bns, bnss, bsa, ipc, crpc, iea, consumer-protection-act-2019, negotiable-instruments-act-1881, transfer-of-property-act-1882, indian-contract-act-1872, constitution-of-india, specific-relief-act-1963, arbitration-and-conciliation-act-1996, information-technology-act-2000, motor-vehicles-act-1988.
5. **Accuracy.**
   - **Never guess a section number.** Cite a section only if it appears in the verified provisions supplied to you below, or you are completely certain of both the number and what it says. If you are not certain, describe the right or rule in plain words and name the Act without a number (for example "the BNSS rules on arrest"). A missing citation is far better than a wrong one.
   - **Current law first.** The BNS, BNSS, and BSA replaced the IPC, CrPC, and Evidence Act for offences and procedure from 1 July 2024. Prefer the BNS/BNSS/BSA, and mention an old section only as a cross-reference when you are certain of it, for example "BNSS §58 (formerly CrPC §57)".
   - **Do not overstate the forum.** If the right court, tribunal, or authority depends on the state or the facts, say that it depends and name the realistic options (for example the rent authority or civil court, the consumer commission, or free legal aid). Never say a particular forum will definitely hear the case unless you are certain.
   - **Do not invent rules or deadlines.** Only state a legal requirement or time limit that you can support with a provision above or are certain of.
6. **Formatting.** Leave a blank line before and after every heading, list, table, and quote. Bold the lead term of a list item, like "- **Term:** detail". Do not add a disclaimer, because the app already shows one.`;

const RESEARCH_PROMPT = `You are the research step for an Indian legal assistant. Read the user's question and identify up to 3 specific statutory provisions that most directly decide the answer. Call lookup_statute once for each, using the current law (BNS, BNSS, BSA, or the relevant central Act). Only look up a section if you are confident of its number. If you are not confident of any specific section, call no tool.`;

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

    // Auth verification for conversation persistence
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?._id || (session?.user as any)?.id;
    const hasValidConvoId =
      userId &&
      conversationId &&
      typeof conversationId === "string" &&
      mongoose.Types.ObjectId.isValid(conversationId);

    // Verify the caller actually owns this conversation before writing to it,
    // to prevent an authenticated user from injecting messages into (or
    // renaming) another user's conversation by supplying its ID.
    let isValidConvo = false;
    if (hasValidConvoId) {
      try {
        await dbConnect();
        isValidConvo = Boolean(
          await ConversationModel.exists({ _id: conversationId, userId })
        );
      } catch (ownershipErr) {
        console.warn("[Chat Route] Could not verify conversation ownership:", ownershipErr);
      }
    }

    // If this chat lives inside a matter, give the model the matter's details.
    let matterContext = "";
    if (isValidConvo) {
      try {
        matterContext = await buildMatterContext(conversationId, userId);
      } catch (matterErr) {
        console.warn("[Chat Route] Could not load matter context:", matterErr);
      }
    }
    const systemPrompt = matterContext ? `${SYSTEM_PROMPT}\n\n${matterContext}` : SYSTEM_PROMPT;

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

    const sources: IMessageSource[] = [];
    const retrievedContextBlocks: string[] = [];

    // 1. Fast statutory pre-fetch based on detected Acts and Sections in the user query
    if (lastUserMsg?.content) {
      const detectedRefs = extractStatutoryRefs(lastUserMsg.content);
      for (const ref of detectedRefs) {
        if (!sources.some((s) => s.act === ref.act && s.section === ref.section)) {
          try {
            const detail = await lookupSection(ref.act, ref.section);
            if (detail) {
              sources.push({
                act: detail.act.id,
                section: detail.section.number,
                title: `${detail.act.short_title} §${detail.section.number}`,
              });
              retrievedContextBlocks.push(formatDetailContext(detail));

              // If an old IPC/CrPC section is referenced, auto-fetch corresponding BNS/BNSS
              if (Array.isArray(detail.corresponds_to)) {
                for (const corr of detail.corresponds_to) {
                  if (
                    corr.act &&
                    corr.section &&
                    !sources.some((s) => s.act === corr.act && s.section === corr.section)
                  ) {
                    const corrDetail = await lookupSection(corr.act, corr.section);
                    if (corrDetail) {
                      sources.push({
                        act: corrDetail.act.id,
                        section: corrDetail.section.number,
                        title: `${corrDetail.act.short_title} §${corrDetail.section.number}`,
                      });
                      retrievedContextBlocks.push(formatDetailContext(corrDetail));
                    }
                  }
                }
              }
            }
          } catch (err) {
            console.warn("[Chat Route] Pre-fetch lookup error for", ref, err);
          }
        }
      }
    }

    // 2. If no statutory refs pre-fetched, run dynamic agentic tool-calling round
    if (retrievedContextBlocks.length === 0) {
      try {
        const researchHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          { role: "system", content: RESEARCH_PROMPT },
          ...recentMessages.filter(
            (m: any) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim()
          ),
        ];
        const toolResponse = await createCompletionWithRetry({
          model: chosenModel,
          messages: researchHistory,
          tools: legalTools,
          tool_choice: "auto",
        });

        const toolMessage = toolResponse.choices[0]?.message;
        if (toolMessage?.tool_calls && toolMessage.tool_calls.length > 0) {
          for (const toolCall of toolMessage.tool_calls) {
            try {
              const args = JSON.parse(toolCall.function.arguments || "{}");
              const fnName = toolCall.function.name;

              if (fnName === "lookup_statute" || fnName === "search_penalties") {
                const detail = await lookupSection(args.act || "bns", args.section);
                if (detail && !sources.some((s) => s.act === detail.act.id && s.section === detail.section.number)) {
                  sources.push({
                    act: detail.act.id,
                    section: detail.section.number,
                    title: `${detail.act.short_title} §${detail.section.number}`,
                  });
                  retrievedContextBlocks.push(formatDetailContext(detail));
                }
              } else if (fnName === "convert_penal_provision") {
                const conversion = await convertProvision(args.sourceAct, args.section);
                if (conversion?.act && conversion?.section) {
                  const detail = await lookupSection(conversion.act, conversion.section);
                  if (detail && !sources.some((s) => s.act === detail.act.id && s.section === detail.section.number)) {
                    sources.push({
                      act: detail.act.id,
                      section: detail.section.number,
                      title: `${detail.act.short_title} §${detail.section.number}`,
                    });
                    retrievedContextBlocks.push(formatDetailContext(detail));
                  }
                }
              }
            } catch (toolExecErr) {
              console.warn("[Chat Route] Dynamic tool parsing error:", toolExecErr);
            }
          }
        }
      } catch (agenticErr: any) {
        console.warn("[Chat Route] Dynamic agentic round skipped:", agenticErr?.message);
      }
    }

    // 3. Construct clean streaming conversation history (system + user/assistant text turns only)
    // IMPORTANT: Exclude assistant tool_calls and tool-role messages to prevent Groq 'Tool choice is none' error.
    const groundedSystemPrompt =
      retrievedContextBlocks.length > 0
        ? `${systemPrompt}\n\n## 📚 Verified Statutory Provisions & Landmark Jurisprudence (IndiaCode Grounding):\n${retrievedContextBlocks.join(
            "\n\n---\n\n"
          )}\n\nGround your answer in the verified provisions and precedents above. Follow the output format exactly: line 1 is "# Title: ..." with 3-4 words, then a blank line, then "## Short answer". Include only the sections that apply, say everything once, and do not wrap the reply in a code block.`
        : systemPrompt;

    const streamingHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: groundedSystemPrompt },
      ...recentMessages
        .filter(
          (m: any) =>
            (m.role === "user" || m.role === "assistant") &&
            typeof m.content === "string" &&
            m.content.trim().length > 0
        )
        .map((m: any) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
    ];

    // 4. Stream final response to client with backoff and rate-limit fallback
    let stream: any;
    try {
      stream = await createCompletionWithRetry({
        model: chosenModel,
        stream: true,
        messages: streamingHistory,
      });
    } catch (streamErr: any) {
      if (streamErr?.status === 429 && chosenModel === "openai/gpt-oss-120b") {
        console.warn("[Chat Route] Rate limit on 120b, falling back to openai/gpt-oss-20b...");
        stream = await createCompletionWithRetry({
          model: "openai/gpt-oss-20b",
          stream: true,
          messages: streamingHistory,
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

          // Extract 3-4 word heading from line 1 of assistant response
          const headingMatch = assistantText.match(/^\s*#\s*(?:Title:?\s*)?([^\n\r#]+)/im);
          let extractedTitle: string | null = null;
          if (headingMatch && headingMatch[1]) {
            const rawTitle = headingMatch[1].replace(/[*_"'`]/g, "").trim();
            const words = rawTitle.split(/\s+/).filter(Boolean);
            if (words.length >= 1) {
              extractedTitle = words.slice(0, 5).join(" ").slice(0, 50);
            }
          }

          const existingConvo = await ConversationModel.findById(conversationId);
          const needsTitle =
            !existingConvo?.title || existingConvo.title === DEFAULT_CONVERSATION_TITLE;

          if (needsTitle) {
            if (extractedTitle) {
              await ConversationModel.findByIdAndUpdate(conversationId, {
                title: extractedTitle,
                updatedAt: new Date(),
              });
            } else if (lastUserMsg?.content) {
              await autoTitleConversation(conversationId, lastUserMsg.content, assistantText);
            }
          } else {
            await ConversationModel.findByIdAndUpdate(conversationId, {
              updatedAt: new Date(),
            });
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
    if (!convo || convo.title !== DEFAULT_CONVERSATION_TITLE) {
      return;
    }

    const titleRes = await openai.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        {
          role: "system",
          content:
            "You are an Indian legal editor. Generate a concise 3-4 word title summarizing this legal consultation. Do not include quotes, periods, or extra words. Example: Cheating Penalty Under BNS",
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

/**
 * Format a statutory detail object into an authoritative context block for RAG grounding
 */
function formatDetailContext(detail: any): string {
  const parts: string[] = [
    `Act: ${detail.act.short_title} (${detail.act.id.toUpperCase()})`,
    `Section ${detail.section.number}: ${detail.section.title}`,
    `Bare Statutory Text: ${detail.section.text.slice(0, 2000)}`,
  ];
  if (detail.section.bailable !== undefined) {
    parts.push(`Bail Classification: ${detail.section.bailable ? "Bailable" : "Non-Bailable"}`);
  }
  if (detail.section.cognizable !== undefined) {
    parts.push(`Cognizance: ${detail.section.cognizable ? "Cognizable" : "Non-Cognizable"}`);
  }
  if (detail.section.court_triable) {
    parts.push(`Court Triable By: ${detail.section.court_triable}`);
  }
  if (Array.isArray(detail.corresponds_to) && detail.corresponds_to.length > 0) {
    const corrText = detail.corresponds_to
      .map((c: any) => `${c.act.toUpperCase()} §${c.section} (${c.relation})`)
      .join(", ");
    parts.push(`Corresponding Old/New Penal Provision: ${corrText}`);
  }
  if (detail.judgments && detail.judgments.length > 0) {
    const judgments = detail.judgments
      .slice(0, 2)
      .map(
        (j: any) =>
          `- **${j.title}** (${j.court_name}, ${j.date}): ${j.ratio_decidendi}`
      )
      .join("\n");
    parts.push(`Landmark Judicial Precedents:\n${judgments}`);
  }
  return parts.join("\n");
}

/**
 * Extract statutory references (Act and Section) from user prompts
 */
function extractStatutoryRefs(text: string): { act: string; section: string }[] {
  const refs: { act: string; section: string }[] = [];
  const seen = new Set<string>();

  const add = (act: string, sec: string) => {
    const cleanSec = sec.replace(/[^0-9a-zA-Z]/g, "").toLowerCase();
    const key = `${act}:${cleanSec}`;
    if (!seen.has(key)) {
      seen.add(key);
      refs.push({ act, section: sec });
    }
  };

  // Standard Act-first matches: "BNS Section 318", "BNS §318", "BNS 318"
  const patterns: [RegExp, string][] = [
    // Negative lookahead (?!s\b) stops "bns" from also matching inside "bnss",
    // which would otherwise wrongly ground the answer in BNS instead of BNSS.
    [/\b(?:bns(?!s\b)|bharatiya\s*nyaya\s*sanhita)\D*?(\d+[a-z]?)/gi, "bns"],
    [/\b(?:bnss|bharatiya\s*nagarik\s*suraksha\s*sanhita)\D*?(\d+[a-z]?)/gi, "bnss"],
    [/\b(?:bsa|bharatiya\s*sakshya\s*adhiniyam)\D*?(\d+[a-z]?)/gi, "bsa"],
    [/\b(?:ipc|indian\s*penal\s*code)\D*?(\d+[a-z]?)/gi, "ipc"],
    [/\b(?:crpc|code\s*of\s*criminal\s*procedure)\D*?(\d+[a-z]?)/gi, "crpc"],
    [/\b(?:ni\s*act|negotiable\s*instruments(?:\s*act)?)\D*?(\d+[a-z]?)/gi, "negotiable-instruments-act-1881"],
    [/\b(?:cpc|code\s*of\s*civil\s*procedure)\D*?(\d+[a-z]?)/gi, "code-of-civil-procedure-1908"],
    [/\b(?:rera)\D*?(\d+[a-z]?)/gi, "real-estate-regulation-and-development-act-2016"],
  ];

  for (const [regex, act] of patterns) {
    const matches = text.matchAll(regex);
    for (const m of matches) {
      if (m[1]) add(act, m[1]);
    }
  }

  // Reverse Section-first matches: "Section 420 IPC", "Section 138 NI Act", "Section 35 BNSS"
  const revRegex = /\b(?:section|sec|§)\s*(\d+[a-z]?)\s*(?:of\s*(?:the\s*)?)?(bns|bnss|bsa|ipc|crpc|cpc|ni\s*act|negotiable\s*instruments)/gi;
  const revMatches = text.matchAll(revRegex);
  for (const m of revMatches) {
    const sec = m[1];
    const actStr = m[2].toLowerCase();
    let act = "bns";
    if (actStr.includes("ipc")) act = "ipc";
    else if (actStr.includes("crpc")) act = "crpc";
    else if (actStr.includes("bnss")) act = "bnss";
    else if (actStr.includes("bsa")) act = "bsa";
    else if (actStr.includes("cpc")) act = "code-of-civil-procedure-1908";
    else if (actStr.includes("ni") || actStr.includes("negotiable")) act = "negotiable-instruments-act-1881";
    add(act, sec);
  }

  return refs;
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
            try {
              controller.enqueue(encoder.encode(content));
            } catch {
              // Client disconnected or closed stream early
              break;
            }
          }
        }
        try {
          controller.close();
        } catch {
          // Already closed
        }

        if (onCompletion) {
          onCompletion(fullText).catch((err) =>
            console.error("[Post-stream Callback Error]:", err)
          );
        }
      } catch (err: any) {
        console.error("[Stream Controller Error]:", err);
        try {
          if (!fullText) {
            controller.enqueue(
              encoder.encode(
                "## ⚠️ High Legal Query Volume\n\nBharatLegal AI experienced a transient rate limit while synthesizing statutory jurisprudence. Please retry your question."
              )
            );
          }
          controller.close();
        } catch {
          // Controller might already be closed
        }
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
