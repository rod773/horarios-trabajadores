"use client";

import * as React from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface GsapRevealProps {
  children: React.ReactNode;
  className?: string;
  y?: number;
  x?: number;
  duration?: number;
  delay?: number;
  scale?: number;
  as?: keyof React.JSX.IntrinsicElements;
}

export function GsapReveal({
  children,
  className,
  y = 30,
  x = 0,
  duration = 0.8,
  delay = 0,
  scale,
  as = "div",
}: GsapRevealProps) {
  const ref = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y, x, scale: scale ?? 1 },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
    return () => ctx.revert();
  }, [y, x, duration, delay, scale]);

  const Comp = as as React.ElementType;
  return (
    <Comp ref={ref as React.Ref<HTMLElement>} className={cn(className)}>
      {children}
    </Comp>
  );
}

export function GsapParallax({
  children,
  className,
  speed = 0.3,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    const reduce =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.to(el, {
        yPercent: -50 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
    return () => ctx.revert();
  }, [speed]);
  return <div ref={ref} className={cn(className)}>{children}</div>;
}
