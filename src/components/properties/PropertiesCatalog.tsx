'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building, ChevronLeft, ChevronRight } from 'lucide-react';
import { PropertyCard } from '@/components/properties/PropertyCard';
import {
  PRICE_PRESETS,
  PropertyFiltersBar,
} from '@/components/properties/PropertyFiltersBar';
import { AccentHeadline } from '@/components/ui/AccentHeadline';
import { useVVStore } from '@/context/VVStoreContext';
import { useScrollReveal } from '@/hooks/useGsapReveal';
import { supabase } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import type { PropertyFilterState, PropertyType } from '@/types';

const ITEMS_PER_PAGE = 6;

const DEFAULT_FILTERS: PropertyFilterState = {
  search: '',
  areas: [],
  type: 'all',
  minPrice: null,
  maxPrice: null,
  availability: 'all',
  sort: 'featured',
};

function parseInitialType(raw: string | null): PropertyType | 'all' {
  if (
    raw === 'Villa' ||
    raw === 'Penthouse' ||
    raw === 'Apartment' ||
    raw === 'Plot' ||
    raw === 'Commercial'
  ) {
    return raw;
  }
  return 'all';
}

export function PropertiesCatalog() {
  const { publishedProperties, isHydrated, refreshCatalog } = useVVStore();
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);

  // Sync with live Supabase database on mount & subscribe to real-time changes
  useEffect(() => {
    void refreshCatalog();

    const channel = supabase
      .channel('public_properties_catalog_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        () => {
          console.log('[PropertiesCatalog] Realtime change detected, refreshing...');
          void refreshCatalog();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshCatalog]);

  const [filters, setFilters] = useState<PropertyFilterState>(() => {
    const budgetId = searchParams.get('budget');
    const matchedBudget = PRICE_PRESETS.find((p) => p.id === budgetId);
    return {
      ...DEFAULT_FILTERS,
      search: searchParams.get('q') ?? '',
      type: parseInitialType(searchParams.get('type')),
      minPrice: matchedBudget?.min ?? null,
      maxPrice: matchedBudget?.max ?? null,
    };
  });
  const [page, setPage] = useState(1);
  const [resetTick, setResetTick] = useState(0);

  const availableAreas = useMemo(() => {
    const set = new Set<string>();
    publishedProperties.forEach((p) => {
      if (p.area.trim()) set.add(p.area.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [publishedProperties]);

  const filteredProperties = useMemo(() => {
    const q = filters.search.trim().toLowerCase();

    const matched = publishedProperties.filter((p) => {
      const effectivePrice =
        p.hasOffer && p.offerPriceInr ? p.offerPriceInr : p.priceInr;

      if (q) {
        const hay = `${p.title} ${p.area} ${p.city} ${p.type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      if (filters.areas.length > 0 && !filters.areas.includes(p.area)) {
        return false;
      }

      if (filters.type !== 'all' && p.type !== filters.type) {
        return false;
      }

      if (filters.minPrice !== null && effectivePrice < filters.minPrice) {
        return false;
      }

      if (filters.maxPrice !== null && effectivePrice > filters.maxPrice) {
        return false;
      }

      if (
        filters.availability !== 'all' &&
        p.availability !== filters.availability
      ) {
        return false;
      }

      return true;
    });

    const sorted = [...matched];
    if (filters.sort === 'price-asc') {
      sorted.sort((a, b) => {
        const pa = a.hasOffer && a.offerPriceInr ? a.offerPriceInr : a.priceInr;
        const pb = b.hasOffer && b.offerPriceInr ? b.offerPriceInr : b.priceInr;
        return pa - pb;
      });
    } else if (filters.sort === 'price-desc') {
      sorted.sort((a, b) => {
        const pa = a.hasOffer && a.offerPriceInr ? a.offerPriceInr : a.priceInr;
        const pb = b.hasOffer && b.offerPriceInr ? b.offerPriceInr : b.priceInr;
        return pb - pa;
      });
    } else if (filters.sort === 'newest') {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return sorted;
  }, [publishedProperties, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredProperties.length / ITEMS_PER_PAGE)
  );
  const currentPage = Math.min(page, totalPages);
  const paginated = filteredProperties.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useScrollReveal(gridRef, '[data-card-reveal]', [
    currentPage,
    filteredProperties.length,
  ]);

  const handleFilterChange = (next: PropertyFilterState) => {
    setFilters(next);
    setPage(1);
  };

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setResetTick((t) => t + 1);
  };

  const changePage = (nextPage: number) => {
    setPage(nextPage);
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#FAF6F4]">
      {/* Architectural Deep Plum Catalogue Header */}
      <section className="relative bg-[#491F40] pt-28 pb-20 text-white sm:pt-32 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.26em] text-[#E0C188] uppercase">
            <span>PORTFOLIO CATALOGUE</span>
            <span className="h-px w-10 bg-[#E0C188]/45" aria-hidden="true" />
          </div>

          <div className="mt-3.5 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <AccentHeadline
                as="h1"
                text="Curated Properties"
                accentWord="Properties"
                accentClassName="text-[#E0C188]"
                className="font-display text-4xl font-semibold text-white sm:text-5xl lg:text-[54px]"
              />
              <p className="mt-3 max-w-2xl text-sm leading-[1.72] text-[#DBCCC6]/90 sm:text-base">
                Explore residential homes, plots, villas, and commercial
                properties represented by V.V Properties, priced transparently in
                Indian Rupees (INR).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-sm border border-[#E0C188]/30 bg-[#32132B]/70 px-4 py-2 text-xs font-semibold text-[#E0C188]">
                {filteredProperties.length}{' '}
                {filteredProperties.length === 1 ? 'property' : 'properties'}{' '}
                found
              </span>
              <select
                aria-label="Sort properties"
                value={filters.sort}
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    sort: e.target.value as PropertyFilterState['sort'],
                  })
                }
                className="rounded-sm border border-[#E0C188]/35 bg-[#32132B] px-4 py-2 text-xs font-medium text-white focus:border-[#E0C188] focus:outline-none"
              >
                <option value="featured">Sort: Curated Order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Sort: Newest Listed</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Overlapping Filters Bar */}
      <div className="relative z-20 mx-auto -mt-9 max-w-7xl px-4 sm:px-6 lg:px-8">
        <PropertyFiltersBar
          key={resetTick}
          filters={filters}
          availableAreas={availableAreas}
          onChange={handleFilterChange}
          onReset={handleReset}
        />
      </div>

      {/* Grid & Pagination */}
      <section className="py-14 sm:py-16 lg:py-20">
        <div ref={gridRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {!isHydrated ? (
            <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-[430px] animate-pulse rounded-md border border-[#DBCCC6] bg-white/80"
                />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-[#DBCCC6] bg-white px-6 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-[#DBCCC6] bg-[#FAF6F4] text-[#CE8936]">
                <Building className="h-6 w-6" />
              </div>
              <h2 className="mt-5 font-display text-3xl font-semibold text-[#491F40]">
                {publishedProperties.length === 0
                  ? 'No properties currently listed'
                  : 'No properties match your filters'}
              </h2>
              <p className="mt-2.5 max-w-md text-sm leading-relaxed text-[#491F40]/72">
                {publishedProperties.length === 0
                  ? 'Our portfolio is currently being updated with new residential, land, and commercial opportunities. Please check back shortly or contact V.V Properties.'
                  : 'Try clearing a region selection or expanding your INR budget range to browse the full curated catalogue.'}
              </p>
              {publishedProperties.length > 0 && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="mt-6 rounded-sm bg-gradient-to-br from-[#E0C188] to-[#CE8936] px-6 py-2.5 text-xs font-semibold tracking-wider text-[#491F40] uppercase transition-all hover:brightness-105"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
                {paginated.map((property) => (
                  <div key={property.id} data-card-reveal>
                    <PropertyCard property={property} className="h-full" />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav
                  aria-label="Properties Pagination"
                  className="mt-14 flex items-center justify-center gap-2"
                >
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => changePage(currentPage - 1)}
                    aria-label="Previous page"
                    className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#DBCCC6] bg-white text-[#491F40] transition-colors hover:border-[#491F40] hover:bg-[#491F40] hover:text-white disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => changePage(pageNum)}
                        aria-current={
                          pageNum === currentPage ? 'page' : undefined
                        }
                        className={cn(
                          'flex h-10 min-w-10 items-center justify-center rounded-sm border px-3 text-sm font-semibold transition-colors',
                          pageNum === currentPage
                            ? 'border-[#491F40] bg-[#491F40] text-[#E0C188]'
                            : 'border-[#DBCCC6] bg-white text-[#491F40] hover:border-[#CE8936] hover:text-[#9A5F1D]'
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    disabled={currentPage >= totalPages}
                    onClick={() => changePage(currentPage + 1)}
                    aria-label="Next page"
                    className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#DBCCC6] bg-white text-[#491F40] transition-colors hover:border-[#491F40] hover:bg-[#491F40] hover:text-white disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
