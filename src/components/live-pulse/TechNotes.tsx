"use client";

import { ArrowUpRight } from "lucide-react";
import { useT } from "@/lib/live-pulse/i18n";

const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/0bera1/live-pulse-dashboard";

export function TechNotes() {
  const t = useT();
  return (
    <section className="panel grid gap-8 p-6 md:grid-cols-[1fr_2fr] md:p-8" aria-labelledby="tech-title">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">{t.tech.eyebrow}</p>
        <h2 id="tech-title" className="mt-2 text-xl font-semibold text-ink">
          {t.tech.heading}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          {t.tech.body}
        </p>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-line-strong px-3.5 py-2 font-mono text-xs text-ink transition-colors hover:border-accent hover:text-accent"
        >
          {t.tech.repo} <ArrowUpRight size={14} aria-hidden />
        </a>
      </div>
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {t.tech.stack.map((s) => (
          <div key={s.k} className="border-l border-line pl-4">
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{s.k}</dt>
            <dd className="mt-1 text-sm text-ink-2">{s.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
