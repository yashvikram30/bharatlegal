"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Share2, Search, Scale, CheckCheck, BookOpen, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

type Right = {
  id: string;
  title: string;
  statute: string;
  content: string;
};

type RightCategory = {
  id: string;
  title: string;
  description: string;
  rights: Right[];
};

export default function RightsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("arrest");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories: RightCategory[] = [
    {
      id: "arrest",
      title: "Arrest & Detention",
      description: "Constitutional and procedural protections during police interactions and custody.",
      rights: [
        {
          id: "arrest-1",
          title: "Right to Know Grounds of Arrest & Offence Particulars",
          statute: "Section 50(1) CrPC / Section 47 BNSS",
          content:
            "A police officer making an arrest without a warrant must immediately communicate to you full particulars of the offence for which you are arrested and the exact grounds for arrest. If the offence is bailable, they must inform you of your entitlement to be released on bail.",
        },
        {
          id: "arrest-2",
          title: "Right to Legal Representation & Advocate Access",
          statute: "Article 22(1) Constitution & Section 41D CrPC / Sec 38 BNSS",
          content:
            "You have a fundamental constitutional right to consult and be defended by a legal practitioner of your choice. Under Section 41D, you are entitled to meet an advocate of your choice during interrogation, though not throughout the entire examination.",
        },
        {
          id: "arrest-3",
          title: "Production Before Magistrate Within 24 Hours",
          statute: "Article 22(2) Constitution & Section 57 CrPC / Sec 58 BNSS",
          content:
            "No police officer can detain a person in custody for more than 24 hours without the express authorization of a Judicial Magistrate, excluding the time necessary for the journey from the place of arrest to the court.",
        },
        {
          id: "arrest-4",
          title: "Right to Have a Nominated Relative or Friend Informed",
          statute: "Section 41B(b) CrPC / Section 36 BNSS",
          content:
            "The arresting officer is statutorily required to inform one friend, relative, or nominated person of your arrest and the exact police station or detention facility where you are held.",
        },
        {
          id: "arrest-5",
          title: "Mandatory Medical Examination by Registered Medical Practitioner",
          statute: "Section 54 CrPC / Section 53 BNSS",
          content:
            "When arrested, you have the statutory right to be examined by a registered medical practitioner. The medical report documents your physical condition and any injuries, serving as vital contemporaneous evidence against custodial torture or police misconduct.",
        },
      ],
    },
    {
      id: "property",
      title: "Property & Tenancy",
      description: "Protections regarding residential leases, security deposit refunds, and property possession.",
      rights: [
        {
          id: "prop-1",
          title: "Right to Timely Security Deposit Refund",
          statute: "Model Tenancy Act / State Rent Control Acts",
          content:
            "Landlords are required to refund the security deposit within 30 days of handing over vacant possession, after reasonable agreed deductions for verified damages. Arbitrary forfeiture is an actionable civil wrong.",
        },
        {
          id: "prop-2",
          title: "Protection Against Unlawful Eviction & Essential Services Cut-off",
          statute: "Section 14 Model Tenancy Act & State Rent Laws",
          content:
            "A landlord cannot forcefully evict a tenant or cut off essential utilities (electricity, water) without a valid decree from the competent Rent Court or Rent Tribunal following due statutory notice.",
        },
        {
          id: "prop-3",
          title: "Right to Prior Notice Before Landlord Premises Entry",
          statute: "Model Tenancy Act / Transfer of Property Act, 1882",
          content:
            "Except in cases of structural emergency, a landlord or property manager must provide at least 24 hours prior written or electronic notice before entering the leased premises for repairs or inspection.",
        },
        {
          id: "prop-4",
          title: "Equal Coparcenary & Ancestral Inheritance Rights for Daughters",
          statute: "Hindu Succession (Amendment) Act, 2005 (Vineeta Sharma v. Rakesh Sharma)",
          content:
            "Daughters have equal coparcenary rights by birth in ancestral property with the same rights and liabilities as sons, irrespective of whether the father was alive when the 2005 amendment came into force.",
        },
      ],
    },
    {
      id: "consumer",
      title: "Consumer Protection",
      description: "Remedies against defective goods, deficient services, misleading ads, and unfair e-commerce trade.",
      rights: [
        {
          id: "cons-1",
          title: "Right to Redressal Against Unfair Trade Practices",
          statute: "Section 2(47) & Section 35 Consumer Protection Act, 2019",
          content:
            "Consumers can file statutory claims for defective goods, deficient service, or misleading claims before the District Consumer Commission (pecuniary jurisdiction up to ₹50 Lakhs) with simplified e-filing via e-Daakhil.",
        },
        {
          id: "cons-2",
          title: "Product Liability Claims Against Manufacturers & Sellers",
          statute: "Section 82 to 87 Consumer Protection Act, 2019",
          content:
            "Manufacturers, service providers, and product sellers are strictly liable to compensate consumers for harm caused by defective products, manufacturing flaws, or lack of adequate warning instructions.",
        },
        {
          id: "cons-3",
          title: "Right to Free Delivery Returns & No Hidden Cancellation Penalties",
          statute: "Consumer Protection (E-Commerce) Rules, 2020",
          content:
            "E-commerce entities cannot arbitrarily impose cancellation charges unless similar charges are borne by the platform for cancellations, nor can they refuse refunds on genuine defective or non-compliant deliveries.",
        },
      ],
    },
    {
      id: "workplace",
      title: "Workplace & Labour",
      description: "Rights governing wages, notice periods, non-compete clauses, and prevention of harassment.",
      rights: [
        {
          id: "work-1",
          title: "Right Against Unreasonable Post-Employment Non-Compete Clauses",
          statute: "Section 27 Indian Contract Act, 1872",
          content:
            "Every agreement by which anyone is restrained from exercising a lawful profession, trade, or business is void to that extent under Indian law. Employers cannot legally enforce blanket post-employment non-compete covenants against employees.",
        },
        {
          id: "work-2",
          title: "Protection Against Sexual Harassment (POSH Act)",
          statute: "Sexual Harassment of Women at Workplace Act, 2013",
          content:
            "Every organization with 10+ employees must constitute an Internal Complaints Committee (ICC). Female employees are entitled to a time-bound, confidential redressal inquiry with interim relief measures.",
        },
        {
          id: "work-3",
          title: "Right to Gratuity Upon 5 Years of Continuous Service",
          statute: "Payment of Gratuity Act, 1972",
          content:
            "Employees completing 5 years of continuous service are legally entitled to gratuity payment calculated at 15 days' wages for every completed year of service, payable within 30 days of resignation, retirement, or termination.",
        },
      ],
    },
    {
      id: "family",
      title: "Family & Succession",
      description: "Statutory rights regarding maintenance, child custody, and domestic violence protection.",
      rights: [
        {
          id: "fam-1",
          title: "Right to Claim Monthly Maintenance & Interim Support",
          statute: "Section 125 CrPC / Section 144 BNSS & Sec 24 HMA",
          content:
            "Wives, minor children, and aged or infirm parents who are unable to maintain themselves can claim maintenance from any person who has sufficient means but neglects or refuses to maintain them.",
        },
        {
          id: "fam-2",
          title: "Protection from Domestic Violence & Right to Shared Household",
          statute: "Protection of Women from Domestic Violence Act, 2005 (PWDVA)",
          content:
            "An aggrieved woman has the statutory right to reside in the shared household regardless of whether she has any legal title, along with protection orders, monetary relief, and custody orders.",
        },
      ],
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Legal provision copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (title: string, content: string) => {
    const textToShare = `${title}\n\n${content}\n\nSource: BharatLegal (https://bharatlegal.in/rights)`;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: `Legal Right: ${title}`,
          text: textToShare,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(textToShare);
      toast.success("Details copied to clipboard for sharing");
    }
  };

  // Filter rights by search query across all categories or current category
  const currentCategoryData = categories.find((c) => c.id === selectedCategory);

  const filteredRights = (currentCategoryData?.rights || []).filter((r) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(query) ||
      r.statute.toLowerCase().includes(query) ||
      r.content.toLowerCase().includes(query)
    );
  });

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl space-y-8">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 border border-forest-500/20">
          <Scale className="w-3.5 h-3.5" />
          <span>Statutory Citizen Rights</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground font-heading tracking-tight">
          Legal Rights Visualizer
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Explore your constitutional protections and statutory remedies under Indian law in plain, understandable language.
        </p>
      </div>

      {/* Scenario Search Bar */}
      <div className="max-w-2xl mx-auto relative">
        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search scenarios (e.g. 'security deposit', 'police custody', 'gratuity')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-card border-border focus-visible:ring-2 focus-visible:ring-gold-700 rounded-xl shadow-rest-card"
        />
      </div>

      {/* Category Tabs */}
      <Tabs
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full space-y-6"
      >
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 bg-forest-100 dark:bg-forest-800/80 p-1 rounded-xl h-auto gap-1">
          {categories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="text-xs font-semibold py-2 rounded-lg data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm"
            >
              {category.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 sm:p-6 space-y-1 shadow-rest-card">
              <h2 className="text-xl font-bold text-foreground font-heading">
                {category.title}
              </h2>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>

            {filteredRights.length > 0 ? (
              <Accordion type="single" collapsible className="space-y-3">
                {filteredRights.map((right) => (
                  <AccordionItem
                    key={right.id}
                    value={right.id}
                    className="bg-card border border-border rounded-xl px-5 sm:px-6 py-1 hover:border-forest-500 transition-colors shadow-rest-card"
                  >
                    <AccordionTrigger className="hover:no-underline py-4 text-left">
                      <div className="space-y-1 pr-4">
                        <div className="inline-block text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 border border-forest-500/20 mb-1">
                          {right.statute}
                        </div>
                        <h3 className="text-base font-bold text-foreground font-heading">
                          {right.title}
                        </h3>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="pt-2 pb-5 border-t border-border/60">
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {right.content}
                        </p>

                        <div className="flex items-center gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(right.id, right.content)}
                            className="h-8 text-xs flex items-center gap-1.5 border-border"
                          >
                            {copiedId === right.id ? (
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                            <span>Copy Text</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShare(right.title, right.content)}
                            className="h-8 text-xs flex items-center gap-1.5 border-border"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                            <span>Share</span>
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <div className="text-center py-12 bg-card border border-border rounded-xl space-y-2">
                <p className="text-base font-semibold text-foreground">
                  No rights matched "{searchQuery}"
                </p>
                <p className="text-sm text-muted-foreground">
                  Try broader search terms or switch categories.
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Free Legal Aid Callout Banner */}
      <div className="bg-forest-100 dark:bg-forest-800/60 border border-forest-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-forest-800 dark:text-forest-50 font-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-forest-800 dark:text-gold-500" />
            Entitled to 100% Free Legal Aid?
          </h3>
          <p className="text-xs sm:text-sm text-forest-500 dark:text-forest-100/80 max-w-xl leading-relaxed">
            Under Section 12 of the Legal Services Authorities Act, women, children, undertrials, and citizens earning under state thresholds receive free court representation.
          </p>
        </div>

        <Button
          asChild
          className="bg-forest-800 text-white hover:bg-forest-950 dark:bg-gold-500 dark:text-forest-950 dark:hover:bg-gold-500/90 shrink-0 font-medium text-xs sm:text-sm h-10 px-5 focus-visible:ring-2 focus-visible:ring-gold-700"
        >
          <Link href="/help">Find DLSA Clinics</Link>
        </Button>
      </div>
    </div>
  );
}
