import { useRef, useState, useCallback, useEffect } from "react";

interface UseStreamDripperOptions {
  /**
   * Characters to drip per animation frame tick (~16ms).
   * Default: 3 chars.
   */
  charsPerTick?: number;
  /**
   * Tick interval in ms. Default: 18ms (~55-60fps).
   */
  tickMs?: number;
  /**
   * Callback fired when stream has finished and all buffered text has been dripped.
   */
  onComplete?: (finalText: string) => void;
}

export function useStreamDripper(options: UseStreamDripperOptions = {}) {
  const { charsPerTick = 3, tickMs = 18, onComplete } = options;

  const [displayedText, setDisplayedText] = useState("");
  const targetTextRef = useRef("");
  const currentTextRef = useRef("");
  const isStreamingRef = useRef(false);
  const streamEndedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const startDripping = useCallback(() => {
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      const target = targetTextRef.current;
      const current = currentTextRef.current;

      if (current.length < target.length) {
        // Adaptive drip rate:
        // If incoming chunks arrive in big network bursts (e.g. Groq 200+ tokens/sec),
        // dynamically increase step size so we don't lag behind real-time by seconds.
        const backlog = target.length - current.length;
        const step =
          backlog > 200
            ? Math.ceil(backlog / 6)
            : backlog > 80
            ? Math.ceil(backlog / 12)
            : charsPerTick;

        const nextIndex = Math.min(current.length + step, target.length);
        const nextText = target.slice(0, nextIndex);
        currentTextRef.current = nextText;
        setDisplayedText(nextText);
      } else if (streamEndedRef.current) {
        // Stream has closed and buffer is completely drained
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        isStreamingRef.current = false;
        onCompleteRef.current?.(current);
      }
    }, tickMs);
  }, [charsPerTick, tickMs]);

  /**
   * Push incoming raw network chunk into the smoothing buffer.
   */
  const appendChunk = useCallback(
    (chunk: string) => {
      targetTextRef.current += chunk;
      isStreamingRef.current = true;
      startDripping();
    },
    [startDripping]
  );

  /**
   * Signal that the network stream has completed.
   * If flushImmediately is true, immediately sets all remaining text.
   */
  const endStream = useCallback((flushImmediately = false) => {
    streamEndedRef.current = true;
    if (flushImmediately) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      currentTextRef.current = targetTextRef.current;
      setDisplayedText(targetTextRef.current);
      isStreamingRef.current = false;
      onCompleteRef.current?.(targetTextRef.current);
    }
  }, []);

  /**
   * Reset buffer for a new generation.
   */
  const reset = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    targetTextRef.current = "";
    currentTextRef.current = "";
    isStreamingRef.current = false;
    streamEndedRef.current = false;
    setDisplayedText("");
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    displayedText,
    appendChunk,
    endStream,
    reset,
    isDripping: isStreamingRef.current,
  };
}
