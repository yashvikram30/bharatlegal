import coreActsFallback from "@/data/statutes/core-acts.json";

export interface StatuteAct {
  id: string;
  short_title: string;
  long_title?: string | null;
  act_number?: string | null;
  act_year?: number | null;
  enforcement_date?: string | null;
  ministry?: string | null;
  department?: string | null;
  jurisdiction?: string | null;
  section_count?: number | null;
  url?: string | null;
  description?: string;
}

export interface CorrespondsTo {
  direction: "predecessor" | "successor" | string;
  act: string;
  section: string;
  relation: string;
  score: number;
  notes?: string;
  url?: string;
}

export interface SectionJudgment {
  cnr: string;
  title: string;
  court: string;
  court_name: string;
  date: string;
  precedential_value?: string | null;
  court_marking?: string | null;
  ratio_decidendi?: string;
  applied_to_this_section?: string;
  decided_under?: string | null;
  url?: string;
}

export interface StatuteSection {
  number: string;
  title: string;
  text: string;
  bailable?: boolean | null;
  cognizable?: boolean | null;
  compoundable?: boolean | null;
  court_triable?: string | null;
}

export interface StatuteSectionDetail {
  act: StatuteAct;
  section: StatuteSection;
  corresponds_to: CorrespondsTo[];
  judgments: SectionJudgment[];
  source: "live" | "fallback";
  url?: string;
}

const BASE_API_URL = "https://indiacode.ecourtsindia.com/api/v1";
const BASE_WEB_URL = "https://indiacode.ecourtsindia.com";
const TIMEOUT_MS = 6000;

// Common Act alias mappings
const ACT_ALIASES: Record<string, string> = {
  bns: "bns",
  "bharatiya-nyaya-sanhita": "bns",
  "bharatiya-nyaya-sanhita-2023": "bns",
  ipc: "ipc",
  "indian-penal-code": "ipc",
  "indian-penal-code-1860": "ipc",
  bnss: "bnss",
  "bharatiya-nagarik-suraksha-sanhita": "bnss",
  "bharatiya-nagarik-suraksha-sanhita-2023": "bnss",
  crpc: "crpc",
  "code-of-criminal-procedure": "crpc",
  "code-of-criminal-procedure-1973": "crpc",
  bsa: "bsa",
  "bharatiya-sakshya-adhiniyam": "bsa",
  "bharatiya-sakshya-adhiniyam-2023": "bsa",
  iea: "indian-evidence-act-1872",
  "indian-evidence-act": "indian-evidence-act-1872",
  cpa: "consumer-protection-act-2019",
  "consumer-protection-act": "consumer-protection-act-2019",
  "consumer-protection-act-2019": "consumer-protection-act-2019",
  ni: "negotiable-instruments-act-1881",
  "ni-act": "negotiable-instruments-act-1881",
  "negotiable-instruments": "negotiable-instruments-act-1881",
  "negotiable-instruments-act-1881": "negotiable-instruments-act-1881",
  "transfer-of-property": "transfer-of-property-act-1882",
  "transfer-of-property-act": "transfer-of-property-act-1882",
  "transfer-of-property-act-1882": "transfer-of-property-act-1882",
  "transfer-of-property-act-1913": "transfer-of-property-act-1882",
  "contract-act": "indian-contract-act-1872",
  "indian-contract-act": "indian-contract-act-1872",
  "indian-contract-act-1872": "indian-contract-act-1872",
  rera: "real-estate-regulation-and-development-act-2016",
  "motor-vehicles-act": "motor-vehicles-act-1988",
  "it-act": "information-technology-act-2000",
  "information-technology-act": "information-technology-act-2000",
};

export function resolveActSlug(act: string): string {
  const normalized = act.trim().toLowerCase().replace(/\s+/g, "-");
  return ACT_ALIASES[normalized] || normalized;
}

// In-memory SWR cache to avoid repeated HTTP calls
const memoryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function fetchWithTimeout(url: string, timeoutMs = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "BharatLegal/1.0 (LegalEase; Educational Legal Research)",
        Accept: "application/json",
      },
      next: { revalidate: 604800 }, // Next.js ISR 7-day cache
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Lookup a statutory section by act slug and section number.
 * Live call with automatic fallback to bundled core acts.
 */
export async function lookupSection(
  actInput: string,
  sectionNumber: string
): Promise<StatuteSectionDetail | null> {
  const actSlug = resolveActSlug(actInput);
  const cleanSec = sectionNumber.trim().replace(/^§\s*/, "").replace(/^section\s*/i, "");
  const cacheKey = `section:${actSlug}:${cleanSec}`;

  // 1. Check in-memory cache
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Try live IndiaCode API
  const liveUrl = `${BASE_API_URL}/${actSlug}/section/${cleanSec}`;
  try {
    const res = await fetchWithTimeout(liveUrl);
    if (res.ok) {
      const json = await res.json();
      const result: StatuteSectionDetail = {
        act: {
          id: json.act?.id || actSlug,
          short_title: json.act?.short_title || actSlug.toUpperCase(),
          long_title: json.act?.long_title,
          act_number: json.act?.act_number,
          act_year: json.act?.act_year,
          enforcement_date: json.act?.enforcement_date,
          ministry: json.act?.ministry,
          department: json.act?.department,
          jurisdiction: json.act?.jurisdiction,
          url: json.act?.url,
        },
        section: {
          number: json.section?.number || cleanSec,
          title: json.section?.title || `Section ${cleanSec}`,
          text: json.section?.text || "",
          bailable: json.section?.bailable ?? null,
          cognizable: json.section?.cognizable ?? null,
          compoundable: json.section?.compoundable ?? null,
          court_triable: json.section?.court_triable ?? null,
        },
        corresponds_to: Array.isArray(json.corresponds_to) ? json.corresponds_to : [],
        judgments: Array.isArray(json.judgments) ? json.judgments : [],
        source: "live",
        url: json.url || `${BASE_WEB_URL}/${actSlug}/section/${cleanSec}/`,
      };

      memoryCache.set(cacheKey, { data: result, timestamp: Date.now() });
      return result;
    }
  } catch (error) {
    console.warn(`[IndiaCode API] Live lookup failed for ${actSlug}/${cleanSec}. Using fallback.`, error);
  }

  // 3. Fallback to bundled dataset
  const fallbackKey = `${actSlug}/${cleanSec}`;
  const fallbackData = (coreActsFallback.sections as Record<string, any>)[fallbackKey];
  if (fallbackData) {
    const fallbackResult: StatuteSectionDetail = {
      ...fallbackData,
      source: "fallback",
      url: `${BASE_WEB_URL}/${actSlug}/section/${cleanSec}/`,
    };
    memoryCache.set(cacheKey, { data: fallbackResult, timestamp: Date.now() });
    return fallbackResult;
  }

  return null;
}

/**
 * Fetch raw clean markdown representation of a statutory provision.
 * Useful for streaming context into LLM prompts or vector chunking.
 */
export async function getSectionMarkdown(
  actInput: string,
  sectionNumber: string
): Promise<string | null> {
  const actSlug = resolveActSlug(actInput);
  const cleanSec = sectionNumber.trim().replace(/^§\s*/, "").replace(/^section\s*/i, "");
  const mdUrl = `${BASE_WEB_URL}/${actSlug}/section/${cleanSec}.md`;

  try {
    const res = await fetch(mdUrl, {
      headers: { "User-Agent": "BharatLegal/1.0" },
      next: { revalidate: 604800 },
    });
    if (res.ok) {
      return await res.text();
    }
  } catch (err) {
    console.warn(`[IndiaCode] Markdown fetch failed for ${actSlug}/${cleanSec}`, err);
  }

  // Generate markdown from fallback if available
  const detail = await lookupSection(actInput, sectionNumber);
  if (detail) {
    return `# ${detail.act.short_title}, Section ${detail.section.number}: ${detail.section.title}\n\n- Act: ${detail.act.short_title}\n\n## Text\n\n${detail.section.text}`;
  }

  return null;
}

/**
 * Convert an old or new criminal provision (e.g. IPC 420 -> BNS 318, or BNS 103 -> IPC 302).
 */
export async function convertProvision(
  sourceActInput: string,
  sectionNumber: string
): Promise<CorrespondsTo | null> {
  const sourceSlug = resolveActSlug(sourceActInput);
  const cleanSec = sectionNumber.trim().replace(/^§\s*/, "").replace(/^section\s*/i, "");

  const detail = await lookupSection(sourceSlug, cleanSec);
  if (detail && detail.corresponds_to.length > 0) {
    return detail.corresponds_to[0];
  }

  // If queried under old law (e.g. IPC 420), search reverse mapping in fallback
  for (const [, secData] of Object.entries(coreActsFallback.sections as Record<string, any>)) {
    const match = secData.corresponds_to?.find(
      (c: CorrespondsTo) => resolveActSlug(c.act) === sourceSlug && c.section === cleanSec
    );
    if (match) {
      return {
        direction: "successor",
        act: secData.act.id,
        section: secData.section.number,
        relation: match.relation || "successor-provision",
        score: match.score || 0.9,
        notes: `Mapped from ${sourceSlug.toUpperCase()} §${cleanSec} to ${secData.act.id.toUpperCase()} §${secData.section.number}`,
      };
    }
  }

  return null;
}

/**
 * Search available acts in IndiaCode catalog.
 */
export async function searchActs(query: string, limit = 10): Promise<StatuteAct[]> {
  try {
    const res = await fetchWithTimeout(
      `${BASE_API_URL}/acts?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.acts)) {
        return json.acts;
      }
    }
  } catch (err) {
    console.warn(`[IndiaCode] Act search failed for query: "${query}"`, err);
  }

  // Filter fallback acts
  const q = query.toLowerCase();
  return (coreActsFallback.acts as StatuteAct[]).filter(
    (a) => a.id.includes(q) || a.short_title.toLowerCase().includes(q)
  );
}
