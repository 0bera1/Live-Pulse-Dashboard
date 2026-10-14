import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { fmtPct } from "@/lib/live-pulse/format";

/** Signed % change: arrow + sign + color, so direction never relies on hue alone. */
export function Delta({ value, digits = 2, className = "" }: { value: number; digits?: number; className?: string }) {
  const flat = Math.abs(value) < 10 ** -digits / 2;
  const Icon = flat ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  const tone = flat ? "text-muted" : value > 0 ? "text-up" : "text-down";
  return (
    <span className={`inline-flex items-center gap-0.5 font-mono text-xs tabular-nums ${tone} ${className}`}>
      <Icon size={13} strokeWidth={2} aria-hidden />
      {fmtPct(value, digits)}
    </span>
  );
}
