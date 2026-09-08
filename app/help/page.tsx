"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Search,
  Building2,
  ShieldCheck,
  Globe,
  ExternalLink,
  CheckCircle2,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 max-w-5xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 border border-forest-500/20">
          <Building2 className="w-3.5 h-3.5" />
          <span>Government & Free Legal Aid Directory</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground font-heading tracking-tight">
          Find Legal Aid in India
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Connect with official District & State Legal Services Authorities (DLSA / SLSA) offering free legal counsel, court representation, and mediation across India.
        </p>
      </div>

      {/* Statutory Section 12 Criteria Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 space-y-4 shadow-rest-card">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-foreground font-heading">
              Who is Entitled to 100% Free Legal Aid in India?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Under Section 12 of the <em>Legal Services Authorities Act, 1987</em>, free legal aid (including advocate fees and court fee exemption) is guaranteed by the Constitution of India for:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1 text-xs text-foreground font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-800 dark:text-gold-500 shrink-0" />
                Women and Children
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-800 dark:text-gold-500 shrink-0" />
                Members of SC / ST Communities
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-800 dark:text-gold-500 shrink-0" />
                Persons in Custody / Undertrials
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-800 dark:text-gold-500 shrink-0" />
                Industrial Workmen / Labourers
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-800 dark:text-gold-500 shrink-0" />
                Victims of Trafficking or Disaster
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-forest-800 dark:text-gold-500 shrink-0" />
                Annual Income below State Thresholds
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-rest-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by state, city, or service..."
              className="pl-9 bg-background border-border focus-visible:ring-2 focus-visible:ring-gold-700"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="md:col-span-3">
            <Select value={stateFilter} onValueChange={setStateFilter}>
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
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
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="Service Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Service Types</SelectItem>
                <SelectItem value="DLSA / Government">DLSA / Government</SelectItem>
                <SelectItem value="State Legal Aid">State Legal Aid Authorities</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Providers Directory List */}
      <div className="space-y-4">
        {filteredProviders.length > 0 ? (
          filteredProviders.map((provider) => (
            <div
              key={provider.id}
              className="bg-card border border-border rounded-xl p-5 sm:p-6 hover:border-forest-500 hover:shadow-hover-card transition-all duration-200 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 border border-forest-500/20 mb-1.5 inline-block">
                    {provider.type}
                  </span>
                  <h3 className="text-lg sm:text-xl font-bold text-foreground font-heading">
                    {provider.name}
                  </h3>
                </div>

                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs shrink-0 border-border self-start sm:self-center"
                >
                  <a href={provider.website} target="_blank" rel="noreferrer" className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Official Portal <ExternalLink className="w-3 h-3" />
                  </a>
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="space-y-2 text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-forest-800 dark:text-gold-500 shrink-0 mt-0.5" />
                    <span>{provider.address}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-forest-800 dark:text-gold-500 shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground">{provider.phone}</span>
                  </div>

                  <div className="flex items-start gap-2">
                    <Mail className="w-4 h-4 text-forest-800 dark:text-gold-500 shrink-0 mt-0.5" />
                    <span>{provider.email}</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      Key Services
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {provider.specialization.map((spec) => (
                        <span
                          key={spec}
                          className="text-[11px] px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                      Operational Hours & Helpline
                    </p>
                    <p className="text-xs text-muted-foreground">{provider.hours}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-card border border-border rounded-xl space-y-2">
            <p className="text-base font-semibold text-foreground">
              No legal aid authorities found matching criteria
            </p>
            <p className="text-sm text-muted-foreground">
              Call the national toll-free helpline at <strong>1516</strong> for immediate direction.
            </p>
          </div>
        )}
      </div>

      {/* Emergency Helpline Box */}
      <div className="bg-forest-950 text-forest-50 border border-forest-900 rounded-2xl p-6 sm:p-8 space-y-3">
        <h3 className="text-lg font-bold text-white font-heading">
          National Emergency Legal Aid Contact Numbers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm pt-1">
          <div className="p-3.5 rounded-xl bg-forest-800/80 border border-forest-500/30 space-y-0.5">
            <p className="text-forest-100/70 text-xs">NALSA National Helpline</p>
            <p className="text-base font-bold text-gold-500 font-mono">1516</p>
            <p className="text-[11px] text-forest-100/60">24/7 Toll-Free Legal Aid</p>
          </div>
          <div className="p-3.5 rounded-xl bg-forest-800/80 border border-forest-500/30 space-y-0.5">
            <p className="text-forest-100/70 text-xs">Women in Distress</p>
            <p className="text-base font-bold text-white font-mono">1091 / 181</p>
            <p className="text-[11px] text-forest-100/60">National Commission for Women</p>
          </div>
          <div className="p-3.5 rounded-xl bg-forest-800/80 border border-forest-500/30 space-y-0.5">
            <p className="text-forest-100/70 text-xs">National Consumer Helpline</p>
            <p className="text-base font-bold text-white font-mono">1915</p>
            <p className="text-[11px] text-forest-100/60">Ministry of Consumer Affairs</p>
          </div>
        </div>
      </div>
    </div>
  );
}
