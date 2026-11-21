'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink, Quote, Star } from 'lucide-react';
import { AccentHeadline } from '@/components/ui/AccentHeadline';
import { IdbImage } from '@/components/ui/IdbImage';
import { SITE_CONFIG } from '@/config/site';
import { useVVStore } from '@/context/VVStoreContext';
import { useScrollReveal } from '@/hooks/useGsapReveal';
import { getInitials } from '@/lib/format';
import { cn } from '@/lib/utils';

export function TestimonialsSection() {
  const { visibleTestimonials } = useVVStore();
  const sectionRef = useRef<HTMLElement>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const touchStartX = useRef<number | null>(null);

  useScrollReveal(sectionRef, '[data-reveal]');

  // Adapt cards per slide across mobile (1), tablet (2), desktop (3)
  useEffect(() => {
    const updatePerPage = () => {
      if (window.innerWidth < 640) setPerPage(1);
      else if (window.innerWidth < 1024) setPerPage(2);
      else setPerPage(3);
    };
    updatePerPage();
    window.addEventListener('resize', updatePerPage);
    return () => window.removeEventListener('resize', updatePerPage);
  }, []);

  const totalPages = Math.max(
    1,
    Math.ceil(visibleTestimonials.length / perPage)
  );
  const safePage = pageIndex % totalPages;
  const start = safePage * perPage;
  const slice = visibleTestimonials.slice(start, start + perPage);

  if (visibleTestimonials.length === 0) {
    return null;
  }

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className="border-b border-[#DBCCC6]/80 bg-[#FAF6F4] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div data-reveal className="max-w-2xl">
            <div className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.26em] text-[#9A5F1D] uppercase">
              <span>CLIENT PERSPECTIVES</span>
              <span className="h-px w-10 bg-[#CE8936]/55" aria-hidden="true" />
            </div>
            <AccentHeadline
              as="h2"
              text="Trusted by Buyers & Families."
              accentWord="Buyers"
              className="mt-3.5 font-display text-[34px] leading-[1.12] font-semibold text-[#491F40] sm:text-[42px] lg:text-[46px]"
            />
            <div className="mt-3.5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#DBCCC6] bg-white px-3 py-1 text-xs font-semibold text-[#491F40]">
                <Star className="h-3.5 w-3.5 fill-[#CE8936] text-[#CE8936]" />
                <span>{SITE_CONFIG.contact.rating.label}</span>
              </span>
              <p className="text-sm text-[#491F40]/68">
                Client experiences shared with V.V Properties.
              </p>
            </div>
          </div>

          {totalPages > 1 && (
            <div data-reveal className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() =>
                  setPageIndex((safePage - 1 + totalPages) % totalPages)
                }
                aria-label="Previous testimonials"
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#DBCCC6] bg-white text-[#491F40] transition-colors hover:border-[#491F40] hover:bg-[#491F40] hover:text-white"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setPageIndex((safePage + 1) % totalPages)}
                aria-label="Next testimonials"
                className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#DBCCC6] bg-white text-[#491F40] transition-colors hover:border-[#491F40] hover:bg-[#491F40] hover:text-white"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Cards Grid with Touch Swipe */}
        <div
          data-reveal
          onTouchStart={(e) => {
            touchStartX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const endX = e.changedTouches[0]?.clientX ?? null;
            if (touchStartX.current !== null && endX !== null && totalPages > 1) {
              const delta = endX - touchStartX.current;
              if (Math.abs(delta) > 45) {
                setPageIndex(
                  delta < 0
                    ? (safePage + 1) % totalPages
                    : (safePage - 1 + totalPages) % totalPages
                );
              }
            }
            touchStartX.current = null;
          }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {slice.map((item) => (
            <article
              key={item.id}
              className="flex flex-col justify-between rounded-md border border-[#DBCCC6] bg-white p-7 shadow-[0_10px_28px_rgba(73,31,64,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#CE8936]/75 hover:shadow-[0_18px_38px_rgba(73,31,64,0.10)]"
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div
                    className="flex items-center gap-1"
                    aria-label={`${item.rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          'h-4 w-4',
                          star <= item.rating
                            ? 'fill-[#CE8936] text-[#CE8936]'
                            : 'text-[#DBCCC6]'
                        )}
                      />
                    ))}
                  </div>
                  <Quote
                    className="h-6 w-6 text-[#DBA79C]/75"
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-5 text-[15px] leading-[1.72] text-[#491F40]/82">
                  &ldquo;{item.reviewText}&rdquo;
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-[#DBCCC6]/75 pt-5">
                <div className="flex min-w-0 items-center gap-3">
                  {item.photo ? (
                    <IdbImage
                      src={item.photo}
                      alt={item.clientName}
                      loading="lazy"
                      className="h-11 w-11 shrink-0 rounded-full border border-[#DBCCC6] object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E0C188]/40 bg-[#491F40] text-xs font-semibold tracking-wider text-[#E0C188]">
                      {getInitials(item.clientName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-[#491F40]">
                      {item.clientName}
                    </h3>
                    <p className="truncate text-xs text-[#491F40]/62">
                      {item.locationOrProperty}
                    </p>
                  </div>
                </div>

                {item.reviewUrl && (
                  <a
                    href={item.reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-sm p-1.5 text-[#9A5F1D] transition-colors hover:bg-[#FAF6F4] hover:text-[#491F40]"
                    title="View review source"
                    aria-label="View external review source"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Dots Indicator */}
        {totalPages > 1 && (
          <div className="mt-9 flex justify-center gap-2">
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Testimonial page ${idx + 1}`}
                onClick={() => setPageIndex(idx)}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  idx === safePage
                    ? 'w-8 bg-[#CE8936]'
                    : 'w-2.5 bg-[#DBCCC6] hover:bg-[#491F40]/45'
                )}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
