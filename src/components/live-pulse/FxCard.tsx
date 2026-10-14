"use client";

import { Landmark } from "lucide-react";
import { describeFx } from "@/lib/live-pulse/describe";
import { fmtFixed } from "@/lib/live-pulse/format";
import type { FxData } from "@/lib/live-pulse/types";
import { usePolling } from "@/lib/live-pulse/usePolling";
import { AnimatedNumber } from "./AnimatedNumber";
import { Delta } from "./Delta";
import { ModuleCard } from "./ModuleCard";
import { SkeletonRows } from "./Skeleton";
import { Sparkline } from "./Sparkline";

const fmtRate = (n: number) => fmtFixed(n, 4);

export function FxCard({ className }: { className?: string }) {
  const { data, fetchedAt, loading, degraded } = usePolling<FxData>("fx", 60_000, describeFx);

  return (
    <ModuleCard
      sourceId="fx"
      title="Döviz Kurları"
      subtitle={data ? `ECB referans · ${data.date}` : "ECB referans kurları"}
      icon={Landmark}
      source="Frankfurter / ECB"
      sourceHref="https://frankfurter.dev/"
      fetchedAt={fetchedAt}
      loading={loading}
      degraded={degraded}
      hasData={data != null}
      className={className}
      skeleton={<SkeletonRows rows={4} className="h-11" />}
    >
      <ul className="divide-y divide-line">
        {data?.pairs.map((p) => (
          <li key={p.pair} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1">
              <p className="font-mono text-sm font-semibold text-ink">{p.pair}</p>
              <p className="truncate text-xs text-muted">{p.label}</p>
            </div>
            <Sparkline
              values={p.history}
              color="var(--accent)"
              label={`${p.pair} son ${p.history.length} iş günü trendi`}
            />
            <div className="flex w-24 flex-col items-end gap-0.5">
              <AnimatedNumber value={p.rate} format={fmtRate} className="font-mono text-base font-semibold text-ink" />
              <Delta value={p.changePct} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-auto pt-4 font-mono text-[11px] text-muted">Değişim: önceki iş gününe göre · grafik: son 3 hafta</p>
    </ModuleCard>
  );
}
