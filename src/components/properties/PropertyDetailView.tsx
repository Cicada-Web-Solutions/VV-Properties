'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  ArrowUpDown,
  Bath,
  BedDouble,
  Building2,
  CarFront,
  CheckCircle2,
  Compass,
  Droplets,
  Dumbbell,
  Expand,
  KeyRound,
  Lock,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Trees,
  Waves,
} from 'lucide-react';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyLightbox } from '@/components/properties/PropertyLightbox';
import { IdbImage } from '@/components/ui/IdbImage';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SITE_CONFIG } from '@/config/site';
import { useVVStore } from '@/context/VVStoreContext';
import { getAmenityLabel } from '@/data/amenities';
import {
  formatINR,
  formatINRCompact,
  formatShortDate,
  getWhatsAppUrl,
} from '@/lib/format';
import { cn } from '@/lib/utils';
import type { AmenityKey } from '@/types';

const AMENITY_ICONS: Record<AmenityKey, React.ComponentType<{ className?: string }>> = {
  'infinity-pool': Waves,
  'private-garden': Trees,
  concierge: KeyRound,
  'smart-home': Sparkles,
  'security-24x7': ShieldCheck,
  'private-elevator': ArrowUpDown,
  clubhouse: Building2,
  'fitness-spa': Dumbbell,
  'covered-parking': CarFront,
  'ocean-view': Droplets,
  'solar-ready': SunMedium,
  'vaastu-compliant': Compass,
};

export function PropertyDetailView() {
  const params = useParams<{ id: string }>();
  const { publishedProperties, isHydrated } = useVVStore();
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const paramId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const property = useMemo(
    () =>
      publishedProperties.find(
        (p) => p.slug === paramId || p.id === paramId
      ),
    [publishedProperties, paramId]
  );

  const similarProperties = useMemo(() => {
    if (!property) return [];
    const candidates = publishedProperties.filter((p) => p.id !== property.id);
    const sameAreaOrType = candidates.filter(
      (p) => p.type === property.type || p.city === property.city
    );
    const merged = [
      ...sameAreaOrType,
      ...candidates.filter((p) => !sameAreaOrType.includes(p)),
    ];
    return merged.slice(0, 3);
  }, [publishedProperties, property]);

  if (!isHydrated && !property) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-2xl bg-[#CDE6F5]/30" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#CDE6F5]/50 text-[#4062BB]">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-5 font-display text-4xl font-medium text-[#0D0221]">
          Property Unavailable
        </h1>
        <p className="mt-3 text-base text-[#0D0221]/70">
          This listing could not be found or is currently unpublished in the VV
          Properties catalogue.
        </p>
        <Link
          href="/properties"
          className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#4062BB] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0D0221]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Properties</span>
        </Link>
      </div>
    );
  }

  const gallery =
    property.galleryImages.length > 0
      ? property.galleryImages
      : [property.coverImage];

  const isSold = property.availability === 'sold';
  const hasOffer =
    Boolean(property.hasOffer) &&
    typeof property.offerPriceInr === 'number' &&
    property.offerPriceInr > 0 &&
    property.offerPriceInr < property.priceInr;
  const effectivePrice = hasOffer
    ? (property.offerPriceInr as number)
    : property.priceInr;

  const callHref = property.callNumber
    ? `tel:${property.callNumber}`
    : SITE_CONFIG.contact.phoneHref;
  const whatsappUrl = getWhatsAppUrl(property.title, property.whatsappNumber);
  const enquireUrl = `/?property=${encodeURIComponent(property.id)}#contact`;

  const priceBoxCard = (
    <div className="rounded-2xl border-2 border-[#0D0221] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {hasOffer && property.offerBadgeText && !isSold ? (
          <span className="inline-block rounded-full bg-[#0D0221] px-3 py-1 text-[11px] font-semibold tracking-wide text-white">
            {property.offerBadgeText}
          </span>
        ) : (
          <span className="text-xs font-semibold tracking-wider text-[#0D0221]/60 uppercase">
            {property.type} Valuation
          </span>
        )}
        <StatusBadge status={property.availability} />
      </div>

      <p className="mt-4 text-xs font-medium tracking-wider text-[#0D0221]/55 uppercase">
        {isSold ? 'Archive Reference Price' : 'Starting Price (INR)'}
      </p>

      <div className="mt-1 flex flex-wrap items-baseline gap-2.5">
        <span
          className={cn(
            'font-display text-3xl font-semibold tracking-tight sm:text-4xl',
            isSold ? 'text-[#0D0221]/60 line-through' : 'text-[#0D0221]'
          )}
        >
          {formatINR(effectivePrice)}
        </span>
        <span className="text-sm font-semibold text-[#4062BB]">
          ({formatINRCompact(effectivePrice)})
        </span>
      </div>

      {hasOffer && !isSold && (
        <p className="mt-1.5 text-xs text-[#0D0221]/65">
          <s>{formatINR(property.priceInr)}</s>
          {property.offerEndDate
            ? ` · Offer valid until ${formatShortDate(property.offerEndDate)}`
            : ''}
        </p>
      )}

      {isSold && (
        <div className="mt-4 rounded-xl border border-[#F06543]/30 bg-[#F06543]/10 p-3 text-xs leading-relaxed text-[#0D0221]/85">
          This sample property is currently marked <strong>Sold</strong>. Contact
          our advisory team for comparable off-market opportunities.
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2.5">
        <a
          href={callHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0D0221] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#4062BB]"
        >
          <Phone className="h-4 w-4" />
          <span>Call our team</span>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#0D0221]/25 bg-white px-4 py-3 text-sm font-medium text-[#0D0221] transition-colors hover:border-[#49A078] hover:bg-[#49A078]/10"
        >
          <MessageCircle className="h-4 w-4 text-[#49A078]" />
          <span>WhatsApp us</span>
        </a>
        <Link
          href={enquireUrl}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4062BB] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#314ea0]"
        >
          <Send className="h-4 w-4" />
          <span>
            {isSold
              ? 'Enquire for Similar Properties'
              : 'Enquire about this property'}
          </span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-white pb-24 md:pb-16">
      {/* Breadcrumb Bar */}
      <div className="border-b border-[#0D0221]/8 bg-[#CDE6F5]/15">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3.5 text-xs text-[#0D0221]/65 sm:px-6 lg:px-8">
          <Link href="/" className="hover:text-[#4062BB]">
            Home
          </Link>
          <span aria-hidden="true">&rsaquo;</span>
          <Link href="/properties" className="hover:text-[#4062BB]">
            Properties
          </Link>
          <span aria-hidden="true">&rsaquo;</span>
          <span className="truncate font-medium text-[#0D0221]">
            {property.title}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Gallery Grid (Wireframe Block C) */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <button
            type="button"
            onClick={() => setLightboxIdx(0)}
            className="group relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-[#0D0221]/10 bg-[#CDE6F5]/20 md:col-span-8 md:aspect-[16/10.5]"
            aria-label={`Open ${property.title} gallery lightbox`}
          >
            <IdbImage
              src={gallery[0]}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-full bg-[#0D0221]/80 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-xs">
              <Expand className="h-3.5 w-3.5" />
              <span>View Gallery ({gallery.length})</span>
            </span>
          </button>

          <div className="grid grid-cols-2 gap-3 md:col-span-4 md:grid-cols-1 md:grid-rows-2">
            <button
              type="button"
              onClick={() => setLightboxIdx(gallery.length > 1 ? 1 : 0)}
              className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#0D0221]/10 bg-[#CDE6F5]/20 md:aspect-auto"
              aria-label="Open gallery image 2"
            >
              <IdbImage
                src={gallery[1] ?? gallery[0]}
                alt={`${property.title} secondary view`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </button>

            <button
              type="button"
              onClick={() => setLightboxIdx(gallery.length > 2 ? 2 : 0)}
              className="group relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#0D0221]/10 bg-[#CDE6F5]/20 md:aspect-auto"
              aria-label="Open full gallery"
            >
              <IdbImage
                src={gallery[2] ?? gallery[0]}
                alt={`${property.title} architectural angle`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {gallery.length > 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0D0221]/45 transition-colors group-hover:bg-[#0D0221]/60">
                  <span className="rounded-full border border-white/40 bg-[#0D0221]/65 px-4 py-1.5 text-xs font-semibold text-white">
                    +{gallery.length - 3} more photos
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Details Body + Sticky Price Box */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Main Content */}
          <div className="space-y-10 lg:col-span-8">
            {/* Title Block */}
            <div className="border-b border-[#0D0221]/10 pb-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-md bg-[#CDE6F5]/55 px-3 py-1 text-xs font-semibold tracking-wider text-[#4062BB] uppercase">
                  {property.type}
                </span>
                <StatusBadge status={property.availability} size="md" />
              </div>

              <h1 className="mt-4 font-display text-3xl leading-[1.1] font-medium text-[#0D0221] sm:text-5xl">
                {property.title}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-[#0D0221]/70">
                <MapPin className="h-4 w-4 text-[#4062BB]" />
                <span>
                  {property.area}, {property.city}
                </span>
              </div>

              {/* Mobile Price Box below Title per Wireframe spec */}
              <div className="mt-7 lg:hidden">{priceBoxCard}</div>
            </div>

            {/* Key Specifications Grid */}
            <div>
              <h2 className="font-display text-2xl font-medium text-[#0D0221]">
                Specifications
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                <div className="rounded-xl border border-[#0D0221]/10 bg-[#CDE6F5]/15 p-4">
                  <p className="text-[11px] font-semibold tracking-wider text-[#0D0221]/55 uppercase">
                    Built / Plot Area
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#0D0221]">
                    <Maximize2 className="h-4 w-4 text-[#4062BB]" />
                    <span>
                      {property.specifications.areaSqFt.toLocaleString('en-IN')}{' '}
                      sq.ft
                    </span>
                  </p>
                </div>

                {typeof property.specifications.bedrooms === 'number' && (
                  <div className="rounded-xl border border-[#0D0221]/10 bg-[#CDE6F5]/15 p-4">
                    <p className="text-[11px] font-semibold tracking-wider text-[#0D0221]/55 uppercase">
                      Bedrooms
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#0D0221]">
                      <BedDouble className="h-4 w-4 text-[#4062BB]" />
                      <span>{property.specifications.bedrooms} Suites</span>
                    </p>
                  </div>
                )}

                {typeof property.specifications.bathrooms === 'number' && (
                  <div className="rounded-xl border border-[#0D0221]/10 bg-[#CDE6F5]/15 p-4">
                    <p className="text-[11px] font-semibold tracking-wider text-[#0D0221]/55 uppercase">
                      Bathrooms
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-[#0D0221]">
                      <Bath className="h-4 w-4 text-[#4062BB]" />
                      <span>{property.specifications.bathrooms} Baths</span>
                    </p>
                  </div>
                )}

                {property.specifications.plotOrFloor && (
                  <div className="rounded-xl border border-[#0D0221]/10 bg-[#CDE6F5]/15 p-4">
                    <p className="text-[11px] font-semibold tracking-wider text-[#0D0221]/55 uppercase">
                      Configuration
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#0D0221]">
                      {property.specifications.plotOrFloor}
                    </p>
                  </div>
                )}

                {typeof property.specifications.parkingSpaces === 'number' && (
                  <div className="rounded-xl border border-[#0D0221]/10 bg-[#CDE6F5]/15 p-4">
                    <p className="text-[11px] font-semibold tracking-wider text-[#0D0221]/55 uppercase">
                      Parking
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#0D0221]">
                      {property.specifications.parkingSpaces} Covered Bays
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-[#0D0221]/10 bg-[#CDE6F5]/15 p-4">
                  <p className="text-[11px] font-semibold tracking-wider text-[#0D0221]/55 uppercase">
                    Possession
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#0D0221]">
                    {property.specifications.possessionStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* About the Property */}
            <div>
              <h2 className="font-display text-2xl font-medium text-[#0D0221]">
                About the property
              </h2>
              <div className="mt-4 space-y-4 text-base leading-relaxed text-[#0D0221]/80">
                {property.longDescription.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Amenities Grid */}
            {property.amenities.length > 0 && (
              <div>
                <h2 className="font-display text-2xl font-medium text-[#0D0221]">
                  Amenities
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {property.amenities.map((key) => {
                    const Icon = AMENITY_ICONS[key] ?? Sparkles;
                    return (
                      <div
                        key={key}
                        className="flex flex-col items-center justify-center rounded-xl border border-[#0D0221]/12 bg-white px-3 py-4 text-center"
                      >
                        <Icon className="h-5 w-5 text-[#4062BB]" />
                        <span className="mt-2 text-xs font-medium text-[#0D0221]">
                          {getAmenityLabel(key)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Why Buy This Property */}
            {property.whyBuyPoints.length > 0 && (
              <div className="rounded-2xl border border-[#0D0221]/10 bg-[#CDE6F5]/20 p-6 sm:p-7">
                <h2 className="font-display text-2xl font-medium text-[#0D0221]">
                  Why buy this property
                </h2>
                <ul className="mt-4 space-y-3">
                  {property.whyBuyPoints.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm leading-relaxed text-[#0D0221]/85 sm:text-[15px]"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#49A078]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Desktop Sticky Price Box */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-28">{priceBoxCard}</div>
          </aside>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <section className="mt-20 border-t border-[#0D0221]/10 pt-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-[#4062BB] uppercase">
                  Curated Alternatives
                </p>
                <h2 className="mt-1.5 font-display text-3xl font-medium text-[#0D0221]">
                  Similar Properties
                </h2>
              </div>
              <Link
                href="/properties"
                className="text-sm font-medium text-[#4062BB] hover:underline"
              >
                View all &rarr;
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {similarProperties.map((item) => (
                <PropertyCard key={item.id} property={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Fixed Mobile Bottom Action Bar (Wireframe Block C) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#0D0221]/15 bg-white/95 px-3 py-2.5 shadow-[0_-8px_24px_rgba(13,2,33,0.08)] backdrop-blur-md md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
          <a
            href={callHref}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0D0221] px-2.5 py-2.5 text-xs font-medium text-white"
          >
            <Phone className="h-3.5 w-3.5" />
            <span>Call</span>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#0D0221]/20 bg-white px-2.5 py-2.5 text-xs font-medium text-[#0D0221]"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#49A078]" />
            <span>WhatsApp</span>
          </a>
          <Link
            href={enquireUrl}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#4062BB] px-2.5 py-2.5 text-xs font-medium text-white"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Enquire</span>
          </Link>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      <PropertyLightbox
        images={gallery}
        title={property.title}
        activeIndex={lightboxIdx}
        onChangeIndex={setLightboxIdx}
        onClose={() => setLightboxIdx(null)}
      />
    </div>
  );
}
