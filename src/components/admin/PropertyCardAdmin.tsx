'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Edit3,
  Eye,
  EyeOff,
  ImagePlus,
  MapPin,
  MoreVertical,
  Tag,
  Trash2,
  Type,
} from 'lucide-react';
import { IdbImage } from '@/components/ui/IdbImage';
import { getDisplayLocation, inferBadgeTag } from '@/lib/adminUtils';
import { formatINRCompact } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Property } from '@/types';

interface PropertyCardAdminProps {
  property: Property;
  onEdit: (property: Property) => void;
  onRename: (property: Property) => void;
  onTogglePublish: (property: Property) => void;
  onToggleAvailability: (property: Property) => void;
  onDelete: (property: Property) => void;
}

export function PropertyCardAdmin({
  property,
  onEdit,
  onRename,
  onTogglePublish,
  onToggleAvailability,
  onDelete,
}: PropertyCardAdminProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  const badgeTag = inferBadgeTag(property);
  const effectivePrice =
    property.hasOffer &&
    typeof property.offerPriceInr === 'number' &&
    property.offerPriceInr > 0 &&
    property.offerPriceInr < property.priceInr
      ? property.offerPriceInr
      : property.priceInr;
  const priceText = formatINRCompact(effectivePrice);
  const typeLabel = property.customTypeLabel || property.type;
  const locationText = getDisplayLocation(property);
  const isDraft = property.publishStatus === 'unpublished';
  const isSold = property.availability === 'sold';

  return (
    <article
      data-property-id={property.id}
      aria-label={property.title}
      className="group relative h-56 rounded-2xl border border-slate-200/90 bg-[#0D0221] shadow-sm transition-all duration-300 hover:shadow-xl"
    >
      {/* Cover Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        {property.coverImage ? (
          <IdbImage
            src={property.coverImage}
            alt={property.title}
            className={cn(
              'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
              isSold && 'opacity-85 grayscale-[30%]'
            )}
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-slate-800 p-4 text-center text-slate-400">
            <ImagePlus className="mb-1.5 h-8 w-8 text-slate-500" />
            <span className="text-[11px] font-bold text-slate-300">
              No Cover Image
            </span>
            <span className="text-[9px] text-slate-500">
              Click 3-dots to add photo
            </span>
          </div>
        )}
      </div>

      {/* Top-Left Badge Stack */}
      <div className="pointer-events-none absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
        {badgeTag !== 'None' && (
          <span className="rounded-full border border-white/20 bg-[#0D0221]/85 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-md backdrop-blur-md">
            {badgeTag}
          </span>
        )}
        {isDraft && (
          <span className="rounded-full border border-amber-300/40 bg-amber-500/90 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-md">
            Draft
          </span>
        )}
        {isSold && (
          <span className="rounded-full border border-red-300/40 bg-[#EF4444]/90 px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase shadow-md">
            Sold
          </span>
        )}
      </div>

      {/* Top-Right 3-Dots Menu */}
      <div
        ref={menuRef}
        className={cn(
          'absolute top-3 right-3 z-30 transition-all duration-200',
          menuOpen
            ? 'z-50 opacity-100'
            : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          aria-label={`Listing options for ${property.title}`}
          title="Listing Options"
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/95 text-[#0D0221] shadow-lg transition-transform hover:scale-110 hover:bg-white focus:outline-none"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {menuOpen && (
          <div className="absolute top-9 right-0 z-50 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onEdit(property);
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-[#0F52BA]/5 hover:text-[#0F52BA]"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onRename(property);
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-[#0F52BA]/5 hover:text-[#0F52BA]"
            >
              <Type className="h-3.5 w-3.5" />
              <span>Rename</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onTogglePublish(property);
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-[#0F52BA]/5 hover:text-[#0F52BA]"
            >
              {isDraft ? (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  <span>Publish Live</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  <span>Move to Draft</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onToggleAvailability(property);
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-slate-700 transition-colors hover:bg-[#0F52BA]/5 hover:text-[#0F52BA]"
            >
              {isSold ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Mark Available</span>
                </>
              ) : (
                <>
                  <Tag className="h-3.5 w-3.5" />
                  <span>Mark Sold</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                onDelete(property);
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs font-semibold text-[#EF4444] transition-colors hover:bg-[#EF4444]/5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>

      {/* Hover Gradient Overlay: Price, Type & Location */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-end rounded-2xl bg-gradient-to-t from-[#060112]/90 via-[#060112]/20 via-35% to-transparent p-5 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="font-sans text-base font-extrabold text-white drop-shadow">
            {priceText}
          </span>
          <span className="truncate font-sans text-[10px] font-bold tracking-wider text-[#E9F1F7] uppercase">
            {typeLabel}
          </span>
        </div>
        <p className="flex items-center gap-1 truncate text-[11px] font-medium text-slate-300">
          <MapPin className="h-3 w-3 shrink-0 text-[#E9F1F7]" />
          <span className="truncate">{locationText}</span>
        </p>
      </div>
    </article>
  );
}
