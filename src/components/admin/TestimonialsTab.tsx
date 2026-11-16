'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Star, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Testimonial } from '@/types';

interface TestimonialsTabProps {
  testimonials: Testimonial[];
  onAddTestimonial: (
    payload: Omit<Testimonial, 'id' | 'createdAt'>
  ) => Promise<void>;
  onUpdateTestimonial: (
    id: string,
    patch: Partial<Testimonial>
  ) => Promise<void>;
  onToggleVisibility: (id: string) => Promise<void>;
  onDeleteTestimonial: (testimonial: Testimonial) => void;
}

export function TestimonialsTab({
  testimonials,
  onAddTestimonial,
  onUpdateTestimonial,
  onToggleVisibility,
  onDeleteTestimonial,
}: TestimonialsTabProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [clientName, setClientName] = useState('');
  const [locationOrProperty, setLocationOrProperty] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [formError, setFormError] = useState('');

  const openAdd = () => {
    setEditing(null);
    setClientName('');
    setLocationOrProperty('');
    setRating(5);
    setReviewText('');
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (t: Testimonial) => {
    setEditing(t);
    setClientName(t.clientName);
    setLocationOrProperty(t.locationOrProperty);
    setRating(t.rating || 5);
    setReviewText(t.reviewText);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async () => {
    const cleanName = clientName.trim();
    const cleanQuote = reviewText.trim();
    if (!cleanName || !cleanQuote) {
      setFormError('Please enter Client Name and Client Feedback.');
      return;
    }

    if (editing) {
      await onUpdateTestimonial(editing.id, {
        clientName: cleanName,
        locationOrProperty: locationOrProperty.trim() || 'India',
        rating,
        reviewText: cleanQuote,
      });
    } else {
      await onAddTestimonial({
        clientName: cleanName,
        locationOrProperty: locationOrProperty.trim() || 'India',
        rating,
        reviewText: cleanQuote,
        visible: true,
      });
    }
    setModalOpen(false);
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-[#0D0221] lg:text-3xl">
            Client Testimonials
          </h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500 lg:text-sm">
            Verified customer reviews displayed on public landing pages.
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl bg-[#0F52BA] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#0F52BA]/25 transition-all hover:bg-[#0A3F91]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <div
            key={t.id}
            className={cn(
              'group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm transition-shadow hover:shadow-md',
              !t.visible && 'bg-slate-50/70 opacity-75'
            )}
          >
            <div className="absolute top-4 right-4 flex items-center gap-1">
              <button
                type="button"
                onClick={() => void onToggleVisibility(t.id)}
                title={t.visible ? 'Visible on Landing Page' : 'Hidden from Landing Page'}
                aria-label={t.visible ? 'Hide testimonial' : 'Publish testimonial'}
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#0F52BA]"
              >
                {t.visible ? (
                  <Eye className="h-3.5 w-3.5 text-emerald-600" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                )}
              </button>
              <button
                type="button"
                onClick={() => openEdit(t)}
                title="Edit Testimonial"
                aria-label={`Edit testimonial from ${t.clientName}`}
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-[#0F52BA]/5 hover:text-[#0F52BA]"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDeleteTestimonial(t)}
                title="Delete Testimonial"
                aria-label={`Delete testimonial from ${t.clientName}`}
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <div>
              <div className="mb-3 flex items-center gap-1 text-amber-400">
                {Array.from({ length: t.rating || 5 }).map((_, sIdx) => (
                  <Star key={sIdx} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mb-4 pr-20 text-xs leading-relaxed font-medium text-slate-600">
                &ldquo;{t.reviewText}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#CBD5E1] bg-[#E9F1F7] text-xs font-bold text-[#0F52BA]">
                  {t.clientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-sans text-xs font-bold text-[#0D0221]">
                    {t.clientName}
                  </h4>
                  <p className="text-[10px] font-medium text-slate-400">
                    {t.locationOrProperty}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[10px] font-bold',
                  t.visible
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-200 text-slate-500'
                )}
              >
                {t.visible ? 'Visible' : 'Hidden'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Testimonial Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="testModalTitle"
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0221]/60 p-4 backdrop-blur-sm"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2
                id="testModalTitle"
                className="font-sans text-base font-bold text-[#0D0221]"
              >
                {editing ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close testimonial modal"
                className="cursor-pointer rounded-lg p-1 text-slate-400 hover:text-[#0D0221]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-6 text-xs">
              {formError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 font-semibold text-red-600">
                  {formError}
                </div>
              )}

              <div>
                <label className="mb-1 block font-medium text-slate-500">
                  Client Name
                </label>
                <input
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Client name"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-medium text-slate-500">
                  Rating
                </label>
                <div className="flex items-center gap-1.5 text-amber-400">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <button
                      key={starVal}
                      type="button"
                      onClick={() => setRating(starVal)}
                      aria-label={`Set ${starVal} star rating`}
                      className="cursor-pointer p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={cn(
                          'h-5 w-5',
                          starVal <= rating ? 'fill-current' : 'fill-none'
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-500">
                  Location / Residence
                </label>
                <input
                  value={locationOrProperty}
                  onChange={(e) => setLocationOrProperty(e.target.value)}
                  placeholder="Location (e.g. Dubai · Aurelia Villa Buyer)"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-500">
                  Client Feedback
                </label>
                <textarea
                  rows={3}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Client feedback review"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="cursor-pointer rounded-lg border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                className="cursor-pointer rounded-lg bg-[#0F52BA] px-5 py-1.5 text-xs font-bold text-white shadow-md shadow-[#0F52BA]/25 hover:bg-[#0A3F91]"
              >
                Save Testimonial
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
