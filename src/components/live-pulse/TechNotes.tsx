import { ArrowUpRight } from "lucide-react";

const REPO_URL = process.env.NEXT_PUBLIC_REPO_URL ?? "https://github.com/";

const STACK = [
  { k: "Framework", v: "Next.js App Router · TypeScript" },
  { k: "Veri", v: "5 halka açık API, anahtar gerektirmez" },
  { k: "Proxy", v: "Route Handler + paylaşımlı TTL önbellek" },
  { k: "Güncelleme", v: "Interval tabanlı polling, sekme gizliyken durur" },
  { k: "Dayanıklılık", v: "Kaynak düşerse son bilinen veri gösterilir" },
  { k: "Arayüz", v: "Tailwind CSS · Framer Motion · react-simple-maps" },
];

export function TechNotes() {
  return (
    <section className="panel grid gap-8 p-6 md:grid-cols-[1fr_2fr] md:p-8" aria-labelledby="tech-title">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent">Teknik not</p>
        <h2 id="tech-title" className="mt-2 text-xl font-semibold text-ink">
          Bu proje nasıl çalışıyor?
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-2">
          Sahte backend yok. Tarayıcı yalnızca kendi API route&apos;larımızla konuşuyor. Sunucu her kaynağı kendi hız
          limitine uygun aralıklarla çekip önbelleğe alıyor, böylece ziyaretçi sayısı ne olursa olsun dış servislere
          giden istek sayısı sabit kalıyor.
        </p>
        <a
          href={REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 rounded-md border border-line-strong px-3.5 py-2 font-mono text-xs text-ink transition-colors hover:border-accent hover:text-accent"
        >
          Kaynak kodu GitHub&apos;da incele <ArrowUpRight size={14} aria-hidden />
        </a>
      </div>
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {STACK.map((s) => (
          <div key={s.k} className="border-l border-line pl-4">
            <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{s.k}</dt>
            <dd className="mt-1 text-sm text-ink-2">{s.v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
