"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Scale, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { UserProfile } from "@/components/auth/user-profile";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // Core features
  const navItems = [
    { name: "Ask AI", href: "/chat" },
    { name: "Case Tracker", href: "/dashboard" },
    { name: "My Matters", href: "/matters" },
    { name: "Rights", href: "/rights" },
    { name: "Simplifier", href: "/simplify" },
    { name: "Drafter", href: "/draft" },
    { name: "Legal Help", href: "/help" },
  ];

  const isActiveRoute = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Give the bar a soft edge once content scrolls underneath it.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Let keyboard users dismiss the mobile drawer with Escape.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-forest-100 bg-forest-50/95 backdrop-blur supports-[backdrop-filter]:bg-forest-50/85 dark:border-forest-900/60 dark:bg-forest-950/95 dark:supports-[backdrop-filter]:bg-forest-950/85 transition-shadow duration-200 ${
        scrolled ? "shadow-[0_8px_24px_-16px_rgba(15,43,32,0.35)]" : "shadow-none"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Left: Logo/emblem + "BharatLegal" wordmark */}
          <Link
            href="/"
            className="flex items-center gap-2.5 font-heading font-extrabold text-xl text-forest-950 dark:text-forest-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-700 rounded-md py-1 shrink-0"
          >
            <span className="w-8 h-8 rounded-lg bg-forest-800 text-white dark:bg-forest-900 dark:text-gold-500 flex items-center justify-center text-sm font-bold border border-gold-500/40 shadow-sm">
              <Scale className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="tracking-tight">
              Bharat<span className="text-gold-700 dark:text-gold-500">Legal</span>
            </span>
          </Link>

          {/* Center/right nav links (Desktop: 5 max) */}
          <nav aria-label="Main" className="hidden lg:flex items-center space-x-1 xl:space-x-1.5">
            {navItems.map((item) => {
              const isActive = isActiveRoute(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-700 ${
                    isActive
                      ? "text-forest-950 dark:text-forest-50 bg-forest-100 dark:bg-forest-800 font-semibold"
                      : "text-forest-800/80 dark:text-forest-100/75 hover:text-forest-950 dark:hover:text-forest-50 hover:bg-forest-100/60 dark:hover:bg-forest-800/40"
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

          {/* Far right: Theme Toggle + Auth + Mobile Hamburger Button */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <ModeToggle />
            <UserProfile />

            {/* Mobile Menu Button: Toggles nav drawer */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-forest-950 dark:text-forest-50 hover:bg-forest-100 hover:text-forest-950 dark:hover:bg-forest-800 dark:hover:text-forest-50 h-9 w-9 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
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
            className="lg:hidden border-b border-forest-100 dark:border-forest-900/60 bg-forest-50 dark:bg-forest-950 px-4 py-3 space-y-1"
          >
            <nav aria-label="Main" className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const isActive = isActiveRoute(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`px-3 py-2.5 text-sm font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-700 ${
                      isActive
                        ? "bg-forest-100 dark:bg-forest-800 text-forest-950 dark:text-forest-50 font-semibold"
                        : "text-forest-800/80 dark:text-forest-100/75 hover:bg-forest-100/60 dark:hover:bg-forest-800/40 hover:text-forest-950 dark:hover:text-forest-50"
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
