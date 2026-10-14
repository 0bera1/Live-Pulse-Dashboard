"use client";

import { CloudSun, Wind } from "lucide-react";
import { cityTime, fmtFixed } from "@/lib/live-pulse/format";
import type { WeatherData } from "@/lib/live-pulse/types";
import { useNow } from "@/lib/live-pulse/useNow";
import { usePolling } from "@/lib/live-pulse/usePolling";
import { describeWeather } from "@/lib/live-pulse/describe";
import { weatherKind } from "@/lib/live-pulse/weather-codes";
import { AnimatedNumber } from "./AnimatedNumber";
import { ModuleCard } from "./ModuleCard";
import { Skeleton } from "./Skeleton";

const fmtTemp = (n: number) => `${fmtFixed(n, 0)}°`;

export function WeatherCard({ className }: { className?: string }) {
  const { data, fetchedAt, loading, degraded } = usePolling<WeatherData>("weather", 30_000, describeWeather);
  const now = useNow(15_000);

  return (
    <ModuleCard
      sourceId="weather"
      title="Dünya Hava Durumu"
      subtitle="Anlık · 6 şehir"
      icon={CloudSun}
      source="Open-Meteo"
      sourceHref="https://open-meteo.com/"
      fetchedAt={fetchedAt}
      loading={loading}
      degraded={degraded}
      hasData={data != null}
      className={className}
      skeleton={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      }
    >
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {data?.cities.map((c) => {
          const w = weatherKind(c.code);
          const Icon = !c.isDay && w.nightIcon ? w.nightIcon : w.icon;
          return (
            <li key={c.city} className="rounded-lg border border-line bg-surface-2/50 p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{c.city}</p>
                  <p className="font-mono text-[11px] text-muted" suppressHydrationWarning>
                    {c.country} · {now ? cityTime(c.utcOffsetSec, now) : "--:--"}
                  </p>
                </div>
                <Icon size={20} strokeWidth={1.5} className={c.isDay ? "text-accent" : "text-ink-2"} aria-hidden />
              </div>
              <AnimatedNumber value={c.tempC} format={fmtTemp} className="mt-2 block text-3xl font-semibold text-ink" />
              <p className="mt-1 truncate text-xs text-ink-2">{w.label}</p>
              <p className="mt-0.5 flex items-center gap-1 font-mono text-[11px] text-muted">
                <Wind size={11} aria-hidden /> {fmtFixed(c.windKmh, 0)} km/s
              </p>
            </li>
          );
        })}
      </ul>
    </ModuleCard>
  );
}
