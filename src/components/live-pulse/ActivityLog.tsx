"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePulseState } from "@/lib/live-pulse/status-store";
import type { SourceId } from "@/lib/live-pulse/types";

const VISIBLE = 5;

const TAG: Record<SourceId, string> = {
  earthquakes: "USGS  ",
  crypto: "CRYPTO",
  fx: "FX    ",
  weather: "METEO ",
  github: "GITHUB",
};

const stamp = (ms: number) => {
  const d = new Date(ms);
  const p = (n: number, l = 2) => String(n).padStart(l, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`;
};

/**
 * Terminal-style feed of every real request the page makes: which source,
 * HTTP status, measured latency and what changed. Nothing here is simulated.
 */
export function ActivityLog() {
  const { log } = usePulseState();
  const reduceMotion = useReducedMotion();
  const lines = log.slice(0, VISIBLE);

  return (
    <section className="panel overflow-hidden" aria-labelledby="log-title">
      <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-2.5">
        <h2 id="log-title" className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
          <span className="size-1.5 rounded-full bg-up pulse-dot" aria-hidden />
          Canlı sistem günlüğü
        </h2>
        <span className="hidden font-mono text-[11px] text-muted sm:inline">tarayıcı → halka açık API</span>
      </header>

      <ol
        className="relative h-[9.25rem] overflow-hidden px-5 py-2.5 font-mono text-[11.5px] leading-[1.7rem] sm:text-xs"
        aria-live="off"
      >
        {lines.length === 0 && <li className="text-muted">bağlantılar kuruluyor…</li>}
        <AnimatePresence initial={false} mode="popLayout">
          {lines.map((l, i) => (
            <motion.li
              key={l.id}
              layout={!reduceMotion}
              initial={reduceMotion ? false : { opacity: 0, x: -12 }}
              animate={{ opacity: i === 0 ? 1 : Math.max(0.4, 1 - i * 0.15), x: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex items-baseline gap-3 whitespace-nowrap"
            >
              <span className="hidden text-muted sm:inline">{stamp(l.at)}</span>
              <span className="whitespace-pre text-accent">{TAG[l.source]}</span>
              <span className={l.ok ? "text-up" : "text-down"}>{l.code}</span>
              <span className="w-14 shrink-0 text-right text-muted tabular-nums">{l.latencyMs}ms</span>
              <span className={`truncate ${l.highlight ? "text-ink" : "text-ink-2"}`}>
                {l.highlight && <span className="text-warn">● </span>}
                {l.message}
              </span>
            </motion.li>
          ))}
        </AnimatePresence>
        {/* fade the oldest lines out at the bottom edge */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface to-transparent" aria-hidden />
      </ol>
    </section>
  );
}
