"use client";

import { useT } from "@/lib/live-pulse/i18n";

const SITE_URL = "https://beraekimci.com.tr";

export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-line-strong pt-6 text-center font-mono text-xs text-muted">
      {t.designedBy}
      <a
        href={SITE_URL}
        target="_blank"
        rel="noreferrer"
        className="text-ink transition-colors hover:text-accent"
      >
        Bera
      </a>
    </footer>
  );
}
