"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldAlert,
  Building,
  Briefcase,
  ShoppingBag,
  HeartHandshake,
  Search,
  Copy,
  Check,
  X,
  Sparkles,
  Scale,
  Phone,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import toast from "react-hot-toast";
import { useQuickConsultation } from "@/context/QuickConsultationContext";
import { CitationSheet } from "@/components/chat/citation-sheet";
import { BackLink, EmptyState, PageHeader, PageShell } from "@/components/page";

interface VisualStep {
  number: number;
  title: string;
  section: string;
  lawName: string;
  citation?: {
    act: string;
    section: string;
    label: string;
  };
  script: string;
  hindiScript: string;
  rights: string[];
  limits: string[];
}

interface Scenario {
  id: string;
  name: string;
  blurb: string;
  icon: React.ElementType;
  helpline: string;
  steps: VisualStep[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "police",
    name: "Police stopped or arrested me",
    blurb: "Stopped on the street, called to the station, or arrested.",
    icon: ShieldAlert,
    helpline: "NALSA Legal Aid: 15100 • Emergency: 112",
    steps: [
      {
        number: 1,
        title: "You’re stopped or questioned on the street",
        section: "Sec 179 BNSS (CrPC §160)",
        lawName: "Bharatiya Nagarik Suraksha Sanhita, 2023",
        citation: {
          act: "bnss",
          section: "179",
          label: "Section 179 BNSS",
        },
        script:
          "Officer, am I under arrest or am I free to leave? If summoning me as a witness, please issue a written notice under Section 179 BNSS.",
        hindiScript:
          "अधिकारी महोदय, क्या मैं हिरासत में हूँ या जा सकता हूँ? यदि मुझे गवाह के रूप में बुला रहे हैं, तो कृपया बीएनएसएस की धारा 179 के तहत लिखित नोटिस दें।",
        rights: [
          "You have the right to remain silent regarding self-incriminating queries (Art. 20(3)).",
          "Police cannot force you to unlock your personal mobile phone without a judicial search warrant.",
          "You may ask the officer for their name, badge number, and police station designation.",
        ],
        limits: [
          "Cannot use physical force, intimidation, or verbal abuse during routine stops.",
          "Cannot seize your phone or wallet without preparing an official Seizure Memo.",
        ],
      },
      {
        number: 2,
        title: "You’re being arrested",
        section: "Sec 47 & 43(5) BNSS (CrPC §50 & §46)",
        lawName: "Section 47 & 43(5) BNSS, 2023",
        citation: {
          act: "bnss",
          section: "47",
          label: "Section 47 BNSS",
        },
        script:
          "Under Section 47 BNSS, please state the exact grounds of arrest and bail status. Please notify my family immediately as required by law.",
        hindiScript:
          "बीएनएसएस की धारा 47 के तहत, कृपया मेरी गिरफ्तारी का स्पष्ट कानूनी कारण और ज़मानत की स्थिति बताएं। कानून के अनुसार तुरंत मेरे परिवार को सूचित करें।",
        rights: [
          "Mandatory written Arrest Memo recording exact time, date, and location of arrest.",
          "Right to have one relative or friend informed by police within 1 hour (Sec 36 BNSS).",
          "Women Nighttime Immunity: No female citizen can be arrested between sunset and sunrise without prior written order from a Judicial Magistrate.",
        ],
        limits: [
          "Cannot arrest for bailable offences without offering immediate release on bail.",
          "Male officers cannot physically search or touch a female arrestee.",
        ],
      },
      {
        number: 3,
        title: "You’re questioned in custody",
        section: "Sec 38 & 53 BNSS (CrPC §41D & §54)",
        lawName: "Section 38 & 53 BNSS & Art 22(1)",
        citation: {
          act: "bnss",
          section: "53",
          label: "Section 53 BNSS",
        },
        script:
          "Under Section 38 BNSS, I wish to consult my advocate during interrogation. I also demand an immediate medical examination under Section 53 BNSS.",
        hindiScript:
          "बीएनएसएस की धारा 38 के तहत, मैं पूछताछ के दौरान अपने वकील से परामर्श करना चाहता हूँ। धारा 53 के तहत मेरा तुरंत सरकारी मेडिकल परीक्षण कराया जाए।",
        rights: [
          "Right to consult and be defended by a lawyer of your choice during interrogation.",
          "Mandatory medical checkup by a government doctor documenting all bodily marks and injuries.",
          "Right to free food, drinking water, and safe custodial accommodation.",
        ],
        limits: [
          "Custodial torture, beatings, and forced confessions are strictly illegal (BSA Sec 23).",
          "Cannot detain a suspect in secret or unrecorded detention cells.",
        ],
      },
      {
        number: 4,
        title: "Within 24 hours, you must see a magistrate",
        section: "Sec 58 BNSS & Art 22(2)",
        lawName: "Constitution of India Article 22(2)",
        citation: {
          act: "bnss",
          section: "58",
          label: "Section 58 BNSS",
        },
        script:
          "Your Honour, I was detained on [Date/Time]. The statutory 24-hour detention limit has expired. I request immediate release or regular bail.",
        hindiScript:
          "माननीय न्यायाधीश महोदय, मुझे [दिनांक/समय] को हिरासत में लिया गया था। 24 घंटे की कानूनी सीमा समाप्त हो चुकी है। कृपया मुझे तुरंत रिहा या ज़मानत दें।",
        rights: [
          "Must be presented before the nearest Judicial Magistrate within 24 hours of arrest.",
          "Detention past 24 hours without express Magistrate remand constitutes illegal confinement.",
          "You may directly show any injuries to the Magistrate to initiate action against officers.",
        ],
        limits: [
          "Police cannot hold anyone in custody past 24 hours without a written Magistrate order.",
          "Cannot prevent an accused person from addressing the Magistrate directly.",
        ],
      },
    ],
  },
  {
    id: "tenancy",
    name: "A landlord or rental problem",
    blurb: "Deposit not returned, surprise visits, or being locked out.",
    icon: Building,
    helpline: "National Consumer Helpline: 1915",
    steps: [
      {
        number: 1,
        title: "Your landlord wants to enter, or cuts water or power",
        section: "Sec 15 Model Tenancy Act",
        lawName: "Model Tenancy Act & State Rent Laws",
        citation: {
          act: "model-tenancy-act",
          section: "15",
          label: "Section 15 Model Tenancy Act",
        },
        script:
          "Under Section 15 of the Tenancy Act, you must provide at least 24 hours prior written notice before entering the leased premises for any inspection.",
        hindiScript:
          "किराया अधिनियम की धारा 15 के तहत, मकान के निरीक्षण के लिए आने से पहले आपको कम से कम 24 घंटे की लिखित पूर्व सूचना देना अनिवार्य है।",
        rights: [
          "24-Hour Notice: Landlords must give prior written notice before entering for repairs or inspection.",
          "Essential Utilities: Water and electricity cannot be disconnected even during a rent dispute.",
          "Right to an executed and stamped copy of the tenancy agreement.",
        ],
        limits: [
          "Landlord cannot conduct surprise visits or enter in your absence without written permission.",
          "Cannot cut off essential power or water to force early eviction.",
        ],
      },
      {
        number: 2,
        title: "You’re moving out and want your deposit back",
        section: "Sec 13 Model Tenancy Act",
        lawName: "Section 13 Model Tenancy Act",
        citation: {
          act: "model-tenancy-act",
          section: "13",
          label: "Section 13 Model Tenancy Act",
        },
        script:
          "Vacant possession was delivered on [Date] following joint walkthrough. Under statutory provisions, please refund the security deposit within 30 days.",
        hindiScript:
          "मकान का खाली कब्जा [दिनांक] को सौंप दिया गया है। कानूनी प्रावधानों के अनुसार कृपया 30 दिनों के भीतर पूरी सुरक्षा राशि (Security Deposit) वापस करें।",
        rights: [
          "Full refund of security deposit must be paid within 30 days of handing over keys.",
          "Normal wear and tear (minor scuffs, wall fading) cannot be deducted as damage.",
          "Landlord must provide authentic receipts and invoices for any valid damage claims.",
        ],
        limits: [
          "Cannot forfeit the deposit arbitrarily without itemized damage proof.",
          "Cannot hold deposit after accepting keys and vacant possession.",
        ],
      },
      {
        number: 3,
        title: "You’ve been locked out",
        section: "Sec 21 & 22 Model Tenancy Act",
        lawName: "Model Tenancy Act & Consumer Protection Act",
        citation: {
          act: "model-tenancy-act",
          section: "21",
          label: "Section 21 Model Tenancy Act",
        },
        script:
          "Eviction without a Rent Court decree violates Section 21 of the Tenancy Act. A statutory notice has been issued with 18% interest claims on withheld sums.",
        hindiScript:
          "रेंट कोर्ट के आदेश के बिना बेदखल करना धारा 21 का उल्लंघन है। रोकी गई राशि पर 18% ब्याज के साथ कानूनी नोटिस भेजा जा रहा है।",
        rights: [
          "Eviction strictly requires a formal decree from the Rent Tribunal after due notice.",
          "Tenants can file complaints before the Consumer Commission for deficiency in service.",
          "Right to claim statutory interest on delayed security deposit refunds.",
        ],
        limits: [
          "Landlord cannot lock out a tenant, change locks, or throw belongings onto the street.",
          "Cannot use private recovery agents or threats of physical eviction.",
        ],
      },
    ],
  },
  {
    id: "workplace",
    name: "A problem at work",
    blurb: "A non-compete clause, unpaid gratuity, or harassment.",
    icon: Briefcase,
    helpline: "Labour Helpline: 1800-180-1111",
    steps: [
      {
        number: 1,
        title: "Your old employer cites a non-compete clause",
        section: "Sec 27 Indian Contract Act, 1872",
        lawName: "Section 27 Indian Contract Act & Supreme Court Precedents",
        citation: {
          act: "indian-contract-act-1872",
          section: "27",
          label: "Section 27 Contract Act",
        },
        script:
          "Under Section 27 of the Indian Contract Act and Supreme Court rulings (Percept D'Mark v. Zaheer Khan), post-employment non-compete clauses are void in law.",
        hindiScript:
          "भारतीय अनुबंध अधिनियम की धारा 27 और सुप्रीम कोर्ट के फैसलों के अनुसार, नौकरी छोड़ने के बाद का गैर-प्रतिस्पर्धा (Non-compete) क्लॉज कानूनन शून्य है।",
        rights: [
          "Constitutional Right to Livelihood: You are free to join any employer or competitor after leaving.",
          "Employer cannot legally enforce post-exit non-compete agreements against employees.",
          "Right to receive your relieving letter and experience certificate upon completed notice.",
        ],
        limits: [
          "Employers cannot sue or threaten legal notices simply for accepting an offer from a rival firm.",
          "Cannot withhold earned salary, PF, or relieving documents as leverage for non-compete disputes.",
        ],
      },
      {
        number: 2,
        title: "Getting your gratuity and final pay",
        section: "Payment of Gratuity Act, 1972",
        lawName: "Payment of Gratuity Act (Formula: 15 * Basic * Years / 26)",
        citation: {
          act: "payment-of-gratuity-act-1972",
          section: "4",
          label: "Section 4 Gratuity Act",
        },
        script:
          "Having completed 5+ years of service, I am statutorily entitled to gratuity under Section 7 of the Payment of Gratuity Act, payable within 30 days of exit.",
        hindiScript:
          "5 वर्ष से अधिक सेवा पूरी करने पर, मैं ग्रेच्युटी अधिनियम के तहत ग्रेच्युटी का कानूनी हकदार हूँ, जिसका 30 दिनों में भुगतान होना अनिवार्य है।",
        rights: [
          "Gratuity is mandatory for employees completing 5 years of continuous service.",
          "Formula: 15 days basic wages for every completed year of service.",
          "Must be disbursed within 30 days of separation; delays attract simple statutory interest.",
        ],
        limits: [
          "Employer cannot withhold gratuity for general contractual disagreements or notice shortages.",
          "Cannot condition statutory gratuity release on signing unread liability waivers.",
        ],
      },
      {
        number: 3,
        title: "You’re facing harassment at work",
        section: "POSH Act, 2013",
        lawName: "Sexual Harassment of Women at Workplace Act, 2013",
        citation: {
          act: "posh-act-2013",
          section: "4",
          label: "Section 4 POSH Act",
        },
        script:
          "I am submitting a formal complaint to the Internal Complaints Committee (ICC) requesting a confidential, timebound inquiry and interim protective measures.",
        hindiScript:
          "मैं आंतरिक शिकायत समिति (ICC) को औपचारिक शिकायत दर्ज कर रही हूँ और समयबद्ध जांच एवं अंतरिम सुरक्षा उपायों की मांग करती हूँ।",
        rights: [
          "Every establishment with 10+ employees must have an active ICC chaired by a senior woman.",
          "Right to request up to 3 months paid leave or workplace transfer during the inquiry.",
          "The inquiry must conclude within 90 days with strict statutory confidentiality.",
        ],
        limits: [
          "Employers cannot retaliate against, demote, or terminate anyone filing a POSH complaint.",
          "Cannot disclose the identity of the complainant or witnesses to other staff.",
        ],
      },
    ],
  },
  {
    id: "consumer",
    name: "A faulty product or online order",
    blurb: "A faulty item, hidden fees, or a seller who won’t respond.",
    icon: ShoppingBag,
    helpline: "National Consumer Helpline: 1915",
    steps: [
      {
        number: 1,
        title: "You got a faulty product or a surprise fee",
        section: "E-Commerce Rules, 2020",
        lawName: "Consumer Protection (E-Commerce) Rules, 2020",
        citation: {
          act: "consumer-protection-act-2019",
          section: "2",
          label: "Section 2 CPA 2019",
        },
        script:
          "Under Rule 5(3) of the E-Commerce Rules, 2020, you cannot charge unilateral cancellation fees. Please process a 100% refund for this defective/non-compliant item.",
        hindiScript:
          "ई-कॉमर्स नियम 2020 के नियम 5(3) के अनुसार आप एकतरफा रद्दीकरण शुल्क नहीं काट सकते। कृपया इस खराब सामान का 100% रिफंड तुरंत प्रोसेस करें।",
        rights: [
          "Right to replacement or full refund for defective, broken, or non-matching goods.",
          "Prohibition on unilateral cancellation penalties unless the platform pays identical compensation.",
          "Dark patterns like hidden pre-checked boxes and disguised add-on fees are prohibited.",
        ],
        limits: [
          "Platforms cannot refuse returns on genuine damaged deliveries by blaming third-party sellers.",
          "Cannot delete or manipulate consumer product reviews arbitrarily.",
        ],
      },
      {
        number: 2,
        title: "The seller isn’t responding",
        section: "Rule 4(4) E-Commerce Rules",
        lawName: "Consumer Protection Act, 2019",
        citation: {
          act: "consumer-protection-act-2019",
          section: "35",
          label: "Section 35 CPA 2019",
        },
        script:
          "I am escalating ticket #[ID] to the statutory Grievance Officer. Under Rule 4(4), you must acknowledge within 48 hours and resolve within 30 days.",
        hindiScript:
          "मैं यह शिकायत शिकायत अधिकारी (Grievance Officer) को भेज रहा हूँ। नियम 4(4) के तहत 48 घंटे में पावती और 30 दिनों में समाधान आवश्यक है।",
        rights: [
          "Every major digital platform must publish the name and email of an India-based Grievance Officer.",
          "Mandatory acknowledgment ticket within 48 hours; complete resolution within 1 month.",
          "Manufacturers and sellers are strictly liable for harm caused by defective products.",
        ],
        limits: [
          "Cannot ignore written consumer complaints with infinite automated bot loops.",
          "Cannot close tickets without tenant/consumer agreement.",
        ],
      },
      {
        number: 3,
        title: "Filing a consumer complaint online",
        section: "Sec 34 & 35 CPA 2019",
        lawName: "Consumer Protection Act, 2019 (District Commission)",
        citation: {
          act: "consumer-protection-act-2019",
          section: "34",
          label: "Section 34 CPA 2019",
        },
        script:
          "A formal complaint is being filed online via e-Daakhil (edaakhil.nic.in) before the District Consumer Commission for refund and damages.",
        hindiScript:
          "उपभोक्ता आयोग के समक्ष e-Daakhil के माध्यम से ऑनलाइन औपचारिक शिकायत और हर्जाने का दावा दर्ज किया जा रहा है।",
        rights: [
          "File claims entirely online via e-Daakhil with minimal nominal court fees.",
          "District Commission has pecuniary jurisdiction up to ₹50 Lakhs.",
          "No advocate required: Consumers can present their own cases directly.",
        ],
        limits: [
          "Companies cannot bypass consumer commission jurisdiction using fine-print arbitration clauses.",
          "Failure to obey final orders can lead to imprisonment under Section 72 CPA.",
        ],
      },
    ],
  },
  {
    id: "family",
    name: "Family, maintenance, or violence at home",
    blurb: "Asking for maintenance, or staying safe at home.",
    icon: HeartHandshake,
    helpline: "Women Helpline: 1091 • Childline: 1098",
    steps: [
      {
        number: 1,
        title: "Asking for monthly maintenance",
        section: "Sec 144 BNSS (CrPC §125)",
        lawName: "Section 144 BNSS, 2023",
        citation: {
          act: "bnss",
          section: "144",
          label: "Section 144 BNSS",
        },
        script:
          "Under Section 144 BNSS, I am filing for interim monthly maintenance for myself and my minor children proportionate to the respondent's actual standard of living.",
        hindiScript:
          "बीएनएसएस की धारा 144 के तहत, मैं अपने और अपने बच्चों के भरण-पोषण के लिए मासिक गुजारा भत्ता का दावा दाखिल कर रही हूँ।",
        rights: [
          "Court can award interim financial support pending full case disposal (within 60 days of notice).",
          "Covers wives, minor children, and dependent elderly parents unable to maintain themselves.",
          "Both parties must disclose complete assets and income affidavits (Rajnesh v. Neha).",
        ],
        limits: [
          "A spouse with sufficient income cannot leave a dependent partner or child destitute.",
          "Cannot conceal income or assets to evade statutory maintenance orders.",
        ],
      },
      {
        number: 2,
        title: "Violence at home, and your right to stay",
        section: "Sec 17 & 19 PWDVA, 2005",
        lawName: "Protection of Women from Domestic Violence Act, 2005",
        citation: {
          act: "protection-of-women-from-domestic-violence-act-2005",
          section: "17",
          label: "Section 17 PWDVA",
        },
        script:
          "Under Section 17 of the PWDVA, I have an absolute right to reside in the shared household. Any attempt to lock me out violates Section 19.",
        hindiScript:
          "घरेलू हिंसा अधिनियम की धारा 17 के तहत मुझे साझे घर में रहने का पूर्ण कानूनी अधिकार है। मुझे बाहर निकालना धारा 19 का उल्लंघन है।",
        rights: [
          "Right to Shared Household: Woman cannot be evicted from matrimonial home regardless of ownership title.",
          "Protection Orders: Court can restrain the respondent from entering workplace or harassing the victim.",
          "Access to free court representation through DLSA front office.",
        ],
        limits: [
          "In-laws or spouse cannot lock out, dispossess, or dump an aggrieved woman's belongings outside.",
          "Breach of a protection order carries imprisonment under Section 31 PWDVA.",
        ],
      },
    ],
  },
];

/** "NALSA Legal Aid: 15100 • Emergency: 112" -> [{ label, number }] */
function parseHelplines(value: string) {
  return value
    .split(" • ")
    .map((part) => part.match(/^(.*):\s*([\d-]+)$/))
    .filter((m): m is RegExpMatchArray => Boolean(m))
    .map((m) => ({ label: m[1].trim(), number: m[2] }));
}

function RightsPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { openConsultation } = useQuickConsultation();
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [scriptLanguage, setScriptLanguage] = useState<"en" | "hi">("en");
  const [selectedCitation, setSelectedCitation] = useState<{ act: string; section: string } | null>(null);

  // The chosen situation lives in the URL so the back button and shared links work.
  const situationId = params.get("situation");
  const scenario = SCENARIOS.find((s) => s.id === situationId) ?? null;
  const openStep = params.get("step") ?? "1";

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;
    const results: { scenario: Scenario; step: VisualStep }[] = [];
    for (const sc of SCENARIOS) {
      for (const step of sc.steps) {
        if (
          step.title.toLowerCase().includes(q) ||
          step.section.toLowerCase().includes(q) ||
          step.lawName.toLowerCase().includes(q) ||
          step.script.toLowerCase().includes(q) ||
          step.hindiScript.toLowerCase().includes(q) ||
          step.rights.some((r) => r.toLowerCase().includes(q)) ||
          step.limits.some((l) => l.toLowerCase().includes(q))
        ) {
          results.push({ scenario: sc, step });
        }
      }
    }
    return results;
  }, [searchQuery]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied. You can paste it into a message.");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const footer = (
    <div className="flex flex-col justify-between gap-2 border-t border-border pt-5 text-sm text-muted-foreground sm:flex-row sm:items-center">
      <span>
        This is general information, not legal advice. Women, people awaiting trial, and low-income citizens can get free legal representation.
      </span>
      <Link href="/help" className="inline-flex shrink-0 items-center gap-1 font-semibold text-foreground hover:underline">
        Find free legal aid <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </div>
  );

  // ---------------------------------------------------------------- Level 1: pick a situation
  if (!scenario) {
    return (
      <PageShell>
        <PageHeader
          title="Know your rights"
          description="Tell us what’s happening. You’ll see what to say, what you’re entitled to, and what the authorities can’t do."
        />

        <p className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-foreground">
          In danger right now? Call{" "}
          <a href="tel:112" className="font-bold underline underline-offset-2">112</a>. For free legal advice, call{" "}
          <a href="tel:15100" className="font-bold underline underline-offset-2">15100</a>.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {SCENARIOS.map((sc, i) => {
            const Icon = sc.icon;
            return (
              <button
                key={sc.id}
                type="button"
                onClick={() => router.push(`/rights?situation=${sc.id}`)}
                className={`group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-all hover:-translate-y-px hover:border-gold-500/60 hover:shadow-hover-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 motion-reduce:transition-colors motion-reduce:hover:translate-y-0 ${
                  i === SCENARIOS.length - 1 ? "sm:col-span-2" : ""
                }`}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-forest-100 text-forest-800 transition-colors group-hover:bg-forest-800 group-hover:text-gold-300 dark:bg-forest-800 dark:text-gold-400 dark:group-hover:bg-gold-500 dark:group-hover:text-forest-950">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-lg font-semibold text-foreground">{sc.name}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">{sc.blurb}</span>
                </span>
                <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </button>
            );
          })}
        </div>

        <section aria-labelledby="rights-search" className="space-y-3">
          <h2 id="rights-search" className="font-display text-xl font-semibold text-foreground">
            Looking for something specific?
          </h2>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Try “bail”, “phone”, “deposit” or “gratuity”"
              aria-label="Search rights"
              className="h-11 bg-card pl-9 pr-10 text-base sm:text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {searchResults !== null &&
            (searchResults.length === 0 ? (
              <EmptyState
                icon={Search}
                title="Nothing matched your search"
                description="Try a simpler word, or pick one of the situations above."
              />
            ) : (
              <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
                {searchResults.map(({ scenario: sc, step }) => (
                  <li key={`${sc.id}-${step.number}`}>
                    <button
                      type="button"
                      onClick={() => router.push(`/rights?situation=${sc.id}&step=${step.number}`)}
                      className="group flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-500"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-foreground">{step.title}</span>
                        <span className="block text-sm text-muted-foreground">{sc.name}</span>
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ))}
        </section>

        {footer}
      </PageShell>
    );
  }

  // ---------------------------------------------------------------- Level 2: the steps for one situation
  const helplines = parseHelplines(scenario.helpline);

  return (
    <PageShell>
      <div className="space-y-4">
        <BackLink href="/rights">All situations</BackLink>
        <PageHeader title={scenario.name} description={scenario.blurb} />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-foreground">Need help now?</span>
          {helplines.map((h) => (
            <Button key={h.number} asChild variant="outline" size="sm" className="gap-1.5 bg-background">
              <a href={`tel:${h.number.replace(/-/g, "")}`}>
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                {h.label} {h.number}
              </a>
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Show scripts in</span>
          <div role="group" aria-label="Script language" className="flex items-center gap-1 rounded-xl border border-border bg-background p-1">
            {(["en", "hi"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                aria-pressed={scriptLanguage === lang}
                onClick={() => setScriptLanguage(lang)}
                className={`rounded-lg px-3 py-1 font-medium transition-colors ${
                  scriptLanguage === lang
                    ? "bg-forest-800 text-white dark:bg-gold-500 dark:text-forest-950"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lang === "en" ? "English" : "हिंदी"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Accordion key={scenario.id} type="single" collapsible defaultValue={openStep} className="space-y-3">
        {scenario.steps.map((step) => {
          const script = scriptLanguage === "hi" ? step.hindiScript : step.script;
          const copyKey = `${scenario.id}-${step.number}`;
          return (
            <AccordionItem
              key={step.number}
              value={String(step.number)}
              className="rounded-2xl border border-border bg-card px-4 transition-colors data-[state=open]:border-forest-500/40 sm:px-6"
            >
              <AccordionTrigger className="gap-4 py-5 text-left hover:no-underline">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-forest-700 text-sm font-bold text-foreground dark:border-gold-400">
                    {step.number}
                  </span>
                  <span className="font-display text-lg font-semibold leading-snug text-foreground">{step.title}</span>
                </span>
              </AccordionTrigger>

              <AccordionContent className="space-y-6 pb-6 pt-1">
                {/* 1. What to say */}
                <div className="space-y-3 rounded-2xl bg-forest-100/70 p-4 dark:bg-forest-800/50 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">
                      {scriptLanguage === "hi" ? "यह कहें" : "Say this"}
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(script, copyKey)}
                      className="gap-1.5 bg-background"
                    >
                      {copiedKey === copyKey ? (
                        <>
                          <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" aria-hidden="true" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p lang={scriptLanguage === "hi" ? "hi" : "en"} className="text-base leading-relaxed text-foreground">
                    “{script}”
                  </p>
                </div>

                {/* 2. Can / can't */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2.5">
                    <h3 className="font-display text-base font-semibold text-emerald-800 dark:text-emerald-400">You can</h3>
                    <ul className="space-y-2.5 text-sm leading-relaxed text-foreground/85">
                      {step.rights.map((r, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-2.5">
                    <h3 className="font-display text-base font-semibold text-rose-800 dark:text-rose-400">They can’t</h3>
                    <ul className="space-y-2.5 text-sm leading-relaxed text-foreground/85">
                      {step.limits.map((l, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" aria-hidden="true" />
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 3. The law (kept out of the way) */}
                <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">The law:</span> {step.section}, {step.lawName}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {step.citation && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() =>
                          setSelectedCitation({ act: step.citation!.act, section: step.citation!.section })
                        }
                      >
                        <Scale className="h-4 w-4 text-gold-600" aria-hidden="true" />
                        Read the law
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-1.5"
                      onClick={() =>
                        openConsultation({
                          title: `${scenario.name} • ${step.title}`,
                          subtitle: step.section,
                          prompt: `Under ${step.section} (${step.lawName}), what are my legal rights and authority limits during "${step.title}"? What concrete safeguards protect me if an officer or authority breaches this statutory procedure?`,
                          act: step.section,
                          section: step.section,
                        })
                      }
                    >
                      <Sparkles className="h-4 w-4 text-gold-600" aria-hidden="true" />
                      Ask AI about this
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {footer}

      <CitationSheet
        citation={selectedCitation}
        isOpen={!!selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </PageShell>
  );
}

export default function RightsVisualizerPage() {
  return (
    <Suspense fallback={<PageShell><div className="h-64 animate-pulse rounded-2xl border border-border bg-card/60 motion-reduce:animate-none" aria-label="Loading" /></PageShell>}>
      <RightsPageContent />
    </Suspense>
  );
}
