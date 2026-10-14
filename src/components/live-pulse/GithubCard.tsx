"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CircleDot,
  GitBranch,
  GitCommitHorizontal,
  GitFork,
  GitPullRequest,
  Star,
  Tag,
  Terminal,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { describeGithub } from "@/lib/live-pulse/describe";
import type { GithubData, GithubEvent, GithubEventKind } from "@/lib/live-pulse/types";
import { usePolling } from "@/lib/live-pulse/usePolling";
import { ModuleCard } from "./ModuleCard";
import { RelativeTime } from "./RelativeTime";
import { SkeletonRows } from "./Skeleton";

const VISIBLE = 7;
/** New events are spread over roughly one server refresh window. */
const DRAIN_WINDOW_MS = 80_000;
const MIN_GAP_MS = 1_500;
const MAX_GAP_MS = 8_000;

const KINDS: Record<Exclude<GithubEventKind, "other">, { verb: string; icon: LucideIcon; short: string }> = {
  push: { verb: "kod gönderdi", icon: GitCommitHorizontal, short: "push" },
  pr: { verb: "pull request", icon: GitPullRequest, short: "PR" },
  issue: { verb: "issue", icon: CircleDot, short: "issue" },
  star: { verb: "yıldızladı", icon: Star, short: "yıldız" },
  fork: { verb: "fork'ladı", icon: GitFork, short: "fork" },
  create: { verb: "oluşturdu", icon: GitBranch, short: "yeni" },
  release: { verb: "sürüm yayınladı", icon: Tag, short: "sürüm" },
};

const ACTIONS: Record<string, string> = {
  opened: "açtı",
  closed: "kapattı",
  reopened: "yeniden açtı",
  merged: "birleştirdi",
  branch: "dal oluşturdu",
  tag: "etiket oluşturdu",
  repository: "repo oluşturdu",
};

/**
 * GitHub publishes events in batches; instead of swapping the whole list
 * every poll, queue unseen events and release them one at a time (oldest
 * first) so the feed reads as a continuous stream. Each row keeps its real
 * timestamp.
 */
function useEventStream(data: GithubData | null) {
  const [released, setReleased] = useState<GithubEvent[]>([]);
  const [queued, setQueued] = useState(0);
  const seen = useRef(new Set<string>());
  const initial = useRef<GithubEvent[]>([]);
  const queue = useRef<GithubEvent[]>([]);
  const lastRelease = useRef(0);

  useEffect(() => {
    if (!data) return;
    const fresh = data.events.filter((e) => !seen.current.has(e.id));
    fresh.forEach((e) => seen.current.add(e.id));
    if (initial.current.length === 0) {
      initial.current = data.events.slice(0, VISIBLE);
      return;
    }
    queue.current.push(...fresh.sort((a, b) => a.createdAt - b.createdAt));
  }, [data]);

  useEffect(() => {
    const id = setInterval(() => {
      const q = queue.current;
      setQueued(q.length);
      if (q.length === 0) return;
      const gap = Math.min(MAX_GAP_MS, Math.max(MIN_GAP_MS, DRAIN_WINDOW_MS / q.length));
      if (Date.now() - lastRelease.current < gap) return;
      lastRelease.current = Date.now();
      const next = q.shift()!;
      setQueued(q.length);
      setReleased((prev) => [next, ...(prev.length ? prev : initial.current)].slice(0, VISIBLE));
    }, 500);
    return () => clearInterval(id);
  }, []);

  const rows = released.length ? released : data?.events.slice(0, VISIBLE) ?? [];
  return { rows, queued };
}

export function GithubCard({ className }: { className?: string }) {
  const { data, fetchedAt, loading, degraded } = usePolling<GithubData>("github", 30_000, describeGithub);
  const { rows, queued } = useEventStream(data);
  const reduceMotion = useReducedMotion();

  const breakdown = useMemo(() => {
    if (!data) return [];
    const counts = new Map<GithubEventKind, number>();
    data.events.forEach((e) => counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1));
    return [...counts].sort((a, b) => b[1] - a[1]);
  }, [data]);

  return (
    <ModuleCard
      sourceId="github"
      title="Açık Kaynak Nabzı"
      // lang="en" so the uppercase transform doesn't turn the "i" into "İ".
      subtitle={<><span lang="en">GitHub</span> genel olay akışı</>}
      icon={Terminal}
      source="GitHub REST API"
      sourceHref="https://docs.github.com/rest/activity/events"
      fetchedAt={fetchedAt}
      loading={loading}
      degraded={degraded}
      hasData={data != null}
      className={className}
      skeleton={<SkeletonRows rows={VISIBLE} className="h-9" />}
    >
      {data && (
        <>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 font-mono text-[11px] text-muted">
            <p>
              Son {data.events.length} olay:{" "}
              {breakdown.map(([kind, n], i) => (
                <span key={kind} className="text-ink-2">
                  {i > 0 && " · "}
                  {n} {KINDS[kind as keyof typeof KINDS]?.short ?? kind}
                </span>
              ))}
            </p>
            {queued > 0 && (
              <p className="flex items-center gap-1.5 text-accent">
                <span className="size-1.5 rounded-full bg-accent pulse-dot" aria-hidden />
                {queued} olay akışa giriyor
              </p>
            )}
          </div>
          <ul className="flex flex-col" aria-live="polite">
            <AnimatePresence initial={false}>
              {rows.map((e) => {
                const k = KINDS[e.kind as keyof typeof KINDS];
                const Icon = k.icon;
                const verb = (e.detail && ACTIONS[e.detail]) || k.verb;
                return (
                  <motion.li
                    key={e.id}
                    layout={!reduceMotion}
                    initial={reduceMotion ? false : { opacity: 0, y: -10, backgroundColor: "rgba(56,214,240,0.10)" }}
                    animate={{ opacity: 1, y: 0, backgroundColor: "rgba(56,214,240,0)" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut", backgroundColor: { duration: 2.4 } }}
                    className="-mx-2 flex items-center gap-3 rounded border-b border-line px-2 py-2.5 last:border-0"
                  >
                    <Image src={e.avatar} alt="" width={24} height={24} className="size-6 shrink-0 rounded-full border border-line" unoptimized />
                    <p className="min-w-0 flex-1 truncate text-sm">
                      <span className="text-ink">{e.actor}</span>{" "}
                      <span className="text-muted">{verb}</span>{" "}
                      <a href={`https://github.com/${e.repo}`} target="_blank" rel="noreferrer" className="font-mono text-xs text-accent hover:underline">
                        {e.repo}
                      </a>
                    </p>
                    <Icon size={14} className="shrink-0 text-ink-2" aria-label={k.short} />
                    <RelativeTime time={e.createdAt} className="w-20 shrink-0 text-right font-mono text-[11px] text-muted" />
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          <p className="mt-auto pt-4 font-mono text-[11px] text-muted">
            GitHub bu akışı kendi tarafında birkaç dakika gecikmeli yayınlar.
          </p>
        </>
      )}
    </ModuleCard>
  );
}
