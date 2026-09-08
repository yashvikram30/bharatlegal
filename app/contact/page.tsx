"use client";

import { useState } from "react";
import { Mail, MessageSquare, Send, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Feedback",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setIsSubmitting(false);
    setSubmitted(true);
    toast.success("Thank you! Your feedback has been received.");
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 border border-forest-500/20">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Feedback & Support</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-heading">
          Contact & Legal Research Feedback
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Found an error in statutory section citations, or want to suggest additional Indian acts to index? We value your input.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Info Column */}
        <div className="md:col-span-5 space-y-5">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 space-y-5 shadow-rest-card">
            <h2 className="text-lg font-bold text-foreground font-heading">
              Support Channels
            </h2>
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    General Inquiries
                  </p>
                  <p className="font-medium text-foreground">
                    support@legalease.in
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Location
                  </p>
                  <p className="font-medium text-foreground">
                    New Delhi, India
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-forest-100/60 dark:bg-forest-800/40 border border-forest-500/20 text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-700 dark:text-gold-500" />
                Open Source & Legal Research
              </p>
              <p>
                LegalEase welcomes law students, advocates, and developers interested in improving public legal literacy.
              </p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-7">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-rest-card">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-foreground font-heading">
                  Message Received
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
                  Thank you for contributing to Indian legal awareness. We review submissions regularly.
                </p>
                <Button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "Feedback", message: "" });
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Your Name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Adv. Rajesh Verma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background border-border focus-visible:ring-2 focus-visible:ring-gold-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-background border-border focus-visible:ring-2 focus-visible:ring-gold-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Category
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-gold-700"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  >
                    <option value="Feedback">General Feedback</option>
                    <option value="Citation Correction">Statutory Citation Correction</option>
                    <option value="Bug Report">Technical Bug Report</option>
                    <option value="Feature Request">Feature Request</option>
                    <option value="Collaboration">Legal Aid / Pro-Bono Collaboration</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    required
                    rows={4}
                    placeholder="Describe your feedback, statutory citation note, or suggestion..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-background border-border focus-visible:ring-2 focus-visible:ring-gold-700 text-xs sm:text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-forest-800 text-white hover:bg-forest-950 dark:bg-gold-500 dark:text-forest-950 dark:hover:bg-gold-500/90 font-medium h-10 focus-visible:ring-2 focus-visible:ring-gold-700 mt-2"
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" /> Submit Feedback
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
