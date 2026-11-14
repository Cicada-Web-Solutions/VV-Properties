'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ArrowDown, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { IdbImage } from '@/components/ui/IdbImage';
import { useVVStore } from '@/context/VVStoreContext';
import { prefersReducedMotion } from '@/hooks/useGsapReveal';
import { cn } from '@/lib/utils';

const AUTOPLAY_INTERVAL_MS = 5000;

export function HeroCarousel() {
  const { activeHeroSlides } = useVVStore();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const slides = activeHeroSlides.length > 0 ? activeHeroSlides : [];
  const safeIndex = slides.length > 0 ? current % slides.length : 0;
  const activeSlide = slides[safeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      setCurrent((index + slides.length) % slides.length);
    },
    [slides.length]
  );

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, slides.length]);

  // Subtle GSAP reveal when slide changes
  useEffect(() => {
    const node = contentRef.current;
    if (!node || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        node.querySelectorAll('[data-hero-anim]'),
        { y: 18, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.09,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
        }
      );
    }, node);
    return () => ctx.revert();
  }, [safeIndex]);

  // Subtle gentle scroll parallax on hero media
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.to('[data-hero-parallax]', {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, hero);
    return () => ctx.revert();
  }, []);

  if (!activeSlide) {
    return null;
  }

  const renderHeadline = (headline: string, accentWord?: string) => {
    if (!accentWord || !headline.includes(accentWord)) {
      return headline;
    }
    const idx = headline.indexOf(accentWord);
    return (
      <>
        {headline.slice(0, idx)}
        <span className="text-[#CDE6F5]">{accentWord}</span>
        {headline.slice(idx + accentWord.length)}
      </>
    );
  };

  return (
    <section
      ref={heroRef}
      aria-label="Featured Architectural Showcase"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => {
        setPaused(true);
        touchStartX.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const endX = e.changedTouches[0]?.clientX ?? null;
        if (touchStartX.current !== null && endX !== null) {
          const delta = endX - touchStartX.current;
          if (Math.abs(delta) > 45) {
            goTo(delta < 0 ? safeIndex + 1 : safeIndex - 1);
          }
        }
        touchStartX.current = null;
        setPaused(false);
      }}
      className="relative min-h-[540px] w-full overflow-hidden bg-[#0D0221] sm:min-h-[620px] lg:min-h-[700px]"
    >
      {/* Background slides */}
      {slides.map((slide, index) => {
        const isCurrent = index === safeIndex;
        return (
          <div
            key={slide.id}
            aria-hidden={!isCurrent}
            className={cn(
              'absolute inset-0 transition-opacity duration-700 ease-out',
              isCurrent ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none z-0'
            )}
          >
            <div data-hero-parallax className="h-[108%] w-full -translate-y-[4%]">
              <IdbImage
                src={slide.image}
                alt={slide.headline}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="h-full w-full object-cover object-center"
              />
            </div>
            {/* Dark architectural gradient scrim for guaranteed readability */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-[#0D0221]/88 via-[#0D0221]/55 to-[#0D0221]/20"
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0D0221]/50 to-transparent"
              aria-hidden="true"
            />
          </div>
        );
      })}

      {/* Slide Content */}
      <div className="relative z-10 mx-auto flex min-h-[540px] max-w-7xl flex-col justify-between px-4 py-14 sm:min-h-[620px] sm:px-6 sm:py-16 lg:min-h-[700px] lg:px-8 lg:py-20">
        <div ref={contentRef} className="my-auto max-w-2xl pt-4">
          <div
            data-hero-anim
            className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-[#CDE6F5] uppercase"
          >
            <span>{activeSlide.eyebrow}</span>
            <span className="h-px w-10 bg-[#CDE6F5]/50" aria-hidden="true" />
          </div>

          <h1
            data-hero-anim
            className="mt-4 font-display text-4xl leading-[1.05] font-medium tracking-tight text-white sm:text-5xl lg:text-[68px]"
          >
            {renderHeadline(activeSlide.headline, activeSlide.accentWord)}
          </h1>

          <p
            data-hero-anim
            className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg"
          >
            {activeSlide.supportingText}
          </p>

          {activeSlide.ctaText && (
            <div data-hero-anim className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href={activeSlide.ctaLink || '/properties'}
                className="inline-flex items-center gap-2.5 rounded-lg bg-[#4062BB] px-6 py-3.5 text-sm font-medium text-white shadow-lg transition-all hover:bg-[#3250a3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CDE6F5]"
              >
                <span>{activeSlide.ctaText}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-lg border border-white/30 bg-white/10 px-5 py-3.5 text-sm font-medium text-white backdrop-blur-[2px] transition-colors hover:bg-white hover:text-[#0D0221]"
              >
                <span>Private Advisory</span>
              </Link>
            </div>
          )}
        </div>

        {/* Bottom Controls Bar */}
        <div className="mt-10 flex items-center justify-between gap-4 border-t border-white/15 pt-5">
          <a
            href="#who-we-are"
            className="inline-flex items-center gap-2 text-xs font-medium tracking-wider text-white/75 uppercase transition-colors hover:text-[#CDE6F5]"
          >
            <span className="h-4 w-px bg-white/40" aria-hidden="true" />
            <span>Scroll Down</span>
            <ArrowDown className="h-3.5 w-3.5" />
          </a>

          {slides.length > 1 && (
            <div className="flex items-center gap-4">
              {/* Dots */}
              <div className="flex items-center gap-2" role="tablist" aria-label="Slide selector">
                {slides.map((slide, idx) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={idx === safeIndex}
                    aria-label={`View slide ${idx + 1}: ${slide.headline}`}
                    onClick={() => goTo(idx)}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      idx === safeIndex
                        ? 'w-7 bg-[#CDE6F5]'
                        : 'w-2 bg-white/40 hover:bg-white/75'
                    )}
                  />
                ))}
              </div>

              {/* Prev / Next */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goTo(safeIndex - 1)}
                  aria-label="Previous hero slide"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-[#0D0221]/40 text-white transition-colors hover:border-[#CDE6F5] hover:bg-[#4062BB]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => goTo(safeIndex + 1)}
                  aria-label="Next hero slide"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-[#0D0221]/40 text-white transition-colors hover:border-[#CDE6F5] hover:bg-[#4062BB]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
