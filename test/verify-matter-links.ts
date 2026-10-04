import mongoose from "mongoose";
import dbConnect from "../lib/dbConnect";
import MatterModel from "../model/Matter";
import ConversationModel from "../model/Conversation";
import DocumentAnalysisModel from "../model/DocumentAnalysis";
import LegalDraftModel from "../model/LegalDraft";
import CaseModel from "../model/Case";
import { MatterLinkError, resolveOwnedMatterId, setItemMatter, LINK_MODELS, LINK_TYPES } from "../lib/matter-links";
import { buildMatterContext } from "../lib/matter-context";

/**
 * Verifies that chats, documents, drafts and cases can all be linked to a matter,
 * that one user can never touch another user's matter or items, and that the chat
 * receives the matter's context. Uses throwaway mock users and cleans up after itself.
 */
async function run() {
  console.log("==================================================");
  console.log("🧪 RUNNING MATTER LINKING VERIFICATION TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;
  const check = (name: string, condition: boolean, detail = "") => {
    if (condition) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.error(`  ✗ ${name} ${detail}`);
      failed++;
    }
  };

  const userA = new mongoose.Types.ObjectId();
  const userB = new mongoose.Types.ObjectId();

  try {
    await dbConnect();
    console.log("✓ Connected to MongoDB");

    const matterA = await MatterModel.create({
      userId: userA,
      title: "Deposit refund dispute",
      category: "Housing",
      summary: "Landlord is withholding the ₹64,000 deposit.",
      nextAction: "Send a written demand",
      checklist: [{ text: "Collect rent receipts", completed: false }],
    });
    const matterB = await MatterModel.create({ userId: userB, title: "Someone else's matter" });

    const items = {
      chat: await ConversationModel.create({ userId: userA, title: "Deposit questions" }),
      document: await DocumentAnalysisModel.create({
        userId: userA,
        fileName: "Lease.pdf",
        fileType: "PDF",
        fileSize: 1024,
        documentCategory: "Residential Lease Deed",
        riskScore: 72,
        executiveSummary: "The lease forfeits the whole deposit on early exit.",
        originalText: "text",
        simplifiedText: "text",
      }),
      draft: await LegalDraftModel.create({
        userId: userA,
        draftType: "cheque-bounce-notice",
        title: "Demand notice to landlord",
        generatedContent: "NOTICE ...",
      }),
      case: await CaseModel.create({
        userId: userA,
        caseNumber: "RC/2026/0481",
        title: "Sundaram vs Sharma",
        court: "Rent Authority, Bengaluru",
        caseType: "Tenancy",
        stage: "Hearing",
        status: "Active",
      }),
    } as const;

    console.log("\n▶ Test 1: Every item type can be linked to a matter");
    for (const type of LINK_TYPES) {
      const ok = await setItemMatter(userA.toString(), matterA._id.toString(), type, items[type]._id.toString(), "link");
      const stored: any = await LINK_MODELS[type].findById(items[type]._id).lean();
      check(`${type} linked`, ok && String(stored.matterId) === String(matterA._id));
    }

    console.log("\n▶ Test 2: Another user cannot link, unlink, or attach to these matters");
    let blocked = false;
    try {
      await setItemMatter(userB.toString(), matterA._id.toString(), "chat", items.chat._id.toString(), "unlink");
    } catch (err) {
      blocked = err instanceof MatterLinkError;
    }
    check("user B cannot act on user A's matter", blocked);

    const stolen = await setItemMatter(userB.toString(), matterB._id.toString(), "chat", items.chat._id.toString(), "link");
    check("user B cannot pull user A's chat into their own matter", stolen === false);

    let rejected = false;
    try {
      await resolveOwnedMatterId(userB.toString(), matterA._id.toString());
    } catch (err) {
      rejected = err instanceof MatterLinkError;
    }
    check("a matter id owned by someone else is rejected at creation time", rejected);
    check("no matter id resolves to null", (await resolveOwnedMatterId(userA.toString(), "")) === null);
    check("own matter id resolves", (await resolveOwnedMatterId(userA.toString(), matterA._id.toString())) === matterA._id.toString());

    console.log("\n▶ Test 3: The chat receives the matter's context");
    const context = await buildMatterContext(items.chat._id.toString(), userA.toString());
    check("includes the matter title", context.includes("Deposit refund dispute"));
    check("includes the summary", context.includes("₹64,000"));
    check("includes the next action", context.includes("Send a written demand"));
    check("includes the open checklist", context.includes("Collect rent receipts"));
    check("includes the reviewed document", context.includes("Lease.pdf") && context.includes("72/100"));
    check("includes the draft", context.includes("Demand notice to landlord"));
    check("includes the court case", context.includes("RC/2026/0481"));
    check("a chat outside any matter gets no context", (await buildMatterContext(new mongoose.Types.ObjectId().toString(), userA.toString())) === "");
    check("another user gets no context for this chat", (await buildMatterContext(items.chat._id.toString(), userB.toString())) === "");

    console.log("\n▶ Test 4: Unlinking works and only affects the right matter");
    const wrongMatter = await setItemMatter(userA.toString(), matterB._id.toString(), "draft", items.draft._id.toString(), "unlink").catch(() => false);
    check("unlinking through a different matter does nothing", wrongMatter === false);
    const stillLinked: any = await LegalDraftModel.findById(items.draft._id).lean();
    check("the draft is still in its matter", String(stillLinked.matterId) === String(matterA._id));
    for (const type of LINK_TYPES) {
      await setItemMatter(userA.toString(), matterA._id.toString(), type, items[type]._id.toString(), "unlink");
      const stored: any = await LINK_MODELS[type].findById(items[type]._id).lean();
      check(`${type} unlinked`, stored.matterId === null);
    }
    check("an unlinked chat gets no context", (await buildMatterContext(items.chat._id.toString(), userA.toString())) === "");
  } catch (err: any) {
    console.error("  ✗ Test run FAILED:", err.message);
    failed++;
  } finally {
    // Remove everything this run created, and nothing else (all of it belongs to the two mock users).
    for (const model of [MatterModel, ConversationModel, DocumentAnalysisModel, LegalDraftModel, CaseModel] as any[]) {
      await model.deleteMany({ userId: { $in: [userA, userB] } });
    }
    console.log("\n  ✓ Cleaned up all test records");
  }

  console.log("\n==================================================");
  console.log(`📊 MATTER LINK TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");
  process.exit(failed > 0 ? 1 : 0);
}

run();
