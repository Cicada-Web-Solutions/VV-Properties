'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import {
  ArrowRight,
  Building2,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { IdbImage } from '@/components/ui/IdbImage';
import { useVVStore } from '@/context/VVStoreContext';
import { prefersReducedMotion } from '@/hooks/useGsapReveal';
import { cn } from '@/lib/utils';

const AUTOPLAY_INTERVAL_MS = 5500;

export function HeroCarousel() {
  const { activeHeroSlides } = useVVStore();
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [quickQuery, setQuickQuery] = useState('');
  const [quickType, setQuickType] = useState('all');
  const [quickBudget, setQuickBudget] = useState('all');
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
          duration: 0.72,
          stagger: 0.08,
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

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (quickQuery.trim()) params.set('q', quickQuery.trim());
    if (quickType !== 'all') params.set('type', quickType);
    if (quickBudget !== 'all') params.set('budget', quickBudget);
    const qs = params.toString();
    router.push(qs ? `/properties?${qs}` : '/properties');
  };

  const renderHeadline = (headline: string, accentWord?: string) => {
    if (!accentWord || !headline.includes(accentWord)) {
      return headline;
    }
    const idx = headline.indexOf(accentWord);
    return (
      <>
        {headline.slice(0, idx)}
        <span className="text-[#E0C188]">{accentWord}</span>
        {headline.slice(idx + accentWord.length)}
      </>
    );
  };

  return (
    <div className="relative bg-[#FAF6F4]">
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
        className="relative flex min-h-[82vh] w-full items-center overflow-hidden bg-[#32132B] lg:min-h-[88vh]"
      >
        {/* Background Slides */}
        {slides.map((slide, index) => {
          const isCurrent = index === safeIndex;
          return (
            <div
              key={slide.id}
              aria-hidden={!isCurrent}
              className={cn(
                'absolute inset-0 transition-opacity duration-700 ease-out',
                isCurrent ? 'z-0 opacity-100' : 'pointer-events-none z-0 opacity-0'
              )}
            >
              <div
                data-hero-parallax
                className="h-[108%] w-full -translate-y-[4%]"
              >
                <IdbImage
                  src={slide.image}
                  alt={slide.headline}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              {/* Rich Golden Raisin architectural scrim for effortless legibility */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-[#2D1027]/90 via-[#491F40]/68 to-[#2D1027]/45"
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#2D1027]/88 via-transparent to-[#2D1027]/45"
                aria-hidden="true"
              />
            </div>
          );
        })}

        {/* Vertical Editorial Coordinate Label (Desktop) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-7 z-10 hidden origin-right -translate-y-1/2 rotate-90 text-[10.5px] font-medium tracking-[0.34em] text-[#E0C188]/70 uppercase lg:block"
        >
          COIMBATORE &nbsp;&bull;&nbsp; TAMIL NADU
        </div>

        {/* Hero Foreground Content */}
        <div className="relative z-10 mx-auto flex min-h-[82vh] w-full max-w-7xl flex-col justify-between px-4 pt-28 pb-20 sm:px-6 sm:pt-32 sm:pb-24 lg:min-h-[88vh] lg:px-8">
          <div ref={contentRef} className="my-auto max-w-2xl py-4">
            <div
              data-hero-anim
              className="mb-4 h-[2px] w-12 bg-[#E0C188]"
              aria-hidden="true"
            />
            <p
              data-hero-anim
              className="text-[11px] font-semibold tracking-[0.28em] text-[#E0C188] uppercase"
            >
              {activeSlide.eyebrow}
            </p>

            <h1
              data-hero-anim
              className="mt-4 font-display text-[42px] leading-[1.06] font-semibold tracking-tight text-white sm:text-[58px] lg:text-[72px]"
            >
              {renderHeadline(activeSlide.headline, activeSlide.accentWord)}
            </h1>

            <p
              data-hero-anim
              className="mt-5 max-w-xl text-base leading-[1.72] text-[#FAF6F4]/88 sm:text-[17px]"
            >
              {activeSlide.supportingText}
            </p>

            {activeSlide.ctaText && (
              <div
                data-hero-anim
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <Link
                  href={activeSlide.ctaLink || '/properties'}
                  className="inline-flex items-center gap-2.5 rounded-sm bg-gradient-to-br from-[#E0C188] to-[#CE8936] px-7 py-3.5 text-[13px] font-semibold tracking-wider text-[#491F40] uppercase shadow-[0_12px_30px_rgba(206,137,54,0.28)] transition-all hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0C188]"
                >
                  <span>{activeSlide.ctaText}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* Trust Highlights Row */}
            <div
              data-hero-anim
              className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-[13px] text-[#DBCCC6]"
            >
              <span className="inline-flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#E0C188]" />
                <span>Residential &amp; Commercial</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <Compass className="h-4 w-4 text-[#E0C188]" />
                <span>Land &amp; Plot Transactions</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#E0C188]" />
                <span>Transparent Guidance</span>
              </span>
            </div>
          </div>

          {/* Bottom Controls Bar */}
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-[#E0C188]/20 pt-5">
            <a
              href="#who-we-are"
              className="inline-flex items-center gap-3 text-[10.5px] font-semibold tracking-[0.24em] text-[#DBCCC6] uppercase transition-colors hover:text-[#E0C188]"
            >
              <span className="relative h-7 w-px overflow-hidden bg-white/25">
                <span className="animate-vv-scroll absolute top-0 left-0 h-3.5 w-px bg-[#E0C188]" />
              </span>
              <span>Scroll to Explore</span>
            </a>

            {slides.length > 1 && (
              <div className="flex items-center gap-4">
                <div
                  className="flex items-center gap-2"
                  role="tablist"
                  aria-label="Slide selector"
                >
                  {slides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={idx === safeIndex}
                      aria-label={`View slide ${idx + 1}: ${slide.headline}`}
                      onClick={() => goTo(idx)}
                      className={cn(
                        'h-1.5 rounded-full transition-all',
                        idx === safeIndex
                          ? 'w-8 bg-[#E0C188]'
                          : 'w-2 bg-white/35 hover:bg-white/70'
                      )}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goTo(safeIndex - 1)}
                    aria-label="Previous hero slide"
                    className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#E0C188]/30 bg-[#32132B]/55 text-white transition-colors hover:border-[#E0C188] hover:bg-[#CE8936] hover:text-[#491F40]"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(safeIndex + 1)}
                    aria-label="Next hero slide"
                    className="flex h-9 w-9 items-center justify-center rounded-sm border border-[#E0C188]/30 bg-[#32132B]/55 text-white transition-colors hover:border-[#E0C188] hover:bg-[#CE8936] hover:text-[#491F40]"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Overlapping Quick Property Discovery Bar (Latitude-Inspired) */}
      <div className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <form
          onSubmit={handleQuickSearch}
          aria-label="Quick property finder"
          className="grid grid-cols-1 items-end gap-4 rounded-md border border-[#DBCCC6] bg-white p-5 shadow-[0_24px_56px_rgba(73,31,64,0.14)] md:grid-cols-[1.2fr_1fr_1fr_auto] md:gap-6 md:p-7"
        >
          <div>
            <label
              htmlFor="hero-search-location"
              className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-semibold tracking-[0.18em] text-[#9A5F1D] uppercase"
            >
              <MapPin className="h-3.5 w-3.5 text-[#CE8936]" />
              <span>Location or Property</span>
            </label>
            <div className="relative">
              <input
                id="hero-search-location"
                type="text"
                value={quickQuery}
                onChange={(e) => setQuickQuery(e.target.value)}
                placeholder="Search area, city, or property name..."
                className="w-full border-0 border-b border-[#DBCCC6] bg-transparent py-2 text-[15px] text-[#491F40] placeholder:text-[#491F40]/40 focus:border-[#CE8936] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="hero-search-type"
              className="mb-1.5 block text-[10.5px] font-semibold tracking-[0.18em] text-[#9A5F1D] uppercase"
            >
              Property Type
            </label>
            <select
              id="hero-search-type"
              value={quickType}
              onChange={(e) => setQuickType(e.target.value)}
              className="w-full border-0 border-b border-[#DBCCC6] bg-transparent py-2 text-[15px] text-[#491F40] focus:border-[#CE8936] focus:outline-none"
            >
              <option value="all">All Property Types</option>
              <option value="Villa">Villa</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Apartment">Apartment</option>
              <option value="Plot">Plot / Land</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="hero-search-budget"
              className="mb-1.5 block text-[10.5px] font-semibold tracking-[0.18em] text-[#9A5F1D] uppercase"
            >
              Budget (INR)
            </label>
            <select
              id="hero-search-budget"
              value={quickBudget}
              onChange={(e) => setQuickBudget(e.target.value)}
              className="w-full border-0 border-b border-[#DBCCC6] bg-transparent py-2 text-[15px] text-[#491F40] focus:border-[#CE8936] focus:outline-none"
            >
              <option value="all">Any Price Range</option>
              <option value="under-5">Up to ₹ 5 Cr</option>
              <option value="5-8">₹ 5 Cr – ₹ 8 Cr</option>
              <option value="8-12">₹ 8 Cr – ₹ 12 Cr</option>
              <option value="above-12">₹ 12 Cr &amp; Above</option>
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-gradient-to-br from-[#E0C188] to-[#CE8936] px-6 py-3.5 text-[13px] font-semibold tracking-wider whitespace-nowrap text-[#491F40] uppercase shadow-sm transition-all hover:-translate-y-0.5 hover:brightness-105"
          >
            <Search className="h-4 w-4" />
            <span>Find Properties</span>
          </button>
        </form>
      </div>
    </div>
  );
}
