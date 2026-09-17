"use client";

import type React from "react";
import { Inter, Outfit } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";

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
      className={`${inter.variable} ${outfit.variable}`}
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
                <Navbar />
                <main className={`flex-1 ${isChatRoute ? "h-[calc(100vh-4rem)] overflow-hidden" : ""}`}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={isChatRoute ? "h-full" : ""}
                    >
                      {children}
                    </motion.div>
                  </AnimatePresence>
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
