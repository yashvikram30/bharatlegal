import type React from "react";
import type { Metadata, Viewport } from "next";
import ClientLayout from "./clientLayout";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://bharatlegal.in";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#060A17" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BharatLegal — Simplifying Legal Access for All Indians",
    template: "%s | BharatLegal",
  },
  description:
    "Empowering Indian citizens with AI-powered legal assistance, plain-language rights explanations, statutory citations (BNS/CrPC), real-time case tracking, and intelligent document simplification.",
  keywords: [
    "BharatLegal",
    "Bharat Legal",
    "Indian Law AI",
    "Bharatiya Nyaya Sanhita",
    "BNS",
    "CrPC",
    "BNSS",
    "Case Tracker India",
    "Legal Document Simplifier",
    "Know Your Rights India",
    "Free Legal Aid",
    "Consumer Court Guidance",
  ],
  authors: [{ name: "BharatLegal Team" }],
  creator: "BharatLegal",
  publisher: "BharatLegal",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "BharatLegal",
    title: "BharatLegal — Simplifying Legal Access for All Indians",
    description:
      "Demystifying the Indian justice system through AI-powered assistance, statutory grounding, case tracking, and document simplification.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BharatLegal — Simplifying Legal Access for All Indians",
    description:
      "AI-powered legal assistance, plain-language statutory explanations, and case tracking for Indian citizens.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClientLayout>
      {children}
      <Analytics />
    </ClientLayout>
  );
}