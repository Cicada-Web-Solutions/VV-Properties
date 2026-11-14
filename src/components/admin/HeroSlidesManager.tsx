'use client';

import React, { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { IdbImage } from '@/components/ui/IdbImage';
import { ASSETS } from '@/config/assets';
import { useVVStore } from '@/context/VVStoreContext';
import { saveMediaFile } from '@/lib/idb';
import type { HeroSlide } from '@/types';

export function HeroSlidesManager() {
  const {
    heroSlides,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    moveHeroSlide,
    notify,
  } = useVVStore();

  const [editing, setEditing] = useState<HeroSlide | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HeroSlide | null>(null);

  const [eyebrow, setEyebrow] = useState('PREMIUM REAL ESTATE');
  const [headline, setHeadline] = useState('');
  const [accentWord, setAccentWord] = useState('');
  const [supportingText, setSupportingText] = useState('');
  const [ctaText, setCtaText] = useState('Explore Properties');
  const [ctaLink, setCtaLink] = useState('/properties');
  const [image, setImage] = useState<string>(ASSETS.hero.slide01);
  const [active, setActive] = useState(true);

  const sortedSlides = [...heroSlides].sort((a, b) => a.order - b.order);

  const openEditor = (slide?: HeroSlide) => {
    if (slide) {
      setEditing(slide);
      setCreating(false);
      setEyebrow(slide.eyebrow);
      setHeadline(slide.headline);
      setAccentWord(slide.accentWord || '');
      setSupportingText(slide.supportingText);
      setCtaText(slide.ctaText || '');
      setCtaLink(slide.ctaLink || '/properties');
      setImage(slide.image);
      setActive(slide.active);
    } else {
      setEditing(null);
      setCreating(true);
      setEyebrow('FEATURED COLLECTION');
      setHeadline('');
      setAccentWord('');
      setSupportingText('');
      setCtaText('Explore Properties');
      setCtaLink('/properties');
      setImage(ASSETS.hero.slide01);
      setActive(true);
    }
  };

  const closeEditor = () => {
    setEditing(null);
    setCreating(false);
  };

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return;
    const ref = await saveMediaFile(file);
    setImage(ref);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!headline.trim()) return;

    const payload = {
      eyebrow: eyebrow.trim() || 'VV PROPERTIES',
      headline: headline.trim(),
      accentWord: accentWord.trim() || undefined,
      supportingText: supportingText.trim(),
      ctaText: ctaText.trim() || undefined,
      ctaLink: ctaLink.trim() || '/properties',
      image,
      active,
      order: editing ? editing.order : heroSlides.length + 1,
    };

    if (editing) {
      await updateHeroSlide(editing.id, payload);
      notify('Hero slide updated', 'success');
    } else {
      await addHeroSlide(payload);
      notify('Hero slide added', 'success');
    }
    closeEditor();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#0D0221]/10 bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-medium text-[#0D0221]">
            Landing Banner Carousel
          </h2>
          <p className="text-xs text-[#0D0221]/65">
            Reorder, edit, or toggle slides displayed in the Landing Page hero
            section.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4062BB] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0D0221]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Slide</span>
        </button>
      </div>

      <div className="space-y-3">
        {sortedSlides.map((slide, idx) => (
          <div
            key={slide.id}
            className="flex flex-col justify-between gap-4 rounded-2xl border border-[#0D0221]/10 bg-white p-4 sm:flex-row sm:items-center"
          >
            <div className="flex items-start gap-4 min-w-0">
              <div className="h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-[#0D0221]/10 bg-[#CDE6F5]/20">
                <IdbImage
                  src={slide.image}
                  alt={slide.headline}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#CDE6F5]/55 px-2 py-0.5 text-[10px] font-semibold text-[#4062BB] uppercase">
                    Slide {idx + 1}
                  </span>
                  <span className="text-[11px] font-medium text-[#0D0221]/60">
                    {slide.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
                <h3 className="mt-1 truncate font-display text-xl font-medium text-[#0D0221]">
                  {slide.headline}
                </h3>
                <p className="line-clamp-1 text-xs text-[#0D0221]/65">
                  {slide.supportingText}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => moveHeroSlide(slide.id, 'up')}
                className="rounded-lg border border-[#0D0221]/15 p-2 text-[#0D0221] hover:border-[#4062BB] disabled:opacity-35"
                title="Move up"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                disabled={idx === sortedSlides.length - 1}
                onClick={() => moveHeroSlide(slide.id, 'down')}
                className="rounded-lg border border-[#0D0221]/15 p-2 text-[#0D0221] hover:border-[#4062BB] disabled:opacity-35"
                title="Move down"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  updateHeroSlide(slide.id, { active: !slide.active })
                }
                className="inline-flex items-center gap-1 rounded-lg border border-[#0D0221]/15 px-3 py-2 text-xs font-medium text-[#0D0221] hover:border-[#4062BB]"
              >
                {slide.active ? (
                  <>
                    <EyeOff className="h-3.5 w-3.5" />
                    <span>Hide</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3.5 w-3.5" />
                    <span>Show</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => openEditor(slide)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#0D0221]/15 px-3 py-2 text-xs font-medium text-[#0D0221] hover:border-[#4062BB]"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(slide)}
                disabled={sortedSlides.length <= 1}
                className="rounded-lg border border-[#F06543]/25 p-2 text-[#F06543] hover:bg-[#F06543] hover:text-white disabled:opacity-35"
                title={
                  sortedSlides.length <= 1
                    ? 'At least one hero slide is required'
                    : 'Delete slide'
                }
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Editor */}
      {(creating || editing) && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0D0221]/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#0D0221]/10 pb-3">
              <h3 className="font-display text-2xl font-medium text-[#0D0221]">
                {editing ? 'Edit Hero Slide' : 'Add Hero Slide'}
              </h3>
              <button
                type="button"
                onClick={closeEditor}
                className="rounded-lg p-1.5 text-[#0D0221]/55 hover:bg-[#CDE6F5]/40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0D0221] uppercase">
                  Eyebrow Label
                </label>
                <input
                  type="text"
                  value={eyebrow}
                  onChange={(e) => setEyebrow(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#0D0221] uppercase">
                    Headline <span className="text-[#F06543]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Find a place to call home."
                    className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0D0221] uppercase">
                    Highlighted Word
                  </label>
                  <input
                    type="text"
                    value={accentWord}
                    onChange={(e) => setAccentWord(e.target.value)}
                    placeholder="home."
                    className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0D0221] uppercase">
                  Supporting Line
                </label>
                <textarea
                  rows={2}
                  value={supportingText}
                  onChange={(e) => setSupportingText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#0D0221] uppercase">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0D0221] uppercase">
                    CTA Link
                  </label>
                  <input
                    type="text"
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="/properties"
                    className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#0D0221] uppercase">
                    Slide Background Image
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#4062BB] hover:underline">
                    <ImagePlus className="h-3.5 w-3.5" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        void handleImageFile(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="mt-2 h-32 w-full overflow-hidden rounded-xl border border-[#0D0221]/12 bg-[#CDE6F5]/20">
                  <IdbImage
                    src={image}
                    alt="Slide preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-lg border border-[#0D0221]/20 px-4 py-2 text-sm font-medium text-[#0D0221]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-[#4062BB] px-5 py-2 text-sm font-medium text-white hover:bg-[#0D0221]"
                >
                  Save Slide
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Hero Slide"
        description={`Remove "${deleteTarget?.headline ?? ''}" from the Landing Page banner carousel?`}
        confirmLabel="Delete Slide"
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteHeroSlide(deleteTarget.id);
            notify('Hero slide deleted', 'info');
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
