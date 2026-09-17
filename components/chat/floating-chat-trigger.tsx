"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Scale, Sparkles, X, MessageSquareText } from "lucide-react";
import { useQuickConsultation } from "@/context/QuickConsultationContext";

export function FloatingChatTrigger() {
  const pathname = usePathname();
  const { isOpen, openConsultation } = useQuickConsultation();
  const [isHovered, setIsHovered] = useState(false);

  // Never show floating icon on the dedicated full-screen /chat page or when the drawer is already active
  if (pathname === "/chat" || isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <button
        onClick={() => openConsultation()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-forest-900 text-gold-400 border border-gold-500/40 shadow-2xl hover:shadow-gold-500/10 hover:border-gold-400 active:scale-95 transition-all duration-200"
        aria-label="Open BharatLegal AI Assistant"
      >
        {/* Pulsing beacon indicator */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gold-500" />
        </span>

        {/* Icon */}
        <Scale className="w-4 h-4 text-gold-400 group-hover:rotate-12 transition-transform duration-200 shrink-0" />

        {/* Label */}
        <span className="text-xs font-bold font-heading text-gold-300 tracking-wide">
          Ask Legal AI
        </span>

        {/* Subtle tooltip preview on hover */}
        {isHovered && (
          <div className="absolute right-0 bottom-full mb-2.5 w-56 p-2.5 rounded-xl bg-card border border-border shadow-xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              <span>Legal Guidance, On Demand</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              Got a question about a law, police notice, or contract? Ask anytime without leaving this page.
            </p>
          </div>
        )}
      </button>
    </div>
  );
}
