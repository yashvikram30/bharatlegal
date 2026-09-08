"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSession } from "next-auth/react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { UserProfile } from "@/components/auth/user-profile";
import { LegalResourcesSidebar } from "@/components/legal-resources-sidebar";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  // Primary focused navigation
  const navItems = [
    ...(!session?.user ? [{ name: "Home", href: "/" }] : []),
    { name: "Legal Assistant", href: "/chat" },
    { name: "Case Tracker", href: "/dashboard" },
    { name: "Doc Simplifier", href: "/simplify" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 border-b ${
        isScrolled
          ? "bg-background/95 backdrop-blur-sm border-border shadow-rest-card"
          : "bg-background/70 backdrop-blur-sm border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center gap-2 font-heading font-extrabold text-xl text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-700 rounded-md"
            >
              <span className="w-8 h-8 rounded-lg bg-forest-800 dark:bg-forest-950 text-white flex items-center justify-center text-sm font-bold border border-gold-500/50">
                ⚖
              </span>
              <span>
                Legal<span className="text-gold-700 dark:text-gold-500">Ease</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`relative px-3.5 py-1.5 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-700 ${
                    isActive
                      ? "text-forest-950 dark:text-forest-50 bg-forest-100 dark:bg-forest-800 font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-forest-100/60 dark:hover:bg-forest-800/40"
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-forest-800 dark:bg-gold-500 rounded-full"
                      layoutId="navbar-indicator"
                      transition={{ type: "spring", duration: 0.4 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Legal Resources Hub Drawer + Theme Toggle + Auth */}
          <div className="flex items-center space-x-2">
            {/* Top-Right LegalEase Drawer Button */}
            <LegalResourcesSidebar />

            <ModeToggle />
            <UserProfile />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground hover:bg-forest-100 dark:hover:bg-forest-800"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.15 }}
            className="md:hidden border-b border-border bg-background px-4 py-4 space-y-1.5 shadow-hover-card"
          >
            <nav className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-forest-100 dark:bg-forest-800 text-forest-950 dark:text-forest-50 font-semibold"
                        : "text-muted-foreground hover:bg-forest-100/50 hover:text-foreground"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
