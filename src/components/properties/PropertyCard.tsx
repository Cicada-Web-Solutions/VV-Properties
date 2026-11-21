'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, BedDouble, Bath, Maximize2, MapPin } from 'lucide-react';
import { IdbImage } from '@/components/ui/IdbImage';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatINR, formatINRCompact } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyCardProps {
  property: Property;
  className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
  const isSold = property.availability === 'sold';
  const hasOffer =
    Boolean(property.hasOffer) &&
    typeof property.offerPriceInr === 'number' &&
    property.offerPriceInr > 0 &&
    property.offerPriceInr < property.priceInr;

  const displayPrice = hasOffer
    ? (property.offerPriceInr as number)
    : property.priceInr;

  return (
    <Link
      href={`/properties/${property.slug || property.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-md border border-[#DBCCC6] bg-white shadow-[0_10px_30px_rgba(73,31,64,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-[#CE8936]/75 hover:shadow-[0_24px_48px_rgba(73,31,64,0.14)]',
        className
      )}
    >
      {/* Cover Photography */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#DBCCC6]/35">
        <IdbImage
          src={property.coverImage}
          alt={property.title}
          loading="lazy"
          className={cn(
            'h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]',
            isSold && 'grayscale-[35%] opacity-90'
          )}
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#32132B]/55 to-transparent"
          aria-hidden="true"
        />

        {/* Top Badges Overlay */}
        <div className="absolute inset-x-3.5 top-3.5 flex items-start justify-between gap-2">
          <div className="flex flex-col items-start gap-1.5">
            <span className="rounded-sm bg-[#491F40]/92 px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.16em] text-[#E0C188] uppercase shadow-sm backdrop-blur-xs">
              {property.type}
            </span>
            {hasOffer && property.offerBadgeText && !isSold && (
              <span className="inline-block rounded-sm bg-gradient-to-r from-[#E0C188] to-[#CE8936] px-2.5 py-1 text-[10px] font-bold tracking-wider text-[#491F40] uppercase shadow-sm">
                {property.offerBadgeText}
              </span>
            )}
          </div>
          <StatusBadge
            status={property.availability}
            className="bg-white/95 shadow-sm backdrop-blur-xs"
          />
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <h3 className="font-display text-[24px] leading-snug font-semibold text-[#491F40] transition-colors group-hover:text-[#9A5F1D]">
            {property.title}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[#491F40]/68">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#CE8936]" />
            <span className="truncate">
              {property.area}, {property.city}
            </span>
          </div>

          {/* Structured INR Valuation Plate */}
          <div
            className={cn(
              'mt-4 rounded-sm border px-3.5 py-3',
              isSold
                ? 'border-[#D6866B]/35 bg-[#D6866B]/8'
                : 'border-[#DBCCC6]/85 bg-[#FAF6F4]'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold tracking-[0.16em] text-[#9A5F1D] uppercase">
                {isSold ? 'Reference Price' : hasOffer ? 'Special Offer' : 'Listing Price'}
              </span>
              {hasOffer && !isSold && (
                <s className="text-[11.5px] font-medium text-[#491F40]/45">
                  {formatINR(property.priceInr)}
                </s>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span
                className={cn(
                  'font-display text-[22px] leading-tight font-bold tracking-tight',
                  isSold
                    ? 'text-[#491F40]/65 line-through decoration-[#D6866B]'
                    : 'text-[#491F40]'
                )}
              >
                {formatINR(displayPrice)}
              </span>
              {formatINRCompact(displayPrice) !== formatINR(displayPrice) && (
                <span className="text-xs font-semibold text-[#9A5F1D]">
                  ({formatINRCompact(displayPrice)})
                </span>
              )}
            </div>
          </div>

          <p className="mt-3.5 line-clamp-2 text-[13.5px] leading-relaxed text-[#491F40]/72">
            {property.shortDescription}
          </p>
        </div>

        {/* Bottom Specs & View Details */}
        <div className="mt-5 flex items-center justify-between gap-2 border-t border-[#DBCCC6]/75 pt-4 text-xs text-[#491F40]/72">
          <div className="flex flex-wrap items-center gap-3">
            {typeof property.specifications.bedrooms === 'number' && (
              <span className="inline-flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5 text-[#CE8936]" />
                <span>{property.specifications.bedrooms} Beds</span>
              </span>
            )}
            {typeof property.specifications.bathrooms === 'number' && (
              <span className="inline-flex items-center gap-1">
                <Bath className="h-3.5 w-3.5 text-[#CE8936]" />
                <span>{property.specifications.bathrooms} Baths</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5 text-[#CE8936]" />
              <span>
                {property.specifications.areaSqFt.toLocaleString('en-IN')} sq.ft
              </span>
            </span>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-[#491F40] transition-colors group-hover:text-[#CE8936]">
            <span>Details</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
