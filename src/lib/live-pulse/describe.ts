import { fmtFixed, fmtPct, fmtUsd } from "./format";
import type { CryptoData, FxData, GithubData, QuakeData, WeatherData } from "./types";
import type { Describe } from "./usePolling";

/** Activity-log summaries: what actually changed between two snapshots. */

export const describeQuakes: Describe<QuakeData> = (next, prev) => {
  if (!prev) {
    const top = next.quakes.reduce((a, b) => (b.mag > a.mag ? b : a), next.quakes[0]);
    return { message: `${next.count} deprem yüklendi · en büyük M${fmtFixed(top?.mag ?? 0, 1)}` };
  }
  const seen = new Set(prev.quakes.map((q) => q.id));
  const fresh = next.quakes.filter((q) => !seen.has(q.id));
  if (fresh.length === 0) return { message: `yeni deprem yok · ${next.count} olay izleniyor` };
  const q = fresh.reduce((a, b) => (b.mag > a.mag ? b : a));
  return {
    message: `YENİ DEPREM M${fmtFixed(q.mag, 1)} · ${q.place}${fresh.length > 1 ? ` (+${fresh.length - 1})` : ""}`,
    highlight: true,
  };
};

export const describeCrypto: Describe<CryptoData> = (next, prev) => {
  const parts = next.coins.map((c) => {
    const before = prev?.coins.find((p) => p.id === c.id)?.priceUsd;
    const arrow = before == null || before === c.priceUsd ? "" : c.priceUsd > before ? " ▲" : " ▼";
    return `${c.symbol} ${fmtUsd(c.priceUsd)}${arrow}`;
  });
  const moved = prev != null && next.coins.some((c, i) => prev.coins[i]?.priceUsd !== c.priceUsd);
  return { message: parts.join(" · "), highlight: moved };
};

export const describeFx: Describe<FxData> = (next, prev) => {
  const usd = next.pairs[0];
  const head = `${usd.pair} ${fmtFixed(usd.rate, 4)} (${fmtPct(usd.changePct)})`;
  if (!prev) return { message: `${next.pairs.length} kur yüklendi · ${head}` };
  if (prev.date !== next.date) return { message: `yeni ECB kurları (${next.date}) · ${head}`, highlight: true };
  return { message: `kurlar güncel · ECB ${next.date} · ${head}` };
};

export const describeWeather: Describe<WeatherData> = (next, prev) => {
  const changed = prev
    ? next.cities.filter((c) => {
        const p = prev.cities.find((x) => x.city === c.city);
        return p && (p.tempC !== c.tempC || p.code !== c.code);
      })
    : [];
  const list = (changed.length ? changed : next.cities.slice(0, 3))
    .map((c) => `${c.city} ${fmtFixed(c.tempC, 1)}°`)
    .join(" · ");
  if (!prev) return { message: `${next.cities.length} şehir yüklendi · ${list}` };
  return changed.length
    ? { message: `${changed.length} şehirde değişim · ${list}`, highlight: true }
    : { message: `ölçümler aynı · ${list}` };
};

export const describeGithub: Describe<GithubData> = (next, prev) => {
  if (!prev) return { message: `${next.events.length} olay yüklendi` };
  const seen = new Set(prev.events.map((e) => e.id));
  const fresh = next.events.filter((e) => !seen.has(e.id));
  if (fresh.length === 0) return { message: "yeni olay yok" };
  return {
    message: `+${fresh.length} yeni olay akışa ekleniyor · son: ${fresh[0].actor} → ${fresh[0].repo}`,
    highlight: true,
  };
};
