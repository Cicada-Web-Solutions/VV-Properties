'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2 } from 'lucide-react';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { AccentHeadline } from '@/components/ui/AccentHeadline';
import { useVVStore } from '@/context/VVStoreContext';
import { useScrollReveal } from '@/hooks/useGsapReveal';

/**
 * Homepage Featured Properties Showcase.
 * Consumes live publishedProperties directly from VVStoreContext with zero fabricated listings.
 */
export function FeaturedPropertiesSection() {
  const { publishedProperties, isHydrated } = useVVStore();
  const sectionRef = useRef<HTMLElement>(null);

  const featured = publishedProperties.slice(0, 3);

  useScrollReveal(sectionRef, '[data-reveal]', [
    isHydrated,
    featured.length,
  ]);

  return (
    <section
      id="featured-properties"
      ref={sectionRef}
      className="bg-[#FAF6F4] py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div data-reveal className="max-w-2xl">
            <div className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.26em] text-[#9A5F1D] uppercase">
              <span>FEATURED PROPERTIES</span>
              <span className="h-px w-10 bg-[#CE8936]/55" aria-hidden="true" />
            </div>
            <AccentHeadline
              as="h2"
              text="Properties Worth Building Your Future On."
              accentWord="Future"
              className="mt-3.5 font-display text-[34px] leading-[1.12] font-semibold text-[#491F40] sm:text-[42px] lg:text-[46px]"
            />
            <p className="mt-3.5 max-w-xl text-base leading-[1.72] text-[#491F40]/74">
              Explore curated residential and commercial listings, land parcels,
              and investment opportunities represented by V.V Properties.
            </p>
          </div>

          <div data-reveal>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 rounded-sm border border-[#491F40] bg-white px-6 py-3 text-[13px] font-semibold tracking-wider text-[#491F40] uppercase transition-colors hover:bg-[#491F40] hover:text-white"
            >
              <span>View All Properties</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12">
          {!isHydrated ? (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[440px] animate-pulse rounded-md border border-[#DBCCC6] bg-white/80"
                />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <div
              data-reveal
              className="flex flex-col items-center justify-center rounded-md border border-[#DBCCC6] bg-white px-6 py-16 text-center shadow-xs"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-sm border border-[#DBCCC6] bg-[#FAF6F4] text-[#CE8936]">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-5 font-display text-3xl font-semibold text-[#491F40]">
                Curated Portfolio Being Updated
              </h3>
              <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-[#491F40]/72">
                New residential, commercial, and land listings added through the
                V.V Properties portfolio appear here automatically. Connect with
                our team directly for current availability.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3.5">
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-2 rounded-sm bg-gradient-to-br from-[#E0C188] to-[#CE8936] px-6 py-3 text-xs font-semibold tracking-wider text-[#491F40] uppercase"
                >
                  <span>Enquire Now</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-2 rounded-sm border border-[#491F40] px-6 py-3 text-xs font-semibold tracking-wider text-[#491F40] uppercase transition-colors hover:bg-[#491F40] hover:text-white"
                >
                  <span>Open Catalogue</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
              {featured.map((property) => (
                <div key={property.id} data-reveal>
                  <PropertyCard property={property} className="h-full" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
