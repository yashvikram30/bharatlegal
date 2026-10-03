"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarClock,
  FileSignature,
  FileText,
  Loader2,
  Scale,
  ShieldAlert,
} from "lucide-react";

type Issue = {
  id: string;
  label: string;
  hint: string;
  prompt: string;
  icon: typeof Scale;
};

const issues: Issue[] = [
  {
    id: "notice",
    label: "I got a legal notice",
    hint: "From a court, lawyer, bank, or landlord",
    prompt: "I received a legal notice or concerning legal message. Help me understand what it means, what evidence to preserve, and the safest next steps.",
    icon: FileText,
  },
  {
    id: "police",
    label: "Police contacted me",
    hint: "A call, summons, or station visit",
    prompt: "Police contacted, stopped, or asked me to attend the station. Explain my immediate rights, what to say, what to avoid, and when to seek urgent help.",
    icon: ShieldAlert,
  },
  {
    id: "dispute",
    label: "I’m in a dispute",
    hint: "With a landlord, employer, or seller",
    prompt: "I have a dispute with a landlord, employer, merchant, or service provider. Help me identify my position, preserve evidence, and plan safe next steps.",
    icon: Scale,
  },
  {
    id: "contract",
    label: "I need to review a contract",
    hint: "Before you sign or renew",
    prompt: "I need to understand a contract before signing. Tell me the key risks to check, records to keep, and the right questions to ask before I agree.",
    icon: FileSignature,
  },
  {
    id: "hearing",
    label: "I have a court hearing",
    hint: "Get a checklist to prepare",
    prompt: "I have a court case or hearing. Help me prepare a plain-language checklist of what to confirm, preserve, and discuss with my advocate before the hearing.",
    icon: CalendarClock,
  },
  {
    id: "aid",
    label: "I need free legal help",
    hint: "Find an official legal-aid office",
    prompt: "I need free or affordable legal help in India. Help me understand possible eligibility, what to keep ready, and how to find an appropriate official legal-aid service.",
    icon: Building2,
  },
];

export function IssueIntake() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const stepTwoHeading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    router.prefetch("/chat");
  }, [router]);

  // Move focus to the new question so keyboard and screen-reader users land on it.
  useEffect(() => {
    if (selectedIssue) stepTwoHeading.current?.focus();
  }, [selectedIssue]);

  const continueToPlan = (urgent: boolean) => {
    if (!selectedIssue || isOpening) return;
    setIsOpening(true);
    const urgency = urgent
      ? " This may be urgent or time-sensitive; put immediate safety, deadlines, and official escalation routes first."
      : " This is not an immediate emergency, but identify any deadlines I should check.";
    router.push(`/chat?q=${encodeURIComponent(selectedIssue.prompt + urgency)}&autostart=1`);
  };

  const slide = reduce
    ? { initial: false as const, exit: { opacity: 0 } }
    : { initial: { opacity: 0, x: 12 }, exit: { opacity: 0, x: -12 } };

  return (
    <section id="choose-your-situation" aria-labelledby="issue-intake-heading" className="scroll-mt-24 text-left">
      <div className="rounded-2xl border border-gold-400/30 bg-forest-50 p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] dark:bg-forest-900 sm:p-6">
        <AnimatePresence mode="wait" initial={false}>
          {!selectedIssue ? (
            <motion.div
              key="pick"
              {...slide}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <h2 id="issue-intake-heading" className="font-display text-xl font-semibold text-foreground sm:text-2xl">
                What’s going on?
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Pick the closest match. You’ll get a plan for your situation in a few seconds.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {issues.map((issue) => {
                  const Icon = issue.icon;
                  return (
                    <button
                      key={issue.id}
                      type="button"
                      onClick={() => setSelectedIssue(issue)}
                      className="group flex items-start gap-3 rounded-xl border border-border bg-background p-3.5 text-left transition-all duration-150 hover:-translate-y-px hover:border-gold-500/60 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 motion-reduce:transition-colors motion-reduce:hover:translate-y-0 dark:hover:bg-forest-800/60"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-100 text-forest-800 transition-colors group-hover:bg-forest-800 group-hover:text-gold-300 dark:bg-forest-800 dark:text-gold-400 dark:group-hover:bg-gold-500 dark:group-hover:text-forest-950">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-snug text-foreground">{issue.label}</span>
                        <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">{issue.hint}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="urgency"
              {...slide}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedIssue(null)}
                  disabled={isOpening}
                  className="inline-flex items-center gap-1.5 rounded-md py-1 pr-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:pointer-events-none disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Change situation
                </button>
                <span className="text-xs text-muted-foreground">Step 2 of 2</span>
              </div>

              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-forest-100 px-3 py-1 text-xs font-semibold text-forest-800 dark:bg-forest-800 dark:text-gold-300">
                  <selectedIssue.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {selectedIssue.label}
                </p>
                <h2
                  id="issue-intake-heading"
                  ref={stepTwoHeading}
                  tabIndex={-1}
                  className="mt-3 font-display text-xl font-semibold leading-snug text-foreground outline-none sm:text-2xl"
                >
                  Is there a deadline or safety concern right now?
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  For example: a hearing today, detention, threats, eviction, or a deadline in the next few days.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => continueToPlan(true)}
                  disabled={isOpening}
                  className="flex items-center gap-2.5 rounded-xl border border-amber-500/50 bg-amber-50 px-4 py-3.5 text-left text-sm font-semibold text-amber-950 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 disabled:pointer-events-none disabled:opacity-60 dark:bg-amber-500/10 dark:text-amber-100 dark:hover:bg-amber-500/20"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Yes, I need urgent guidance
                </button>
                <button
                  type="button"
                  onClick={() => continueToPlan(false)}
                  disabled={isOpening}
                  className="flex items-center justify-between gap-2.5 rounded-xl border border-border bg-background px-4 py-3.5 text-left text-sm font-semibold text-foreground transition-colors hover:border-gold-500/60 hover:bg-forest-100/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 disabled:pointer-events-none disabled:opacity-60 dark:hover:bg-forest-800/60"
                >
                  No, help me plan
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
              </div>

              <div role="status" aria-live="polite" className="min-h-5 text-sm text-muted-foreground">
                {isOpening && (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Opening your action plan…
                  </span>
                )}
              </div>

              <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
                In immediate danger, call{" "}
                <a href="tel:112" className="font-semibold text-foreground underline underline-offset-2">
                  112
                </a>
                . For free legal aid, the NALSA helpline is{" "}
                <a href="tel:15100" className="font-semibold text-foreground underline underline-offset-2">
                  15100
                </a>
                .
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="mt-3 px-1 text-xs leading-relaxed text-forest-100/65">
        BharatLegal provides legal information, not legal representation. For immediate danger, contact local emergency services.
      </p>
    </section>
  );
}
