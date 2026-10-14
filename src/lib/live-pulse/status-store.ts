import { useSyncExternalStore } from "react";
import type { SourceId } from "./types";

export type SourceStatus = "loading" | "live" | "stale" | "down";

export interface SourceState {
  status: SourceStatus;
  /** Epoch ms of the freshest upstream data this source has delivered. */
  updatedAt: number | null;
  /** Epoch ms of the last poll round-trip (successful or not). */
  checkedAt: number | null;
  /** Epoch ms of the next scheduled poll; null while paused. */
  nextAt: number | null;
  latencyMs: number | null;
}

export interface LogEntry {
  id: number;
  at: number;
  source: SourceId;
  ok: boolean;
  code: number | "ERR";
  latencyMs: number;
  message: string;
  /** Something genuinely new arrived (new quake, new events, price move). */
  highlight: boolean;
}

export const SOURCES: SourceId[] = ["earthquakes", "crypto", "fx", "weather", "github"];
const LOG_LIMIT = 40;

interface PulseState {
  sources: Record<SourceId, SourceState>;
  requests: number;
  totalLatencyMs: number;
  log: LogEntry[];
}

/**
 * Tiny external store for poll telemetry. Each card subscribes only to its
 * own slice, so one source updating never re-renders the other cards.
 */
let state: PulseState = {
  sources: Object.fromEntries(
    SOURCES.map((id) => [
      id,
      { status: "loading", updatedAt: null, checkedAt: null, nextAt: null, latencyMs: null },
    ]),
  ) as Record<SourceId, SourceState>,
  requests: 0,
  totalLatencyMs: 0,
  log: [],
};

let logId = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function reportSource(id: SourceId, patch: Partial<SourceState>) {
  state = { ...state, sources: { ...state.sources, [id]: { ...state.sources[id], ...patch } } };
  emit();
}

export function recordPoll(entry: Omit<LogEntry, "id">, source: Partial<SourceState>) {
  state = {
    sources: { ...state.sources, [entry.source]: { ...state.sources[entry.source], ...source } },
    requests: state.requests + 1,
    totalLatencyMs: state.totalLatencyMs + entry.latencyMs,
    log: [{ ...entry, id: ++logId }, ...state.log].slice(0, LOG_LIMIT),
  };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getState = () => state;

export function usePulseState() {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function useSourceState(id: SourceId) {
  const get = () => state.sources[id];
  return useSyncExternalStore(subscribe, get, get);
}
