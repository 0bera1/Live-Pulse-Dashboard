import { fmtFixed, fmtPct, fmtUsd } from "./format";
import { getDict } from "./i18n";
import type { CryptoData, FxData, GithubData, QuakeData, WeatherData } from "./types";
import type { Describe } from "./usePolling";

/** Activity-log summaries: what actually changed between two snapshots. */

export const describeQuakes: Describe<QuakeData> = (next, prev) => {
  const m = getDict().msg;
  if (!prev) {
    const top = next.quakes.reduce((a, b) => (b.mag > a.mag ? b : a), next.quakes[0]);
    return { message: m.quakesLoaded(next.count, fmtFixed(top?.mag ?? 0, 1)) };
  }
  const seen = new Set(prev.quakes.map((q) => q.id));
  const fresh = next.quakes.filter((q) => !seen.has(q.id));
  if (fresh.length === 0) return { message: m.quakesNone(next.count) };
  const q = fresh.reduce((a, b) => (b.mag > a.mag ? b : a));
  return {
    message: m.quakeNew(fmtFixed(q.mag, 1), q.place, fresh.length - 1),
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
  const m = getDict().msg;
  const usd = next.pairs[0];
  const head = `${usd.pair} ${fmtFixed(usd.rate, 4)} (${fmtPct(usd.changePct)})`;
  if (!prev) return { message: m.fxLoaded(next.pairs.length, head) };
  if (prev.date !== next.date) return { message: m.fxNew(next.date, head), highlight: true };
  return { message: m.fxCurrent(next.date, head) };
};

export const describeWeather: Describe<WeatherData> = (next, prev) => {
  const d = getDict();
  const m = d.msg;
  const changed = prev
    ? next.cities.filter((c) => {
        const p = prev.cities.find((x) => x.city === c.city);
        return p && (p.tempC !== c.tempC || p.code !== c.code);
      })
    : [];
  const list = (changed.length ? changed : next.cities.slice(0, 3))
    .map((c) => `${d.weather.cities[c.city] ?? c.city} ${fmtFixed(c.tempC, 1)}°`)
    .join(" · ");
  if (!prev) return { message: m.weatherLoaded(next.cities.length, list) };
  return changed.length
    ? { message: m.weatherChanged(changed.length, list), highlight: true }
    : { message: m.weatherSame(list) };
};

export const describeGithub: Describe<GithubData> = (next, prev) => {
  const m = getDict().msg;
  if (!prev) return { message: m.githubLoaded(next.events.length) };
  const seen = new Set(prev.events.map((e) => e.id));
  const fresh = next.events.filter((e) => !seen.has(e.id));
  if (fresh.length === 0) return { message: m.githubNone };
  return {
    message: m.githubNew(fresh.length, fresh[0].actor, fresh[0].repo),
    highlight: true,
  };
};
