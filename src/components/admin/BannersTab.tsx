'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { IdbImage } from '@/components/ui/IdbImage';
import { ASSETS } from '@/config/assets';
import { saveMediaFile } from '@/lib/idb';
import { cn } from '@/lib/utils';
import type { HeroSlide } from '@/types';

interface BannersTabProps {
  heroSlides: HeroSlide[];
  onAddBanner: (slide: Omit<HeroSlide, 'id'>) => Promise<void>;
  onToggleBannerActive: (slide: HeroSlide) => Promise<void>;
  onReorderBanners: (fromIndex: number, toIndex: number) => Promise<void>;
  onMoveBanner: (id: string, direction: 'up' | 'down') => Promise<void>;
  onDeleteBanner: (slide: HeroSlide) => void;
}

export function BannersTab({
  heroSlides,
  onAddBanner,
  onToggleBannerActive,
  onReorderBanners,
  onMoveBanner,
  onDeleteBanner,
}: BannersTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [headline, setHeadline] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [uploadedImageRef, setUploadedImageRef] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const [formError, setFormError] = useState('');

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [hoverTarget, setHoverTarget] = useState<{
    index: number;
    position: 'above' | 'below';
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedBanners = useMemo(
    () => [...heroSlides].sort((a, b) => a.order - b.order),
    [heroSlides]
  );

  const activeCount = useMemo(
    () => sortedBanners.filter((b) => b.active).length,
    [sortedBanners]
  );

  const handleUploadFile = async (file?: File) => {
    if (!file) return;
    setUploadingImage(true);
    try {
      const ref = await saveMediaFile(file);
      setUploadedImageRef(ref);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = headline.trim();
    const cleanSub = subtitle.trim();
    if (!cleanTitle || !cleanSub) {
      setFormError('Please enter both Banner Headline and Subtitle / Callout.');
      return;
    }

    const image =
      uploadedImageRef || urlInput.trim() || ASSETS.hero.slide01;

    await onAddBanner({
      eyebrow: 'FEATURED COLLECTION',
      headline: cleanTitle,
      supportingText: cleanSub,
      ctaText: 'Explore Portfolio',
      ctaLink: '/properties',
      image,
      order: 1,
      active: true,
    });

    setHeadline('');
    setSubtitle('');
    setUploadedImageRef('');
    setUrlInput('');
    setFormError('');
    setModalOpen(false);
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const position = e.clientY - rect.top < rect.height / 2 ? 'above' : 'below';
    setHoverTarget({ index, position });
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetIdx: number) => {
    e.preventDefault();
    const rawSource =
      draggedIdx !== null
        ? draggedIdx
        : Number(e.dataTransfer.getData('text/plain'));
    const isAbove = hoverTarget?.position === 'above';

    setDraggedIdx(null);
    setHoverTarget(null);

    if (Number.isNaN(rawSource)) return;
    let destinationIdx = targetIdx;
    if (!isAbove && destinationIdx < rawSource) {
      destinationIdx = Math.min(sortedBanners.length - 1, destinationIdx + 1);
    } else if (isAbove && destinationIdx > rawSource) {
      destinationIdx = Math.max(0, destinationIdx - 1);
    }

    if (rawSource !== destinationIdx) {
      void onReorderBanners(rawSource, destinationIdx);
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-[#0D0221] lg:text-3xl">
            Banner Management
          </h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500 lg:text-sm">
            Curate hero carousel banners, promotional slides, and display
            priority.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFormError('');
            setModalOpen(true);
          }}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl bg-[#0F52BA] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#0F52BA]/25 transition-all hover:bg-[#0A3F91]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Banner</span>
        </button>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-sans text-sm font-bold text-[#0D0221]">
              Carousel Slides
            </h3>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
              Drag & drop slides (or use arrows) to reorder homepage hero carousel priority.
            </p>
          </div>
          <div
            id="activeBannersCounter"
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-sm"
          >
            {activeCount}/{sortedBanners.length}
          </div>
        </div>

        <div className="space-y-3">
          {sortedBanners.map((banner, i) => {
            const isDragging = draggedIdx === i;
            const insertAbove =
              hoverTarget?.index === i && hoverTarget.position === 'above';
            const insertBelow =
              hoverTarget?.index === i && hoverTarget.position === 'below';

            return (
              <div
                key={banner.id}
                draggable
                onDragStart={(e) => handleDragStart(e, i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDragLeave={() => setHoverTarget(null)}
                onDrop={(e) => handleDrop(e, i)}
                onDragEnd={() => {
                  setDraggedIdx(null);
                  setHoverTarget(null);
                }}
                className={cn(
                  'group flex cursor-grab items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm transition-all duration-200 select-none hover:border-slate-300 active:cursor-grabbing',
                  isDragging &&
                    'scale-[0.98] border-[#0F52BA] opacity-35 shadow-[0_16px_32px_rgba(15,82,186,0.15)]',
                  insertAbove && 'translate-y-0.5 border-t-4 border-t-[#0F52BA]',
                  insertBelow && '-translate-y-0.5 border-b-4 border-b-[#0F52BA]'
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="pointer-events-none h-12 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-slate-100 shadow-sm">
                    <IdbImage
                      src={banner.image}
                      alt={banner.headline}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate font-sans text-xs font-bold text-[#0D0221]">
                      {banner.headline}
                    </h4>
                    <p className="mt-0.5 truncate text-[11px] font-medium text-slate-400">
                      {banner.supportingText}
                    </p>
                  </div>
                </div>

                <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => void onMoveBanner(banner.id, 'up')}
                    disabled={i === 0}
                    aria-label={`Move ${banner.headline} up`}
                    className="hidden cursor-pointer rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#0F52BA] disabled:opacity-30 sm:inline-flex"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void onMoveBanner(banner.id, 'down')}
                    disabled={i === sortedBanners.length - 1}
                    aria-label={`Move ${banner.headline} down`}
                    className="hidden cursor-pointer rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50 hover:text-[#0F52BA] disabled:opacity-30 sm:inline-flex"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => void onToggleBannerActive(banner)}
                    className={cn(
                      'cursor-pointer rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors active:scale-[0.98]',
                      banner.active
                        ? 'border-red-200/60 text-red-500 hover:bg-red-50 hover:text-red-600'
                        : 'border-emerald-200/60 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                    )}
                  >
                    {banner.active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteBanner(banner)}
                    aria-label={`Delete banner ${banner.headline}`}
                    title="Delete Slide"
                    className="cursor-pointer rounded-xl p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 active:scale-[0.98]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Banner Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="addBannerModalTitle"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0221]/60 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2
                id="addBannerModalTitle"
                className="font-sans text-base font-bold text-[#0D0221]"
              >
                Add New Banner Slide
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close banner modal"
                className="cursor-pointer rounded-lg p-1 text-slate-400 hover:text-[#0D0221]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(e) => void handleSaveBanner(e)}>
              <div className="space-y-4 p-6 text-xs">
                {formError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-semibold text-red-600">
                    {formError}
                  </div>
                )}
                <div>
                  <label className="mb-1 block font-medium text-slate-500">
                    Banner Headline
                  </label>
                  <input
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Banner headline"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-slate-500">
                    Subtitle / Callout
                  </label>
                  <input
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Subtitle or brief callout"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block font-medium text-slate-500">
                    Banner Image Upload (IndexedDB)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    aria-label="Upload banner photo"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      void handleUploadFile(file);
                    }}
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDropActive(true);
                    }}
                    onDragLeave={() => setDropActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDropActive(false);
                      const file = e.dataTransfer.files?.[0];
                      void handleUploadFile(file);
                    }}
                    className={cn(
                      'cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all',
                      dropActive
                        ? 'border-[#0F52BA] bg-[#0F52BA]/15'
                        : 'border-[#0F52BA]/40 bg-[#0F52BA]/5 hover:bg-[#0F52BA]/10'
                    )}
                  >
                    {uploadingImage ? (
                      <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-[#0F52BA]" />
                    ) : (
                      <UploadCloud className="mx-auto mb-2 h-8 w-8 text-[#0F52BA]" />
                    )}
                    <p className="font-bold text-[#0D0221]">
                      Drag &amp; drop new banner image here
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      or click to browse local files (JPG, PNG, WebP)
                    </p>
                  </div>

                  {(uploadedImageRef || urlInput.trim()) && (
                    <div className="mt-2.5 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2">
                      <div className="h-12 w-20 overflow-hidden rounded-lg border border-slate-200">
                        <IdbImage
                          src={uploadedImageRef || urlInput.trim()}
                          alt="Banner preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="flex-1 truncate text-[11px] font-semibold text-emerald-700">
                        {uploadedImageRef
                          ? 'Uploaded to IndexedDB ready for slide'
                          : 'Image URL preview active'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setUploadedImageRef('');
                          setUrlInput('');
                        }}
                        className="cursor-pointer text-[11px] font-bold text-red-500 hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  <input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Image URL (optional)"
                    className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-[11px] text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingImage}
                  className="cursor-pointer rounded-xl bg-[#0F52BA] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#0F52BA]/25 hover:bg-[#0A3F91] disabled:opacity-60"
                >
                  Add Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
