import "server-only";
import { connection } from "next/server";
import { cached } from "./cache";

/**
 * Builds a GET handler that proxies one upstream source through the shared
 * TTL cache. `ttlSeconds` is how often we are willing to hit the upstream API,
 * independent of how often browsers poll us.
 */
export function pulseRoute<T>(key: string, ttlSeconds: number, loader: () => Promise<T>) {
  return async function GET() {
    await connection(); // always run at request time, never prerender

    try {
      const payload = await cached(key, ttlSeconds * 1000, loader);
      return Response.json(payload, {
        headers: { "Cache-Control": `public, max-age=0, s-maxage=${ttlSeconds}` },
      });
    } catch (err) {
      console.error(`[live-pulse] ${key} unavailable:`, err);
      return Response.json(
        { error: `${key} kaynağına şu an ulaşılamıyor` },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }
  };
}
