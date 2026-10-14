"use client";

import { animate, useReducedMotion } from "framer-motion";
import { memo, useEffect, useRef } from "react";

interface Props {
  value: number;
  format: (n: number) => string;
  /** Briefly tint the number green/orange when it moves up/down. */
  flash?: boolean;
  duration?: number;
  className?: string;
}

/**
 * Tweens between values by writing straight to the DOM node, so a counting
 * animation costs zero React re-renders.
 */
function AnimatedNumberImpl({ value, format, flash = true, duration = 0.9, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    const from = prev.current;
    prev.current = value;
    if (!el || from === value) return;

    let flashTimer: ReturnType<typeof setTimeout> | undefined;
    if (flash) {
      el.dataset.flash = value > from ? "up" : "down";
      flashTimer = setTimeout(() => delete el.dataset.flash, 1200);
    }

    if (reduceMotion) {
      el.textContent = format(value);
      return () => clearTimeout(flashTimer);
    }

    const controls = animate(from, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = format(v);
      },
    });
    return () => {
      controls.stop();
      clearTimeout(flashTimer);
    };
  }, [value, format, flash, duration, reduceMotion]);

  return (
    <span ref={ref} className={`tabular-nums transition-colors duration-700 ${className ?? ""}`}>
      {format(value)}
    </span>
  );
}

export const AnimatedNumber = memo(AnimatedNumberImpl);
