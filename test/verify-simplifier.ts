import { formatAnalysisToMarkdown, simplifyTextLocally } from "../lib/simplify";

async function runSimplifierTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING DOCUMENT SIMPLIFIER VERIFICATION TESTS");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  // Test 1: Local Simplification Heuristic for Lease
  console.log("▶ Test 1: Verify Residential Lease Detection & Statutory Notes...");
  try {
    const leaseSample = `RESIDENTIAL LEASE AGREEMENT
    Lessor: Mr. Sharma. Lessee: Ms. Sen.
    Rent: 28,000. Deposit: 1,50,000.
    If tenant vacates within lock-in period, deposit is forfeited unconditionally.`;

    const summary = await simplifyTextLocally(leaseSample);
    if (!summary.includes("Residential Tenancy Agreement") || !summary.includes("Section 74")) {
      throw new Error("Missing lease classification or Section 74 warning");
    }
    console.log("  ✓ Correctly classified as Real Estate / Tenancy");
    console.log("  ✓ Flagged Section 74 Indian Contract Act penalty warning");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Test 1 FAILED:", err.message);
    failed++;
  }

  console.log("\n--------------------------------------------------");

  // Test 2: Local Simplification Heuristic for Employment
  console.log("▶ Test 2: Verify Employment Non-Compete Section 27 Warning...");
  try {
    const employmentSample = `EMPLOYMENT CONTRACT
    For 2 years post-termination, employee shall not work for any competitor anywhere in India.`;

    const summary = await simplifyTextLocally(employmentSample);
    if (!summary.includes("Section 27, Indian Contract Act") || !summary.includes("Employment Agreement")) {
      throw new Error("Missing Section 27 non-compete void warning");
    }
    console.log("  ✓ Correctly classified as Employment Agreement");
    console.log("  ✓ Flagged Section 27 void non-compete protection");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Test 2 FAILED:", err.message);
    failed++;
  }

  console.log("\n--------------------------------------------------");

  // Test 3: Structured Markdown Report Generation
  console.log("▶ Test 3: Verify Structured Markdown Report Exporter...");
  try {
    const mockAnalysis = {
      documentCategory: "Residential Lease Deed",
      parties: ["Lessor: Rajesh", "Lessee: Ananya"],
      riskScore: 72,
      executiveSummary: "11-month lease agreement with unbalanced lock-in deposit forfeiture.",
      keyObligations: ["Monthly rent 28,000", "1 month notice to vacate"],
      riskyClauses: [
        {
          clauseTitle: "Unconditional Deposit Forfeiture",
          clauseText: "Full deposit forfeited if vacating early.",
          riskLevel: "critical" as const,
          explanation: "Penalty clauses exceeding actual loss are void under Section 74.",
          recommendation: "Cap deduction to actual broker charges or 1 month rent.",
          statutoryReference: "Section 74, Indian Contract Act, 1872",
        },
      ],
      statutoryReferences: [
        {
          act: "Model Tenancy Act",
          section: "13",
          title: "Security Deposit Refund",
          relevance: "Mandates deposit refund within 30 days.",
        },
      ],
      actionChecklist: ["Demand joint move-in walkthrough inventory."],
      simplifiedText: "Executive breakdown text.",
    };

    const md = formatAnalysisToMarkdown(mockAnalysis, "Lease.txt");
    if (!md.includes("72/100") || !md.includes("[CRITICAL RISK]") || !md.includes("Model Tenancy Act")) {
      throw new Error("Markdown export missing key structured sections");
    }
    console.log("  ✓ Generated valid Markdown report with risk score, badge, and statutory citations");
    passed++;
  } catch (err: any) {
    console.error("  ✗ Test 3 FAILED:", err.message);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`📊 SIMPLIFIER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runSimplifierTests();
