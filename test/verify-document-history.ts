/**
 * Test script for Document Simplifier History & Persistence
 */
import mongoose from "mongoose";
import dbConnect from "../lib/dbConnect";
import DocumentAnalysisModel from "../model/DocumentAnalysis";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 TESTING LEGAL DOCUMENT HISTORY & PERSISTENCE");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  try {
    await dbConnect();
    console.log("✓ Connected to MongoDB via dbConnect()\n");

    const testUserId = new mongoose.Types.ObjectId();
    let createdDocId: string = "";

    // Test 1: Create Document Analysis with originalText
    console.log("▶ Test 1: Persist Document Analysis with originalText and Risk Clauses...");
    try {
      const doc = await DocumentAnalysisModel.create({
        userId: testUserId,
        fileName: "Residential_Tenancy_Agreement.pdf",
        fileType: "PDF",
        fileSize: 45000,
        documentCategory: "Residential Lease Agreement",
        parties: ["Ramesh Gupta (Lessor)", "Pooja Verma (Lessee)"],
        riskScore: 68,
        executiveSummary: "11-month lease with high lock-in penalty and unannounced visits.",
        keyObligations: ["Monthly rent ₹25,000", "30-day notice for vacating"],
        actionChecklist: ["Verify deposit return within 30 days", "Delete unannounced inspection clause"],
        riskyClauses: [
          {
            clauseTitle: "Forfeiture of Security Deposit",
            clauseText: "Deposit forfeited unconditionally if tenant departs before 6 months.",
            riskLevel: "critical",
            explanation: "Violates Section 74 Indian Contract Act 1872.",
            recommendation: "Cap damages to actual incurred broker re-letting cost.",
            statutoryReference: "Section 74, Indian Contract Act, 1872",
          },
        ],
        statutoryReferences: [
          {
            act: "The Indian Contract Act, 1872",
            section: "74",
            title: "Liquidated Damages",
            relevance: "Restricts penalty forfeiture to actual proved losses.",
            actSlug: "indian-contract-act-1872",
          },
        ],
        simplifiedText: "# Plain English Lease Summary\nUnfair deposit penalty detected.",
        originalText: "THIS RESIDENTIAL LEASE IS ENTERED ON 01/01/2025...",
      });

      createdDocId = doc._id.toString();
      if (doc.originalText?.includes("THIS RESIDENTIAL LEASE")) {
        console.log("  ✓ Successfully created document record with originalText saved");
        console.log(`  ✓ Document ID: ${createdDocId}`);
        passed++;
      } else {
        throw new Error("originalText was not persisted properly");
      }
    } catch (e: any) {
      console.error("  ✗ Test 1 failed:", e.message);
      failed++;
    }

    console.log("--------------------------------------------------");

    // Test 2: Query User's Document History List
    console.log("▶ Test 2: Fetch User's Document History List Sorted by Date...");
    try {
      const historyList = await DocumentAnalysisModel.find({ userId: testUserId })
        .sort({ createdAt: -1 })
        .select("fileName fileType fileSize documentCategory riskScore executiveSummary riskyClauses statutoryReferences createdAt updatedAt")
        .lean();

      if (historyList.length === 1 && historyList[0].fileName === "Residential_Tenancy_Agreement.pdf") {
        console.log(`  ✓ Retrieved ${historyList.length} historical audit(s) for user`);
        console.log(`  ✓ File: ${historyList[0].fileName} | Risk Score: ${historyList[0].riskScore}/100`);
        console.log(`  ✓ Flagged clauses count: ${historyList[0].riskyClauses.length}`);
        passed++;
      } else {
        throw new Error(`Expected 1 history item, found ${historyList.length}`);
      }
    } catch (e: any) {
      console.error("  ✗ Test 2 failed:", e.message);
      failed++;
    }

    console.log("--------------------------------------------------");

    // Test 3: Load Full Document by ID (Zero-Token Restore)
    console.log("▶ Test 3: Load Full Document by ID for Zero-Token Audit Restore...");
    try {
      const fullDoc = await DocumentAnalysisModel.findOne({ _id: createdDocId, userId: testUserId }).lean();
      if (!fullDoc) throw new Error("Document not found");

      if (
        fullDoc.simplifiedText.includes("Plain English Lease Summary") &&
        (fullDoc.originalText?.includes("THIS RESIDENTIAL LEASE") ?? false) &&
        fullDoc.riskyClauses.length === 1 &&
        fullDoc.statutoryReferences.length === 1
      ) {
        console.log("  ✓ Full structured analysis and original text restored cleanly");
        console.log("  ✓ Restored simplifiedText length:", fullDoc.simplifiedText.length);
        console.log("  ✓ Restored originalText length:", fullDoc.originalText?.length ?? 0);
        passed++;
      } else {
        throw new Error("Full document content verification failed");
      }
    } catch (e: any) {
      console.error("  ✗ Test 3 failed:", e.message);
      failed++;
    }

    console.log("--------------------------------------------------");

    // Test 4: Delete Document Audit from History
    console.log("▶ Test 4: Delete Document Audit from History...");
    try {
      const deleted = await DocumentAnalysisModel.findOneAndDelete({ _id: createdDocId, userId: testUserId });
      if (!deleted) throw new Error("Failed to delete record");

      const check = await DocumentAnalysisModel.findById(createdDocId);
      if (check === null) {
        console.log("  ✓ Successfully deleted document audit from user history");
        passed++;
      } else {
        throw new Error("Document still exists after deletion");
      }
    } catch (e: any) {
      console.error("  ✗ Test 4 failed:", e.message);
      failed++;
    }

    await mongoose.disconnect();
  } catch (err: any) {
    console.error("Database connection error in test:", err.message);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) process.exit(1);
}

runTests();
