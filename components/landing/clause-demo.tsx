"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

type Risk = "High" | "Medium";

type Clause = {
  id: string;
  text: string;
  risk: Risk;
  plain: string;
  law: string;
};

const clauses: Clause[] = [
  {
    id: "deposit",
    text: "The Lessee shall pay a security deposit of ₹1,20,000 (six months’ rent), refundable at the end of the tenancy.",
    risk: "High",
    plain: "You’re handing over six months of rent upfront, and getting it back depends on the landlord.",
    law: "The Model Tenancy Act, 2021 limits a residential security deposit to two months’ rent. Check whether your state has adopted it.",
  },
  {
    id: "terminate",
    text: "The Lessor may terminate this agreement at any time without notice.",
    risk: "High",
    plain: "Your landlord could ask you to leave overnight, while you are still tied to the lock-in.",
    law: "Rent laws across India generally expect written notice before a tenant is asked to vacate. Ask for a notice period in writing.",
  },
  {
    id: "latefee",
    text: "The Lessee shall pay a late fee of ₹500 per day on any delayed rent.",
    risk: "Medium",
    plain: "On ₹20,000 rent, being a week late costs ₹3,500 and a month late costs ₹15,000.",
    law: "Courts can reduce a penalty that is out of proportion to the loss. See Section 74, Indian Contract Act, 1872.",
  },
];

export function ClauseDemo() {
  const [activeId, setActiveId] = useState(clauses[0].id);
  const reduce = useReducedMotion();
  const active = clauses.find((c) => c.id === activeId) ?? clauses[0];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
      {/* The document */}
      <div className="rounded-xl border border-forest-200 bg-white p-6 shadow-[0_1px_0_rgba(15,43,32,0.04),0_18px_40px_-24px_rgba(15,43,32,0.35)] dark:border-forest-700/60 dark:bg-forest-900 sm:p-9">
        <p className="font-display text-sm font-semibold text-forest-950 dark:text-forest-50">
          Residential Lease Agreement
        </p>
        <p className="mt-1 text-xs text-forest-800/60 dark:text-forest-100/55">
          Sample document, rent ₹20,000 a month
        </p>
        <div className="mt-6 space-y-4 font-display text-[15px] leading-[1.75] text-forest-950/85 dark:text-forest-50/85 sm:text-base">
          {clauses.map((clause, i) => {
            const isActive = clause.id === activeId;
            return (
              <p key={clause.id} className="flex gap-3">
                <span className="mt-[3px] w-6 shrink-0 text-right text-sm text-forest-800/50 dark:text-forest-100/40">
                  {i + 4}.
                </span>
                <button
                  type="button"
                  onClick={() => setActiveId(clause.id)}
                  aria-pressed={isActive}
                  className={`rounded-sm px-1 py-0.5 text-left transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 ${
                    isActive
                      ? "bg-gold-200 text-forest-950 dark:bg-gold-500/30 dark:text-forest-50"
                      : "bg-gold-100/70 hover:bg-gold-200/80 dark:bg-gold-500/10 dark:hover:bg-gold-500/20"
                  }`}
                >
                  {clause.text}
                </button>
              </p>
            );
          })}
        </div>
      </div>

      {/* The plain-language note */}
      <div className="lg:sticky lg:top-24">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.id}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="rounded-xl border-l-4 border-gold-500 bg-forest-100 p-6 dark:bg-forest-800/70"
            aria-live="polite"
          >
            <p
              className={`inline-flex items-center gap-2 text-sm font-semibold ${
                active.risk === "High"
                  ? "text-red-800 dark:text-red-300"
                  : "text-amber-800 dark:text-amber-300"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  active.risk === "High" ? "bg-red-600 dark:bg-red-400" : "bg-amber-500"
                }`}
              />
              {active.risk} risk
            </p>
            <p className="mt-3 font-display text-xl font-semibold leading-snug text-forest-950 dark:text-forest-50">
              {active.plain}
            </p>
            <p className="mt-4 border-t border-forest-200 pt-4 text-sm leading-relaxed text-forest-800/85 dark:border-forest-700 dark:text-forest-100/80">
              {active.law}
            </p>
          </motion.div>
        </AnimatePresence>

        <Link
          href="/simplify"
          className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-forest-800 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 dark:text-gold-400"
        >
          Upload your own agreement
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
