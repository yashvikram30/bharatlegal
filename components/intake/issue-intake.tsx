"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight, Building2, FileText, Gavel, Scale, ShieldAlert } from "lucide-react";

type Issue = {
  id: string;
  label: string;
  prompt: string;
  icon: typeof Scale;
};

const issues: Issue[] = [
  {
    id: "notice",
    label: "I received a notice",
    prompt: "I received a legal notice or concerning legal message. Help me understand what it means, what evidence to preserve, and the safest next steps.",
    icon: FileText,
  },
  {
    id: "police",
    label: "Police contacted me",
    prompt: "Police contacted, stopped, or asked me to attend the station. Explain my immediate rights, what to say, what to avoid, and when to seek urgent help.",
    icon: ShieldAlert,
  },
  {
    id: "dispute",
    label: "Someone is refusing something",
    prompt: "I have a dispute with a landlord, employer, merchant, or service provider. Help me identify my position, preserve evidence, and plan safe next steps.",
    icon: Scale,
  },
  {
    id: "contract",
    label: "I need to review a contract",
    prompt: "I need to understand a contract before signing. Tell me the key risks to check, records to keep, and the right questions to ask before I agree.",
    icon: FileText,
  },
  {
    id: "hearing",
    label: "I have a court hearing",
    prompt: "I have a court case or hearing. Help me prepare a plain-language checklist of what to confirm, preserve, and discuss with my advocate before the hearing.",
    icon: Gavel,
  },
  {
    id: "aid",
    label: "I need free legal help",
    prompt: "I need free or affordable legal help in India. Help me understand possible eligibility, what to keep ready, and how to find an appropriate official legal-aid service.",
    icon: Building2,
  },
];

export function IssueIntake() {
  const router = useRouter();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isUrgent, setIsUrgent] = useState<boolean | null>(null);
  const [showAllIssues, setShowAllIssues] = useState(false);
  const visibleIssues = showAllIssues ? issues : issues.slice(0, 4);

  const continueToPlan = (urgent: boolean) => {
    if (!selectedIssue) return;
    const urgency = urgent
      ? " This may be urgent or time-sensitive; put immediate safety, deadlines, and official escalation routes first."
      : " This is not an immediate emergency, but identify any deadlines I should check.";
    router.push(`/chat?q=${encodeURIComponent(selectedIssue.prompt + urgency)}&autostart=1`);
  };

  return (
    <section id="choose-your-situation" aria-labelledby="issue-intake-heading" className="text-left scroll-mt-24">
      <div className="rounded-2xl border border-forest-500/25 bg-card p-4 shadow-xl dark:bg-forest-900/75 sm:p-5">
        {!selectedIssue ? (
          <>
            <div className="flex items-start gap-3 px-1 pb-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest-800 text-gold-400 dark:bg-gold-500 dark:text-forest-950">
                <Scale className="h-4 w-4" />
              </div>
              <div>
                <h2 id="issue-intake-heading" className="font-heading text-base font-bold text-foreground sm:text-lg">
                  Choose your situation
                </h2>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Takes about 30 seconds. We’ll guide you to a clear next step.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {visibleIssues.map((issue) => {
                const Icon = issue.icon;
                return (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => setSelectedIssue(issue)}
                    className="group flex min-h-12 items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-left text-xs font-semibold text-foreground transition-colors hover:border-gold-500/60 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 dark:hover:bg-forest-800/60 sm:text-sm"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-forest-700 transition-transform group-hover:scale-110 dark:text-gold-400" />
                    <span className="flex-1">{issue.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                );
              })}
            </div>
            {!showAllIssues && (
              <button
                type="button"
                onClick={() => setShowAllIssues(true)}
                className="mt-3 w-full rounded-lg py-1.5 text-xs font-semibold text-forest-700 transition-colors hover:bg-forest-100 hover:text-forest-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 dark:text-gold-400 dark:hover:bg-forest-800 dark:hover:text-gold-200"
              >
                I have a hearing or need legal aid
              </button>
            )}
          </>
        ) : (
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setSelectedIssue(null);
                setIsUrgent(null);
              }}
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              Change situation
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-forest-700 dark:text-gold-400">{selectedIssue.label}</p>
              <h2 className="mt-1 font-heading text-lg font-bold text-foreground">Is there an immediate deadline or safety concern?</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">For example: a hearing today, detention, threats, eviction, or a deadline in the next few days.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setIsUrgent(true);
                  continueToPlan(true);
                }}
                className="flex items-center gap-2 rounded-xl border border-amber-500/45 bg-amber-50 px-3 py-3 text-left text-sm font-semibold text-amber-950 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-amber-500/10 dark:text-amber-100 dark:hover:bg-amber-500/20"
              >
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Yes, I need urgent guidance
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsUrgent(false);
                  continueToPlan(false);
                }}
                className="rounded-xl border border-border bg-background px-3 py-3 text-left text-sm font-semibold text-foreground transition-colors hover:border-gold-500/60 hover:bg-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 dark:hover:bg-forest-800/60"
              >
                No, help me plan my next step
              </button>
            </div>
            {isUrgent !== null && <span className="sr-only">Opening your action plan</span>}
          </div>
        )}
      </div>
      <p className="mt-2 px-1 text-[10px] leading-relaxed text-forest-800/70 dark:text-forest-100/60">
        BharatLegal provides legal information, not legal representation. For immediate danger, contact local emergency services.
      </p>
    </section>
  );
}
