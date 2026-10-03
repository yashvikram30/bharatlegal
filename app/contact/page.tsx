"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { PageHeader, PageShell } from "@/components/page";

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
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Failed to submit feedback. Please try again.");
        return;
      }

      setSubmitted(true);
      toast.success(data.message || "Thank you! Your feedback has been received.");
      setFormData({ name: "", email: "", subject: "Feedback", message: "" });
    } catch (err) {
      console.error("Contact form error:", err);
      toast.error("Network error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Tell us what we got wrong, or what to add"
        description={
          <>
            Found a wrong section citation, a bug, or an Act we should cover? Write to us below. This form is for feedback about BharatLegal. For help with a legal problem, see{" "}
            <Link href="/help" className="font-semibold text-forest-800 underline underline-offset-2 dark:text-gold-400">
              free legal aid
            </Link>
            .
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Info Column */}
        <div className="md:col-span-5 space-y-5">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 space-y-5">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Other ways to reach us
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    General inquiries
                  </p>
                  <a href="mailto:support@bharatlegal.in" className="font-medium text-foreground underline-offset-2 hover:underline">
                    support@bharatlegal.in
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-forest-100 dark:bg-forest-800 text-forest-800 dark:text-forest-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    Location
                  </p>
                  <p className="font-medium text-foreground">
                    New Delhi, India
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-forest-100/60 dark:bg-forest-800/40 border border-forest-500/20 text-sm text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-700 dark:text-gold-500" />
                Open to contributors
              </p>
              <p>
                BharatLegal welcomes law students, advocates, and developers interested in improving public legal literacy.
              </p>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className="md:col-span-7">
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            {submitted ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h2 className="font-display text-xl font-semibold text-foreground">
                  Message sent
                </h2>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Thank you. We review every submission and fix citation errors first.
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
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label htmlFor="contact-name" className="text-sm font-semibold text-foreground">
                    Your name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="contact-name"
                    required
                    autoComplete="name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background border-border focus-visible:ring-2 focus-visible:ring-gold-700"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-email" className="text-sm font-semibold text-foreground">
                    Email address <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="contact-email"
                    required
                    autoComplete="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-background border-border focus-visible:ring-2 focus-visible:ring-gold-700"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="contact-category" className="text-sm font-semibold text-foreground">
                    Category
                  </label>
                  <select
                    id="contact-category"
                    className="w-full h-10 px-3 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold-700"
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
                  <label htmlFor="contact-message" className="text-sm font-semibold text-foreground">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="What should we know? Include the page and the section if it’s a citation."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-background border-border focus-visible:ring-2 focus-visible:ring-gold-700 text-sm"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-forest-800 text-white hover:bg-forest-950 dark:bg-gold-500 dark:text-forest-950 dark:hover:bg-gold-500/90 font-medium h-10 focus-visible:ring-2 focus-visible:ring-gold-700 mt-2"
                >
                  {isSubmitting ? (
                    "Sending…"
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" /> Send feedback
                    </span>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
