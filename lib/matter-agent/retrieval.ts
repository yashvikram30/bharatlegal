/**
 * Small, dependency-free retrieval for one matter's records.
 *
 * A matter holds dozens of records, not millions, so BM25 over paragraph-sized chunks is
 * accurate, fast, deterministic, and needs no embedding service or vector store.
 */

export type ItemKind = "matter" | "chat" | "document" | "draft" | "case";

export interface Chunk {
  /** Unique chunk id, e.g. "document:64f…#3". */
  id: string;
  kind: ItemKind;
  itemId: string;
  /** Title of the record the chunk came from (file name, draft title, case title...). */
  title: string;
  text: string;
}

const STOPWORDS = new Set(
  "a an and are as at be been but by can could did do does for from had has have how i if in into is it its me my of on or our so than that the their them then there these they this to us was we were what when where which who why will with would you your about after again all also any because before between both each few more most other over same should some such too very just tell please give show".split(
    " "
  )
);

/** Lowercase words, minus stopwords, with a light suffix strip so "deposits" matches "deposit". */
export function tokenize(text: string): string[] {
  const words = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const tokens: string[] = [];
  for (const raw of words) {
    if (STOPWORDS.has(raw) || (raw.length < 2 && !/\d/.test(raw))) continue;
    let word = raw;
    if (word.length > 4) word = word.replace(/(ing|ed|es|s)$/, "");
    tokens.push(word);
  }
  return tokens;
}

/** Splits long text into ~`size` character chunks, preferring paragraph then sentence boundaries. */
export function chunkText(text: string, size = 900, overlap = 120): string[] {
  const clean = text.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").trim();
  if (!clean) return [];
  if (clean.length <= size) return [clean];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);
    if (end < clean.length) {
      const window = clean.slice(start, end);
      const breakAt = Math.max(window.lastIndexOf("\n\n"), window.lastIndexOf(". "), window.lastIndexOf("\n"));
      if (breakAt > size * 0.5) end = start + breakAt + 1;
    }
    const piece = clean.slice(start, end).trim();
    if (piece) chunks.push(piece);
    if (end >= clean.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks;
}

/**
 * Words people use for the same legal idea. A query term also matches its group (at half weight),
 * so "will I lose my deposit if I leave early" finds the clause that says the deposit is
 * "forfeited" if the tenant "vacates" in the "lock-in" period.
 */
const SYNONYM_GROUPS: string[][] = [
  ["deposit", "advance", "security"],
  ["lose", "forfeit", "forfeiture", "withhold", "deduct", "deduction", "retain", "keep", "confiscate"],
  ["leave", "vacate", "exit", "quit", "terminate", "termination", "move", "surrender", "resign", "resignation"],
  ["early", "lockin", "lock-in", "premature", "notice-period"],
  ["refund", "return", "repay", "reimburse", "recover"],
  ["hearing", "court", "listing", "adjourn", "adjournment", "appear", "tribunal", "bench"],
  ["penalty", "fine", "damages", "charge", "liquidated", "compensation"],
  ["evict", "eviction", "lockout", "oust", "possession"],
  ["salary", "wage", "pay", "payment", "ctc", "gratuity", "dues"],
  ["notice", "summons", "letter", "demand"],
  ["landlord", "lessor", "owner"],
  ["tenant", "lessee", "renter"],
  ["risk", "risky", "unfair", "harsh", "one-sided", "unconscionable", "problem"],
  ["deadline", "due", "limitation", "period", "timeline"],
  ["sign", "agree", "execute", "consent"],
  ["complaint", "petition", "suit", "claim", "case", "file", "filing"],
  ["police", "fir", "arrest", "station", "custody"],
  ["contract", "agreement", "deed", "document", "lease"],
  ["next", "upcoming", "schedule", "scheduled"],
];

const synonymIndex = (() => {
  const index = new Map<string, Set<string>>();
  for (const group of SYNONYM_GROUPS) {
    const stems = Array.from(new Set(group.flatMap((word) => tokenize(word))));
    for (const stem of stems) {
      const related = index.get(stem) ?? new Set<string>();
      for (const other of stems) if (other !== stem) related.add(other);
      index.set(stem, related);
    }
  }
  return index;
})();

/** Query terms (weight 1) plus their synonyms (weight 0.5). */
function expandQuery(query: string): Map<string, number> {
  const weights = new Map<string, number>();
  const base = Array.from(new Set(tokenize(query)));
  for (const term of base) weights.set(term, 1);
  for (const term of base) {
    for (const related of synonymIndex.get(term) ?? []) {
      if (!weights.has(related)) weights.set(related, 0.5);
    }
  }
  return weights;
}

export interface SearchOptions {
  limit?: number;
  kinds?: ItemKind[];
}

export interface SearchHit {
  chunk: Chunk;
  score: number;
}

const K1 = 1.5;
const B = 0.75;

/** BM25 ranking over chunks. A match in the record's title counts extra. */
export function searchChunks(chunks: Chunk[], query: string, options: SearchOptions = {}): SearchHit[] {
  const { limit = 6, kinds } = options;
  const weights = expandQuery(query);
  const queryTerms = Array.from(weights.keys());
  const pool = kinds?.length ? chunks.filter((c) => kinds.includes(c.kind)) : chunks;
  if (!queryTerms.length || !pool.length) return [];

  const docs = pool.map((chunk) => ({ chunk, tokens: tokenize(chunk.text), titleTokens: new Set(tokenize(chunk.title)) }));
  const avgLen = docs.reduce((sum, d) => sum + d.tokens.length, 0) / docs.length || 1;

  // Document frequency per query term.
  const df = new Map<string, number>();
  for (const term of queryTerms) {
    df.set(term, docs.reduce((n, d) => n + (d.tokens.includes(term) ? 1 : 0), 0));
  }

  const hits: SearchHit[] = [];
  for (const d of docs) {
    const tf = new Map<string, number>();
    for (const t of d.tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

    let score = 0;
    for (const term of queryTerms) {
      const freq = tf.get(term) ?? 0;
      if (!freq) continue;
      const n = df.get(term) ?? 0;
      const idf = Math.log(1 + (docs.length - n + 0.5) / (n + 0.5));
      const weight = weights.get(term) ?? 1;
      score += weight * idf * ((freq * (K1 + 1)) / (freq + K1 * (1 - B + B * (d.tokens.length / avgLen))));
      if (d.titleTokens.has(term)) score += weight * idf * 0.5;
    }
    if (score > 0) hits.push({ chunk: d.chunk, score });
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
