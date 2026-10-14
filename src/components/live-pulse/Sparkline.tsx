import { memo, useId } from "react";

interface Props {
  values: number[];
  width?: number;
  height?: number;
  /** CSS color for the line, e.g. "var(--up)". */
  color: string;
  label: string;
}

/** Single-series trend line; the exact figures are in the adjacent text. */
function SparklineImpl({ values, width = 96, height = 28, color, label }: Props) {
  const gradientId = useId();
  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pad = 3;
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * (width - pad * 2) + pad,
    height - pad - ((v - min) / span) * (height - pad * 2),
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join("");
  const area = `${line}L${pts.at(-1)![0].toFixed(1)},${height}L${pts[0][0].toFixed(1)},${height}Z`;
  const [lx, ly] = pts.at(-1)!;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={lx} cy={ly} r={2.5} fill={color} />
    </svg>
  );
}

export const Sparkline = memo(SparklineImpl);
