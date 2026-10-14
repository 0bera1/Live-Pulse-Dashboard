"use client";

import { useT } from "@/lib/live-pulse/i18n";
import { useSourceState } from "@/lib/live-pulse/status-store";
import type { SourceId } from "@/lib/live-pulse/types";
import { useNow } from "@/lib/live-pulse/useNow";

/**
 * Hairline along the card's top edge that fills until the next poll, then
 * restarts. Pure CSS animation, re-keyed on every round-trip.
 */
export function RefreshBar({ source }: { source: SourceId }) {
  const { checkedAt, nextAt } = useSourceState(source);
  if (checkedAt == null || nextAt == null) return null;
  return (
    <div className="pointer-events-none absolute inset-x-4 top-0 h-px overflow-hidden" aria-hidden>
      <div
        key={checkedAt}
        className="refresh-fill h-full bg-accent/70"
        style={{ animationDuration: `${nextAt - checkedAt}ms` }}
      />
    </div>
  );
}

/** "142 ms · in 4 s" — the measured round-trip and a countdown to the next poll. */
export function PollCountdown({ source }: { source: SourceId }) {
  const t = useT();
  const { nextAt, latencyMs } = useSourceState(source);
  const now = useNow(1000);
  if (latencyMs == null) return null;

  const left = nextAt != null && now != null ? Math.max(0, Math.ceil((nextAt - now) / 1000)) : null;
  return (
    <span className="tabular-nums">
      {latencyMs} ms
      <span className="text-muted/60"> · </span>
      {left == null ? t.card.paused : left === 0 ? t.card.refreshing : t.card.refreshIn(left)}
    </span>
  );
}
