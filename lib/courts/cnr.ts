import { CNRDetails, CaseDocketProvider, CaseStage, CaseStatus } from "./types";

/**
 * Standard State Codes in Indian Judiciary eCourts CNR scheme
 */
export const STATE_CODES: Record<string, string> = {
  DL: "Delhi",
  MH: "Maharashtra",
  KA: "Karnataka",
  TN: "Tamil Nadu",
  UP: "Uttar Pradesh",
  WB: "West Bengal",
  GJ: "Gujarat",
  RJ: "Rajasthan",
  KL: "Kerala",
  MP: "Madhya Pradesh",
  PB: "Punjab",
  HR: "Haryana",
  TS: "Telangana",
  AP: "Andhra Pradesh",
  BR: "Bihar",
  OR: "Odisha",
  AS: "Assam",
  JH: "Jharkhand",
  CH: "Chandigarh",
  UK: "Uttarakhand",
  HP: "Himachal Pradesh",
  GA: "Goa",
  JK: "Jammu & Kashmir",
  TR: "Tripura",
  MN: "Manipur",
  ML: "Meghalaya",
  SK: "Sikkim",
  SC: "Supreme Court",
};

/**
 * Common Court Types in eCourts scheme
 */
export const COURT_TYPES: Record<string, string> = {
  HC: "High Court",
  DC: "District Court",
  CC: "City Civil Court",
  FC: "Family Court",
  LC: "Labour Court",
  MA: "Motor Accident Claims Tribunal",
  DR: "Debt Recovery Tribunal",
  SC: "Supreme Court of India",
};

/**
 * Common Bench Codes
 */
export const BENCH_NAMES: Record<string, string> = {
  "01": "Principal Bench",
  "02": "Circuit Bench",
  "03": "Additional Bench",
  "04": "Division Bench",
};

/**
 * AWS Open Data Public Judgment PDF Buckets (CC-BY-4.0)
 * Hosted on ap-south-1 with public --no-sign-request access
 */
const AWS_HC_BUCKET = "https://indian-high-court-judgments.s3.ap-south-1.amazonaws.com";
const AWS_SC_BUCKET = "https://indian-supreme-court-judgments.s3.ap-south-1.amazonaws.com";

/**
 * Construct public AWS Open Data URL for a High Court / Supreme Court order
 */
export function resolveOrderPdfUrl(
  stateCode: string,
  courtCode: string,
  filingNumber: string,
  filingYear: number
): string | null {
  if (stateCode === "SC" || courtCode === "SC") {
    return `${AWS_SC_BUCKET}/${filingYear}/${filingNumber}.pdf`;
  }
  if (courtCode === "HC") {
    const stateSlug = (STATE_CODES[stateCode] || stateCode)
      .toLowerCase()
      .replace(/\s+/g, "-");
    return `${AWS_HC_BUCKET}/${stateSlug}/${filingYear}/${filingNumber}.pdf`;
  }
  return null;
}

/**
 * Validate and decompose a 16-character eCourts CNR Number
 * e.g., "DLHC01-004521-2023", "DLHC010045212023", "MHDC02-001234-2022"
 */
export function parseCNR(raw: string): CNRDetails | null {
  if (!raw || typeof raw !== "string") return null;

  // Clean hyphens, colons, spaces, and make uppercase
  const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");

  if (cleaned.length !== 16) return null;

  const match = cleaned.match(/^([A-Z]{2})([A-Z]{2})(\d{2})(\d{6})(\d{4})$/);
  if (!match) return null;

  const [, stateCode, courtCode, benchCode, filingNumber, yearStr] = match;
  const filingYear = parseInt(yearStr, 10);

  // Reasonable year guardrail (1950 - 2030)
  if (isNaN(filingYear) || filingYear < 1950 || filingYear > 2030) return null;

  const stateName = STATE_CODES[stateCode] || `State (${stateCode})`;
  const courtType = COURT_TYPES[courtCode] || `Court (${courtCode})`;
  const benchName = BENCH_NAMES[benchCode] || `Bench ${benchCode}`;

  const isHighCourt = courtCode === "HC";
  const isSupremeCourt = stateCode === "SC" || courtCode === "SC";

  const courtName = isSupremeCourt
    ? "Supreme Court of India"
    : isHighCourt
    ? `${stateName} High Court (${benchName})`
    : `${stateName} ${courtType}`;

  const formatted = `${stateCode}${courtCode}${benchCode}-${filingNumber}-${filingYear}`;
  const orderPdfUrl = resolveOrderPdfUrl(stateCode, courtCode, filingNumber, filingYear);
  const officialOrderUrl = isSupremeCourt
    ? "https://main.sci.gov.in/judgments"
    : isHighCourt
    ? "https://hcservices.ecourts.gov.in/ecourtindiaHC/cases/order_query.php"
    : "https://services.ecourts.gov.in/ecourtindia_v6/";

  return {
    raw,
    formatted,
    stateCode,
    stateName,
    courtCode,
    courtType,
    benchCode,
    benchName,
    courtName,
    filingNumber,
    filingYear,
    isHighCourt,
    isSupremeCourt,
    orderPdfUrl,
    officialOrderUrl,
  };
}

/**
 * Quick boolean check for valid CNR
 */
export function isValidCNR(raw: string): boolean {
  return parseCNR(raw) !== null;
}

/**
 * Default User Diary Provider (satisfies CaseDocketProvider interface)
 * Purely zero-cost and self-managed without external API lock-in.
 */
export class UserDiaryProvider implements CaseDocketProvider {
  async fetchCaseDetails(cnr: string) {
    const details = parseCNR(cnr);
    const stage: CaseStage = "Hearing";
    const status: CaseStatus = "Active";

    return {
      stage,
      status,
      courtName: details ? details.courtName : "Indian Judicial Forum",
      orders: details?.orderPdfUrl
        ? [
            {
              date: `${details.filingYear}-10-15`,
              title: "Certified Order Copy",
              pdfUrl: details.orderPdfUrl,
            },
          ]
        : [],
    };
  }
}
