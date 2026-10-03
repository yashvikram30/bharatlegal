"use client";

import type React from "react";
import { Inter, Outfit, Literata, Noto_Serif_Devanagari } from "next/font/google";

import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Toaster } from "react-hot-toast";
import AuthProvider from "../context/AuthProvider";
import { QuickConsultationProvider } from "@/context/QuickConsultationContext";
import { QuickConsultationDrawer } from "@/components/chat/quick-consultation-drawer";
import { FloatingChatTrigger } from "@/components/chat/floating-chat-trigger";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const devanagari = Noto_Serif_Devanagari({
  subsets: ["devanagari"],
  weight: ["500", "600"],
  variable: "--font-devanagari",
  display: "swap",
});

import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isChatRoute = pathname === "/chat";

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${outfit.variable} ${literata.variable} ${devanagari.variable}`}
    >
      <AuthProvider>
        <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-amber-500/20 selection:text-amber-900 dark:selection:text-amber-200">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <QuickConsultationProvider>
              <div className={`flex min-h-screen flex-col ${isChatRoute ? "h-screen overflow-hidden" : ""}`}>
                <a
                  href="#main-content"
                  className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-forest-800 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
                >
                  Skip to content
                </a>
                <Navbar />
                <main id="main-content" className={`flex-1 ${isChatRoute ? "h-[calc(100vh-4rem)] overflow-hidden" : ""}`}>
                  <div
                    key={pathname}
                    className={`animate-in fade-in duration-200 motion-reduce:animate-none ${isChatRoute ? "h-full" : ""}`}
                  >
                    {children}
                  </div>
                </main>
                {!isChatRoute && <Footer />}
              </div>

              {/* Floating Bottom-Right Chatbot Trigger (hidden on /chat) */}
              <FloatingChatTrigger />

              {/* In-Context AI Consultation Drawer */}
              <QuickConsultationDrawer />

              <Toaster
                position="top-right"
                toastOptions={{
                  className: "border border-border bg-card text-card-foreground shadow-lg text-sm rounded-lg",
                }}
              />
            </QuickConsultationProvider>
          </ThemeProvider>
        </body>
      </AuthProvider>
    </html>
  );
}
