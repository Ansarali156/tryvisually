/**
 * Hook: useReducedMotion
 *
 * Detects whether the user prefers reduced motion (prefers-reduced-motion: reduce).
 */

import { useState, useEffect } from "react";

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    const legacyMediaQuery = mediaQuery as unknown as {
      addListener?: (fn: (e: MediaQueryListEvent) => void) => void;
      removeListener?: (fn: (e: MediaQueryListEvent) => void) => void;
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    } else if (typeof legacyMediaQuery.addListener === "function") {
      legacyMediaQuery.addListener(handler);
      return () => legacyMediaQuery.removeListener?.(handler);
    }
  }, []);

  return prefersReducedMotion;
}
