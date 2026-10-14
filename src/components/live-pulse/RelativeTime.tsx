"use client";

import { relativeTime } from "@/lib/live-pulse/format";
import { useNow } from "@/lib/live-pulse/useNow";

/** Self-ticking "12 sn önce" label; only this span re-renders each second. */
export function RelativeTime({ time, className }: { time: number; className?: string }) {
  const now = useNow(1000);
  return (
    <time dateTime={new Date(time).toISOString()} className={className}>
      {now == null ? "—" : relativeTime(time, Math.max(now, time))}
    </time>
  );
}

/** Running stopwatch since `time`, e.g. "01:12:05" — ticks every second. */
export function ElapsedClock({ time, className }: { time: number; className?: string }) {
  const now = useNow(1000);
  if (now == null) return <span className={className}>--:--:--</span>;
  const s = Math.max(0, Math.floor((now - time) / 1000));
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    <time dateTime={new Date(time).toISOString()} className={`tabular-nums ${className ?? ""}`}>
      {p(Math.floor(s / 3600))}:{p(Math.floor((s % 3600) / 60))}:{p(s % 60)}
    </time>
  );
}
