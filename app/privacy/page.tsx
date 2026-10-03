import { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, Lock, EyeOff, Server, FileText } from "lucide-react";
import { PageHeader, PageShell } from "@/components/page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how BharatLegal handles document processing, account history, and privacy controls.",
};

export default function PrivacyPage() {
  const sections = [
    {
      icon: EyeOff,
      title: "1. Document Processing & Saved History",
      content:
        "When you upload documents (PDF, Word, or plain text) to the Document Simplifier, the text is processed to generate your summary and risk analysis. Raw uploaded files are not retained. If you are signed in, we save the generated analysis and extracted document text to your account so you can access your document history; guests do not receive saved document history.",
    },
    {
      icon: Lock,
      title: "2. AI & Large Language Model Privacy",
      content:
        "Our AI processing queries are routed via enterprise inference endpoints with strict zero-data-retention agreements. Your document contents, prompts, and queries are not used to train or fine-tune public foundation models.",
    },
    {
      icon: Server,
      title: "3. Account & Case Tracker Information",
      content:
        "For registered users, we store your account credentials (passwords are securely hashed using bcrypt), profile details, and any case metadata or notes you explicitly choose to save in the Case Tracker. You retain full control to edit or delete your saved cases at any time.",
    },
    {
      icon: ShieldCheck,
      title: "4. Cookies & Session Management",
      content:
        "We utilize secure HTTP-only cookies strictly for authentication session tokens via NextAuth. We do not sell, rent, or trade your personal information to third-party advertisers or data brokers.",
    },
    {
      icon: FileText,
      title: "5. Data Retention & Deletion",
      content:
        "You can request complete account and data deletion at any time by contacting us through our Contact page. Once requested, all associated case records and account details are permanently purged from our database.",
    },
  ];

  return (
    <PageShell>
      <PageHeader
        title="Privacy policy"
        description="Last updated September 2026. Legal matters and documents are sensitive, so this page explains plainly what we do with your data."
      />

      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="bg-card border border-border rounded-2xl p-6 sm:p-7 space-y-2.5"
            >
              <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-3">
                <Icon className="w-5 h-5 text-forest-800 dark:text-gold-500 shrink-0" />
                {section.title}
              </h2>
              <p className="max-w-3xl text-sm sm:text-base text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-forest-100 dark:bg-forest-900/60 border border-forest-500/20 rounded-2xl text-sm text-muted-foreground space-y-1.5">
        <h2 className="font-display text-xl font-semibold text-foreground">Questions about your data?</h2>
        <p>
          Write to us through the{" "}
          <Link href="/contact" className="font-semibold text-forest-800 underline underline-offset-2 dark:text-gold-400">
            contact page
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
