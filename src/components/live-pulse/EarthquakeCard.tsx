"use client";

import { Activity } from "lucide-react";
import { useState } from "react";
import { describeQuakes } from "@/lib/live-pulse/describe";
import { fmtFixed } from "@/lib/live-pulse/format";
import type { QuakeData } from "@/lib/live-pulse/types";
import { usePolling } from "@/lib/live-pulse/usePolling";
import { AnimatedNumber } from "./AnimatedNumber";
import { ModuleCard } from "./ModuleCard";
import { QUAKE_TIERS, QuakeMap, quakeColor } from "./QuakeMap";
import { ElapsedClock, RelativeTime } from "./RelativeTime";
import { Skeleton } from "./Skeleton";

const fmtInt = (n: number) => fmtFixed(Math.round(n), 0);
const fmtMag = (n: number) => `M${fmtFixed(n, 1)}`;

export function EarthquakeCard({ className }: { className?: string }) {
  const { data, fetchedAt, loading, degraded } = usePolling<QuakeData>("earthquakes", 20_000, describeQuakes);
  const [activeId, setActiveId] = useState<string | null>(null);

  const strongest = data?.quakes.reduce((a, b) => (b.mag > a.mag ? b : a), data.quakes[0]);
  const latest = data?.quakes[0];

  return (
    <ModuleCard
      sourceId="earthquakes"
      title="Küresel Sismik Aktivite"
      subtitle={data?.windowLabel ?? "Son 24 saat · M2.5+"}
      icon={Activity}
      source="USGS Earthquake Hazards"
      sourceHref="https://earthquake.usgs.gov/earthquakes/map/"
      fetchedAt={fetchedAt}
      loading={loading}
      degraded={degraded}
      hasData={data != null}
      className={className}
      skeleton={
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
          <Skeleton className="aspect-[800/390] w-full" />
        </div>
      }
    >
      {data && (
        <div className="flex flex-col gap-5">
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="Kaydedilen deprem">
              <AnimatedNumber value={data.count} format={fmtInt} flash={false} className="text-4xl font-semibold text-ink" />
            </Stat>
            {strongest && (
              <Stat label="En büyük" hint={strongest.place}>
                <AnimatedNumber
                  value={strongest.mag}
                  format={fmtMag}
                  flash={false}
                  className="text-4xl font-semibold text-ink"
                />
                <span className="ml-2 inline-block size-2.5 rounded-full align-middle" style={{ background: quakeColor(strongest.mag) }} aria-hidden />
              </Stat>
            )}
            {latest && (
              <Stat label="Son depremden bu yana" hint={latest.place}>
                <ElapsedClock time={latest.time} className="font-mono text-3xl font-semibold text-ink" />
              </Stat>
            )}
          </dl>

          <div className="overflow-hidden rounded-lg border border-line bg-map-ocean/40">
            <QuakeMap quakes={data.quakes} referenceTime={fetchedAt ?? 0} activeId={activeId} onActiveChange={setActiveId} />
          </div>

          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] text-ink-2" aria-label="Lejant">
            {[...QUAKE_TIERS].reverse().map((t) => (
              <li key={t.label} className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: t.color }} aria-hidden />
                {t.label}
              </li>
            ))}
            <li className="flex items-center gap-2">
              <span className="size-2.5 rounded-full border border-ink-2" aria-hidden />
              Halka: son 1 saat · boyut = büyüklük
            </li>
          </ul>

          <ol className="divide-y divide-line border-t border-line" aria-label="En son depremler">
            {data.quakes.slice(0, 5).map((q) => (
              <li
                key={q.id}
                onPointerEnter={() => setActiveId(q.id)}
                onPointerLeave={() => setActiveId(null)}
                className={`flex items-center gap-3 py-2.5 transition-colors ${activeId === q.id ? "bg-surface-2/60" : ""}`}
              >
                <span
                  className="w-12 shrink-0 rounded border border-line py-0.5 text-center font-mono text-xs font-semibold text-ink"
                  style={{ boxShadow: `inset 3px 0 0 ${quakeColor(q.mag)}` }}
                >
                  {fmtFixed(q.mag, 1)}
                </span>
                <a href={q.url} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-sm text-ink-2 hover:text-ink">
                  {q.place}
                </a>
                <span className="hidden shrink-0 font-mono text-[11px] text-muted sm:inline">{q.depthKm} km</span>
                <RelativeTime time={q.time} className="w-20 shrink-0 text-right font-mono text-[11px] text-muted" />
              </li>
            ))}
          </ol>
        </div>
      )}
    </ModuleCard>
  );
}

function Stat({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-1 leading-none">{children}</dd>
      {hint && <dd className="mt-1.5 truncate text-xs text-ink-2" title={hint}>{hint}</dd>}
    </div>
  );
}
