import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Escapes RegExp special characters so untrusted input can be safely
// interpolated into a `new RegExp(...)` (e.g. for case-insensitive Mongo
// $regex lookups) without enabling ReDoS or unintended pattern matching.
export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
