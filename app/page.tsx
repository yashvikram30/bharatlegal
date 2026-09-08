"use client";

import Link from "next/link";
import {
  Scale,
  MessageSquare,
  FileText,
  CalendarCheck,
  Compass,
  Building2,
  ArrowRight,
  ShieldCheck,
  Gavel,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const coreFeatures = [
    {
      icon: MessageSquare,
      title: "AI Legal Chatbot",
      tag: "Statutory Grounded",
      description:
        "Ask legal questions in plain language. Receive explanations grounded in Bharatiya Nyaya Sanhita (BNS) and CrPC with precise section citations.",
      link: "/chat",
      cta: "Open Chatbot",
    },
    {
      icon: CalendarCheck,
      title: "Case Tracker",
      tag: "Live Milestones",
      description:
        "Centralize case stages, hearing reminders, court categories, and milestone notes in an organized citizen dashboard.",
      link: "/dashboard",
      cta: "Track Cases",
    },
    {
      icon: Compass,
      title: "Rights Visualizer",
      tag: "Scenario Guides",
      description:
        "Understand your statutory rights across Arrest & Detention, Property & Tenancy, Consumer Disputes, and Workplace scenarios.",
      link: "/rights",
      cta: "Explore Rights",
    },
    {
      icon: FileText,
      title: "Document Simplifier",
      tag: "Zero-Retention",
      description:
        "Upload tenancy agreements, employment contracts, or legal notices. Detect risky clauses and read plain-language obligation breakdowns.",
      link: "/simplify",
      cta: "Simplify Document",
    },
    {
      icon: Building2,
      title: "Find Legal Help",
      tag: "Government Services",
      description:
        "Access verified District and State Legal Services Authorities (DLSA / SLSA) offering free legal aid under the Legal Services Authorities Act, 1987.",
      link: "/help",
      cta: "Find Assistance",
    },
  ];

  const statutoryBadges = [
    "Bharatiya Nyaya Sanhita (BNS)",
    "Bharatiya Nagarik Suraksha Sanhita (BNSS)",
    "Consumer Protection Act, 2019",
    "Model Tenancy Act / Rent Control",
    "Right to Information (RTI) Act",
    "Legal Services Authorities Act, 1987",
  ];

  const stats = [
    { number: "500+", label: "Statutory Sections & Acts Indexed", isAccent: true },
    { number: "100%", label: "Free Public Legal Aid Mapping", isAccent: false },
    { number: "0s", label: "Raw Document Storage Retention", isAccent: false },
    { number: "24/7", label: "Accessible Citizen Guidance", isAccent: false },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-forest-50 dark:bg-forest-950 text-forest-950 dark:text-forest-50">
      {/* 1. HERO SECTION (forest-50 base / forest-950 dark) */}
      <section className="py-16 sm:py-24 border-b border-forest-100 dark:border-forest-900/60">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl text-center space-y-6">
          {/* Eyebrow badge (neutral forest tones) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-forest-100 text-forest-800 dark:bg-forest-800 dark:text-forest-100 border border-forest-500/20">
            <Scale className="w-3.5 h-3.5 text-forest-800 dark:text-forest-100" />
            <span>Democratizing Legal Literacy for 1.4 Billion Indians</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-forest-950 dark:text-forest-50 font-heading leading-[1.15]">
            Demystifying Indian Law with Plain Language & AI
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-forest-800/80 dark:text-forest-100/75 max-w-2xl mx-auto leading-relaxed">
            Understand your fundamental rights, decode complex contracts, track court timelines, and connect with free legal aid mechanisms across India.
          </p>

          {/* CTAs (Forest buttons in hero, preserving gold for the 2 designated moments) */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <Button
              asChild
              size="lg"
              className="bg-forest-800 text-white hover:bg-forest-900 hover:text-white dark:bg-forest-800 dark:text-forest-50 dark:hover:bg-forest-700 dark:hover:text-forest-50 font-semibold px-6 focus-visible:ring-2 focus-visible:ring-forest-800 shadow-sm"
            >
              <Link href="/chat" className="flex items-center gap-2">
                Ask Legal Assistant <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border border-forest-800 text-forest-800 bg-transparent hover:bg-forest-100 hover:text-forest-950 dark:border-forest-700 dark:text-forest-100 dark:hover:bg-forest-800 dark:hover:text-forest-50 focus-visible:ring-2 focus-visible:ring-forest-800 font-semibold px-6"
            >
              <Link href="/simplify">Simplify a Contract</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 2. TRUST / STAT BAR (Alternating Band 1: forest-100 light / forest-800 dark) */}
      {/* GOLD MOMENT 1: Stat-bar accent on the lead statistic */}
      <section className="py-8 bg-forest-100 dark:bg-forest-800 border-b border-forest-100 dark:border-forest-700/60">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-5xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p
                  className={`text-2xl sm:text-3xl font-extrabold font-heading ${
                    stat.isAccent
                      ? "text-gold-700 dark:text-gold-500"
                      : "text-forest-950 dark:text-forest-50"
                  }`}
                >
                  {stat.number}
                </p>
                <p className="text-xs sm:text-sm text-forest-800/80 dark:text-forest-100/75 font-medium">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CORE FEATURES GRID (forest-50 base / forest-950 dark; forest-800 elevated surfaces in dark) */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-forest-950 dark:text-forest-50 font-heading">
              A Complete Legal Empowerment Suite
            </h2>
            <p className="text-sm sm:text-base text-forest-800/80 dark:text-forest-100/75">
              Engineered specifically for Indian citizens, consumers, tenants, and small businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {coreFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`bg-card dark:bg-forest-800/80 border border-forest-100 dark:border-forest-700/50 rounded-xl p-6 flex flex-col justify-between hover:border-forest-500/50 dark:hover:border-forest-500/60 hover:shadow-hover-card transition-all duration-200 group ${
                    idx === 4 ? "md:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-forest-100 dark:bg-forest-950 text-forest-800 dark:text-forest-50 border border-transparent dark:border-forest-700/60 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-forest-100 dark:bg-forest-950 text-forest-800 dark:text-forest-50 border border-forest-500/20 dark:border-forest-700/60">
                        {feature.tag}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-forest-950 dark:text-forest-50 font-heading mb-1.5">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-forest-800/80 dark:text-forest-100/75 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-forest-100 dark:border-forest-700/50 mt-6">
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-between px-3 py-2 text-sm font-semibold text-forest-800 hover:bg-forest-100 hover:text-forest-950 dark:text-forest-100 dark:hover:bg-forest-900 dark:hover:text-forest-50 rounded-lg transition-colors"
                    >
                      <Link href={feature.link}>
                        <span>{feature.cta}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. MISSION SECTION (Dark anchor in light mode: forest-800 / elevated forest-800 surface in dark mode) */}
      <section className="py-16 sm:py-20 bg-forest-800 text-forest-50 dark:bg-forest-800/60 border-t border-b border-forest-900 dark:border-forest-700/60">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-forest-950 text-forest-100 border border-forest-700">
                <Gavel className="w-3.5 h-3.5 text-forest-100" />
                <span>The Story & Architecture</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white font-heading">
                Why We Built LegalEase
              </h2>
              <p className="text-forest-100/85 leading-relaxed text-sm sm:text-base">
                Over 45 million court cases are currently pending in India. Millions of everyday citizens sign binding lease deeds, employment bonds, and loan agreements without understanding the fine print.
              </p>
              <p className="text-forest-100/85 leading-relaxed text-sm sm:text-base">
                Most legal AI platforms are trained on foreign US/UK laws. LegalEase was engineered specifically to decode the Indian justice system — bridging the divide between statutory terminology and common citizens.
              </p>
              <div className="pt-2">
                <Button
                  asChild
                  variant="outline"
                  className="border border-forest-500/80 bg-transparent text-white hover:bg-forest-950 hover:text-white hover:border-forest-400 focus-visible:ring-2 focus-visible:ring-forest-500 font-medium"
                >
                  <Link href="/about" className="flex items-center gap-2">
                    Read Our Full Story <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Commitments Card (forest-950 surface on forest-800 band) */}
            <div className="lg:col-span-5 bg-forest-950 border border-forest-700/50 rounded-2xl p-6 sm:p-8 space-y-4">
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-forest-100" />
                Our Core Commitments
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-forest-100/85">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-100 mt-2 shrink-0" />
                  <span>
                    <strong className="text-white">Statutory Accuracy:</strong> Every AI response highlights statutory sections and relevant acts.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-100 mt-2 shrink-0" />
                  <span>
                    <strong className="text-white">Zero Document Retention:</strong> Uploaded contracts are analyzed in-memory and never stored.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-forest-100 mt-2 shrink-0" />
                  <span>
                    <strong className="text-white">Advocate Empowerment:</strong> We prepare citizens for informed consultations with legal counsel.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. STATUTES COVERAGE STRIP (Alternating Band 2: forest-100 light / forest-800 dark) */}
      <section className="py-12 bg-forest-100 dark:bg-forest-800 border-b border-forest-100 dark:border-forest-700/60">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl text-center space-y-4">
          <p className="text-xs font-semibold text-forest-800 dark:text-forest-100/80 uppercase tracking-wider">
            Grounded in Authentic Indian Jurisprudence
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {statutoryBadges.map((badge) => (
              <span
                key={badge}
                className="inline-block text-xs font-medium px-3.5 py-1.5 rounded-md bg-forest-50 dark:bg-forest-950 text-forest-950 dark:text-forest-50 border border-forest-500/20"
              >
                ⚖ {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FINAL CTA BAND (forest-50 base / forest-950 dark) */}
      {/* GOLD MOMENT 2: Final CTA button */}
      <section className="py-16 sm:py-20 bg-forest-50 dark:bg-forest-950">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-forest-950 dark:text-forest-50 font-heading">
              Ready to Navigate Indian Law with Confidence?
            </h2>
            <p className="text-sm sm:text-base text-forest-800/80 dark:text-forest-100/75 max-w-xl mx-auto">
              Try the AI chatbot, review your statutory rights, or find free legal aid clinics across your state today.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button
                asChild
                size="lg"
                className="bg-gold-500 text-forest-950 font-bold hover:bg-gold-500/90 hover:text-forest-950 shadow-sm focus-visible:ring-2 focus-visible:ring-gold-700 px-6"
              >
                <Link href="/chat">Start Free Consultation</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border border-forest-800 text-forest-800 bg-transparent hover:bg-forest-100 hover:text-forest-950 dark:border-forest-700 dark:text-forest-100 dark:hover:bg-forest-800 dark:hover:text-forest-50 font-semibold px-6"
              >
                <Link href="/help">Find Free Legal Aid</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
