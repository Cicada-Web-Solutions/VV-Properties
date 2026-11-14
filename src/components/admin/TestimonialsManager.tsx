'use client';

import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { IdbImage } from '@/components/ui/IdbImage';
import { useVVStore } from '@/context/VVStoreContext';
import { getInitials } from '@/lib/format';
import { saveMediaFile } from '@/lib/idb';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/types';

export function TestimonialsManager() {
  const {
    testimonials,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialVisibility,
    notify,
  } = useVVStore();

  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Testimonial | null>(null);

  const [clientName, setClientName] = useState('');
  const [locationOrProperty, setLocationOrProperty] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(undefined);
  const [visible, setVisible] = useState(true);

  const openEditor = (item?: Testimonial) => {
    if (item) {
      setEditing(item);
      setCreating(false);
      setClientName(item.clientName);
      setLocationOrProperty(item.locationOrProperty);
      setRating(item.rating);
      setReviewText(item.reviewText);
      setPhoto(item.photo);
      setVisible(item.visible);
    } else {
      setEditing(null);
      setCreating(true);
      setClientName('');
      setLocationOrProperty('');
      setRating(5);
      setReviewText('');
      setPhoto(undefined);
      setVisible(true);
    }
  };

  const closeEditor = () => {
    setEditing(null);
    setCreating(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !reviewText.trim()) return;

    const payload = {
      clientName: clientName.trim(),
      locationOrProperty:
        locationOrProperty.trim() || 'Private Client (Sample)',
      rating,
      reviewText: reviewText.trim().slice(0, 250),
      photo,
      visible,
    };

    if (editing) {
      await updateTestimonial(editing.id, payload);
      notify('Testimonial updated', 'success');
    } else {
      await addTestimonial(payload);
      notify('Testimonial added', 'success');
    }
    closeEditor();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#0D0221]/10 bg-white p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-2xl font-medium text-[#0D0221]">
            Client Testimonials
          </h2>
          <p className="text-xs text-[#0D0221]/65">
            Toggle visibility per review or add/edit client perspectives shown
            on the Landing Page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex items-center gap-2 rounded-lg bg-[#4062BB] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0D0221]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Review</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {testimonials.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex flex-col justify-between rounded-2xl border bg-white p-5 transition-colors',
              item.visible
                ? 'border-[#0D0221]/10'
                : 'border-dashed border-[#0D0221]/20 bg-[#CDE6F5]/10 opacity-75'
            )}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {item.photo ? (
                    <IdbImage
                      src={item.photo}
                      alt={item.clientName}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D0221] text-xs font-semibold text-white">
                      {getInitials(item.clientName)}
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-[#0D0221]">
                      {item.clientName}
                    </h3>
                    <p className="text-xs text-[#0D0221]/60">
                      {item.locationOrProperty}
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                    item.visible
                      ? 'bg-[#49A078]/15 text-[#2d7251]'
                      : 'bg-[#0D0221]/10 text-[#0D0221]/65'
                  )}
                >
                  {item.visible ? 'Visible' : 'Hidden'}
                </span>
              </div>

              <div className="mt-3 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      'h-3.5 w-3.5',
                      s <= item.rating
                        ? 'fill-[#4062BB] text-[#4062BB]'
                        : 'text-[#0D0221]/20'
                    )}
                  />
                ))}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[#0D0221]/80">
                &ldquo;{item.reviewText}&rdquo;
              </p>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-[#0D0221]/8 pt-3.5">
              <button
                type="button"
                onClick={async () => {
                  await toggleTestimonialVisibility(item.id);
                  notify(
                    item.visible ? 'Review hidden' : 'Review shown',
                    'info'
                  );
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#0D0221]/15 px-3 py-1.5 text-xs font-medium text-[#0D0221] hover:border-[#4062BB]"
              >
                {item.visible ? (
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
                onClick={() => openEditor(item)}
                className="inline-flex items-center gap-1 rounded-lg border border-[#0D0221]/15 px-3 py-1.5 text-xs font-medium text-[#0D0221] hover:border-[#4062BB]"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(item)}
                className="rounded-lg border border-[#F06543]/25 p-1.5 text-[#F06543] hover:bg-[#F06543] hover:text-white"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {(creating || editing) && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0D0221]/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#0D0221]/10 pb-3">
              <h3 className="font-display text-2xl font-medium text-[#0D0221]">
                {editing ? 'Edit Testimonial' : 'Add Testimonial'}
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
                  Client Name <span className="text-[#F06543]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client name (Sample)"
                  className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-[#0D0221] uppercase">
                    Location / Property
                  </label>
                  <input
                    type="text"
                    value={locationOrProperty}
                    onChange={(e) => setLocationOrProperty(e.target.value)}
                    placeholder="Bengaluru Villa Buyer"
                    className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0D0221] uppercase">
                    Rating (1–5)
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-[#0D0221]/15 bg-white px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} Stars
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0D0221] uppercase">
                  Review Quote (Max 250 chars){' '}
                  <span className="text-[#F06543]">*</span>
                </label>
                <textarea
                  rows={3}
                  maxLength={250}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#0D0221]/15 px-3 py-2 text-xs font-medium text-[#0D0221] hover:border-[#4062BB]">
                  <ImagePlus className="h-3.5 w-3.5 text-[#4062BB]" />
                  <span>{photo ? 'Replace Photo' : 'Upload Photo (Optional)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const ref = await saveMediaFile(file);
                        setPhoto(ref);
                      }
                      e.target.value = '';
                    }}
                    className="hidden"
                  />
                </label>

                <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-[#0D0221]">
                  <input
                    type="checkbox"
                    checked={visible}
                    onChange={(e) => setVisible(e.target.checked)}
                    className="h-4 w-4 accent-[#4062BB]"
                  />
                  <span>Visible on Landing Page</span>
                </label>
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
                  Save Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Testimonial"
        description={`Remove review from "${deleteTarget?.clientName ?? ''}"?`}
        confirmLabel="Delete Review"
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteTestimonial(deleteTarget.id);
            notify('Testimonial deleted', 'info');
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
