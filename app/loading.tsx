import { Scale } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 space-y-4">
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-forest-800 text-white dark:bg-forest-900 dark:text-gold-500 border border-gold-500/40 flex items-center justify-center text-2xl font-bold shadow-sm animate-pulse">
          ⚖
        </div>
        <div className="absolute inset-0 rounded-2xl border-2 border-gold-500/40 animate-ping" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-foreground font-heading">
          Loading BharatLegal...
        </p>
        <p className="text-xs text-muted-foreground">
          Preparing statutory index and resources
        </p>
      </div>
    </div>
  );
}
