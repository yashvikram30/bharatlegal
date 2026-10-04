import type { ItemKind } from "./retrieval";

/**
 * Short, stable tags the assistant uses to cite a record, e.g. [doc-02ee1].
 *
 * Models copy short tags reliably but mangle 24-character ids. A tag is derived from the record's
 * id, so the page can turn it back into a link using the matter data it already has, with no
 * lookup table to store or keep in sync.
 */
export type CitableKind = Exclude<ItemKind, "matter">;

const PREFIX: Record<CitableKind, string> = { chat: "chat", document: "doc", draft: "draft", case: "case" };
const KIND_BY_PREFIX: Record<string, CitableKind> = { chat: "chat", doc: "document", draft: "draft", case: "case" };

export const itemTag = (kind: CitableKind, id: string) => `${PREFIX[kind]}-${id.slice(-5)}`;

/** Matches a tag in square brackets (or the 【】 brackets some models substitute). */
export const TAG_PATTERN = /[\[【]((?:chat|doc|draft|case)-[0-9a-f]{5})[\]】]/gi;

export function parseTag(tag: string): { kind: CitableKind; suffix: string } | null {
  const m = tag.toLowerCase().match(/^(chat|doc|draft|case)-([0-9a-f]{5})$/);
  return m ? { kind: KIND_BY_PREFIX[m[1]], suffix: m[2] } : null;
}

/**
 * Rewrites the tags in an answer as markdown links to the records, using `resolve` to find a
 * record by kind and id suffix. Unknown tags are removed so no raw tag is ever shown to the user.
 */
export function linkifyTags(
  text: string,
  resolve: (kind: CitableKind, suffix: string) => { id: string; title: string } | undefined
): string {
  return text
    .replace(TAG_PATTERN, (_, tag: string) => {
      const parsed = parseTag(tag);
      const record = parsed && resolve(parsed.kind, parsed.suffix);
      if (!parsed || !record) return "";
      const safeTitle = record.title.replace(/[\[\]]/g, "");
      return `[${safeTitle}](#item:${parsed.kind}:${record.id})`;
    })
    .replace(/【[^】]*】/g, "") // any other bracketed leftovers
    .replace(/[ \t]+([.,;:])/g, "$1");
}
