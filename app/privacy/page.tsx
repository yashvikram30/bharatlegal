import { Metadata } from "next";
import { ShieldCheck, Lock, EyeOff, Server, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — BharatLegal",
  description:
    "Learn about how BharatLegal handles your data, ensures ephemeral document processing, and maintains privacy compliance.",
};

export default function PrivacyPage() {
  const sections = [
    {
      icon: EyeOff,
      title: "1. Ephemeral Document Processing",
      content:
        "When you upload documents (PDF, Word, or plain text) to the Document Simplifier, the text is processed in-memory solely for the purpose of generating your summary and risk analysis. We do not permanently store your raw uploaded documents on our servers unless you explicitly save a case or document summary to your authenticated dashboard.",
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
        "You can request complete account and data deletion at any time by contacting us through our Contact page or via your user profile settings. Once requested, all associated case records and account details are permanently purged from our database.",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 border border-forest-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Your Privacy Matters</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-heading">
          Privacy Policy
        </h1>
        <p className="text-xs text-muted-foreground">
          Last Updated: September 2026 • Effective Immediately
        </p>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          At BharatLegal, we understand that legal matters and documents involve sensitive personal and commercial information. We are committed to maintaining the highest standards of data security, transparency, and user privacy.
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="bg-card border border-border rounded-xl p-6 sm:p-7 shadow-rest-card space-y-2.5"
            >
              <h2 className="text-lg font-bold text-foreground font-heading flex items-center gap-3">
                <Icon className="w-5 h-5 text-forest-800 dark:text-gold-500 shrink-0" />
                {section.title}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </div>
          );
        })}
      </div>

      <div className="p-6 bg-forest-100 dark:bg-forest-900/60 border border-forest-500/20 rounded-xl text-xs text-muted-foreground space-y-1.5">
        <p className="font-semibold text-foreground">Questions or Concerns?</p>
        <p>
          If you have any questions regarding this Privacy Policy or how your data is handled, please reach out via our contact page.
        </p>
      </div>
    </div>
  );
}
