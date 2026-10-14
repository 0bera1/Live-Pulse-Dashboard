"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Current time, quantized to `intervalMs` and re-read on that cadence.
 * Returns null during SSR/hydration so server and client markup match.
 */
export function useNow(intervalMs: number): number | null {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const id = setInterval(onChange, intervalMs);
      return () => clearInterval(id);
    },
    [intervalMs],
  );
  return useSyncExternalStore(
    subscribe,
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => null,
  );
}
