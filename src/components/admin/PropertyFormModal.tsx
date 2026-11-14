'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  ImagePlus,
  Plus,
  Star,
  Trash2,
  X,
} from 'lucide-react';
import { IdbImage } from '@/components/ui/IdbImage';
import { ASSETS } from '@/config/assets';
import { AMENITIES_CATALOG } from '@/data/amenities';
import { formatINRCompact, slugify } from '@/lib/format';
import { saveMediaFile } from '@/lib/idb';
import { cn } from '@/lib/utils';
import type {
  AmenityKey,
  AvailabilityStatus,
  Property,
  PropertyType,
  PublishStatus,
} from '@/types';

interface PropertyFormModalProps {
  open: boolean;
  initialProperty?: Property | null;
  nextDisplayOrder: number;
  onSave: (
    payload: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => Promise<void>;
  onClose: () => void;
}

const PROPERTY_TYPES: PropertyType[] = [
  'Villa',
  'Penthouse',
  'Apartment',
  'Plot',
  'Commercial',
];

export function PropertyFormModal({
  open,
  initialProperty,
  nextDisplayOrder,
  onSave,
  onClose,
}: PropertyFormModalProps) {
  if (!open) return null;

  return (
    <PropertyFormModalInner
      key={initialProperty?.id ?? 'new-property'}
      initialProperty={initialProperty}
      nextDisplayOrder={nextDisplayOrder}
      onSave={onSave}
      onClose={onClose}
    />
  );
}

function PropertyFormModalInner({
  initialProperty,
  nextDisplayOrder,
  onSave,
  onClose,
}: Omit<PropertyFormModalProps, 'open'>) {
  const initialImages = initialProperty
    ? initialProperty.galleryImages.length > 0
      ? initialProperty.galleryImages
      : [initialProperty.coverImage]
    : [];

  const [title, setTitle] = useState(initialProperty?.title ?? '');
  const [area, setArea] = useState(initialProperty?.area ?? '');
  const [city, setCity] = useState(initialProperty?.city ?? '');
  const [type, setType] = useState<PropertyType>(
    initialProperty?.type ?? 'Villa'
  );
  const [priceInr, setPriceInr] = useState(
    initialProperty ? String(initialProperty.priceInr) : '55000000'
  );
  const [hasOffer, setHasOffer] = useState(initialProperty?.hasOffer ?? false);
  const [offerPriceInr, setOfferPriceInr] = useState(
    initialProperty?.offerPriceInr ? String(initialProperty.offerPriceInr) : ''
  );
  const [offerBadgeText, setOfferBadgeText] = useState(
    initialProperty?.offerBadgeText || 'Pre-launch offer'
  );
  const [offerEndDate, setOfferEndDate] = useState(
    initialProperty?.offerEndDate || ''
  );
  const [availability, setAvailability] = useState<AvailabilityStatus>(
    initialProperty?.availability ?? 'available'
  );
  const [publishStatus, setPublishStatus] = useState<PublishStatus>(
    initialProperty?.publishStatus ?? 'published'
  );
  const [displayOrder, setDisplayOrder] = useState(
    initialProperty
      ? String(initialProperty.displayOrder)
      : String(nextDisplayOrder)
  );

  const [galleryImages, setGalleryImages] = useState<string[]>(initialImages);
  const [coverImage, setCoverImage] = useState<string>(
    initialProperty?.coverImage || initialImages[0] || ''
  );

  const [shortDescription, setShortDescription] = useState(
    initialProperty?.shortDescription ?? ''
  );
  const [longDescriptionText, setLongDescriptionText] = useState(
    initialProperty ? initialProperty.longDescription.join('\n\n') : ''
  );
  const [areaSqFt, setAreaSqFt] = useState(
    initialProperty ? String(initialProperty.specifications.areaSqFt) : '4200'
  );
  const [bedrooms, setBedrooms] = useState(
    typeof initialProperty?.specifications.bedrooms === 'number'
      ? String(initialProperty.specifications.bedrooms)
      : initialProperty
        ? ''
        : '4'
  );
  const [bathrooms, setBathrooms] = useState(
    typeof initialProperty?.specifications.bathrooms === 'number'
      ? String(initialProperty.specifications.bathrooms)
      : initialProperty
        ? ''
        : '4'
  );
  const [plotOrFloor, setPlotOrFloor] = useState(
    initialProperty?.specifications.plotOrFloor || ''
  );
  const [parkingSpaces, setParkingSpaces] = useState(
    typeof initialProperty?.specifications.parkingSpaces === 'number'
      ? String(initialProperty.specifications.parkingSpaces)
      : initialProperty
        ? ''
        : '2'
  );
  const [possessionStatus, setPossessionStatus] = useState(
    initialProperty?.specifications.possessionStatus ??
      'Ready for Handover (Sample)'
  );
  const [facing] = useState(
    initialProperty?.specifications.facing || 'North-East'
  );
  const [amenities, setAmenities] = useState<AmenityKey[]>(
    initialProperty?.amenities ?? [
      'security-24x7',
      'smart-home',
      'covered-parking',
    ]
  );
  const [whyBuyPoints, setWhyBuyPoints] = useState<string[]>(
    initialProperty?.whyBuyPoints ?? [
      'Prime architectural corridor with clear freehold title',
      'Close to international schools and business districts',
    ]
  );
  const [newUsp, setNewUsp] = useState('');
  const [callNumber, setCallNumber] = useState(
    initialProperty?.callNumber || ''
  );
  const [whatsappNumber, setWhatsappNumber] = useState(
    initialProperty?.whatsappNumber || ''
  );

  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImages(true);
    try {
      const refs: string[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        const ref = await saveMediaFile(file);
        refs.push(ref);
      }
      if (refs.length > 0) {
        setGalleryImages((prev) => {
          const updated = [...prev, ...refs];
          if (!coverImage || !updated.includes(coverImage)) {
            setCoverImage(updated[0]);
          }
          return updated;
        });
      }
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (imgRef: string) => {
    setGalleryImages((prev) => {
      const next = prev.filter((item) => item !== imgRef);
      if (coverImage === imgRef) {
        setCoverImage(next[0] || '');
      }
      return next;
    });
  };

  const moveImage = (index: number, delta: -1 | 1) => {
    const targetIdx = index + delta;
    if (targetIdx < 0 || targetIdx >= galleryImages.length) return;
    const copy = [...galleryImages];
    const tmp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = tmp;
    setGalleryImages(copy);
  };

  const toggleAmenity = (key: AmenityKey) => {
    setAmenities((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const addUsp = () => {
    const trimmed = newUsp.trim();
    if (!trimmed) return;
    setWhyBuyPoints((prev) => [...prev, trimmed]);
    setNewUsp('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericPrice = Number(priceInr);
    const numericOfferPrice = Number(offerPriceInr);
    const numericSqFt = Number(areaSqFt);

    if (title.trim().length < 3) {
      setError('Please enter a property title (at least 3 characters).');
      return;
    }
    if (!area.trim() || !city.trim()) {
      setError('Please provide both Area/Locality and City.');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      setError('Please enter a valid listing price in INR.');
      return;
    }
    if (
      hasOffer &&
      (!Number.isFinite(numericOfferPrice) ||
        numericOfferPrice <= 0 ||
        numericOfferPrice >= numericPrice)
    ) {
      setError('Offer price must be a positive INR amount lower than the base price.');
      return;
    }
    if (!Number.isFinite(numericSqFt) || numericSqFt <= 0) {
      setError('Please enter a valid area in sq.ft.');
      return;
    }
    if (shortDescription.trim().length < 10) {
      setError('Please write a short summary description (at least 10 characters).');
      return;
    }

    const finalGallery =
      galleryImages.length > 0 ? galleryImages : [ASSETS.properties.p01[0]];
    const finalCover =
      coverImage && finalGallery.includes(coverImage)
        ? coverImage
        : finalGallery[0];

    const paragraphs = longDescriptionText
      .split(/\n\s*\n/)
      .map((s) => s.trim())
      .filter(Boolean);

    setSaving(true);
    setError(null);
    try {
      await onSave(
        {
          slug:
            initialProperty?.slug ||
            `${slugify(title)}-${Date.now().toString().slice(-4)}`,
          title: title.trim(),
          area: area.trim(),
          city: city.trim(),
          type,
          priceInr: numericPrice,
          hasOffer,
          offerPriceInr: hasOffer ? numericOfferPrice : undefined,
          offerBadgeText: hasOffer ? offerBadgeText.trim() || 'Special Offer' : undefined,
          offerEndDate: hasOffer ? offerEndDate || undefined : undefined,
          availability,
          publishStatus,
          displayOrder: Number(displayOrder) || nextDisplayOrder,
          coverImage: finalCover,
          galleryImages: finalGallery,
          shortDescription: shortDescription.trim(),
          longDescription:
            paragraphs.length > 0 ? paragraphs : [shortDescription.trim()],
          specifications: {
            areaSqFt: numericSqFt,
            bedrooms: bedrooms ? Number(bedrooms) : undefined,
            bathrooms: bathrooms ? Number(bathrooms) : undefined,
            plotOrFloor: plotOrFloor.trim() || undefined,
            parkingSpaces: parkingSpaces ? Number(parkingSpaces) : undefined,
            possessionStatus: possessionStatus.trim() || 'Ready (Sample)',
            facing: facing.trim() || undefined,
          },
          amenities,
          whyBuyPoints: whyBuyPoints.filter(Boolean),
          callNumber: callNumber.trim() || undefined,
          whatsappNumber: whatsappNumber.trim() || undefined,
        },
        initialProperty?.id
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const parsedPrice = Number(priceInr);

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0D0221]/60 p-3 backdrop-blur-[2px] sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="property-modal-title"
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-[#0D0221]/10 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#0D0221]/10 px-6 py-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.16em] text-[#4062BB] uppercase">
              Portfolio Editor
            </p>
            <h2
              id="property-modal-title"
              className="font-display text-2xl font-medium text-[#0D0221] sm:text-3xl"
            >
              {initialProperty ? 'Edit Property Listing' : 'Add New Property'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#0D0221]/55 hover:bg-[#CDE6F5]/40 hover:text-[#0D0221]"
            aria-label="Close property editor"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-[#F06543]/40 bg-[#F06543]/10 px-4 py-3 text-xs font-medium text-[#b83718]"
            >
              {error}
            </div>
          )}

          {/* Core Identity */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase">
                Property Title <span className="text-[#F06543]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. The Crestview Horizon Villa"
                className="mt-1.5 w-full rounded-lg border border-[#0D0221]/15 px-3.5 py-2.5 text-sm focus:border-[#4062BB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase">
                Area / Locality <span className="text-[#F06543]">*</span>
              </label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Whitefield"
                className="mt-1.5 w-full rounded-lg border border-[#0D0221]/15 px-3.5 py-2.5 text-sm focus:border-[#4062BB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase">
                City <span className="text-[#F06543]">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru"
                className="mt-1.5 w-full rounded-lg border border-[#0D0221]/15 px-3.5 py-2.5 text-sm focus:border-[#4062BB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase">
                Category / Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PropertyType)}
                className="mt-1.5 w-full rounded-lg border border-[#0D0221]/15 bg-white px-3.5 py-2.5 text-sm focus:border-[#4062BB] focus:outline-none"
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase">
                  Status
                </label>
                <select
                  value={availability}
                  onChange={(e) =>
                    setAvailability(e.target.value as AvailabilityStatus)
                  }
                  className="mt-1.5 w-full rounded-lg border border-[#0D0221]/15 bg-white px-2.5 py-2.5 text-sm focus:border-[#4062BB] focus:outline-none"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase">
                  Visibility
                </label>
                <select
                  value={publishStatus}
                  onChange={(e) =>
                    setPublishStatus(e.target.value as PublishStatus)
                  }
                  className="mt-1.5 w-full rounded-lg border border-[#0D0221]/15 bg-white px-2.5 py-2.5 text-sm focus:border-[#4062BB] focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="unpublished">Hidden</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase">
                  Order
                </label>
                <input
                  type="number"
                  min={1}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#0D0221]/15 px-2.5 py-2.5 text-sm focus:border-[#4062BB] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* INR Pricing & Optional Offer */}
          <div className="rounded-xl border border-[#0D0221]/10 bg-[#CDE6F5]/20 p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-[#0D0221]">
                Pricing in INR (₹)
              </h3>
              {Number.isFinite(parsedPrice) && parsedPrice > 0 && (
                <span className="rounded-full bg-white px-3 py-0.5 text-xs font-semibold text-[#4062BB]">
                  {formatINRCompact(parsedPrice)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase">
                  Base Price (INR ₹) <span className="text-[#F06543]">*</span>
                </label>
                <input
                  type="number"
                  min={100000}
                  step={50000}
                  required
                  value={priceInr}
                  onChange={(e) => setPriceInr(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-[#0D0221]/15 bg-white px-3.5 py-2.5 text-sm focus:border-[#4062BB] focus:outline-none"
                />
              </div>

              <div className="flex items-end pb-2">
                <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-[#0D0221]">
                  <input
                    type="checkbox"
                    checked={hasOffer}
                    onChange={(e) => setHasOffer(e.target.checked)}
                    className="h-4 w-4 rounded border-[#0D0221]/30 accent-[#4062BB]"
                  />
                  <span>Enable Pre-launch / Special Offer</span>
                </label>
              </div>
            </div>

            {hasOffer && (
              <div className="grid grid-cols-1 gap-3 border-t border-[#0D0221]/10 pt-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0D0221]">
                    Offer Price (INR ₹)
                  </label>
                  <input
                    type="number"
                    min={100000}
                    step={50000}
                    value={offerPriceInr}
                    onChange={(e) => setOfferPriceInr(e.target.value)}
                    placeholder="Lower than base price"
                    className="mt-1 w-full rounded-lg border border-[#0D0221]/15 bg-white px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0D0221]">
                    Offer Badge Text
                  </label>
                  <input
                    type="text"
                    value={offerBadgeText}
                    onChange={(e) => setOfferBadgeText(e.target.value)}
                    placeholder="Pre-launch offer"
                    className="mt-1 w-full rounded-lg border border-[#0D0221]/15 bg-white px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0D0221]">
                    Offer End Date
                  </label>
                  <input
                    type="date"
                    value={offerEndDate}
                    onChange={(e) => setOfferEndDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#0D0221]/15 bg-white px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Multi-Image Uploader (IndexedDB Blob Storage) */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-[#0D0221]">
                  Property Gallery &amp; Cover Image
                </h3>
                <p className="text-xs text-[#0D0221]/60">
                  Uploaded photos are stored locally in IndexedDB as binary
                  Blobs for multi-page preview. Not permanent cloud storage.
                </p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[#0D0221] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#4062BB]">
                <ImagePlus className="h-4 w-4" />
                <span>
                  {uploadingImages ? 'Processing...' : 'Upload Images'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={uploadingImages}
                  onChange={(e) => {
                    void handleImageUpload(e.target.files);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
              </label>
            </div>

            {galleryImages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#0D0221]/25 bg-[#CDE6F5]/15 p-6 text-center text-xs text-[#0D0221]/65">
                No images added yet. Upload one or more photos above (if left
                empty, a default placeholder image will be assigned).
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {galleryImages.map((img, idx) => {
                  const isCover = img === coverImage;
                  return (
                    <div
                      key={`${img}-${idx}`}
                      className={cn(
                        'overflow-hidden rounded-xl border bg-white',
                        isCover
                          ? 'border-2 border-[#4062BB]'
                          : 'border-[#0D0221]/12'
                      )}
                    >
                      <div className="relative aspect-[4/3] bg-[#CDE6F5]/20">
                        <IdbImage
                          src={img}
                          alt={`Property upload ${idx + 1}`}
                          className="h-full w-full object-cover"
                        />
                        {isCover && (
                          <span className="absolute top-2 left-2 rounded bg-[#4062BB] px-2 py-0.5 text-[10px] font-semibold text-white">
                            Cover
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1 px-2 py-1.5">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, -1)}
                            disabled={idx === 0}
                            className="rounded p-1 text-[#0D0221]/60 hover:bg-[#CDE6F5]/40 disabled:opacity-30"
                            title="Move left"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 1)}
                            disabled={idx === galleryImages.length - 1}
                            className="rounded p-1 text-[#0D0221]/60 hover:bg-[#CDE6F5]/40 disabled:opacity-30"
                            title="Move right"
                          >
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          {!isCover && (
                            <button
                              type="button"
                              onClick={() => setCoverImage(img)}
                              className="rounded p-1 text-[#4062BB] hover:bg-[#CDE6F5]/40"
                              title="Set as cover image"
                            >
                              <Star className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(img)}
                            className="rounded p-1 text-[#F06543] hover:bg-[#F06543]/10"
                            title="Remove image"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Descriptions */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase">
                Short Card Description <span className="text-[#F06543]">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Concise 1-2 line overview for catalogue cards..."
                className="mt-1.5 w-full rounded-lg border border-[#0D0221]/15 px-3.5 py-2.5 text-sm focus:border-[#4062BB] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-wider text-[#0D0221] uppercase">
                Full Property Narrative (Separate paragraphs with a blank line)
              </label>
              <textarea
                rows={4}
                value={longDescriptionText}
                onChange={(e) => setLongDescriptionText(e.target.value)}
                placeholder="Detailed architectural narrative for the Property Details page..."
                className="mt-1.5 w-full rounded-lg border border-[#0D0221]/15 px-3.5 py-2.5 text-sm focus:border-[#4062BB] focus:outline-none"
              />
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-sm font-semibold text-[#0D0221]">
              Architectural Specifications
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-[#0D0221]/75">
                  Area (sq.ft) <span className="text-[#F06543]">*</span>
                </label>
                <input
                  type="number"
                  min={100}
                  required
                  value={areaSqFt}
                  onChange={(e) => setAreaSqFt(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0D0221]/75">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min={0}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0D0221]/75">
                  Bathrooms
                </label>
                <input
                  type="number"
                  min={0}
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  placeholder="Optional"
                  className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0D0221]/75">
                  Plot / Floor Label
                </label>
                <input
                  type="text"
                  value={plotOrFloor}
                  onChange={(e) => setPlotOrFloor(e.target.value)}
                  placeholder="e.g. 24th Sky Level"
                  className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0D0221]/75">
                  Parking Bays
                </label>
                <input
                  type="number"
                  min={0}
                  value={parkingSpaces}
                  onChange={(e) => setParkingSpaces(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#0D0221]/75">
                  Possession Status
                </label>
                <input
                  type="text"
                  value={possessionStatus}
                  onChange={(e) => setPossessionStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Amenities Multi-Select */}
          <div>
            <h3 className="text-sm font-semibold text-[#0D0221]">
              Amenities (Select from Preset)
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {AMENITIES_CATALOG.map((item) => {
                const active = amenities.includes(item.key);
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => toggleAmenity(item.key)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors',
                      active
                        ? 'border-[#4062BB] bg-[#4062BB] text-white'
                        : 'border-[#0D0221]/15 bg-white text-[#0D0221] hover:border-[#4062BB]'
                    )}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Why Buy USPs */}
          <div>
            <h3 className="text-sm font-semibold text-[#0D0221]">
              Why Buy Points (USPs)
            </h3>
            <div className="mt-2.5 flex gap-2">
              <input
                type="text"
                value={newUsp}
                onChange={(e) => setNewUsp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addUsp();
                  }
                }}
                placeholder="Add a key highlight and press Add..."
                className="flex-1 rounded-lg border border-[#0D0221]/15 px-3.5 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
              />
              <button
                type="button"
                onClick={addUsp}
                className="inline-flex items-center gap-1 rounded-lg bg-[#0D0221] px-4 py-2 text-xs font-medium text-white hover:bg-[#4062BB]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
            <ul className="mt-3 space-y-2">
              {whyBuyPoints.map((pt, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between gap-3 rounded-lg border border-[#0D0221]/10 bg-[#CDE6F5]/15 px-3 py-2 text-xs text-[#0D0221]"
                >
                  <span>{pt}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setWhyBuyPoints((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    className="text-[#F06543] hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Optional Direct Contact Overrides */}
          <div className="grid grid-cols-1 gap-4 border-t border-[#0D0221]/10 pt-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#0D0221]/75">
                Custom Call Number (Optional)
              </label>
              <input
                type="tel"
                value={callNumber}
                onChange={(e) => setCallNumber(e.target.value)}
                placeholder="Defaults to global agency desk"
                className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#0D0221]/75">
                Custom WhatsApp Number (Optional)
              </label>
              <input
                type="tel"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="Defaults to global WhatsApp desk"
                className="mt-1 w-full rounded-lg border border-[#0D0221]/15 px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Submit Actions */}
          <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-[#0D0221]/10 bg-white pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#0D0221]/20 bg-white px-5 py-2.5 text-sm font-medium text-[#0D0221] hover:bg-[#CDE6F5]/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImages}
              className="rounded-lg bg-[#4062BB] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0D0221] disabled:opacity-55"
            >
              {saving
                ? 'Saving...'
                : initialProperty
                  ? 'Save Changes'
                  : 'Publish Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
