"use client";

import type { ReactNode } from "react";
import { ChevronDown, Clock3, FileText } from "lucide-react";
import type { ParsedAnswer } from "@/lib/legal-action-plan";

/**
 * A chat answer, laid out by importance: the short answer first, then what to do, then any
 * deadline and records, and finally the supporting sections (the law, court decisions, ...)
 * collapsed so they are there when wanted but never in the way.
 */
export function AnswerView({
  parsed,
  renderBlock,
  renderInline,
}: {
  parsed: ParsedAnswer;
  /** Full markdown (tables, lists, quotes) with citation buttons. */
  renderBlock: (markdown: string) => ReactNode;
  /** Markdown for one line of text, without paragraph wrapping. */
  renderInline: (markdown: string) => ReactNode;
}) {
  const { summary, steps, deadline, records, sections } = parsed;
  const hasSteps = steps.length > 0;

  return (
    <div className="space-y-5">
      {summary && (
        <div className="rounded-2xl border border-forest-500/25 bg-forest-50/80 p-4 text-base leading-relaxed text-foreground dark:border-gold-500/30 dark:bg-forest-900/50 sm:p-5 sm:text-lg [&_p]:mb-0 [&_p]:!text-base sm:[&_p]:!text-lg">
          {renderBlock(summary)}
        </div>
      )}

      {hasSteps && (
        <section aria-label="What to do next" className="space-y-3">
          <h2 className="font-display text-lg font-semibold text-foreground">What to do next</h2>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={index} className="flex items-start gap-3 text-sm leading-relaxed text-foreground sm:text-base">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-forest-800 text-xs font-bold text-white dark:bg-gold-500 dark:text-forest-950">
                  {index + 1}
                </span>
                <span>{renderInline(step)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {deadline && (
        <div className="flex items-start gap-3 rounded-2xl border border-gold-500/40 bg-gold-100/60 p-4 dark:bg-gold-500/10">
          <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-gold-700 dark:text-gold-400" aria-hidden="true" />
          <div className="min-w-0 text-sm leading-relaxed text-foreground sm:text-base">
            <p className="font-semibold">Deadlines</p>
            <div className="mt-0.5 [&_p]:mb-0">{renderBlock(deadline)}</div>
          </div>
        </div>
      )}

      {records.length > 0 && (
        <div className="flex items-start gap-3 text-sm sm:text-base">
          <FileText className="mt-0.5 h-5 w-5 shrink-0 text-forest-700 dark:text-gold-400" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-semibold text-foreground">Keep these records</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-foreground/85 marker:text-gold-600 dark:marker:text-gold-400">
              {records.map((record, index) => (
                <li key={index}>{renderInline(record)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {sections.length > 0 && (
        <div className="space-y-2 pt-1">
          {sections.map((section, index) => {
            // With next steps present the extras are supporting detail, so they start collapsed.
            // Without steps (a general question) the sections are the answer, so they start open.
            const startOpen = !hasSteps || /one thing to confirm/i.test(section.heading);
            return (
              <details
                key={`${index}-${section.heading}`}
                open={startOpen}
                className="group rounded-2xl border border-border bg-card/60 open:bg-card"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-4 py-3 font-display text-base font-semibold text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 [&::-webkit-details-marker]:hidden">
                  {section.heading}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="space-y-3 px-4 pb-4 text-sm leading-relaxed sm:text-base">{renderBlock(section.body)}</div>
              </details>
            );
          })}
        </div>
      )}

      {hasSteps && (
        <p className="border-t border-border/50 pt-3 text-sm text-muted-foreground">
          General information, not legal advice. Rules can differ by state, so check with an enrolled advocate or free legal aid before you file anything.
        </p>
      )}
    </div>
  );
}
