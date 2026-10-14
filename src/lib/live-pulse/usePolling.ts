"use client";

import { useEffect, useRef, useState } from "react";
import { recordPoll, reportSource, type SourceStatus } from "./status-store";
import type { PulsePayload, SourceId } from "./types";

export interface PollingState<T> {
  /** Last known good data; kept even when a later poll fails. */
  data: T | null;
  /** Epoch ms when the server last reached the upstream API. */
  fetchedAt: number | null;
  loading: boolean;
  /** True when the latest poll failed or the server served a stale copy. */
  degraded: boolean;
}

export interface Change {
  message: string;
  /** Marks the log line as notable (new quake, new events, price move...). */
  highlight?: boolean;
}

/** Summarizes a new snapshot for the activity log. `prev` is null on first load. */
export type Describe<T> = (next: T, prev: T | null) => Change;

/**
 * Polls `/api/live-pulse/{source}` every `intervalMs`.
 *
 * - Pauses while the tab is hidden and refreshes immediately when it returns.
 * - Never overlaps requests; aborts the in-flight one on unmount.
 * - Only sets state when the upstream snapshot changed, so the card doesn't
 *   re-render on a cache hit — but every round-trip is still reported to the
 *   status store (latency, next poll time) and written to the activity log.
 */
export function usePolling<T>(
  source: SourceId,
  intervalMs: number,
  describe: Describe<T>,
): PollingState<T> {
  const [state, setState] = useState<PollingState<T>>({
    data: null,
    fetchedAt: null,
    loading: true,
    degraded: false,
  });
  const latest = useRef(state);
  const describeRef = useRef(describe);

  useEffect(() => {
    describeRef.current = describe;
  });

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;
    let disposed = false;

    const commit = (next: PollingState<T>) => {
      const prev = latest.current;
      if (
        prev.fetchedAt === next.fetchedAt &&
        prev.loading === next.loading &&
        prev.degraded === next.degraded
      ) {
        return;
      }
      latest.current = next;
      setState(next);
    };

    const statusOf = (s: PollingState<T>): SourceStatus =>
      s.data == null ? (s.loading ? "loading" : "down") : s.degraded ? "stale" : "live";

    const tick = async () => {
      clearTimeout(timer);
      controller?.abort();
      controller = new AbortController();
      const started = performance.now();
      let code: number | "ERR" = "ERR";
      let change: Change;

      try {
        const res = await fetch(`/api/live-pulse/${source}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        code = res.status;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as PulsePayload<T>;
        const prev = latest.current;
        const isNew = body.fetchedAt !== prev.fetchedAt;

        // On a server-cache hit, describe the snapshot against itself so the
        // log still reports current values ("yeni deprem yok · 36 izleniyor").
        change = describeRef.current(body.data, isNew ? prev.data : body.data);
        if (body.stale) change = { message: `kaynak yanıt vermiyor · son bilinen veri korunuyor` };

        commit({
          data: isNew ? body.data : prev.data,
          fetchedAt: body.fetchedAt,
          loading: false,
          degraded: body.stale,
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        change = {
          message: latest.current.data ? "istek başarısız · son bilinen veri korunuyor" : "istek başarısız · yeniden denenecek",
        };
        commit({ ...latest.current, loading: false, degraded: true });
      }

      if (disposed) return;
      const now = Date.now();
      const paused = document.hidden;
      if (!paused) timer = setTimeout(tick, intervalMs);

      recordPoll(
        {
          at: now,
          source,
          ok: code !== "ERR" && code < 400,
          code,
          latencyMs: Math.round(performance.now() - started),
          message: change.message,
          highlight: change.highlight ?? false,
        },
        {
          status: statusOf(latest.current),
          updatedAt: latest.current.fetchedAt,
          checkedAt: now,
          nextAt: paused ? null : now + intervalMs,
          latencyMs: Math.round(performance.now() - started),
        },
      );
    };

    const onVisibility = () => {
      if (document.hidden) {
        clearTimeout(timer);
        reportSource(source, { nextAt: null });
      } else {
        tick();
      }
    };

    tick();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true;
      clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [source, intervalMs]);

  return state;
}
