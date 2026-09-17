"use client";

import { CheckCircle2, Clock3, FileText, ListChecks } from "lucide-react";
import type { LegalActionPlan } from "@/lib/legal-action-plan";

export function ActionPlanCard({ plan }: { plan: LegalActionPlan }) {
  return (
    <aside className="rounded-2xl border border-forest-500/30 dark:border-gold-500/35 bg-forest-50/80 dark:bg-forest-900/50 overflow-hidden shadow-2xs">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-forest-500/20 dark:border-gold-500/20 bg-forest-100/70 dark:bg-forest-900/80">
        <div className="w-7 h-7 rounded-lg bg-forest-800 dark:bg-gold-500 text-white dark:text-forest-950 flex items-center justify-center shrink-0">
          <ListChecks className="w-4 h-4" />
        </div>
        <div>
          <p className="text-xs font-bold text-foreground font-heading">Your next steps</p>
          <p className="text-[10px] text-muted-foreground">A practical starting point based on your question</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {plan.summary && <p className="text-xs sm:text-sm text-foreground leading-relaxed">{plan.summary}</p>}

        <ol className="space-y-2.5">
          {plan.nextSteps.map((step, index) => (
            <li key={`${index}-${step}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-foreground leading-relaxed">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-800 text-[10px] font-bold text-white dark:bg-gold-500 dark:text-forest-950">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>

        {plan.timeSensitivity && (
          <div className="flex items-start gap-2.5 rounded-xl border border-gold-500/30 bg-gold-100/60 dark:bg-gold-500/10 px-3 py-2.5">
            <Clock3 className="w-4 h-4 shrink-0 mt-0.5 text-gold-700 dark:text-gold-400" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-gold-800 dark:text-gold-300">Time sensitivity</p>
              <p className="text-xs text-foreground mt-0.5 leading-relaxed">{plan.timeSensitivity}</p>
            </div>
          </div>
        )}

        {plan.recordsToKeep.length > 0 && (
          <div className="flex items-start gap-2.5 text-xs sm:text-sm">
            <FileText className="w-4 h-4 shrink-0 mt-0.5 text-forest-700 dark:text-gold-400" />
            <div>
              <p className="font-semibold text-foreground">Keep these records</p>
              <p className="text-muted-foreground leading-relaxed">{plan.recordsToKeep.join(" · ")}</p>
            </div>
          </div>
        )}

        <p className="flex items-start gap-1.5 text-[10px] text-muted-foreground leading-relaxed border-t border-border/50 pt-3">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5 text-forest-700 dark:text-gold-400" />
          Check state-specific rules and seek an enrolled advocate for representation or filing advice.
        </p>
      </div>
    </aside>
  );
}
