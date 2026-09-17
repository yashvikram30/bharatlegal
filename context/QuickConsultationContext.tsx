"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface ConsultationContextData {
  title?: string;
  subtitle?: string;
  prompt?: string;
  act?: string;
  section?: string;
}

interface QuickConsultationContextType {
  isOpen: boolean;
  contextData: ConsultationContextData | null;
  openConsultation: (data?: ConsultationContextData) => void;
  closeConsultation: () => void;
}

const QuickConsultationContext = createContext<QuickConsultationContextType | undefined>(
  undefined
);

export function QuickConsultationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [contextData, setContextData] = useState<ConsultationContextData | null>(null);

  const openConsultation = useCallback((data?: ConsultationContextData) => {
    if (data) {
      setContextData(data);
    }
    setIsOpen(true);
  }, []);

  const closeConsultation = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <QuickConsultationContext.Provider
      value={{
        isOpen,
        contextData,
        openConsultation,
        closeConsultation,
      }}
    >
      {children}
    </QuickConsultationContext.Provider>
  );
}

export function useQuickConsultation() {
  const context = useContext(QuickConsultationContext);
  if (!context) {
    throw new Error(
      "useQuickConsultation must be used within a QuickConsultationProvider"
    );
  }
  return context;
}
