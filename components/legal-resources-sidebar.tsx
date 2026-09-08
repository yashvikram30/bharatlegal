"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Scale,
  Search,
  Building2,
  Info,
  Copy,
  CheckCheck,
  Phone,
  Globe,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Gavel,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  rights: Right[];
};

const rightsCategories: RightCategory[] = [
  {
    id: "arrest",
    title: "Arrest & Custody",
    rights: [
      {
        id: "r1",
        title: "Right to Know Grounds of Arrest",
        statute: "Sec 50(1) CrPC / Sec 47 BNSS",
        content:
          "The police officer must immediately inform you of the full particulars of the offence and exact grounds of arrest, including bail eligibility.",
      },
      {
        id: "r2",
        title: "Advocate Access During Interrogation",
        statute: "Art 22(1) Constitution & Sec 41D CrPC / Sec 38 BNSS",
        content:
          "You are legally entitled to meet and consult an advocate of your choice during police interrogation.",
      },
      {
        id: "r3",
        title: "Magistrate Production Within 24 Hours",
        statute: "Art 22(2) Constitution & Sec 57 CrPC / Sec 58 BNSS",
        content:
          "Detention beyond 24 hours without express judicial order from the nearest Magistrate is unconstitutional and illegal.",
      },
      {
        id: "r4",
        title: "Mandatory Medical Examination",
        statute: "Sec 54 CrPC / Sec 53 BNSS",
        content:
          "You have the right to request a certified medical examination to record physical condition and any custodial injuries.",
      },
    ],
  },
  {
    id: "tenancy",
    title: "Tenancy & Lease",
    rights: [
      {
        id: "r5",
        title: "Security Deposit Refund Within 30 Days",
        statute: "Model Tenancy Act / Rent Control Acts",
        content:
          "Landlord must return the security deposit within 30 days of vacating after agreed verifiable deductions.",
      },
      {
        id: "r6",
        title: "Protection Against Utility Cut-off",
        statute: "Sec 14 Model Tenancy Act",
        content:
          "Landlord cannot disconnect electricity or water supply or forcefully evict without an order from the Rent Court.",
      },
      {
        id: "r7",
        title: "24-Hour Prior Entry Notice",
        statute: "Transfer of Property Act, 1882",
        content:
          "Landlord must provide at least 24 hours prior notice before entering the premises for repairs or inspection.",
      },
    ],
  },
  {
    id: "consumer",
    title: "Consumer Rights",
    rights: [
      {
        id: "r8",
        title: "Product & Service Liability Claims",
        statute: "Sec 82-87 Consumer Protection Act, 2019",
        content:
          "Manufacturers and sellers are strictly liable to compensate for harm or financial loss caused by defective goods or deficient services.",
      },
      {
        id: "r9",
        title: "Right to File via e-Daakhil",
        statute: "Sec 35 Consumer Protection Act, 2019",
        content:
          "Consumers can e-file complaints before the District Consumer Commission for claims up to ₹50 Lakhs without physical court visits.",
      },
    ],
  },
  {
    id: "workplace",
    title: "Workplace & Labour",
    rights: [
      {
        id: "r10",
        title: "Blanket Non-Compete Clauses are Void",
        statute: "Sec 27 Indian Contract Act, 1872",
        content:
          "Agreements restraining an employee from exercising a lawful profession post-employment are legally void in India.",
      },
      {
        id: "r11",
        title: "Gratuity Entitlement After 5 Years",
        statute: "Payment of Gratuity Act, 1972",
        content:
          "Continuous service of 5 years guarantees statutory gratuity of 15 days wages per completed year.",
      },
    ],
  },
];

const legalAidCenters = [
  {
    name: "Delhi State Legal Services Authority (DSLSA)",
    state: "Delhi",
    phone: "1516 (24/7 Toll-Free) / 011-23384775",
    website: "https://dslsa.org",
    coverage: "Free Court Representation, Lok Adalat, Mediation",
  },
  {
    name: "Maharashtra State Legal Services Authority (MSLSA)",
    state: "Maharashtra",
    phone: "022-22691358 / 1516",
    website: "https://legalservices.maharashtra.gov.in",
    coverage: "High Court & District Court Legal Aid",
  },
  {
    name: "Karnataka State Legal Services Authority (KSLSA)",
    state: "Karnataka",
    phone: "080-22111725 / 1516",
    website: "https://kslsa.kar.nic.in",
    coverage: "Free Advocate Allocation & Lok Adalat",
  },
  {
    name: "Tamil Nadu State Legal Services Authority (TNSLSA)",
    state: "Tamil Nadu",
    phone: "044-25342441 / 1516",
    website: "https://tnslsa.gov.in",
    coverage: "Free Legal Aid & Counseling",
  },
  {
    name: "West Bengal State Legal Services Authority (WBSLSA)",
    state: "West Bengal",
    phone: "033-22483892 / 1516",
    website: "https://wbslsa.gov.in",
    coverage: "District Clinics & Undertrial Defense",
  },
];

export function LegalResourcesSidebar() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("rights");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied statutory right");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allRights = rightsCategories.flatMap((c) => c.rights);
  const filteredRights = allRights.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.statute.toLowerCase().includes(q) ||
      r.content.toLowerCase().includes(q)
    );
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 bg-forest-100 dark:bg-forest-800/80 border-forest-500/30 text-forest-800 dark:text-forest-100 hover:bg-forest-800 hover:text-white dark:hover:bg-gold-500 dark:hover:text-forest-950 text-xs font-semibold flex items-center gap-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-gold-700 shadow-rest-card"
        >
          <span className="w-4 h-4 rounded bg-forest-800 dark:bg-gold-500 text-white dark:text-forest-950 flex items-center justify-center text-[10px] font-bold">
            ⚖
          </span>
          <span className="font-heading">LegalEase</span>
          <span className="text-[10px] font-mono opacity-60">Menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md md:max-w-lg p-0 flex flex-col bg-background border-l border-border shadow-hover-card"
      >
        <SheetHeader className="p-5 pb-3 border-b border-border bg-card/60">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-forest-800 text-white flex items-center justify-center text-xs font-bold border border-gold-500/50">
              ⚖
            </span>
            <SheetTitle className="text-lg font-bold font-heading text-foreground">
              Legal<span className="text-gold-700 dark:text-gold-500">Ease</span> Hub
            </SheetTitle>
          </div>
        </SheetHeader>

        {/* Multi-Tab Navigation in Drawer */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-5 pt-3 pb-2 bg-card/40 border-b border-border">
            <TabsList className="grid grid-cols-3 w-full bg-forest-100 dark:bg-forest-800 h-9 p-0.5 rounded-lg">
              <TabsTrigger
                value="rights"
                className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                <Scale className="w-3.5 h-3.5 mr-1" /> Rights
              </TabsTrigger>
              <TabsTrigger
                value="help"
                className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                <Building2 className="w-3.5 h-3.5 mr-1" /> Legal Aid
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                <Info className="w-3.5 h-3.5 mr-1" /> About
              </TabsTrigger>
            </TabsList>
          </div>

          {/* TAB 1: RIGHTS VISUALIZER */}
          <TabsContent value="rights" className="flex-1 overflow-hidden m-0 p-0 flex flex-col">
            <div className="p-4 border-b border-border bg-background">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search rights (e.g. deposit, arrest, non-compete)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-xs bg-card border-border focus-visible:ring-1 focus-visible:ring-gold-700"
                />
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3 pb-6">
                <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
                  <span>Showing {filteredRights.length} provisions</span>
                  <Link
                    href="/rights"
                    onClick={() => setOpen(false)}
                    className="text-gold-700 dark:text-gold-500 hover:underline font-medium flex items-center gap-1"
                  >
                    Full Page <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <Accordion type="single" collapsible className="space-y-2.5">
                  {filteredRights.map((right) => (
                    <AccordionItem
                      key={right.id}
                      value={right.id}
                      className="bg-card border border-border rounded-xl px-4 py-0.5 hover:border-forest-500 shadow-rest-card"
                    >
                      <AccordionTrigger className="hover:no-underline py-3 text-left">
                        <div className="space-y-0.5 pr-2">
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 border border-forest-500/20 inline-block mb-1">
                            {right.statute}
                          </span>
                          <h4 className="text-xs sm:text-sm font-bold text-foreground font-heading">
                            {right.title}
                          </h4>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-1 pb-3 text-xs text-muted-foreground space-y-2 border-t border-border/40">
                        <p className="leading-relaxed">{right.content}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(right.id, `${right.title}: ${right.content}`)}
                          className="h-7 text-[11px] flex items-center gap-1 mt-1 border-border"
                        >
                          {copiedId === right.id ? (
                            <CheckCheck className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          <span>Copy Right</span>
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* TAB 2: FIND LEGAL AID */}
          <TabsContent value="help" className="flex-1 overflow-hidden m-0 p-0 flex flex-col">
            <ScrollArea className="flex-1 p-4 space-y-4">
              <div className="space-y-4 pb-6">
                {/* 24/7 Helpline Banner */}
                <div className="p-3.5 rounded-xl bg-forest-950 text-forest-50 border border-forest-900 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gold-500 uppercase tracking-wider">
                      National Free Legal Helpline
                    </p>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-forest-800 text-white font-mono">
                      24/7 Free
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gold-500" />
                    <span className="text-lg font-extrabold font-mono text-white">1516</span>
                  </div>
                  <p className="text-[11px] text-forest-100/70 leading-tight">
                    National Legal Services Authority (NALSA) government legal assistance.
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground uppercase tracking-wider text-[11px]">
                    State Authorities (DLSA / SLSA)
                  </span>
                  <Link
                    href="/help"
                    onClick={() => setOpen(false)}
                    className="text-gold-700 dark:text-gold-500 hover:underline font-medium flex items-center gap-1"
                  >
                    Directory <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>

                <div className="space-y-2.5">
                  {legalAidCenters.map((center) => (
                    <div
                      key={center.name}
                      className="bg-card border border-border rounded-xl p-3.5 space-y-2 hover:border-forest-500 transition-colors shadow-rest-card"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-bold text-foreground font-heading">
                          {center.name}
                        </h4>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 shrink-0">
                          {center.state}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{center.coverage}</p>
                      <div className="flex items-center justify-between pt-1 border-t border-border text-xs">
                        <span className="text-muted-foreground font-mono text-[11px]">
                          📞 {center.phone.split(" / ")[0]}
                        </span>
                        <a
                          href={center.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-gold-700 dark:text-gold-500 hover:underline text-[11px] flex items-center gap-1"
                        >
                          Portal <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          {/* TAB 3: ABOUT LEAGALEASE */}
          <TabsContent value="about" className="flex-1 overflow-hidden m-0 p-0 flex flex-col">
            <ScrollArea className="flex-1 p-4 space-y-4">
              <div className="space-y-4 pb-6">
                <div className="bg-card border border-border rounded-xl p-4 space-y-2.5 shadow-rest-card">
                  <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-forest-800 dark:text-gold-500" />
                    <h3 className="text-sm font-bold text-foreground font-heading">
                      Our Mission
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Democratizing legal literacy for 1.4B Indian citizens. We bridge the gap between statutory jargon and everyday citizens by providing plain-language explanations grounded in authentic Indian statutes.
                  </p>
                </div>

                <div className="bg-card border border-border rounded-xl p-4 space-y-2 shadow-rest-card text-xs">
                  <h4 className="font-bold text-foreground font-heading flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-forest-800 dark:text-gold-500" />
                    Statutory Grounding
                  </h4>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li>• Bharatiya Nyaya Sanhita (BNS) & BNSS / CrPC</li>
                    <li>• Consumer Protection Act, 2019</li>
                    <li>• Model Tenancy Act & State Rent Laws</li>
                    <li>• Right to Information (RTI) Act, 2005</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-forest-100 dark:bg-forest-900/60 border border-forest-500/20 text-[11px] text-muted-foreground space-y-1">
                  <p className="font-semibold text-foreground">Good-Faith Disclaimer</p>
                  <p>
                    LegalEase provides educational legal information and does not create an advocate-client relationship under the Advocates Act, 1961.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="text-xs h-8">
                    <Link href="/about" onClick={() => setOpen(false)}>
                      About Story
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="text-xs h-8">
                    <Link href="/contact" onClick={() => setOpen(false)}>
                      Contact Us
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="text-xs h-8">
                    <Link href="/privacy" onClick={() => setOpen(false)}>
                      Privacy Policy
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="text-xs h-8">
                    <Link href="/terms" onClick={() => setOpen(false)}>
                      Terms
                    </Link>
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
