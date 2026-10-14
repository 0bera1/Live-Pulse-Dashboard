"use client";

import { Coins } from "lucide-react";
import { useT } from "@/lib/live-pulse/i18n";
import { describeCrypto } from "@/lib/live-pulse/describe";
import { fmtUsd } from "@/lib/live-pulse/format";
import type { CryptoData } from "@/lib/live-pulse/types";
import { usePolling } from "@/lib/live-pulse/usePolling";
import { AnimatedNumber } from "./AnimatedNumber";
import { Delta } from "./Delta";
import { ModuleCard } from "./ModuleCard";
import { SkeletonRows } from "./Skeleton";
import { Sparkline } from "./Sparkline";

export function CryptoCard({ className }: { className?: string }) {
  const t = useT();
  const { data, fetchedAt, loading, degraded } = usePolling<CryptoData>("crypto", 5_000, describeCrypto);
  const hasHistory = data?.coins.some((c) => c.history.length > 1);

  return (
    <ModuleCard
      sourceId="crypto"
      title={t.crypto.title}
      subtitle={t.crypto.subtitle}
      icon={Coins}
      source={hasHistory ? "Binance market data" : "CoinGecko"}
      sourceHref={hasHistory ? "https://data-api.binance.vision" : "https://www.coingecko.com/"}
      fetchedAt={fetchedAt}
      loading={loading}
      degraded={degraded}
      hasData={data != null}
      className={className}
      skeleton={<SkeletonRows rows={4} className="h-11" />}
    >
      <ul className="divide-y divide-line">
        {data?.coins.map((c) => (
          <li key={c.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <span className="grid h-8 w-11 shrink-0 place-items-center rounded-md border border-line bg-surface-2 font-mono text-[11px] font-semibold text-accent">
              {c.symbol}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm text-ink-2">{c.name}</span>
            <Sparkline values={c.history} width={72} color="var(--accent)" label={t.crypto.spark(c.name)} />
            <div className="flex w-[6.5rem] flex-col items-end gap-0.5">
              <AnimatedNumber value={c.priceUsd} format={fmtUsd} duration={0.6} className="font-mono text-base font-semibold text-ink" />
              <Delta value={c.change24h} />
            </div>
          </li>
        ))}
      </ul>
      {hasHistory && (
        <p className="mt-auto pt-4 font-mono text-[11px] text-muted">{t.crypto.note}</p>
      )}
    </ModuleCard>
  );
}
