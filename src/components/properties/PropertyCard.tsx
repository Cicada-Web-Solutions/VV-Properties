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
        'group flex flex-col overflow-hidden rounded-2xl border border-[#0D0221]/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#4062BB]/45 hover:shadow-[0_16px_40px_rgba(13,2,33,0.07)]',
        className
      )}
    >
      {/* Cover Photography */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#CDE6F5]/30">
        <IdbImage
          src={property.coverImage}
          alt={property.title}
          loading="lazy"
          className={cn(
            'h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]',
            isSold && 'grayscale-[35%] opacity-90'
          )}
        />

        {/* Top Badges Overlay */}
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div>
            {hasOffer && property.offerBadgeText && !isSold && (
              <span className="inline-block rounded-full bg-[#0D0221] px-3 py-1 text-[11px] font-semibold tracking-wide text-white shadow-sm">
                {property.offerBadgeText}
              </span>
            )}
          </div>
          <StatusBadge
            status={property.availability}
            className="bg-white/95 shadow-sm backdrop-blur-[2px]"
          />
        </div>

        {/* Property Type Tag bottom-left */}
        <div className="absolute bottom-3 left-3">
          <span className="rounded-md bg-white/92 px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[#0D0221] uppercase shadow-xs">
            {property.type}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <h3 className="font-display text-2xl leading-snug font-medium text-[#0D0221] transition-colors group-hover:text-[#4062BB]">
            {property.title}
          </h3>

          <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-[#0D0221]/60">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#4062BB]" />
            <span className="truncate">
              {property.area}, {property.city}
            </span>
          </div>

          {/* Highlighted INR Price */}
          <div className="mt-4 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <span
              className={cn(
                'inline-flex items-baseline gap-2 rounded-lg border px-3 py-1 text-base font-bold tracking-tight',
                isSold
                  ? 'border-[#F06543]/30 bg-[#F06543]/8 text-[#0D0221]/75 line-through decoration-[#F06543]'
                  : 'border-[#0D0221]/15 bg-[#CDE6F5]/25 text-[#0D0221]'
              )}
            >
              <span>{formatINR(displayPrice)}</span>
              {formatINRCompact(displayPrice) !== formatINR(displayPrice) && (
                <span className="text-[11px] font-medium text-[#4062BB]">
                  ({formatINRCompact(displayPrice)})
                </span>
              )}
            </span>
            {hasOffer && !isSold && (
              <s className="text-xs font-medium text-[#0D0221]/45">
                {formatINR(property.priceInr)}
              </s>
            )}
          </div>

          <p className="mt-3.5 line-clamp-2 text-sm leading-relaxed text-[#0D0221]/72">
            {property.shortDescription}
          </p>
        </div>

        {/* Bottom Specs & View Details */}
        <div className="mt-5 flex items-center justify-between border-t border-[#0D0221]/8 pt-4 text-xs text-[#0D0221]/65">
          <div className="flex items-center gap-3.5">
            {typeof property.specifications.bedrooms === 'number' && (
              <span className="inline-flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5 text-[#4062BB]" />
                <span>{property.specifications.bedrooms} Beds</span>
              </span>
            )}
            {typeof property.specifications.bathrooms === 'number' && (
              <span className="inline-flex items-center gap-1">
                <Bath className="h-3.5 w-3.5 text-[#4062BB]" />
                <span>{property.specifications.bathrooms} Baths</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <Maximize2 className="h-3.5 w-3.5 text-[#4062BB]" />
              <span>
                {property.specifications.areaSqFt.toLocaleString('en-IN')} sq.ft
              </span>
            </span>
          </div>

          <span className="inline-flex items-center gap-1 font-medium text-[#4062BB] transition-transform group-hover:translate-x-0.5">
            <span>Details</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
