"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  distance?: string;
  duration?: number;
  origin?: "top" | "bottom" | "left" | "right";
  reset?: boolean;
  as?: keyof React.JSX.IntrinsicElements;
}

export function ScrollRevealBox({
  children,
  className,
  delay = 0,
  distance = "24px",
  duration = 600,
  origin = "bottom",
  reset = false,
  as = "div",
}: ScrollRevealProps) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    import("scrollreveal").then((mod) => {
      if (cancelled) return;
      const ScrollReveal = mod.default;
      const sr = ScrollReveal({
        distance,
        duration,
        delay,
        origin,
        reset,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      });
      sr.reveal(el);
      cleanup = () => {
        if (el && (sr as unknown as { clean: (target: HTMLElement) => void }).clean) {
          (sr as unknown as { clean: (target: HTMLElement) => void }).clean(el);
        }
      };
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [delay, distance, duration, origin, reset]);

  const Comp = as as React.ElementType;
  return (
    <Comp ref={ref as React.Ref<HTMLElement>} className={cn(className)}>
      {children}
    </Comp>
  );
}
