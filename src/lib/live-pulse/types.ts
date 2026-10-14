/** Envelope `loadSource` resolves with on success. */
export interface PulsePayload<T> {
  data: T;
  /** Epoch ms when the upstream API was last successfully reached. */
  fetchedAt: number;
  /** True when upstream failed and this is the last known good copy. */
  stale: boolean;
}

export type SourceId = "earthquakes" | "fx" | "crypto" | "weather" | "github";

// ── Earthquakes ────────────────────────────────────────────────
export interface Quake {
  id: string;
  mag: number;
  place: string;
  time: number;
  lon: number;
  lat: number;
  depthKm: number;
  url: string;
  tsunami: boolean;
}

export interface QuakeData {
  count: number;
  quakes: Quake[];
}

// ── FX ─────────────────────────────────────────────────────────
export interface FxPair {
  pair: string;
  label: string;
  rate: number;
  changePct: number;
  /** Daily closes, oldest → newest. */
  history: number[];
}

export interface FxData {
  date: string;
  pairs: FxPair[];
}

// ── Crypto ─────────────────────────────────────────────────────
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  priceUsd: number;
  change24h: number;
  updatedAt: number;
  /** One-minute closes for the last hour, ending on the live price. */
  history: number[];
}

export interface CryptoData {
  coins: Coin[];
}

// ── Weather ────────────────────────────────────────────────────
export interface CityWeather {
  city: string;
  country: string;
  tempC: number;
  windKmh: number;
  code: number;
  isDay: boolean;
  utcOffsetSec: number;
}

export interface WeatherData {
  cities: CityWeather[];
}

// ── GitHub ─────────────────────────────────────────────────────
export type GithubEventKind =
  | "push"
  | "pr"
  | "issue"
  | "star"
  | "fork"
  | "create"
  | "release"
  | "other";

export interface GithubEvent {
  id: string;
  kind: GithubEventKind;
  actor: string;
  avatar: string;
  repo: string;
  createdAt: number;
  detail?: string;
}

export interface GithubData {
  events: GithubEvent[];
}
