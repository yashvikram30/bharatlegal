import dbConnect from "../lib/dbConnect";
import MatterModel from "../model/Matter";
import CaseModel from "../model/Case";
import DocumentAnalysisModel from "../model/DocumentAnalysis";
import mongoose from "mongoose";

async function runMatterTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING MATTER WORKSPACE VERIFICATION TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  try {
    await dbConnect();
    console.log("✓ Connected to MongoDB");

    const mockUserId = new mongoose.Types.ObjectId();

    // ----------------------------------------------------
    // Test 1: Create a Matter with Next Best Action & Checklist
    // ----------------------------------------------------
    console.log("\n▶ Test 1: Create Matter with Action Checklist...");
    const matter = await MatterModel.create({
      userId: mockUserId,
      title: "Security Deposit Refund Dispute",
      category: "Housing",
      status: "Open",
      summary: "Landlord withholding ₹64,000 security deposit without itemized repair bill.",
      nextAction: "Issue 15-day statutory demand notice under Model Tenancy Act §13",
      nextActionDue: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      checklist: [
        { text: "Collect bank statement showing initial deposit transfer", completed: true },
        { text: "Download lease agreement copy", completed: true },
        { text: "Draft Model Tenancy Act demand notice in Studio", completed: false },
      ],
    });

    if (!matter._id) throw new Error("Failed to insert Matter into MongoDB");
    console.log(`  ✓ Created Matter: "${matter.title}" (ID: ${matter._id})`);
    console.log(`  ✓ Category: ${matter.category} | Status: ${matter.status}`);
    console.log(`  ✓ Checklist items: ${matter.checklist.length} (1 pending)`);
    passed++;

    // ----------------------------------------------------
    // Test 2: Link Case & Document Analysis to Matter
    // ----------------------------------------------------
    console.log("\n▶ Test 2: Link Case and Document Analysis to Matter...");
    const linkedCase = await CaseModel.create({
      userId: mockUserId,
      matterId: matter._id,
      caseNumber: "RC/2026/0481",
      title: "Priya Sundaram vs Rajesh Sharma",
      court: "Rent Authority Bench-1, Bengaluru",
      caseType: "Tenancy",
      stage: "Hearing",
      status: "Active",
    });

    const linkedDoc = await DocumentAnalysisModel.create({
      userId: mockUserId,
      matterId: matter._id,
      fileName: "Residential_Lease_Agreement.pdf",
      fileType: "PDF",
      fileSize: 10240,
      documentCategory: "Residential Lease Deed",
      riskScore: 72,
      executiveSummary: "Agreement contains unlawful 100% deposit forfeiture covenant.",
      originalText: "Sample lease agreement text.",
      simplifiedText: "Simplified plain language text.",
    });

    console.log(`  ✓ Linked Case: "${linkedCase.title}" with matterId: ${linkedCase.matterId}`);
    console.log(`  ✓ Linked Document: "${linkedDoc.fileName}" with matterId: ${linkedDoc.matterId}`);

    // Query both via matterId
    const foundCases = await CaseModel.find({ matterId: matter._id });
    const foundDocs = await DocumentAnalysisModel.find({ matterId: matter._id });

    if (foundCases.length !== 1 || foundDocs.length !== 1) {
      throw new Error("Failed to query linked case or document by matterId");
    }
    console.log(`  ✓ Query verified: 1 linked case and 1 linked document resolved for this matter`);
    passed++;

    // ----------------------------------------------------
    // Test 3: Update Matter Status and Complete Checklist
    // ----------------------------------------------------
    console.log("\n▶ Test 3: Update Matter Status & Checklist Progress...");
    const updated = await MatterModel.findByIdAndUpdate(
      matter._id,
      {
        status: "Waiting",
        nextAction: "Await landlord response to notice",
        "checklist.2.completed": true,
      },
      { new: true }
    );

    if (!updated || updated.status !== "Waiting" || !updated.checklist[2].completed) {
      throw new Error("Failed to update matter status or checklist item");
    }
    console.log(`  ✓ Status transitioned to: ${updated.status}`);
    console.log(`  ✓ All ${updated.checklist.length} checklist items marked completed`);
    passed++;

    // ----------------------------------------------------
    // Test 4: Cleanup Test Records
    // ----------------------------------------------------
    console.log("\n▶ Test 4: Clean up test artifacts...");
    await CaseModel.findByIdAndDelete(linkedCase._id);
    await DocumentAnalysisModel.findByIdAndDelete(linkedDoc._id);
    await MatterModel.findByIdAndDelete(matter._id);
    console.log("  ✓ Successfully cleaned up test matter, case, and document records");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Test FAILED:", err.message);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`📊 MATTER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runMatterTests();
