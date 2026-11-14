'use client';

import React, { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { IdbImage } from '@/components/ui/IdbImage';
import { cn } from '@/lib/utils';

interface PropertyLightboxProps {
  images: string[];
  title: string;
  activeIndex: number | null;
  onChangeIndex: (idx: number) => void;
  onClose: () => void;
}

export function PropertyLightbox({
  images,
  title,
  activeIndex,
  onChangeIndex,
  onClose,
}: PropertyLightboxProps) {
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') {
        onChangeIndex((activeIndex + 1) % images.length);
      } else if (e.key === 'ArrowLeft') {
        onChangeIndex((activeIndex - 1 + images.length) % images.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, images.length, onChangeIndex, onClose]);

  if (activeIndex === null || images.length === 0) return null;

  const safeIdx =
    ((activeIndex % images.length) + images.length) % images.length;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-[#0D0221]/95 p-4 text-white backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} gallery lightbox`}
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 pb-3">
        <div className="min-w-0">
          <p className="truncate font-display text-xl font-medium text-white">
            {title}
          </p>
          <p className="text-xs text-[#CDE6F5]">
            Image {safeIdx + 1} of {images.length}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white hover:text-[#0D0221]"
          aria-label="Close lightbox"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main Image Stage with Touch Swipe */}
      <div
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(e) => {
          const endX = e.changedTouches[0]?.clientX ?? null;
          if (touchStartX.current !== null && endX !== null) {
            const delta = endX - touchStartX.current;
            if (Math.abs(delta) > 45) {
              onChangeIndex(
                delta < 0
                  ? (safeIdx + 1) % images.length
                  : (safeIdx - 1 + images.length) % images.length
              );
            }
          }
          touchStartX.current = null;
        }}
        className="relative flex flex-1 items-center justify-center overflow-hidden"
      >
        <IdbImage
          src={images[safeIdx]}
          alt={`${title} gallery view ${safeIdx + 1}`}
          className="max-h-[75vh] max-w-full rounded-xl object-contain"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                onChangeIndex((safeIdx - 1 + images.length) % images.length)
              }
              aria-label="Previous gallery image"
              className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-[#0D0221]/70 text-white transition-colors hover:bg-[#4062BB] sm:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => onChangeIndex((safeIdx + 1) % images.length)}
              aria-label="Next gallery image"
              className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-[#0D0221]/70 text-white transition-colors hover:bg-[#4062BB] sm:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Strip */}
      {images.length > 1 && (
        <div className="mt-4 flex justify-center gap-2.5 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={`${img}-${idx}`}
              type="button"
              onClick={() => onChangeIndex(idx)}
              className={cn(
                'h-14 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-all',
                idx === safeIdx
                  ? 'border-[#CDE6F5] opacity-100'
                  : 'border-transparent opacity-55 hover:opacity-90'
              )}
              aria-label={`Select gallery image ${idx + 1}`}
            >
              <IdbImage
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
