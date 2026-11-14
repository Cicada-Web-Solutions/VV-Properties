'use client';

import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Subtle scroll-triggered editorial fade/rise reveal for children matching selector.
 * Respects prefers-reduced-motion and cleans up safely via gsap.context().
 */
export function useScrollReveal(
  containerRef: React.RefObject<HTMLElement | null>,
  selector = '[data-reveal]',
  deps: unknown[] = []
) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const targets = el.querySelectorAll(selector);
      if (targets.length === 0) return;

      gsap.fromTo(
        targets,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.72,
          stagger: 0.08,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: el,
            start: 'top 84%',
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Subtle count-up animation for integer counters inside containerRef.
 */
export function useCountUpOnScroll(
  containerRef: React.RefObject<HTMLElement | null>,
  selector = '[data-countup]'
) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const nodes = el.querySelectorAll<HTMLElement>(selector);
      nodes.forEach((node) => {
        const target = Number(node.dataset.target ?? '0');
        const suffix = node.dataset.suffix ?? '';
        if (!Number.isFinite(target)) return;

        const counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration: 1.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: node,
            start: 'top 88%',
            once: true,
          },
          onUpdate: () => {
            node.textContent = `${Math.round(counter.value)}${suffix}`;
          },
        });
      });
    }, el);

    return () => ctx.revert();
  }, [containerRef, selector]);
}
