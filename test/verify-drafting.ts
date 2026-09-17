import {
  generateDeterministicDraft,
  DRAFT_TEMPLATES,
} from "../lib/drafting/templates";
import dbConnect from "../lib/dbConnect";
import LegalDraftModel from "../model/LegalDraft";
import mongoose from "mongoose";

async function runDraftingTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING STATUTORY DRAFTING VERIFICATION TESTS");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  // ----------------------------------------------------
  // Test 1: Residential Rental Agreement Generator
  // ----------------------------------------------------
  console.log("\n▶ Test 1: Verify Residential Rent Agreement (Model Tenancy Act)...");
  try {
    const rentTemplate = DRAFT_TEMPLATES.find((t) => t.id === "residential-rent-agreement")!;
    const deed = generateDeterministicDraft("residential-rent-agreement", rentTemplate.sampleData);

    if (!deed || deed.length < 500) {
      throw new Error("Generated rent deed is too short or empty");
    }

    const checks = [
      { text: "MODEL TENANCY ACT, 2021", label: "Model Tenancy Act title" },
      { text: "Section 11", label: "Section 11 deposit cap" },
      { text: "Section 13", label: "Section 13 deposit refund timeline" },
      { text: "Section 15", label: "Section 15 24-hr inspection notice" },
      { text: "Section 20", label: "Section 20 essential supplies protection" },
      { text: "Section 21", label: "Section 21 eviction protection" },
      { text: rentTemplate.sampleData.landlordName, label: "Landlord name" },
      { text: rentTemplate.sampleData.tenantName, label: "Tenant name" },
    ];

    for (const check of checks) {
      if (!deed.includes(check.text)) {
        throw new Error(`Missing expected statutory covenant: ${check.label} ('${check.text}')`);
      }
    }

    console.log(`  ✓ Successfully generated ${deed.length} character lease deed`);
    console.log(`  ✓ All Model Tenancy Act statutory covenants (Sec 11, 13, 15, 20, 21) verified`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ Test 1 FAILED:`, err.message);
    failed++;
  }

  // ----------------------------------------------------
  // Test 2: Cheque Bounce Notice Generator (Sec 138 NI Act)
  // ----------------------------------------------------
  console.log("\n▶ Test 2: Verify Section 138 Cheque Bounce Demand Notice...");
  try {
    const chequeTemplate = DRAFT_TEMPLATES.find((t) => t.id === "cheque-bounce-notice")!;
    const notice = generateDeterministicDraft("cheque-bounce-notice", chequeTemplate.sampleData);

    if (!notice || notice.length < 500) {
      throw new Error("Generated cheque notice is too short or empty");
    }

    const checks = [
      { text: "SECTION 138", label: "Section 138 NI Act reference" },
      { text: "SECTION 142", label: "Section 142 criminal jurisdiction" },
      { text: "15 (FIFTEEN) DAYS", label: "Mandatory 15-day statutory cure notice" },
      { text: "Funds Insufficient", label: "Bank return memo reason" },
      { text: "Section 318 of the Bharatiya Nyaya Sanhita, 2023", label: "BNS penal cheating provision" },
      { text: chequeTemplate.sampleData.chequeNumber, label: "Cheque number" },
    ];

    for (const check of checks) {
      if (!notice.includes(check.text)) {
        throw new Error(`Missing expected statutory covenant: ${check.label} ('${check.text}')`);
      }
    }

    console.log(`  ✓ Successfully generated ${notice.length} character statutory demand notice`);
    console.log(`  ✓ Mandatory 15-day cure period and BNS §318 / NI Act §138 verified`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ Test 2 FAILED:`, err.message);
    failed++;
  }

  // ----------------------------------------------------
  // Test 3: Consumer Grievance Notice Generator
  // ----------------------------------------------------
  console.log("\n▶ Test 3: Verify Consumer Grievance Legal Notice (CPA 2019)...");
  try {
    const consumerTemplate = DRAFT_TEMPLATES.find((t) => t.id === "consumer-grievance-notice")!;
    const notice = generateDeterministicDraft("consumer-grievance-notice", consumerTemplate.sampleData);

    if (!notice || notice.length < 500) {
      throw new Error("Generated consumer notice is too short or empty");
    }

    const checks = [
      { text: "CONSUMER PROTECTION ACT, 2019", label: "CPA 2019 reference" },
      { text: "Section 2(7)", label: "Section 2(7) consumer definition" },
      { text: "Section 2(11)", label: "Section 2(11) deficiency in service" },
      { text: "Section 35", label: "Section 35 Consumer Commission complaint" },
      { text: "e-Daakhil", label: "e-Daakhil national portal citation" },
      { text: consumerTemplate.sampleData.consumerName, label: "Consumer name" },
    ];

    for (const check of checks) {
      if (!notice.includes(check.text)) {
        throw new Error(`Missing expected statutory covenant: ${check.label} ('${check.text}')`);
      }
    }

    console.log(`  ✓ Successfully generated ${notice.length} character consumer legal notice`);
    console.log(`  ✓ CPA 2019 sections and e-Daakhil consumer forum warnings verified`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ Test 3 FAILED:`, err.message);
    failed++;
  }

  // ----------------------------------------------------
  // Test 4: RTI Application Generator
  // ----------------------------------------------------
  console.log("\n▶ Test 4: Verify RTI Application (Section 6(1) RTI Act)...");
  try {
    const rtiTemplate = DRAFT_TEMPLATES.find((t) => t.id === "rti-application")!;
    const rti = generateDeterministicDraft("rti-application", rtiTemplate.sampleData);

    if (!rti || rti.length < 400) {
      throw new Error("Generated RTI application is too short or empty");
    }

    const checks = [
      { text: "SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005", label: "Section 6(1) reference" },
      { text: "Central Public Information Officer", label: "CPIO addressing" },
      { text: "Section 7(1)", label: "Section 7(1) 30-day statutory time limit" },
      { text: "10/-", label: "₹10 statutory application fee" },
      { text: rtiTemplate.sampleData.applicantName, label: "Applicant name" },
    ];

    for (const check of checks) {
      if (!rti.includes(check.text)) {
        throw new Error(`Missing expected statutory clause: ${check.label} ('${check.text}')`);
      }
    }

    console.log(`  ✓ Successfully generated ${rti.length} character RTI application`);
    console.log(`  ✓ RTI Act 2005 Section 6(1) & 7(1) statutory compliance verified`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ Test 4 FAILED:`, err.message);
    failed++;
  }

  // ----------------------------------------------------
  // Test 5: MongoDB LegalDraftModel Persistence CRUD
  // ----------------------------------------------------
  console.log("\n▶ Test 5: Verify MongoDB Legal Draft Persistence & CRUD...");
  try {
    await dbConnect();
    console.log("  ✓ Connected to MongoDB");

    const mockUserId = new mongoose.Types.ObjectId();
    const testDraft = await LegalDraftModel.create({
      userId: mockUserId,
      draftType: "residential-rent-agreement",
      title: "Test Lease: Sharma & Sundaram",
      formData: {
        landlordName: "Rajesh Kumar Sharma",
        tenantName: "Priya Sundaram",
        monthlyRent: "32000",
      },
      generatedContent: "RESIDENTIAL RENTAL AGREEMENT TEST CONTENT",
    });

    if (!testDraft._id) {
      throw new Error("Failed to insert legal draft into MongoDB");
    }
    console.log(`  ✓ Created draft in MongoDB (ID: ${testDraft._id})`);

    // Verify retrieval
    const retrieved = await LegalDraftModel.findById(testDraft._id).lean();
    if (!retrieved || retrieved.title !== "Test Lease: Sharma & Sundaram") {
      throw new Error("Failed to read back created legal draft");
    }
    console.log(`  ✓ Retrieved draft with title "${retrieved.title}"`);

    // Verify update
    const updated = await LegalDraftModel.findByIdAndUpdate(
      testDraft._id,
      { title: "Updated Lease Title" },
      { new: true }
    );
    if (!updated || updated.title !== "Updated Lease Title") {
      throw new Error("Failed to update legal draft");
    }
    console.log(`  ✓ Updated draft title to "${updated.title}"`);

    // Cleanup
    await LegalDraftModel.findByIdAndDelete(testDraft._id);
    const postDelete = await LegalDraftModel.findById(testDraft._id);
    if (postDelete) {
      throw new Error("Failed to delete test draft from MongoDB");
    }
    console.log("  ✓ Successfully deleted test draft from vault");
    passed++;
  } catch (err: any) {
    console.error(`  ✗ Test 5 FAILED:`, err.message);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`📊 DRAFTING TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runDraftingTests();
