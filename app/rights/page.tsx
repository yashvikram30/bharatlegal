"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldAlert,
  Building,
  Briefcase,
  ShoppingBag,
  HeartHandshake,
  Search,
  Copy,
  Check,
  ArrowUpRight,
  PhoneCall,
  X,
  Sparkles,
  Scale,
  ExternalLink,
  Languages,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useQuickConsultation } from "@/context/QuickConsultationContext";
import { CitationSheet } from "@/components/chat/citation-sheet";

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
  icon: React.ElementType;
  helpline: string;
  steps: VisualStep[];
}

const SCENARIOS: Scenario[] = [
  {
    id: "police",
    name: "Police Stop & Custody",
    icon: ShieldAlert,
    helpline: "NALSA Legal Aid: 15100 • Emergency: 112",
    steps: [
      {
        number: 1,
        title: "Street Stop & Questioning",
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
        title: "The Moment of Formal Arrest",
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
        title: "Interrogation & Medical Examination",
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
        title: "24-Hour Production Before Magistrate",
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
    name: "Tenancy & Security Deposit",
    icon: Building,
    helpline: "National Consumer Helpline: 1915",
    steps: [
      {
        number: 1,
        title: "Privacy & Essential Utilities During Lease",
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
        title: "Vacating & 30-Day Deposit Refund Clock",
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
        title: "Unlawful Lockout & Legal Recovery",
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
    name: "Workplace & Employment",
    icon: Briefcase,
    helpline: "Labour Helpline: 1800-180-1111",
    steps: [
      {
        number: 1,
        title: "Post-Employment Non-Compete Clauses",
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
        title: "Gratuity Entitlement & Final Settlement",
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
        title: "Workplace Harassment (POSH Act)",
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
    name: "Consumer & E-Commerce",
    icon: ShoppingBag,
    helpline: "National Consumer Helpline: 1915",
    steps: [
      {
        number: 1,
        title: "Defective Delivery & Cancellation Fees",
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
        title: "Grievance Officer Escalation",
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
        title: "e-Daakhil Online Consumer Court",
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
    name: "Family & Maintenance",
    icon: HeartHandshake,
    helpline: "Women Helpline: 1091 • Childline: 1098",
    steps: [
      {
        number: 1,
        title: "Interim Monthly Maintenance",
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
        title: "Domestic Violence & Shared Household",
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

const SUGGESTED_CHIPS = [
  { label: "Police asking for phone", query: "phone" },
  { label: "Arrested without warrant", query: "arrest" },
  { label: "Landlord keeping deposit", query: "deposit" },
  { label: "Surprise landlord visits", query: "notice" },
  { label: "2-Year Non-compete clause", query: "non-compete" },
  { label: "Defective online delivery", query: "cancellation" },
  { label: "Child maintenance claim", query: "maintenance" },
];

export default function RightsVisualizerPage() {
  const { openConsultation } = useQuickConsultation();
  const [activeScenarioId, setActiveScenarioId] = useState<string>("police");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [scriptLanguage, setScriptLanguage] = useState<"en" | "hi">("en");
  const [selectedCitation, setSelectedCitation] = useState<{ act: string; section: string } | null>(null);

  const currentScenario = useMemo(() => {
    return SCENARIOS.find((s) => s.id === activeScenarioId) || SCENARIOS[0];
  }, [activeScenarioId]);

  // Cross-scenario search calculation
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return null;

    const results: { scenario: Scenario; step: VisualStep }[] = [];
    for (const scenario of SCENARIOS) {
      for (const step of scenario.steps) {
        if (
          step.title.toLowerCase().includes(q) ||
          step.section.toLowerCase().includes(q) ||
          step.lawName.toLowerCase().includes(q) ||
          step.script.toLowerCase().includes(q) ||
          step.hindiScript.toLowerCase().includes(q) ||
          step.rights.some((r) => r.toLowerCase().includes(q)) ||
          step.limits.some((l) => l.toLowerCase().includes(q))
        ) {
          results.push({ scenario, step });
        }
      }
    }
    return results;
  }, [searchQuery]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(label);
    toast.success("Copied legal script to clipboard");
    setTimeout(() => setCopiedScript(null), 2000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl space-y-6">
      {/* 1. Header with Language Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-gold-400 border border-forest-500/20">
            <Sparkles className="w-3.5 h-3.5 text-gold-500" />
            <span>Interactive Citizen Legal Roadmaps</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight">
            Rights Visualizer
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Step-by-step citizen roadmaps, exact spoken dialogue, and authority limits under Indian statutory law.
          </p>
        </div>

        {/* Global Script Language Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/60 border border-border self-start sm:self-center">
          <Languages className="w-3.5 h-3.5 text-muted-foreground ml-1.5" />
          <button
            onClick={() => setScriptLanguage("en")}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              scriptLanguage === "en"
                ? "bg-card text-foreground font-bold shadow-xs border border-border/70"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            English Scripts
          </button>
          <button
            onClick={() => setScriptLanguage("hi")}
            className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
              scriptLanguage === "hi"
                ? "bg-card text-foreground font-bold shadow-xs border border-border/70"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            हिंदी संवाद
          </button>
        </div>
      </div>

      {/* 2. Emergency Citizen Hotline Bar */}
      <div className="flex flex-wrap items-center gap-2 text-[11px] p-2.5 rounded-xl bg-muted/30 border border-border/60">
        <span className="font-semibold text-foreground/80 flex items-center gap-1 mr-1">
          <PhoneCall className="w-3 h-3 text-gold-500" />
          <span>Emergency Hotlines:</span>
        </span>
        <a
          href="tel:15100"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-forest-100/70 dark:bg-forest-900/40 text-forest-800 dark:text-gold-400 hover:underline font-medium border border-forest-500/20"
        >
          NALSA Free Legal Aid: <strong>15100</strong>
        </a>
        <a
          href="tel:112"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:underline font-medium border border-rose-500/20"
        >
          Police Emergency: <strong>112</strong>
        </a>
        <a
          href="tel:1915"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground/80 hover:underline font-medium border border-border/60"
        >
          Consumer: <strong>1915</strong>
        </a>
        <a
          href="tel:1091"
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted text-foreground/80 hover:underline font-medium border border-border/60"
        >
          Women: <strong>1091</strong>
        </a>
      </div>

      {/* 3. Global Scenario Search & Quick Question Chips */}
      <div className="space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rights & statutory procedures across all domains (e.g. 'phone search', 'bail', 'deposit refund', 'non compete')..."
            className="h-10 pl-9 pr-8 text-xs sm:text-sm bg-card border-border rounded-xl shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground text-xs"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
          <span className="text-muted-foreground font-medium shrink-0">Common situations:</span>
          {SUGGESTED_CHIPS.map((chip) => (
            <button
              key={chip.query}
              onClick={() => setSearchQuery(chip.query)}
              className={`px-2.5 py-0.5 rounded-full border transition-colors shrink-0 ${
                searchQuery.toLowerCase() === chip.query.toLowerCase()
                  ? "bg-forest-800 text-white dark:bg-gold-500 dark:text-forest-950 font-bold border-transparent"
                  : "bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:border-forest-500/50"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Topic Selector Strip */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs border-b border-border/60">
        {searchResults !== null && (
          <button
            onClick={() => setSearchQuery("")}
            className="px-3 py-2 rounded-t-lg font-bold text-forest-700 dark:text-gold-400 bg-forest-50 dark:bg-forest-900/30 border-b-2 border-forest-600 dark:border-gold-400 flex items-center gap-1.5 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Search Results ({searchResults.length})</span>
            <X className="w-3 h-3 ml-1 opacity-70" />
          </button>
        )}

        {SCENARIOS.map((scenario) => {
          const Icon = scenario.icon;
          const isActive = searchResults === null && activeScenarioId === scenario.id;
          return (
            <button
              key={scenario.id}
              onClick={() => {
                setActiveScenarioId(scenario.id);
                setSearchQuery("");
              }}
              className={`px-3 py-2 rounded-t-lg font-medium transition-colors flex items-center gap-1.5 shrink-0 border-b-2 ${
                isActive
                  ? "border-forest-800 text-foreground font-semibold dark:border-gold-400"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{scenario.name}</span>
            </button>
          );
        })}
      </div>

      {/* 5. The Clean Vertical Step Timeline */}
      <div className="relative pl-6 sm:pl-8 space-y-6 pt-2 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-border/60">
        {searchResults !== null ? (
          // Global Search Results View
          searchResults.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed rounded-2xl p-6">
              <ShieldAlert className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                No statutory steps matched "{searchQuery}"
              </p>
              <p className="text-xs text-muted-foreground">
                Try searching for a different keyword or tap one of the common situation chips above.
              </p>
            </div>
          ) : (
            searchResults.map(({ scenario, step }, idx) => (
              <div key={`${scenario.id}-${step.number}`} className="relative space-y-3">
                {/* Node Circle */}
                <div className="absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full bg-card border-2 border-forest-700 dark:border-gold-400 flex items-center justify-center text-[11px] font-bold text-foreground font-mono shadow-xs">
                  {idx + 1}
                </div>

                {/* Heading & Badges */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                      {scenario.name}
                    </span>
                    <h3 className="font-bold text-base text-foreground font-heading">
                      {step.title}
                    </h3>
                    {step.citation ? (
                      <button
                        onClick={() =>
                          setSelectedCitation({
                            act: step.citation!.act,
                            section: step.citation!.section,
                          })
                        }
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-gold-400 font-semibold border border-forest-500/30 hover:border-forest-500 hover:bg-forest-200/60 dark:hover:bg-forest-800/80 transition-all flex items-center gap-1 cursor-pointer group"
                        title="Click to view full Bare Act text & Supreme Court precedents"
                      >
                        <Scale className="w-3 h-3 text-gold-500 group-hover:scale-110 transition-transform" />
                        <span>{step.section}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium border border-border/50">
                        {step.section}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{step.lawName}</p>
                </div>

                {/* Spoken Citizen Script */}
                <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-foreground/80 uppercase tracking-wide text-[10px]">
                      {scriptLanguage === "hi" ? "आपको क्या बोलना चाहिए:" : "What You Should Say:"}
                    </span>
                    <button
                      onClick={() =>
                        handleCopy(
                          scriptLanguage === "hi" ? step.hindiScript : step.script,
                          `search-${idx}`
                        )
                      }
                      className="text-[11px] text-forest-800 dark:text-gold-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      {copiedScript === `search-${idx}` ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-foreground italic leading-relaxed">
                    "{scriptLanguage === "hi" ? step.hindiScript : step.script}"
                  </p>
                </div>

                {/* Rights and Limitations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <div className="space-y-1.5">
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-[11px] uppercase tracking-wider">
                      Your Rights:
                    </p>
                    <ul className="space-y-1.5 text-muted-foreground leading-relaxed">
                      {step.rights.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                            ✓
                          </span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1.5">
                    <p className="font-semibold text-rose-600 dark:text-rose-400 text-[11px] uppercase tracking-wider">
                      Authority Prohibitions:
                    </p>
                    <ul className="space-y-1.5 text-muted-foreground leading-relaxed">
                      {step.limits.map((l, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-rose-500 font-bold shrink-0">✕</span>
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Ask AI & Bare Act Inspector Triggers */}
                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={() =>
                      openConsultation({
                        title: `${scenario.name} • ${step.title}`,
                        subtitle: step.section,
                        prompt: `Under ${step.section} (${step.lawName}), what are my legal rights and authority limits during "${step.title}"? What concrete safeguards protect me if an officer or authority breaches this statutory procedure?`,
                        act: step.section,
                        section: step.section,
                      })
                    }
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-forest-700 dark:text-gold-400 hover:underline cursor-pointer group"
                  >
                    <Sparkles className="w-3 h-3 text-gold-500 group-hover:rotate-12 transition-transform" />
                    <span>Ask AI about this step</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>

                  {step.citation && (
                    <button
                      onClick={() =>
                        setSelectedCitation({
                          act: step.citation!.act,
                          section: step.citation!.section,
                        })
                      }
                      className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                      <Scale className="w-3 h-3 text-gold-500" />
                      <span>Read Full Bare Act Text</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )
        ) : (
          // Active Scenario Steps View
          currentScenario.steps.map((step) => (
            <div key={step.number} className="relative space-y-3">
              {/* Node Circle */}
              <div className="absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full bg-card border-2 border-forest-700 dark:border-gold-400 flex items-center justify-center text-[11px] font-bold text-foreground font-mono shadow-xs">
                {step.number}
              </div>

              {/* Step Heading & Statutory Section */}
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-base text-foreground font-heading">
                    {step.title}
                  </h3>
                  {step.citation ? (
                    <button
                      onClick={() =>
                        setSelectedCitation({
                          act: step.citation!.act,
                          section: step.citation!.section,
                        })
                      }
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-gold-400 font-semibold border border-forest-500/30 hover:border-forest-500 hover:bg-forest-200/60 dark:hover:bg-forest-800/80 transition-all flex items-center gap-1 cursor-pointer group"
                      title="Click to view full Bare Act text & Supreme Court precedents"
                    >
                      <Scale className="w-3 h-3 text-gold-500 group-hover:scale-110 transition-transform" />
                      <span>{step.section}</span>
                      <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground font-medium border border-border/50">
                      {step.section}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">{step.lawName}</p>
              </div>

              {/* Spoken Citizen Script */}
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground/80 uppercase tracking-wide text-[10px]">
                    {scriptLanguage === "hi" ? "आपको क्या बोलना चाहिए:" : "What You Should Say:"}
                  </span>
                  <button
                    onClick={() =>
                      handleCopy(
                        scriptLanguage === "hi" ? step.hindiScript : step.script,
                        `step-${step.number}`
                      )
                    }
                    className="text-[11px] text-forest-800 dark:text-gold-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    {copiedScript === `step-${step.number}` ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-foreground italic leading-relaxed">
                  "{scriptLanguage === "hi" ? step.hindiScript : step.script}"
                </p>
              </div>

              {/* Rights and Limitations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                <div className="space-y-1.5">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-400 text-[11px] uppercase tracking-wider">
                    Your Rights:
                  </p>
                  <ul className="space-y-1.5 text-muted-foreground leading-relaxed">
                    {step.rights.map((r, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                          ✓
                        </span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <p className="font-semibold text-rose-600 dark:text-rose-400 text-[11px] uppercase tracking-wider">
                    Authority Prohibitions:
                  </p>
                  <ul className="space-y-1.5 text-muted-foreground leading-relaxed">
                    {step.limits.map((l, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold shrink-0">✕</span>
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ask AI & Bare Act Inspector Triggers */}
              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={() =>
                    openConsultation({
                      title: `${currentScenario.name} • ${step.title}`,
                      subtitle: step.section,
                      prompt: `Under ${step.section} (${step.lawName}), what are my legal rights and authority limits during "${step.title}"? What concrete safeguards protect me if an officer or authority breaches this statutory procedure?`,
                      act: step.section,
                      section: step.section,
                    })
                  }
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-forest-700 dark:text-gold-400 hover:underline cursor-pointer group"
                >
                  <Sparkles className="w-3 h-3 text-gold-500 group-hover:rotate-12 transition-transform" />
                  <span>Ask AI about this step</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>

                {step.citation && (
                  <button
                    onClick={() =>
                      setSelectedCitation({
                        act: step.citation!.act,
                        section: step.citation!.section,
                      })
                    }
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    <Scale className="w-3 h-3 text-gold-500" />
                    <span>Read Bare Act Text</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 6. Minimal DLSA Help Footer Note */}
      <div className="border-t border-border/60 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Entitled to free legal aid? Women, undertrials, and low-income citizens receive 100% free legal representation under Sec 12 LSAA.
        </span>
        <Link
          href="/help"
          className="font-semibold text-foreground hover:underline shrink-0 flex items-center gap-1"
        >
          <span>Find DLSA Clinics →</span>
        </Link>
      </div>

      {/* 7. Mounted Interactive IndiaCode Bare Act Citation Sheet */}
      <CitationSheet
        citation={selectedCitation}
        isOpen={!!selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
}
