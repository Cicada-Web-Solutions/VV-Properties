'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Building, ChevronLeft, ChevronRight } from 'lucide-react';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyFiltersBar } from '@/components/properties/PropertyFiltersBar';
import { AccentHeadline } from '@/components/ui/AccentHeadline';
import { useVVStore } from '@/context/VVStoreContext';
import { useScrollReveal } from '@/hooks/useGsapReveal';
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
  const { publishedProperties } = useVVStore();
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<PropertyFilterState>(() => ({
    ...DEFAULT_FILTERS,
    type: parseInitialType(searchParams.get('type')),
  }));
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
    <div className="bg-white">
      {/* Editorial Catalogue Header */}
      <section className="border-b border-[#0D0221]/8 bg-[#CDE6F5]/20 py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-[#0D0221]/65 uppercase">
            <span>PORTFOLIO CATALOGUE</span>
            <span className="h-px w-10 bg-[#0D0221]/20" aria-hidden="true" />
          </div>

          <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <AccentHeadline
                as="h1"
                text="Curated Properties"
                accentWord="Properties"
                className="font-display text-4xl font-medium text-[#0D0221] sm:text-5xl"
              />
              <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-[#0D0221]/72 sm:text-base">
                Explore vetted villas, sky penthouses, land parcels, and
                commercial estates priced transparently in Indian Rupees (INR).
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-[#0D0221]/12 bg-white px-4 py-1.5 text-xs font-semibold text-[#0D0221]">
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
                className="rounded-full border border-[#0D0221]/12 bg-white px-4 py-1.5 text-xs font-medium text-[#0D0221] focus:border-[#4062BB] focus:outline-none"
              >
                <option value="featured">Sort: Curated Order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Sort: Newest Listed</option>
              </select>
            </div>
          </div>

          <div className="mt-8">
            <PropertyFiltersBar
              key={resetTick}
              filters={filters}
              availableAreas={availableAreas}
              onChange={handleFilterChange}
              onReset={handleReset}
            />
          </div>
        </div>
      </section>

      {/* Grid & Pagination */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div ref={gridRef} className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {paginated.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0D0221]/20 bg-[#CDE6F5]/15 px-6 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#4062BB] shadow-xs">
                <Building className="h-6 w-6" />
              </div>
              <h2 className="mt-4 font-display text-3xl font-medium text-[#0D0221]">
                No properties match your filters
              </h2>
              <p className="mt-2 max-w-md text-sm text-[#0D0221]/70">
                Try clearing a region selection or expanding your INR budget
                range to browse the full curated catalogue.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 rounded-lg bg-[#4062BB] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0D0221]"
              >
                Reset All Filters
              </button>
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
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#0D0221]/15 bg-white text-[#0D0221] transition-colors hover:border-[#4062BB] hover:text-[#4062BB] disabled:opacity-40"
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
                          'flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors',
                          pageNum === currentPage
                            ? 'border-[#0D0221] bg-[#0D0221] text-white'
                            : 'border-[#0D0221]/15 bg-white text-[#0D0221] hover:border-[#4062BB] hover:text-[#4062BB]'
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
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#0D0221]/15 bg-white text-[#0D0221] transition-colors hover:border-[#4062BB] hover:text-[#4062BB] disabled:opacity-40"
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
