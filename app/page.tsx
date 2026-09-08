"use client";

import { motion } from "framer-motion";
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
  BookOpen,
  Sparkles,
  ExternalLink,
  Gavel,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const coreFeatures = [
    {
      icon: MessageSquare,
      title: "AI Legal Assistant",
      tag: "Statutory Grounded",
      description:
        "Ask questions in plain English or Hindi. Get instant statutory explanations grounded in Bharatiya Nyaya Sanhita (BNS) and CrPC with section citations.",
      link: "/chat",
      cta: "Ask Assistant",
    },
    {
      icon: FileText,
      title: "Document Simplifier",
      tag: "Zero-Retention",
      description:
        "Upload complex tenancy agreements, employment contracts, or notices. Extract key obligations, identify risky clauses, and read plain-language summaries.",
      link: "/simplify",
      cta: "Simplify Document",
    },
    {
      icon: CalendarCheck,
      title: "Case Tracker",
      tag: "Live Timelines",
      description:
        "Keep track of ongoing disputes, next hearing dates, court stages, and historical milestones in a unified personal dashboard.",
      link: "/dashboard",
      cta: "Open Tracker",
    },
    {
      icon: Compass,
      title: "Rights Visualizer",
      tag: "Interactive Guide",
      description:
        "Explore your constitutional and statutory rights across Arrest & Detention, Property & Tenancy, Consumer Disputes, and Workplace scenarios.",
      link: "/rights",
      cta: "Explore Rights",
    },
    {
      icon: Building2,
      title: "Find Legal Aid (DLSA)",
      tag: "Government Services",
      description:
        "Connect with District and State Legal Services Authorities across India offering free legal aid under the Legal Services Authorities Act, 1987.",
      link: "/help",
      cta: "Find Directory",
    },
  ];

  const statutoryBadges = [
    "⚖ Bharatiya Nyaya Sanhita (BNS)",
    "📜 Bharatiya Nagarik Suraksha Sanhita (BNSS)",
    "🛡 Consumer Protection Act, 2019",
    "🏢 Real Estate (RERA) Act",
    "📋 Right to Information (RTI) Act",
    "🏛 NALSA Legal Aid Guidelines",
  ];

  const stats = [
    { number: "500+", label: "Statutory Sections & Acts Indexed" },
    { number: "100%", label: "Free Public Legal Aid Mapping" },
    { number: "0s", label: "Raw Document Storage Retention" },
    { number: "24/7", label: "Accessible Legal Guidance" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-border">
        {/* Subtle Background Radial Glow */}
        <div className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            {/* Top Tag */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20"
            >
              <Scale className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Democratizing Legal Awareness for 1.4 Billion Indians</span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground font-heading leading-[1.15]"
            >
              Demystifying Indian Law with Plain Language & AI
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Understand your rights, decode complex legal contracts, track court timelines, and connect with free legal aid mechanisms across India.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap justify-center gap-3 pt-4"
            >
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-6 shadow-sm"
              >
                <Link href="/chat" className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Ask AI Legal Assistant
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-border">
                <Link href="/simplify">Simplify a Contract</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
                <Link href="/rights">Know Your Rights</Link>
              </Button>
            </motion.div>

            {/* Coverage Badges */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-8"
            >
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Grounded in Authentic Indian Jurisprudence
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                {statutoryBadges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-block text-xs font-medium px-3 py-1 rounded-md bg-muted text-muted-foreground border border-border"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="py-8 bg-muted/40 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
                  {stat.number}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-14 max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold text-foreground font-heading">
              A Complete Legal Empowerment Suite
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Engineered specifically for Indian citizens, consumers, tenants, and small businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {coreFeatures.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between hover:border-amber-500/40 hover:shadow-md transition-all group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                        {feature.tag}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground font-heading mb-1.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-border/60 mt-6">
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-between px-2 text-sm font-semibold text-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:bg-transparent"
                    >
                      <Link href={feature.link}>
                        <span>{feature.cta}</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Narrative Section (Replacing Stock Testimonials) */}
      <section className="py-16 sm:py-20 bg-muted/30 border-t border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-foreground border border-primary/20">
                <Gavel className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>The Story & Architecture</span>
              </div>
              <h2 className="text-3xl font-extrabold text-foreground font-heading">
                Why We Built LegalEase
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Over 45 million court cases are currently pending in India. Millions of everyday citizens sign binding lease deeds, employment bonds, and loan agreements without understanding the fine print.
              </p>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
                Most legal AI platforms are trained on foreign US/UK laws. LegalEase was engineered specifically to decode the Indian justice system — bridging the divide between statutory terminology and common citizens.
              </p>
              <div className="pt-2">
                <Button asChild variant="outline" className="border-border">
                  <Link href="/about" className="flex items-center gap-2">
                    Read Our Full Story <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5 bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-foreground font-heading flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Our Core Commitments
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span><strong>Statutory Accuracy:</strong> Every AI response highlights statutory sections and relevant acts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span><strong>Zero Document Retention:</strong> Uploaded contracts are analyzed in-memory and never used for public training.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <span><strong>Advocate Collaboration:</strong> We empower citizens to consult lawyers effectively, rather than replacing legal counsel.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Action Banner */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center bg-card border border-border rounded-2xl p-8 sm:p-12 shadow-sm space-y-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading">
              Ready to Navigate Indian Law with Confidence?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Try the AI assistant, review your fundamental rights, or explore free legal aid clinics across your state today.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/chat">Start Free Consultation</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/help">Find Free Legal Aid</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
