const LOCALE = "tr-TR";

const cache = new Map<string, Intl.NumberFormat>();
function nf(min: number, max: number, style?: "currency") {
  const key = `${min}-${max}-${style ?? ""}`;
  let f = cache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(LOCALE, {
      minimumFractionDigits: min,
      maximumFractionDigits: max,
      ...(style ? { style, currency: "USD", currencyDisplay: "narrowSymbol" } : {}),
    });
    cache.set(key, f);
  }
  return f;
}

export const fmtFixed = (n: number, digits: number) => nf(digits, digits).format(n);

/** Price with precision scaled to its magnitude ($81.827 vs $2,1834). */
export function fmtUsd(n: number) {
  const digits = n >= 1000 ? 0 : n >= 1 ? 2 : 4;
  return nf(digits, digits, "currency").format(n);
}

export function fmtPct(n: number, digits = 2) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${nf(digits, digits).format(Math.abs(n))}%`;
}

export function relativeTime(ms: number, now = Date.now()) {
  const s = Math.max(0, Math.round((now - ms) / 1000));
  if (s < 5) return "şimdi";
  if (s < 60) return `${s} sn önce`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} sa önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

export function clockTime(ms: number) {
  return new Date(ms).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/** Wall-clock time in a city, given its UTC offset. */
export function cityTime(utcOffsetSec: number, now = Date.now()) {
  const d = new Date(now + utcOffsetSec * 1000);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}
