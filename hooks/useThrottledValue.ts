import { useState, useEffect, useRef } from "react";

/**
 * Throttle a fast-changing string value (like LLM streaming text)
 * so heavy consumers (like Markdown parsers) only re-render every intervalMs.
 */
export function useThrottledValue(value: string, intervalMs = 75, isImmediateWhenDone = false): string {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdatedRef = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const now = Date.now();
    const elapsed = now - lastUpdatedRef.current;

    if (elapsed >= intervalMs) {
      lastUpdatedRef.current = now;
      setThrottledValue(value);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        lastUpdatedRef.current = Date.now();
        setThrottledValue(value);
      }, intervalMs - elapsed);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, intervalMs]);

  useEffect(() => {
    if (isImmediateWhenDone) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setThrottledValue(value);
    }
  }, [isImmediateWhenDone, value]);

  return throttledValue;
}
