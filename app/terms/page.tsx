import { Metadata } from "next";
import { AlertTriangle, Scale, CheckCircle2, ShieldAlert, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service & Legal Disclaimer — LegalEase",
  description:
    "Terms of service, usage conditions, and statutory educational disclaimers for the LegalEase platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 border border-forest-500/20">
          <Scale className="w-3.5 h-3.5" />
          <span>User Agreement & Conditions</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-heading">
          Terms of Service & Legal Disclaimer
        </h1>
        <p className="text-xs text-muted-foreground">
          Last Updated: September 2026 • Please review prior to utilizing platform tools.
        </p>
      </div>

      {/* Primary Statutory Disclaimer Banner */}
      <div className="bg-forest-100 dark:bg-forest-900/60 border border-forest-500/30 rounded-2xl p-6 sm:p-8 space-y-3">
        <div className="flex items-start gap-3.5">
          <AlertTriangle className="w-6 h-6 text-gold-700 dark:text-gold-500 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-foreground font-heading">
              Important Good-Faith Statutory Disclaimer
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              LegalEase is an <strong>educational and informational technology platform</strong> powered by Artificial Intelligence. 
              The content, analyses, chatbot responses, and rights summaries provided on this platform do <strong>not</strong> constitute formal legal advice, legal representation, or a formal legal opinion.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Use of this platform does <strong>not</strong> create an advocate-client relationship within the meaning of the <em>Advocates Act, 1961</em> or any other statutory authority in India. For formal legal representation, court filings, or binding counsel, you must consult an advocate enrolled with a State Bar Council.
            </p>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        <div className="bg-card border border-border rounded-xl p-6 sm:p-7 shadow-rest-card space-y-2.5">
          <h3 className="text-lg font-bold text-foreground font-heading flex items-center gap-2.5">
            <Info className="w-5 h-5 text-forest-800 dark:text-gold-500 shrink-0" />
            1. Nature of the Service
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            LegalEase provides tools including an AI Legal Assistant, Document Simplifier, Case Tracker, Rights Visualizer, and Legal Aid Directory. These tools are intended to help users understand legal vocabulary, organize case timelines, and explore basic statutory frameworks.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 sm:p-7 shadow-rest-card space-y-2.5">
          <h3 className="text-lg font-bold text-foreground font-heading flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-forest-800 dark:text-gold-500 shrink-0" />
            2. Limitations of Artificial Intelligence
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            While we strive for high accuracy by grounding our AI in authentic Indian legal statutes (e.g., BNS, CrPC, Consumer Protection Act), AI outputs may occasionally contain nuances or outdated citations. Users should independently verify statutory sections with official Gazette notifications or certified legal counsel before acting upon them.
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 sm:p-7 shadow-rest-card space-y-2.5">
          <h3 className="text-lg font-bold text-foreground font-heading flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-forest-800 dark:text-gold-500 shrink-0" />
            3. User Responsibilities & Acceptable Use
          </h3>
          <ul className="space-y-1.5 text-xs sm:text-sm text-muted-foreground list-disc pl-5 leading-relaxed">
            <li>You agree not to upload malicious software, corrupted files, or defamatory material.</li>
            <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
            <li>You agree not to use the platform to generate deceptive or fraudulent legal documents.</li>
          </ul>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 sm:p-7 shadow-rest-card space-y-2.5">
          <h3 className="text-lg font-bold text-foreground font-heading flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-forest-800 dark:text-gold-500 shrink-0" />
            4. Limitation of Liability
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            To the maximum extent permitted by applicable Indian law, LegalEase, its creators, and contributors shall not be liable for any direct, indirect, incidental, or consequential damages resulting from reliance on any informational outputs provided herein.
          </p>
        </div>
      </div>
    </div>
  );
}
