"use client";

import { useT } from "@/lib/live-pulse/i18n";
import { clockTime } from "@/lib/live-pulse/format";
import { SOURCES, usePulseState } from "@/lib/live-pulse/status-store";
import { useNow } from "@/lib/live-pulse/useNow";
import { AnimatedNumber } from "./AnimatedNumber";

const fmtCount = (n: number) => String(Math.round(n));

export function StatusHeader() {
  const t = useT();
  const { sources, requests, totalLatencyMs } = usePulseState();
  const list = SOURCES.map((id) => ({ id, ...sources[id] }));
  const avgLatency = requests ? Math.round(totalLatencyMs / requests) : 0;

  const online = list.filter((s) => s.status === "live" || s.status === "stale").length;
  const booting = list.some((s) => s.status === "loading");
  const allLive = list.every((s) => s.status === "live");
  const lastUpdate = Math.max(0, ...list.map((s) => s.checkedAt ?? 0)) || null;

  const system = booting
    ? { label: t.header.booting, tone: "text-muted", dot: "bg-muted" }
    : allLive
      ? { label: "LIVE", tone: "text-up", dot: "bg-up pulse-dot" }
      : online > 0
        ? { label: "DEGRADED", tone: "text-warn", dot: "bg-warn" }
        : { label: "OFFLINE", tone: "text-down", dot: "bg-down" };

  return (
    <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-2xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">{t.header.eyebrow}</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
          Live Pulse<span className="text-accent">.</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-2 sm:text-lg">
          {t.header.intro}
        </p>
      </div>

      <div className="panel w-full shrink-0 p-4 lg:w-[22rem]" role="status" aria-live="polite">
        <div className="flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted">SYSTEM STATUS</span>
          <span className={`flex items-center gap-2 font-mono text-sm font-semibold tracking-[0.2em] ${system.tone}`}>
            <span className={`size-2 rounded-full ${system.dot}`} aria-hidden />
            {system.label}
          </span>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-4 border-t border-line pt-3 font-mono text-xs">
          <span className="text-muted">{t.header.lastUpdate}</span>
          <span className="text-ink tabular-nums">{lastUpdate ? clockTime(lastUpdate) : "--:--:--"}</span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-4 font-mono text-xs">
          <span className="text-muted">{t.header.activeSources}</span>
          <span className="text-ink tabular-nums">
            {online}/{list.length}
          </span>
        </div>
        <div className="mt-1.5 flex items-baseline justify-between gap-4 font-mono text-xs">
          <span className="text-muted">{t.header.sessionRequests}</span>
          <span className="text-ink">
            <AnimatedNumber value={requests} format={fmtCount} flash={false} duration={0.4} />
            <span className="text-muted">{t.header.avg(avgLatency)}</span>
          </span>
        </div>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={t.header.sourcesAria}>
          {list.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-1.5 rounded border border-line px-2 py-0.5 font-mono text-[10px] text-ink-2"
              title={s.status}
            >
              <span
                className={`size-1.5 rounded-full ${
                  s.status === "live" ? "bg-up" : s.status === "stale" ? "bg-warn" : s.status === "down" ? "bg-down" : "bg-muted"
                }`}
                aria-hidden
              />
              {t.header.sources[s.id]}
            </li>
          ))}
        </ul>
        <LocalClock />
      </div>
    </header>
  );
}

function LocalClock() {
  const t = useT();
  const now = useNow(1000);
  return (
    <p className="mt-3 border-t border-line pt-3 text-right font-mono text-[11px] text-muted tabular-nums">
      {t.header.localTime} {now ? clockTime(now) : "--:--:--"}
    </p>
  );
}
