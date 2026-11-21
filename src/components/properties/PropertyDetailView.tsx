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
      <div className="bg-[#FAF6F4] pt-28 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-96 animate-pulse rounded-md bg-[#DBCCC6]/40" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="bg-[#FAF6F4] pt-32 pb-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm border border-[#DBCCC6] bg-white text-[#CE8936]">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-5 font-display text-4xl font-semibold text-[#491F40]">
            Property Unavailable
          </h1>
          <p className="mt-3 text-base text-[#491F40]/72">
            This listing could not be found or is currently unpublished in the
            V.V Properties catalogue.
          </p>
          <Link
            href="/properties"
            className="mt-7 inline-flex items-center gap-2 rounded-sm bg-gradient-to-br from-[#E0C188] to-[#CE8936] px-6 py-3 text-xs font-semibold tracking-wider text-[#491F40] uppercase transition-all hover:brightness-105"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Properties</span>
          </Link>
        </div>
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
    <div className="rounded-md border border-[#DBCCC6] border-t-4 border-t-[#CE8936] bg-white p-6 shadow-[0_18px_46px_rgba(73,31,64,0.10)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {hasOffer && property.offerBadgeText && !isSold ? (
          <span className="inline-block rounded-sm bg-gradient-to-r from-[#E0C188] to-[#CE8936] px-3 py-1 text-[10.5px] font-bold tracking-wider text-[#491F40] uppercase">
            {property.offerBadgeText}
          </span>
        ) : (
          <span className="text-[11px] font-semibold tracking-[0.18em] text-[#9A5F1D] uppercase">
            {property.type} Valuation
          </span>
        )}
        <StatusBadge status={property.availability} />
      </div>

      <p className="mt-5 text-[11px] font-semibold tracking-[0.16em] text-[#491F40]/60 uppercase">
        {isSold ? 'Archive Reference Price' : 'Listing Price (INR)'}
      </p>

      <div className="mt-1.5 flex flex-wrap items-baseline gap-2.5">
        <span
          className={cn(
            'font-display text-3xl font-bold tracking-tight sm:text-4xl',
            isSold
              ? 'text-[#491F40]/60 line-through decoration-[#D6866B]'
              : 'text-[#491F40]'
          )}
        >
          {formatINR(effectivePrice)}
        </span>
        <span className="text-sm font-semibold text-[#9A5F1D]">
          ({formatINRCompact(effectivePrice)})
        </span>
      </div>

      {hasOffer && !isSold && (
        <p className="mt-1.5 text-xs text-[#491F40]/65">
          <s>{formatINR(property.priceInr)}</s>
          {property.offerEndDate
            ? ` · Offer valid until ${formatShortDate(property.offerEndDate)}`
            : ''}
        </p>
      )}

      {isSold && (
        <div className="mt-4 rounded-sm border border-[#D6866B]/40 bg-[#D6866B]/12 p-3 text-xs leading-relaxed text-[#491F40]/88">
          This property is currently marked <strong>Sold</strong>. Contact V.V
          Properties for comparable available opportunities.
        </div>
      )}

      <div className="mt-6 flex flex-col gap-2.5">
        <Link
          href={enquireUrl}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-gradient-to-br from-[#E0C188] to-[#CE8936] px-4 py-3.5 text-xs font-semibold tracking-wider text-[#491F40] uppercase shadow-sm transition-all hover:brightness-105"
        >
          <Send className="h-4 w-4" />
          <span>
            {isSold
              ? 'Enquire for Similar Properties'
              : 'Enquire about this property'}
          </span>
        </Link>
        <a
          href={callHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#491F40] px-4 py-3 text-xs font-semibold tracking-wider text-white uppercase transition-colors hover:bg-[#32132B]"
        >
          <Phone className="h-4 w-4 text-[#E0C188]" />
          <span>Call our team</span>
        </a>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-[#DBCCC6] bg-[#FAF6F4] px-4 py-3 text-xs font-semibold tracking-wider text-[#491F40] uppercase transition-colors hover:border-[#25D366] hover:bg-[#25D366]/10"
        >
          <MessageCircle className="h-4 w-4 text-[#25D366]" />
          <span>WhatsApp us</span>
        </a>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FAF6F4] pt-[68px] pb-24 md:pb-16">
      {/* Breadcrumb Bar */}
      <div className="border-b border-[#DBCCC6] bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3.5 text-xs text-[#491F40]/65 sm:px-6 lg:px-8">
          <Link href="/" className="transition-colors hover:text-[#9A5F1D]">
            Home
          </Link>
          <span aria-hidden="true">&rsaquo;</span>
          <Link
            href="/properties"
            className="transition-colors hover:text-[#9A5F1D]"
          >
            Properties
          </Link>
          <span aria-hidden="true">&rsaquo;</span>
          <span className="truncate font-semibold text-[#491F40]">
            {property.title}
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
        {/* Architectural Gallery Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
          <button
            type="button"
            onClick={() => setLightboxIdx(0)}
            className="group relative aspect-[16/10] w-full overflow-hidden rounded-md border border-[#DBCCC6] bg-[#DBCCC6]/35 md:col-span-8 md:aspect-[16/10.5]"
            aria-label={`Open ${property.title} gallery lightbox`}
          >
            <IdbImage
              src={gallery[0]}
              alt={property.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <span className="absolute right-4 bottom-4 inline-flex items-center gap-1.5 rounded-sm border border-[#E0C188]/40 bg-[#491F40]/88 px-3.5 py-2 text-xs font-semibold tracking-wide text-[#E0C188] backdrop-blur-xs">
              <Expand className="h-3.5 w-3.5" />
              <span>View Gallery ({gallery.length})</span>
            </span>
          </button>

          <div className="grid grid-cols-2 gap-3 md:col-span-4 md:grid-cols-1 md:grid-rows-2">
            <button
              type="button"
              onClick={() => setLightboxIdx(gallery.length > 1 ? 1 : 0)}
              className="group relative aspect-[16/10] overflow-hidden rounded-md border border-[#DBCCC6] bg-[#DBCCC6]/35 md:aspect-auto"
              aria-label="Open gallery image 2"
            >
              <IdbImage
                src={gallery[1] ?? gallery[0]}
                alt={`${property.title} secondary view`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </button>

            <button
              type="button"
              onClick={() => setLightboxIdx(gallery.length > 2 ? 2 : 0)}
              className="group relative aspect-[16/10] overflow-hidden rounded-md border border-[#DBCCC6] bg-[#DBCCC6]/35 md:aspect-auto"
              aria-label="Open full gallery"
            >
              <IdbImage
                src={gallery[2] ?? gallery[0]}
                alt={`${property.title} architectural angle`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              {gallery.length > 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#32132B]/55 transition-colors group-hover:bg-[#32132B]/70">
                  <span className="rounded-sm border border-[#E0C188]/55 bg-[#491F40]/85 px-4 py-1.5 text-xs font-semibold tracking-wide text-[#E0C188]">
                    +{gallery.length - 3} more photos
                  </span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Details Body + Sticky Valuation Box */}
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Left Main Content */}
          <div className="space-y-10 lg:col-span-8">
            {/* Title Block */}
            <div className="rounded-md border border-[#DBCCC6] bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-sm bg-[#491F40] px-3 py-1 text-[11px] font-semibold tracking-[0.18em] text-[#E0C188] uppercase">
                  {property.type}
                </span>
                <StatusBadge status={property.availability} size="md" />
              </div>

              <h1 className="mt-4 font-display text-3xl leading-[1.1] font-semibold text-[#491F40] sm:text-5xl">
                {property.title}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm font-medium text-[#491F40]/72">
                <MapPin className="h-4 w-4 text-[#CE8936]" />
                <span>
                  {property.area}, {property.city}
                </span>
              </div>

              {/* Mobile Price Box below Title */}
              <div className="mt-7 lg:hidden">{priceBoxCard}</div>
            </div>

            {/* Key Specifications Grid */}
            <div className="rounded-md border border-[#DBCCC6] bg-white p-6 shadow-xs sm:p-8">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#9A5F1D] uppercase">
                PROPERTY OVERVIEW
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-[#491F40]">
                Specifications
              </h2>
              <div className="mt-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                <div className="rounded-sm border border-[#DBCCC6]/85 bg-[#FAF6F4] p-4">
                  <p className="text-[10.5px] font-semibold tracking-[0.14em] text-[#491F40]/60 uppercase">
                    Built / Plot Area
                  </p>
                  <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#491F40]">
                    <Maximize2 className="h-4 w-4 text-[#CE8936]" />
                    <span>
                      {property.specifications.areaSqFt.toLocaleString('en-IN')}{' '}
                      sq.ft
                    </span>
                  </p>
                </div>

                {typeof property.specifications.bedrooms === 'number' && (
                  <div className="rounded-sm border border-[#DBCCC6]/85 bg-[#FAF6F4] p-4">
                    <p className="text-[10.5px] font-semibold tracking-[0.14em] text-[#491F40]/60 uppercase">
                      Bedrooms
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#491F40]">
                      <BedDouble className="h-4 w-4 text-[#CE8936]" />
                      <span>{property.specifications.bedrooms} Suites</span>
                    </p>
                  </div>
                )}

                {typeof property.specifications.bathrooms === 'number' && (
                  <div className="rounded-sm border border-[#DBCCC6]/85 bg-[#FAF6F4] p-4">
                    <p className="text-[10.5px] font-semibold tracking-[0.14em] text-[#491F40]/60 uppercase">
                      Bathrooms
                    </p>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-[#491F40]">
                      <Bath className="h-4 w-4 text-[#CE8936]" />
                      <span>{property.specifications.bathrooms} Baths</span>
                    </p>
                  </div>
                )}

                {property.specifications.plotOrFloor && (
                  <div className="rounded-sm border border-[#DBCCC6]/85 bg-[#FAF6F4] p-4">
                    <p className="text-[10.5px] font-semibold tracking-[0.14em] text-[#491F40]/60 uppercase">
                      Configuration
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-[#491F40]">
                      {property.specifications.plotOrFloor}
                    </p>
                  </div>
                )}

                {typeof property.specifications.parkingSpaces === 'number' && (
                  <div className="rounded-sm border border-[#DBCCC6]/85 bg-[#FAF6F4] p-4">
                    <p className="text-[10.5px] font-semibold tracking-[0.14em] text-[#491F40]/60 uppercase">
                      Parking
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-[#491F40]">
                      {property.specifications.parkingSpaces} Covered Bays
                    </p>
                  </div>
                )}

                <div className="rounded-sm border border-[#DBCCC6]/85 bg-[#FAF6F4] p-4">
                  <p className="text-[10.5px] font-semibold tracking-[0.14em] text-[#491F40]/60 uppercase">
                    Possession
                  </p>
                  <p className="mt-1.5 text-sm font-semibold text-[#491F40]">
                    {property.specifications.possessionStatus}
                  </p>
                </div>
              </div>
            </div>

            {/* About the Property */}
            <div className="rounded-md border border-[#DBCCC6] bg-white p-6 shadow-xs sm:p-8">
              <p className="text-[11px] font-semibold tracking-[0.22em] text-[#9A5F1D] uppercase">
                DESCRIPTION
              </p>
              <h2 className="mt-1 font-display text-3xl font-semibold text-[#491F40]">
                About the property
              </h2>
              <div className="mt-4 space-y-4 text-base leading-[1.78] text-[#491F40]/80">
                {property.longDescription.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Amenities Grid */}
            {(property.amenities.length > 0 ||
              (property.customAmenities &&
                property.customAmenities.length > 0)) && (
              <div className="rounded-md border border-[#DBCCC6] bg-white p-6 shadow-xs sm:p-8">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-[#9A5F1D] uppercase">
                  FEATURES &amp; COMFORTS
                </p>
                <h2 className="mt-1 font-display text-3xl font-semibold text-[#491F40]">
                  Amenities
                </h2>
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {property.amenities.map((key) => {
                    const Icon = AMENITY_ICONS[key] ?? Sparkles;
                    return (
                      <div
                        key={key}
                        className="flex flex-col items-center justify-center rounded-sm border border-[#DBCCC6]/85 bg-[#FAF6F4] px-3 py-4 text-center transition-colors hover:border-[#CE8936]"
                      >
                        <Icon className="h-5 w-5 text-[#CE8936]" />
                        <span className="mt-2 text-xs font-semibold text-[#491F40]">
                          {getAmenityLabel(key)}
                        </span>
                      </div>
                    );
                  })}
                  {(property.customAmenities ?? []).map((label) => (
                    <div
                      key={`custom-${label}`}
                      className="flex flex-col items-center justify-center rounded-sm border border-[#DBCCC6]/85 bg-[#FAF6F4] px-3 py-4 text-center transition-colors hover:border-[#CE8936]"
                    >
                      <Sparkles className="h-5 w-5 text-[#CE8936]" />
                      <span className="mt-2 text-xs font-semibold text-[#491F40]">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Why Buy This Property */}
            {property.whyBuyPoints.length > 0 && (
              <div className="rounded-md border border-[#DBCCC6] border-l-4 border-l-[#CE8936] bg-white p-6 shadow-xs sm:p-8">
                <p className="text-[11px] font-semibold tracking-[0.22em] text-[#9A5F1D] uppercase">
                  INVESTMENT HIGHLIGHTS
                </p>
                <h2 className="mt-1 font-display text-3xl font-semibold text-[#491F40]">
                  Why buy this property
                </h2>
                <ul className="mt-5 space-y-3">
                  {property.whyBuyPoints.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm leading-relaxed text-[#491F40]/85 sm:text-[15px]"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#CE8936]" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Desktop Sticky Valuation & Contact Card */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24">{priceBoxCard}</div>
          </aside>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <section className="mt-20 border-t border-[#DBCCC6] pt-14">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.24em] text-[#9A5F1D] uppercase">
                  CURATED ALTERNATIVES
                </p>
                <h2 className="mt-1.5 font-display text-3xl font-semibold text-[#491F40] sm:text-4xl">
                  Similar Properties
                </h2>
              </div>
              <Link
                href="/properties"
                className="text-sm font-semibold text-[#491F40] transition-colors hover:text-[#CE8936]"
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

      {/* Fixed Mobile Bottom Action Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#DBCCC6] bg-white/96 px-3 py-2.5 shadow-[0_-8px_24px_rgba(73,31,64,0.12)] backdrop-blur-md md:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-3 gap-2">
          <a
            href={callHref}
            className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-[#491F40] px-2.5 py-2.5 text-xs font-semibold text-white"
          >
            <Phone className="h-3.5 w-3.5 text-[#E0C188]" />
            <span>Call</span>
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-sm border border-[#DBCCC6] bg-[#FAF6F4] px-2.5 py-2.5 text-xs font-semibold text-[#491F40]"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
            <span>WhatsApp</span>
          </a>
          <Link
            href={enquireUrl}
            className="inline-flex items-center justify-center gap-1.5 rounded-sm bg-gradient-to-br from-[#E0C188] to-[#CE8936] px-2.5 py-2.5 text-xs font-semibold text-[#491F40]"
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
