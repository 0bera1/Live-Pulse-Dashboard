"use client";

import { memo, useRef, useState } from "react";
import { ComposableMap, Geographies, Geography, Graticule, Marker, Sphere } from "react-simple-maps";
import { fmtFixed } from "@/lib/live-pulse/format";
import type { Quake } from "@/lib/live-pulse/types";
import { RelativeTime } from "./RelativeTime";

const WIDTH = 800;
const HEIGHT = 390;
const GEO_URL = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/geo/countries-110m.json`;
const RECENT_MS = 60 * 60 * 1000;

export const QUAKE_TIERS = [
  { min: 6, label: "Güçlü · M6+", color: "var(--quake-strong)" },
  { min: 4.5, label: "Orta · M4.5–5.9", color: "var(--quake-moderate)" },
  { min: 0, label: "Hafif · M2.5–4.4", color: "var(--quake-light)" },
] as const;

export const quakeColor = (mag: number) => QUAKE_TIERS.find((t) => mag >= t.min)!.color;
const quakeRadius = (mag: number) => 2.5 + Math.max(0, mag - 2.5) * 2.3;

/** Static land layer; memoized so marker updates never re-project countries. */
const Land = memo(function Land() {
  return (
    <>
      <Sphere id="rsm-sphere" fill="var(--map-ocean)" stroke="var(--line-strong)" strokeWidth={0.6} />
      <Graticule stroke="var(--map-grid)" strokeWidth={0.4} step={[20, 20]} />
      <Geographies geography={GEO_URL}>
        {({ geographies }) =>
          geographies.map((geo) => (
            <Geography
              key={geo.rsmKey}
              geography={geo}
              fill="var(--map-land)"
              stroke="var(--map-border)"
              strokeWidth={0.4}
              style={{ outline: "none" }}
            />
          ))
        }
      </Geographies>
    </>
  );
});

interface Props {
  quakes: Quake[];
  /** Epoch ms the data was fetched; quakes within 1h of it get a ripple. */
  referenceTime: number;
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
}

function QuakeMapImpl({ quakes, referenceTime, activeId, onActiveChange }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null);

  // Draw small quakes first so big ones sit on top.
  const ordered = [...quakes].sort((a, b) => a.mag - b.mag);
  const active = quakes.find((q) => q.id === activeId);

  const track = (e: React.PointerEvent) => {
    const box = wrap.current?.getBoundingClientRect();
    if (!box) return;
    const half = 128; // keep the 15rem tooltip inside the map
    const x = Math.min(Math.max(e.clientX - box.left, half), box.width - half);
    setTip({ x, y: e.clientY - box.top });
  };

  return (
    <div ref={wrap} className="relative" onPointerLeave={() => onActiveChange(null)}>
      <ComposableMap
        width={WIDTH}
        height={HEIGHT}
        projection="geoEqualEarth"
        projectionConfig={{ scale: 150, center: [10, 4] }}
        className="h-auto w-full"
        role="img"
        aria-label={`Son 24 saatteki ${quakes.length} depremin dünya haritası`}
      >
        <Land />
        {ordered.map((q) => {
          const r = quakeRadius(q.mag);
          const color = quakeColor(q.mag);
          const isActive = q.id === activeId;
          return (
            <Marker
              key={q.id}
              coordinates={[q.lon, q.lat]}
              onPointerEnter={(e) => {
                track(e);
                onActiveChange(q.id);
              }}
              onPointerMove={track}
              style={{ cursor: "pointer" }}
            >
              {referenceTime - q.time < RECENT_MS && (
                <circle r={r} fill="none" stroke={color} strokeWidth={1.2} className="quake-ripple" />
              )}
              {/* Invisible, larger hit target. */}
              <circle r={Math.max(r, 8)} fill="transparent" />
              <circle
                r={isActive ? r + 2 : r}
                fill={color}
                fillOpacity={isActive ? 0.95 : 0.7}
                stroke="var(--surface)"
                strokeWidth={isActive ? 2 : 1}
                style={{ transition: "r 200ms, fill-opacity 200ms" }}
              />
            </Marker>
          );
        })}
      </ComposableMap>

      {active && tip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute z-10 w-60 -translate-x-1/2 rounded-md border border-line-strong bg-surface-2/95 px-3 py-2 shadow-xl backdrop-blur"
          style={{
            left: tip.x,
            top: tip.y + 16,
          }}
        >
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-lg font-semibold text-ink">M{fmtFixed(active.mag, 1)}</span>
            <RelativeTime time={active.time} className="font-mono text-[11px] text-muted" />
          </div>
          <p className="mt-0.5 text-xs leading-snug text-ink-2">{active.place}</p>
          <p className="mt-1 font-mono text-[11px] text-muted">
            Derinlik {active.depthKm} km{active.tsunami ? " · tsunami uyarısı" : ""}
          </p>
        </div>
      )}
    </div>
  );
}

export const QuakeMap = memo(QuakeMapImpl);
