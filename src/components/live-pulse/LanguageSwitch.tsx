"use client";

import { useEffect } from "react";
import { initLocale, LOCALES, setLocale, useLocale, useT } from "@/lib/live-pulse/i18n";

/** Segmented language picker; also applies the saved/browser language on mount. */
export function LanguageSwitch() {
  const locale = useLocale();
  const t = useT();

  useEffect(() => {
    initLocale();
  }, []);

  return (
    <div className="flex justify-end">
      <div
        role="group"
        aria-label={t.languageLabel}
        className="inline-flex overflow-hidden rounded-md border border-line-strong font-mono text-[11px]"
      >
        {LOCALES.map((l) => (
          <button
            key={l.id}
            type="button"
            lang={l.id}
            title={l.name}
            aria-pressed={locale === l.id}
            onClick={() => setLocale(l.id)}
            className={`px-3 py-1.5 transition-colors ${
              locale === l.id ? "bg-surface-2 text-accent" : "text-muted hover:text-ink"
            }`}
          >
            {l.short}
          </button>
        ))}
      </div>
    </div>
  );
}
