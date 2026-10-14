"use client";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useT } from "@/lib/live-pulse/i18n";
import type { SourceId } from "@/lib/live-pulse/types";
import { PollCountdown, RefreshBar } from "./PollMeter";

interface Props {
  sourceId: SourceId;
  title: string;
  subtitle: ReactNode;
  icon: LucideIcon;
  /** Data attribution, shown in the footer (e.g. "USGS"). */
  source: string;
  sourceHref: string;
  fetchedAt: number | null;
  loading: boolean;
  degraded: boolean;
  hasData: boolean;
  skeleton: ReactNode;
  className?: string;
  children: ReactNode;
}

/**
 * Shared chrome for every data module: header, live/stale badge, poll meter,
 * skeleton while loading and a calm fallback when the source is down.
 */
export function ModuleCard({
  sourceId,
  title,
  subtitle,
  icon: Icon,
  source,
  sourceHref,
  fetchedAt,
  loading,
  degraded,
  hasData,
  skeleton,
  className = "",
  children,
}: Props) {
  const t = useT();
  const status = !hasData ? (loading ? "loading" : "down") : degraded ? "stale" : "live";

  return (
    <section className={`panel flex flex-col ${className}`} aria-busy={loading && !hasData}>
      <RefreshBar source={sourceId} />
      {/* Re-keyed on each new upstream snapshot → one soft glow per arrival. */}
      {fetchedAt != null && <span key={fetchedAt} className="card-flash" aria-hidden />}

      <header className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-surface-2 text-accent">
            <Icon size={16} strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-wide text-balance text-ink">{title}</h2>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{subtitle}</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </header>

      <div className="flex flex-1 flex-col p-5">
        {status === "loading" && skeleton}
        {status === "down" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center">
            <p className="text-sm text-ink-2">{t.card.downTitle}</p>
            <p className="font-mono text-[11px] text-muted">{t.card.downHint}</p>
          </div>
        )}
        {hasData && children}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-line px-5 py-2.5 font-mono text-[11px] text-muted">
        <a href={sourceHref} target="_blank" rel="noreferrer" className="hover:text-ink-2">
          {t.card.source}: {source}
        </a>
        <span className="flex items-center gap-1.5">
          {degraded && hasData && <span className="text-warn">{t.card.lastKnown}</span>}
          <PollCountdown source={sourceId} />
        </span>
      </footer>
    </section>
  );
}

const BADGE = {
  loading: { dot: "bg-muted", text: "text-muted" },
  live: { dot: "bg-up pulse-dot", text: "text-up" },
  stale: { dot: "bg-warn", text: "text-warn" },
  down: { dot: "bg-down", text: "text-down" },
} as const;

function StatusBadge({ status }: { status: keyof typeof BADGE }) {
  const t = useT();
  const b = BADGE[status];
  return (
    <span
      className={`flex shrink-0 items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] ${b.text}`}
    >
      <span className={`size-1.5 rounded-full ${b.dot}`} aria-hidden />
      {t.card.badge[status]}
    </span>
  );
}
