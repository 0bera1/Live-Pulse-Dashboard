import "server-only";
import type { PulsePayload } from "../types";

interface Entry<T> {
  data: T;
  fetchedAt: number;
}

const store = new Map<string, Entry<unknown>>();
const inflight = new Map<string, Promise<Entry<unknown>>>();

/**
 * Process-wide TTL cache in front of an upstream API.
 *
 * - Every visitor shares one upstream call per `ttlMs`, which keeps us far
 *   below the free-tier rate limits no matter how many tabs are polling.
 * - Concurrent misses are de-duplicated into a single request.
 * - If the upstream call fails, the last good copy is served with
 *   `stale: true`; only a cold failure (nothing cached yet) throws.
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<PulsePayload<T>> {
  const hit = store.get(key) as Entry<T> | undefined;
  if (hit && Date.now() - hit.fetchedAt < ttlMs) {
    return { ...hit, stale: false };
  }

  let pending = inflight.get(key) as Promise<Entry<T>> | undefined;
  if (!pending) {
    pending = loader()
      .then((data) => {
        const entry = { data, fetchedAt: Date.now() };
        store.set(key, entry);
        return entry;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, pending);
  }

  try {
    return { ...(await pending), stale: false };
  } catch (err) {
    if (hit) return { ...hit, stale: true };
    throw err;
  }
}

/** fetch() with a hard timeout and a JSON body, bypassing Next's data cache. */
export async function fetchJson<T>(
  url: string,
  init: RequestInit = {},
  timeoutMs = 8000,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { "User-Agent": "live-pulse-dashboard", ...init.headers },
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return (await res.json()) as T;
}
