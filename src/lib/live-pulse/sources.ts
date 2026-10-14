import { cached, fetchJson } from "./cache";
import type {
  CityWeather,
  CryptoData,
  FxData,
  GithubData,
  GithubEvent,
  GithubEventKind,
  PulsePayload,
  QuakeData,
  SourceId,
  WeatherData,
} from "./types";

// ── Earthquakes · USGS ─────────────────────────────────────────
interface UsgsFeed {
  metadata: { count: number };
  features: {
    id: string;
    properties: {
      mag: number | null;
      place: string | null;
      time: number;
      url: string;
      tsunami: number;
    };
    geometry: { coordinates: [number, number, number] };
  }[];
}

export async function loadEarthquakes(): Promise<QuakeData> {
  const feed = await fetchJson<UsgsFeed>(
    "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson",
  );
  const quakes = feed.features
    .filter((f) => f.properties.mag != null)
    .map((f) => ({
      id: f.id,
      mag: Math.round(f.properties.mag! * 10) / 10,
      place: f.properties.place ?? "Bilinmeyen konum",
      time: f.properties.time,
      lon: f.geometry.coordinates[0],
      lat: f.geometry.coordinates[1],
      depthKm: Math.round(f.geometry.coordinates[2]),
      url: f.properties.url,
      tsunami: f.properties.tsunami === 1,
    }))
    .sort((a, b) => b.time - a.time);

  return { count: quakes.length, quakes };
}

// ── FX · Frankfurter (ECB reference rates) ─────────────────────
interface FrankfurterSeries {
  rates: Record<string, Record<string, number>>;
}

const FX_PAIRS = [
  { pair: "USD/TRY", label: "Amerikan Doları", quote: (r: Rates) => r.TRY },
  { pair: "EUR/TRY", label: "Euro", quote: (r: Rates) => r.TRY / r.EUR },
  { pair: "GBP/TRY", label: "İngiliz Sterlini", quote: (r: Rates) => r.TRY / r.GBP },
  { pair: "EUR/USD", label: "Euro / Dolar", quote: (r: Rates) => 1 / r.EUR },
];
type Rates = Record<string, number>;

const isoDay = (d: Date) => d.toISOString().slice(0, 10);

export async function loadFx(): Promise<FxData> {
  const end = new Date();
  const start = new Date(end.getTime() - 21 * 86_400_000);
  const series = await fetchJson<FrankfurterSeries>(
    `https://api.frankfurter.dev/v1/${isoDay(start)}..${isoDay(end)}?base=USD&symbols=TRY,EUR,GBP`,
  );
  const days = Object.keys(series.rates).sort();
  if (days.length < 2) throw new Error("FX series too short");

  const pairs = FX_PAIRS.map(({ pair, label, quote }) => {
    const history = days.map((d) => quote(series.rates[d]));
    const rate = history.at(-1)!;
    const prev = history.at(-2)!;
    return { pair, label, rate, changePct: ((rate - prev) / prev) * 100, history };
  });

  return { date: days.at(-1)!, pairs };
}

// ── Crypto · Binance public market data (CoinGecko fallback) ───
const COINS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", pair: "BTCUSDT" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", pair: "ETHUSDT" },
  { id: "solana", symbol: "SOL", name: "Solana", pair: "SOLUSDT" },
  { id: "ripple", symbol: "XRP", name: "XRP", pair: "XRPUSDT" },
];

// Market-data-only Binance host: no key, no account, not geo-restricted.
const BINANCE = "https://data-api.binance.vision/api/v3";

interface BinanceTicker {
  symbol: string;
  openPrice: string;
  lastPrice: string;
  closeTime: number;
}
type BinanceKline = [number, string, string, string, string, ...unknown[]];

/** Last 60 one-minute closes per pair; refreshed once a minute. */
function loadMinuteHistory() {
  return cached("crypto-klines", 60_000, async () => {
    const series = await Promise.all(
      COINS.map((c) =>
        fetchJson<BinanceKline[]>(`${BINANCE}/klines?symbol=${c.pair}&interval=1m&limit=60`),
      ),
    );
    return Object.fromEntries(
      COINS.map((c, i) => [c.pair, series[i].map((k) => Number(k[4]))]),
    ) as Record<string, number[]>;
  });
}

async function loadBinance(): Promise<CryptoData> {
  const symbols = encodeURIComponent(JSON.stringify(COINS.map((c) => c.pair)));
  const [tickers, history] = await Promise.all([
    fetchJson<BinanceTicker[]>(`${BINANCE}/ticker/24hr?symbols=${symbols}&type=MINI`, {}, 5000),
    loadMinuteHistory().catch(() => null),
  ]);
  const bySymbol = new Map(tickers.map((t) => [t.symbol, t]));

  return {
    coins: COINS.filter((c) => bySymbol.has(c.pair)).map(({ pair, ...c }) => {
      const t = bySymbol.get(pair)!;
      const price = Number(t.lastPrice);
      const open = Number(t.openPrice);
      // The current minute's candle is still open: end the line on the live price.
      const closes = history?.data[pair] ?? [];
      return {
        ...c,
        priceUsd: price,
        change24h: ((price - open) / open) * 100,
        updatedAt: t.closeTime,
        history: [...closes.slice(0, -1), price],
      };
    }),
  };
}

type GeckoPrice = Record<
  string,
  { usd: number; usd_24h_change: number; last_updated_at: number }
>;

async function loadCoinGecko(): Promise<CryptoData> {
  const ids = COINS.map((c) => c.id).join(",");
  const prices = await fetchJson<GeckoPrice>(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true`,
  );
  return {
    coins: COINS.filter((c) => prices[c.id]).map((c) => ({
      id: c.id,
      symbol: c.symbol,
      name: c.name,
      priceUsd: prices[c.id].usd,
      change24h: prices[c.id].usd_24h_change,
      updatedAt: prices[c.id].last_updated_at * 1000,
      history: [],
    })),
  };
}

export async function loadCrypto(): Promise<CryptoData> {
  try {
    return await loadBinance();
  } catch (err) {
    console.warn("[live-pulse] Binance unavailable, falling back to CoinGecko:", err);
    return loadCoinGecko();
  }
}

// ── Weather · Open-Meteo ───────────────────────────────────────
const CITIES = [
  { city: "istanbul", country: "TR", lat: 41.01, lon: 28.97 },
  { city: "ankara", country: "TR", lat: 39.93, lon: 32.86 },
  { city: "london", country: "GB", lat: 51.51, lon: -0.13 },
  { city: "newyork", country: "US", lat: 40.71, lon: -74.01 },
  { city: "tokyo", country: "JP", lat: 35.68, lon: 139.69 },
  { city: "sydney", country: "AU", lat: -33.87, lon: 151.21 },
];

interface MeteoPoint {
  utc_offset_seconds: number;
  current: {
    temperature_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    is_day: number;
  };
}

export async function loadWeather(): Promise<WeatherData> {
  const lat = CITIES.map((c) => c.lat).join(",");
  const lon = CITIES.map((c) => c.lon).join(",");
  const points = await fetchJson<MeteoPoint[]>(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,is_day&timezone=auto`,
  );
  const cities: CityWeather[] = CITIES.map((c, i) => ({
    city: c.city,
    country: c.country,
    tempC: points[i].current.temperature_2m,
    windKmh: points[i].current.wind_speed_10m,
    code: points[i].current.weather_code,
    isDay: points[i].current.is_day === 1,
    utcOffsetSec: points[i].utc_offset_seconds,
  }));
  return { cities };
}

// ── GitHub · public events ─────────────────────────────────────
interface GhEvent {
  id: string;
  type: string;
  actor: { login: string; avatar_url: string };
  repo: { name: string };
  created_at: string;
  payload: {
    action?: string;
    ref_type?: string;
    size?: number;
    release?: { tag_name?: string };
  };
}

const KIND: Record<string, GithubEventKind> = {
  PushEvent: "push",
  PullRequestEvent: "pr",
  IssuesEvent: "issue",
  WatchEvent: "star",
  ForkEvent: "fork",
  CreateEvent: "create",
  ReleaseEvent: "release",
};

export async function loadGithub(): Promise<GithubData> {
  // Unauthenticated, called from the visitor's browser: 60 req/h per IP.
  const raw = await fetchJson<GhEvent[]>("https://api.github.com/events?per_page=60");

  const events: GithubEvent[] = raw
    .filter((e) => !e.actor.login.endsWith("[bot]"))
    .map((e) => ({
      id: e.id,
      kind: KIND[e.type] ?? "other",
      actor: e.actor.login,
      avatar: `${e.actor.avatar_url}${e.actor.avatar_url.includes("?") ? "&" : "?"}s=48`,
      repo: e.repo.name,
      createdAt: Date.parse(e.created_at),
      detail: e.payload.action ?? e.payload.ref_type ?? e.payload.release?.tag_name,
    }))
    .filter((e) => e.kind !== "other")
    // The feed is ordered by ingestion, not by when the event happened.
    .sort((a, b) => b.createdAt - a.createdAt);

  return { events };
}

// ── Registry · what usePolling calls ───────────────────────────
// `ttl` is how long a snapshot is reused before the upstream API is hit again.
const SOURCES = {
  crypto: { ttl: 4, load: loadCrypto },
  earthquakes: { ttl: 60, load: loadEarthquakes },
  fx: { ttl: 1800, load: loadFx },
  github: { ttl: 90, load: loadGithub },
  weather: { ttl: 300, load: loadWeather },
} satisfies Record<SourceId, { ttl: number; load: () => Promise<unknown> }>;

export function loadSource<T>(source: SourceId): Promise<PulsePayload<T>> {
  const { ttl, load } = SOURCES[source];
  return cached(source, ttl * 1000, load as () => Promise<T>);
}
