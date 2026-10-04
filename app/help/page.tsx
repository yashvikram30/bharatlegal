"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Search,
  ShieldCheck,
  Globe,
  ExternalLink,
  CheckCircle2,
  Clock,
  Languages,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EmptyState, PageHeader, PageShell } from "@/components/page";

type LegalHelpProvider = {
  id: string;
  name: string;
  type: "DLSA / Government" | "State Legal Aid" | "High Court Committee" | "Consumer Forum";
  specialization: string[];
  city: string;
  state: string;
  languages: string[];
  phone: string;
  email: string;
  website: string;
  hours: string;
  address: string;
};

/** "1516 (24/7 Toll-Free) / 011-23384775" -> [{ number: "1516", note: "24/7 Toll-Free", tel: "1516" }, ...] */
function parsePhones(value: string) {
  return value.split(" / ").flatMap((part) => {
    const m = part.match(/^([\d][\d\s-]*)(?:\((.*)\))?\s*$/);
    if (!m) return [];
    return [{ number: m[1].trim(), note: m[2]?.trim() ?? "", tel: m[1].replace(/[^\d]/g, "") }];
  });
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const providers: LegalHelpProvider[] = [
    {
      id: "1",
      name: "Delhi State Legal Services Authority (DSLSA)",
      type: "DLSA / Government",
      specialization: ["Free Court Representation", "Lok Adalat", "Victim Compensation", "Mediation"],
      city: "New Delhi",
      state: "Delhi",
      languages: ["Hindi", "English", "Punjabi", "Urdu"],
      phone: "1516 (24/7 Toll-Free) / 011-23384775",
      email: "dslsa-phc@nic.in",
      website: "https://dslsa.org",
      hours: "Mon-Sat, 9:30 AM - 5:30 PM (Toll-free 24/7)",
      address: "Central Office, Patiala House Courts Complex, New Delhi - 110001",
    },
    {
      id: "2",
      name: "Maharashtra State Legal Services Authority (MSLSA)",
      type: "State Legal Aid",
      specialization: ["Criminal Legal Aid", "Women & Child Assistance", "Prison Legal Aid Clinics"],
      city: "Mumbai",
      state: "Maharashtra",
      languages: ["Marathi", "Hindi", "English"],
      phone: "022-22691358 / 1516",
      email: "mslsa-bhc@nic.in",
      website: "https://legalservices.maharashtra.gov.in",
      hours: "Mon-Fri, 10:00 AM - 5:00 PM",
      address: "PWD Building, High Court Campus, Fort, Mumbai - 400032",
    },
    {
      id: "3",
      name: "Karnataka State Legal Services Authority (KSLSA)",
      type: "DLSA / Government",
      specialization: ["Property Disputes", "Labour & Wage Claims", "Free Advocate Allotment"],
      city: "Bengaluru",
      state: "Karnataka",
      languages: ["Kannada", "English", "Tamil", "Telugu"],
      phone: "080-22111725 / 1516",
      email: "kslsa.kar@nic.in",
      website: "https://kslsa.kar.nic.in",
      hours: "Mon-Sat, 10:00 AM - 5:00 PM",
      address: "Nyaya Degula, 1st Floor, H. Siddaiah Road, Bengaluru - 560027",
    },
    {
      id: "4",
      name: "Tamil Nadu State Legal Services Authority (TNSLSA)",
      type: "State Legal Aid",
      specialization: ["Senior Citizens Legal Aid", "Motor Accident Claims", "Family Counseling"],
      city: "Chennai",
      state: "Tamil Nadu",
      languages: ["Tamil", "English"],
      phone: "044-25342441 / 1516",
      email: "tnslsa@gmail.com",
      website: "https://tnslsa.gov.in",
      hours: "Mon-Fri, 9:30 AM - 5:30 PM",
      address: "North Fort Road, High Court Campus, Chennai - 600104",
    },
    {
      id: "5",
      name: "West Bengal State Legal Services Authority (WBSLSA)",
      type: "DLSA / Government",
      specialization: ["Undertrial Prisoner Aid", "Consumer Mediation", "Free Legal Counsel"],
      city: "Kolkata",
      state: "West Bengal",
      languages: ["Bengali", "Hindi", "English"],
      phone: "033-22483892 / 1516",
      email: "wbstatelegal@gmail.com",
      website: "https://wbslsa.gov.in",
      hours: "Mon-Fri, 10:00 AM - 5:00 PM",
      address: "City Civil Court Building, 2&3 Kiran Sankar Roy Road, Kolkata - 700001",
    },
    {
      id: "6",
      name: "Telangana State Legal Services Authority (TSLSA)",
      type: "State Legal Aid",
      specialization: ["Dispute Mediation", "Tribal Rights", "Domestic Violence Legal Aid"],
      city: "Hyderabad",
      state: "Telangana",
      languages: ["Telugu", "Urdu", "Hindi", "English"],
      phone: "040-23446704 / 1516",
      email: "telanganaslsa@gmail.com",
      website: "https://tslsa.telangana.gov.in",
      hours: "Mon-Sat, 10:00 AM - 5:00 PM",
      address: "Nyaya Seva Sadan, High Court Premises, Hyderabad - 500066",
    },
  ];

  const states = Array.from(new Set(providers.map((p) => p.state)));

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.specialization.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesState = stateFilter === "all" || p.state === stateFilter;
    const matchesType = typeFilter === "all" || p.type === typeFilter;

    return matchesSearch && matchesState && matchesType;
  });

  const isFiltered = searchQuery !== "" || stateFilter !== "all" || typeFilter !== "all";
  const clearFilters = () => {
    setSearchQuery("");
    setStateFilter("all");
    setTypeFilter("all");
  };

  return (
    <PageShell>
      <PageHeader
        title="Find free legal aid near you"
        description="Reach the official District and State Legal Services Authorities, which offer free legal advice, court representation, and mediation. Not sure where to start? Call the national helpline."
        actions={
          <Button asChild size="lg">
            <a href="tel:15100" className="flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden="true" />
              Call 15100
            </a>
          </Button>
        }
      />

      {/* Eligibility: useful, but not what most people come here to do first */}
      <Accordion type="single" collapsible>
        <AccordionItem value="eligibility" className="rounded-2xl border border-border bg-card px-5 sm:px-6">
          <AccordionTrigger className="gap-3 py-4 text-left hover:no-underline">
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-forest-100 text-forest-800 dark:bg-forest-800 dark:text-forest-100">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="font-display text-lg font-semibold text-foreground">Who can get free legal aid?</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pb-5 pt-1">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Under Section 12 of the <em>Legal Services Authorities Act, 1987</em>, free legal aid (including advocate fees and court fee exemption) is guaranteed by the Constitution of India for:
            </p>
            <ul className="grid grid-cols-1 gap-3 text-sm font-medium text-foreground sm:grid-cols-2 md:grid-cols-3">
              {[
                "Women and children",
                "Members of SC / ST communities",
                "People in custody or awaiting trial",
                "Industrial workers and labourers",
                "Victims of trafficking or disaster",
                "Income below your state’s limit",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-forest-800 dark:text-gold-500" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Find an office */}
      <section aria-labelledby="offices-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="offices-heading" className="font-display text-xl font-semibold text-foreground sm:text-2xl">
            Legal aid offices
          </h2>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {filteredProviders.length} of {providers.length}
            {isFiltered && (
              <>
                {" "}
                <button type="button" onClick={clearFilters} className="font-semibold text-foreground underline underline-offset-2">
                  Clear filters
                </button>
              </>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <div className="relative md:col-span-6">
            <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              aria-label="Search legal aid offices"
              placeholder="Search by state, city, or service"
              className="h-11 bg-card pl-9 text-base sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:col-span-3">
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger aria-label="Filter by state" className="h-11 bg-card">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All states</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger aria-label="Filter by type of office" className="h-11 bg-card">
                <SelectValue placeholder="Type of office" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="DLSA / Government">DLSA / Government</SelectItem>
                <SelectItem value="State Legal Aid">State Legal Aid Authorities</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredProviders.length > 0 ? (
            filteredProviders.map((provider) => {
              const phones = parsePhones(provider.phone);
              return (
                <article key={provider.id} className="space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <header>
                    <p className="text-sm font-medium text-muted-foreground">
                      {provider.type} · {provider.city}, {provider.state}
                    </p>
                    <h3 className="mt-1 font-display text-xl font-semibold text-foreground">{provider.name}</h3>
                    <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-forest-800 dark:text-gold-500" aria-hidden="true" />
                      {provider.address}
                    </p>
                  </header>

                  <div className="flex flex-wrap gap-2">
                    {phones.map((ph, i) => (
                      <Button key={ph.tel} asChild size="sm" variant={i === 0 ? "default" : "outline"} className="gap-1.5">
                        <a href={`tel:${ph.tel}`}>
                          <Phone className="h-4 w-4" aria-hidden="true" />
                          Call {ph.number}
                          {ph.note && <span className="font-normal opacity-80">({ph.note})</span>}
                        </a>
                      </Button>
                    ))}
                    <Button asChild size="sm" variant="outline" className="gap-1.5">
                      <a href={`mailto:${provider.email}`}>
                        <Mail className="h-4 w-4" aria-hidden="true" />
                        Email
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="gap-1.5">
                      <a href={provider.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4" aria-hidden="true" />
                        Official website
                        <ExternalLink className="h-3.5 w-3.5 opacity-70" aria-hidden="true" />
                      </a>
                    </Button>
                  </div>

                  <dl className="grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="font-semibold text-foreground">Help available</dt>
                      <dd className="mt-1.5 flex flex-wrap gap-1.5">
                        {provider.specialization.map((spec) => (
                          <span key={spec} className="rounded-full bg-secondary px-2.5 py-1 text-sm text-secondary-foreground">
                            {spec}
                          </span>
                        ))}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Languages className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        Languages
                      </dt>
                      <dd className="mt-1 text-muted-foreground">{provider.languages.join(", ")}</dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1.5 font-semibold text-foreground">
                        <Clock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                        Hours
                      </dt>
                      <dd className="mt-1 text-muted-foreground">{provider.hours}</dd>
                    </div>
                  </dl>
                </article>
              );
            })
          ) : (
            <EmptyState
              icon={Search}
              title="No offices match your search"
              description="Clear a filter, or call the national legal-aid helpline on 15100 and they will point you to the right office."
              action={
                <Button variant="outline" onClick={clearFilters}>
                  Clear search and filters
                </Button>
              }
            />
          )}
        </div>
      </section>

      {/* National helplines */}
      <section aria-labelledby="helplines-heading" className="space-y-3 rounded-2xl bg-forest-950 p-6 text-forest-50 sm:p-8">
        <h2 id="helplines-heading" className="font-display text-xl font-semibold text-white">
          National helplines
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "NALSA national helpline", numbers: ["15100"], note: "Free legal aid, toll-free", accent: true },
            { label: "Women in distress", numbers: ["1091", "181"], note: "National Commission for Women", accent: false },
            { label: "National consumer helpline", numbers: ["1915"], note: "Ministry of Consumer Affairs", accent: false },
          ].map((h) => (
            <li key={h.label} className="rounded-xl border border-forest-500/30 bg-forest-800/80 p-4">
              <p className="text-sm text-forest-100/80">{h.label}</p>
              <p className={`mt-1 font-mono text-xl font-bold ${h.accent ? "text-gold-400" : "text-white"}`}>
                {h.numbers.map((n, i) => (
                  <span key={n}>
                    {i > 0 && " / "}
                    <a href={`tel:${n}`} className="hover:underline">
                      {n}
                    </a>
                  </span>
                ))}
              </p>
              <p className="mt-1 text-sm text-forest-100/70">{h.note}</p>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
