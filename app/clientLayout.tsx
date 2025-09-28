"use client"

import type React from "react"

import { Inter } from "next/font/google"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

import { ThemeProvider } from "@/components/theme-provider"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Toaster } from "react-hot-toast"
import AuthProvider from '../context/AuthProvider';

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
        <div className={`${inter.className} flex min-h-screen flex-col bg-background`}>
          <Navbar />
          <main className="flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}
