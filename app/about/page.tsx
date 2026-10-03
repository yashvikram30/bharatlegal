import { Metadata } from "next";
import Link from "next/link";
import { Scale, BookOpen, ShieldCheck, HeartHandshake, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, PageShell, SectionHeading } from "@/components/page";

export const metadata: Metadata = {
  title: "About Us: Demystifying Indian Law",
  description:
    "Learn why BharatLegal was built, our mission to bridge India's legal literacy divide, and how we ground AI in statutory Indian frameworks like BNS and CrPC.",
};

export default function AboutPage() {
  const pillars = [
    {
      icon: Scale,
      title: "Statutory Grounding",
      description:
        "Legal guidance grounded in authentic Indian statutes, including Bharatiya Nyaya Sanhita (BNS), CrPC/BNSS, Consumer Protection Act, and RTI Act.",
    },
    {
      icon: BookOpen,
      title: "Plain Language Translation",
      description:
        "Converting convoluted legalese into clear, actionable Hindi & English explanations that any citizen can understand.",
    },
    {
      icon: ShieldCheck,
      title: "Ethical & Responsible AI",
      description:
        "Clear boundaries and source citations. BharatLegal serves as an informational companion, bridging the gap before formal advocate consultation.",
    },
    {
      icon: HeartHandshake,
      title: "Accessible to All",
      description:
        "Free access to basic rights information, case tracking, and legal aid directory to empower underprivileged citizens across India.",
    },
  ];

  const milestones = [
    {
      step: "01",
      title: "The Legal Literacy Gap",
      description:
        "In India, over 45 million cases are pending across courts. Millions of citizens sign agreements or face disputes without understanding their fundamental rights.",
    },
    {
      step: "02",
      title: "AI with Indian Context",
      description:
        "Most global legal AI models are trained on US/UK common law. BharatLegal was engineered specifically for Indian jurisprudence, terminology, and court structures.",
    },
    {
      step: "03",
      title: "Empowerment, Not Replacement",
      description:
        "We do not replace advocates. We empower citizens to understand their situation, organize their facts, and have more effective consultations with legal counsel.",
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Demystifying the Indian justice system"
        description="BharatLegal exists so that knowing your legal rights in India is not an expensive privilege. We use AI to make the law accessible, transparent, and actionable."
      />

      {/* Story / Problem Section */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-4">
        <SectionHeading title="Why we built BharatLegal" />
        <div className="space-y-3.5 text-muted-foreground text-sm sm:text-base leading-relaxed">
          <p>
            The Indian legal system is one of the most comprehensive frameworks in the world, yet the vast majority of citizens feel alienated by its complex vocabulary, multi-tier court procedures, and statutory density.
          </p>
          <p>
            Whether it is an individual trying to recover an unfairly withheld security deposit, a consumer fighting an e-commerce refund refusal, or an employee questioning an unreasonable non-compete covenant, people frequently face confusion and delay.
          </p>
          <p>
            BharatLegal addresses this gap by transforming dense legal jargon into plain-language summaries, providing scenario-based rights visualizations, enabling real-time case tracking, and connecting people with free legal aid mechanisms (DLSA / SLSA) across the country.
          </p>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="space-y-6">
        <SectionHeading title="What we stand for" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-card border border-border rounded-2xl p-6 hover:border-forest-500 hover:shadow-hover-card transition-all"
              >
                <div className="w-11 h-11 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground mb-1.5 font-heading">
                  {pillar.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture & Approach */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 space-y-6">
        <SectionHeading title="Our approach" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {milestones.map((item) => (
            <div key={item.step} className="space-y-2">
              <span className="text-3xl font-extrabold text-forest-500/40 dark:text-forest-500 font-heading">
                {item.step}
              </span>
              <h3 className="text-base font-bold text-foreground font-heading">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-forest-100 dark:bg-forest-900/60 border border-forest-500/20 rounded-2xl p-8 sm:p-10 space-y-4">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Try it on your own situation
        </h2>
        <p className="text-sm text-muted-foreground max-w-lg">
          Ask the chatbot a question, review your rights, or check a contract for risky clauses.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Button
            asChild
            className="bg-forest-800 text-white hover:bg-forest-950 dark:bg-gold-500 dark:text-forest-950 dark:hover:bg-gold-500/90 font-medium focus-visible:ring-2 focus-visible:ring-gold-700"
          >
            <Link href="/chat" className="flex items-center gap-2">
              Ask the chatbot <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-forest-800 text-forest-800 hover:bg-forest-50 dark:border-forest-100 dark:text-forest-100 dark:hover:bg-forest-800"
          >
            <Link href="/rights">Know your rights</Link>
          </Button>
        </div>
      </div>
    </PageShell>
  );
}
