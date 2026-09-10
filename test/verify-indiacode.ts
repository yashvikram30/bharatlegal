import {
  lookupSection,
  getSectionMarkdown,
  convertProvision,
  searchActs,
} from "../lib/legal-api/indiacode";

async function runTests() {
  console.log("==================================================");
  console.log("🧪 RUNNING INDIACODE CLIENT VERIFICATION TESTS");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  // Test 1: Live / Cached BNS Section 103 (Murder)
  console.log("▶ Test 1: Lookup BNS Section 103 (Murder)...");
  try {
    const sec103 = await lookupSection("bns", "103");
    if (!sec103) {
      throw new Error("Failed to retrieve BNS Section 103");
    }
    console.log(`  ✓ Title: ${sec103.section.title}`);
    console.log(`  ✓ Source: ${sec103.source}`);
    console.log(`  ✓ Text Preview: ${sec103.section.text.substring(0, 100)}...`);
    console.log(`  ✓ Correspondences: ${sec103.corresponds_to.length}`);
    const ipcCorresp = sec103.corresponds_to.find(
      (c) => c.act === "ipc" && c.section === "302"
    );
    if (!ipcCorresp) {
      throw new Error("Missing IPC 302 correspondence in BNS 103");
    }
    console.log(`  ✓ IPC Correspondence verified: ${ipcCorresp.act.toUpperCase()} §${ipcCorresp.section} (${ipcCorresp.relation})`);
    console.log(`  ✓ Precedents found: ${sec103.judgments.length}`);
    if (sec103.judgments.length > 0) {
      console.log(`  ✓ Landmark judgment: "${sec103.judgments[0].title}" (${sec103.judgments[0].court_name})`);
    }
    passed++;
  } catch (err: any) {
    console.error(`  ✗ Test 1 FAILED:`, err.message);
    failed++;
  }

  console.log("\n--------------------------------------------------");

  // Test 2: BNS Section 318 (Cheating -> IPC 420)
  console.log("▶ Test 2: Lookup BNS Section 318 (Cheating) & Concordance...");
  try {
    const sec318 = await lookupSection("bns", "318");
    if (!sec318) {
      throw new Error("Failed to retrieve BNS Section 318");
    }
    console.log(`  ✓ Title: ${sec318.section.title}`);
    const ipc420 = sec318.corresponds_to.find(
      (c) => c.act === "ipc" && c.section === "420"
    );
    if (!ipc420) {
      throw new Error("Missing IPC 420 correspondence in BNS 318");
    }
    console.log(`  ✓ IPC Correspondence verified: ${ipc420.act.toUpperCase()} §${ipc420.section} (${ipc420.relation})`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ Test 2 FAILED:`, err.message);
    failed++;
  }

  console.log("\n--------------------------------------------------");

  // Test 3: Reverse Provision Conversion (IPC 420 -> BNS 318)
  console.log("▶ Test 3: Reverse Conversion (IPC 420 -> BNS)...");
  try {
    const conversion = await convertProvision("ipc", "420");
    if (!conversion) {
      throw new Error("Failed to convert IPC 420 to BNS");
    }
    console.log(`  ✓ Converted to: ${conversion.act.toUpperCase()} §${conversion.section} (${conversion.relation})`);
    if (conversion.section !== "318") {
      throw new Error(`Expected section 318, got ${conversion.section}`);
    }
    passed++;
  } catch (err: any) {
    console.error(`  ✗ Test 3 FAILED:`, err.message);
    failed++;
  }

  console.log("\n--------------------------------------------------");

  // Test 4: Section Markdown Fetch
  console.log("▶ Test 4: Fetch Clean Markdown for BNS Section 103...");
  try {
    const markdown = await getSectionMarkdown("bns", "103");
    if (!markdown || !markdown.includes("Bharatiya Nyaya Sanhita")) {
      throw new Error("Markdown representation missing or invalid");
    }
    console.log(`  ✓ Markdown retrieved (${markdown.length} chars)`);
    console.log(`  ✓ Markdown Preview:\n${markdown.split("\n").slice(0, 4).join("\n")}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ Test 4 FAILED:`, err.message);
    failed++;
  }

  console.log("\n--------------------------------------------------");

  // Test 5: Act Search Discovery
  console.log("▶ Test 5: Search Acts by query 'nyaya'...");
  try {
    const acts = await searchActs("nyaya", 3);
    if (!acts || acts.length === 0) {
      throw new Error("Failed to discover acts matching 'nyaya'");
    }
    console.log(`  ✓ Found ${acts.length} acts:`);
    acts.forEach((a) => console.log(`    - [${a.id}] ${a.short_title}`));
    passed++;
  } catch (err: any) {
    console.error(`  ✗ Test 5 FAILED:`, err.message);
    failed++;
  }

  console.log("\n--------------------------------------------------");

  // Test 6: Fallback Dataset Resilience
  console.log("▶ Test 6: Fallback Dataset Resolution (BNSS 35 Arrest)...");
  try {
    const bnss35 = await lookupSection("bnss", "35");
    if (!bnss35) {
      throw new Error("Failed to retrieve BNSS Section 35");
    }
    console.log(`  ✓ Title: ${bnss35.section.title}`);
    console.log(`  ✓ Source: ${bnss35.source}`);
    const crpc41 = bnss35.corresponds_to.find((c) => c.section === "41");
    if (crpc41) {
      console.log(`  ✓ Predecessor mapped: CrPC §${crpc41.section}`);
    }
    passed++;
  } catch (err: any) {
    console.error(`  ✗ Test 6 FAILED:`, err.message);
    failed++;
  }

  console.log("\n==================================================");
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
