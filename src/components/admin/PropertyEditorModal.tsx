'use client';

import React, { useRef, useState } from 'react';
import {
  ArrowUpDown,
  BatteryCharging,
  BedDouble,
  Car,
  CheckCircle,
  Dumbbell,
  Droplets,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  Smile,
  Trash2,
  Trees,
  Video,
  Waves,
  X,
  Zap,
} from 'lucide-react';
import { IdbImage } from '@/components/ui/IdbImage';
import {
  extractBhkCount,
  getAmenityLabelsForProperty,
  getDisplayLocation,
  inferBadgeTag,
  makePropertySlug,
  mapAmenityLabelsToStore,
  normalizePropertyType,
  parseInrPriceInput,
  splitLocationAreaCity,
  TEAMMATE_PRESET_AMENITIES,
  type PresetAmenityItem,
} from '@/lib/adminUtils';
import { formatINRCompact } from '@/lib/format';
import { saveMediaFile } from '@/lib/idb';
import { cn } from '@/lib/utils';
import type {
  AvailabilityStatus,
  BadgeTag,
  Property,
  PublishStatus,
} from '@/types';

interface PropertyEditorModalProps {
  isOpen: boolean;
  editingProperty: Property | null;
  nextDisplayOrder: number;
  onClose: () => void;
  onSave: (
    payload: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => Promise<void>;
}

const PRESET_ICON_COMPONENTS: Record<
  PresetAmenityItem['iconName'],
  React.ComponentType<{ className?: string }>
> = {
  'bed-double': BedDouble,
  waves: Waves,
  dumbbell: Dumbbell,
  'shield-check': ShieldCheck,
  car: Car,
  trees: Trees,
  zap: Zap,
  'arrow-up-down': ArrowUpDown,
  droplets: Droplets,
  video: Video,
  smile: Smile,
  'battery-charging': BatteryCharging,
};

function renderAmenityIcon(name: string, className = 'w-4 h-4 flex-shrink-0') {
  const lower = name.toLowerCase();
  const matched = TEAMMATE_PRESET_AMENITIES.find(
    (item) => item.name.toLowerCase() === lower
  );
  if (matched) {
    const Icon = PRESET_ICON_COMPONENTS[matched.iconName];
    return <Icon className={className} />;
  }
  if (lower.includes('bed')) return <BedDouble className={className} />;
  if (lower.includes('pool')) return <Waves className={className} />;
  if (lower.includes('gym') || lower.includes('club')) {
    return <Dumbbell className={className} />;
  }
  if (lower.includes('security')) return <ShieldCheck className={className} />;
  if (lower.includes('park') || lower.includes('car')) return <Car className={className} />;
  if (lower.includes('garden') || lower.includes('green')) return <Trees className={className} />;
  if (lower.includes('power') || lower.includes('backup')) return <Zap className={className} />;
  if (lower.includes('lift') || lower.includes('elevat')) {
    return <ArrowUpDown className={className} />;
  }
  if (lower.includes('water')) return <Droplets className={className} />;
  if (lower.includes('cctv') || lower.includes('camera')) return <Video className={className} />;
  if (lower.includes('play')) return <Smile className={className} />;
  if (lower.includes('ev') || lower.includes('charge')) {
    return <BatteryCharging className={className} />;
  }
  return <CheckCircle className={className} />;
}

export function PropertyEditorModal({
  isOpen,
  editingProperty,
  nextDisplayOrder,
  onClose,
  onSave,
}: PropertyEditorModalProps) {
  const initialAmenities = editingProperty
    ? getAmenityLabelsForProperty(editingProperty)
    : [];
  const initialExtraAmenities = initialAmenities.filter(
    (lbl) =>
      !TEAMMATE_PRESET_AMENITIES.some(
        (p) => p.name.toLowerCase() === lbl.toLowerCase()
      )
  );
  const initialGallery = editingProperty?.galleryImages ?? [];

  const [title, setTitle] = useState(editingProperty?.title ?? '');
  const [propertyTypeText, setPropertyTypeText] = useState(
    editingProperty
      ? editingProperty.customTypeLabel || editingProperty.type
      : ''
  );
  const [locationText, setLocationText] = useState(
    editingProperty ? getDisplayLocation(editingProperty) : ''
  );
  const [priceText, setPriceText] = useState(
    editingProperty ? formatINRCompact(editingProperty.priceInr) : ''
  );
  const [offerPriceText, setOfferPriceText] = useState(
    editingProperty?.hasOffer && editingProperty.offerPriceInr
      ? formatINRCompact(editingProperty.offerPriceInr)
      : ''
  );
  const [badgeTag, setBadgeTag] = useState<BadgeTag>(
    editingProperty ? inferBadgeTag(editingProperty) : 'None'
  );
  const [publishStatus, setPublishStatus] = useState<PublishStatus>(
    editingProperty?.publishStatus ?? 'published'
  );
  const [availability, setAvailability] = useState<AvailabilityStatus>(
    editingProperty?.availability ?? 'available'
  );
  const [description, setDescription] = useState(
    editingProperty
      ? editingProperty.shortDescription ||
          editingProperty.longDescription[0] ||
          ''
      : ''
  );
  const [coverImage, setCoverImage] = useState(
    editingProperty?.coverImage || ''
  );
  const [gallerySlots, setGallerySlots] = useState<string[]>(
    editingProperty
      ? Array.from({ length: 5 }, (_, idx) => initialGallery[idx] ?? '')
      : ['', '', '', '', '']
  );
  const [selectedAmenities, setSelectedAmenities] =
    useState<string[]>(initialAmenities);
  const [customAmenityInput, setCustomAmenityInput] = useState('');
  const [customAmenityOptions, setCustomAmenityOptions] = useState<string[]>(
    initialExtraAmenities
  );
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingSlotIdx, setUploadingSlotIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const pendingSlotRef = useRef<number>(0);

  if (!isOpen) return null;

  const allAmenityButtons = [
    ...TEAMMATE_PRESET_AMENITIES.map((a) => a.name),
    ...customAmenityOptions.filter(
      (name) =>
        !TEAMMATE_PRESET_AMENITIES.some(
          (p) => p.name.toLowerCase() === name.toLowerCase()
        )
    ),
  ];

  const toggleAmenity = (name: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  const handleAddCustomAmenity = () => {
    const val = customAmenityInput.trim();
    if (!val) return;
    if (!selectedAmenities.includes(val)) {
      setSelectedAmenities((prev) => [...prev, val]);
    }
    if (
      !allAmenityButtons.some((item) => item.toLowerCase() === val.toLowerCase())
    ) {
      setCustomAmenityOptions((prev) => [...prev, val]);
    }
    setCustomAmenityInput('');
  };

  const handleCoverUpload = async (file?: File) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      const ref = await saveMediaFile(file);
      setCoverImage(ref);
    } finally {
      setUploadingCover(false);
    }
  };

  const handleGallerySlotUpload = async (file?: File) => {
    if (!file) return;
    const slotIdx = pendingSlotRef.current;
    setUploadingSlotIdx(slotIdx);
    try {
      const ref = await saveMediaFile(file);
      setGallerySlots((prev) =>
        prev.map((item, idx) => (idx === slotIdx ? ref : item))
      );
    } finally {
      setUploadingSlotIdx(null);
    }
  };

  const handleSubmit = async () => {
    const cleanTitle = title.trim();
    const cleanLocation = locationText.trim();
    const parsedPriceInr = parseInrPriceInput(priceText);

    if (!cleanTitle || !cleanLocation || parsedPriceInr <= 0) {
      setFormError(
        'Please fill out Property Name, Location, and a valid INR Price (e.g. ₹1.85 Cr, ₹78 L, or 7800000).'
      );
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      const parsedOffer = offerPriceText.trim()
        ? parseInrPriceInput(offerPriceText)
        : 0;
      const hasValidOffer =
        parsedOffer > 0 && parsedOffer < parsedPriceInr;

      const { area, city } = splitLocationAreaCity(
        cleanLocation,
        editingProperty?.city || 'India'
      );
      const cleanTypeLabel = propertyTypeText.trim() || 'Apartment · 3 BHK';
      const normalizedType = normalizePropertyType(cleanTypeLabel);
      const parsedBedrooms =
        extractBhkCount(cleanTypeLabel) ??
        editingProperty?.specifications.bedrooms;

      const { amenities, customAmenities } =
        mapAmenityLabelsToStore(selectedAmenities);

      const nonEmptyGallery = gallerySlots.filter(Boolean);
      const effectiveCover = coverImage || nonEmptyGallery[0] || '';
      const mergedGallery =
        nonEmptyGallery.length > 0
          ? nonEmptyGallery
          : effectiveCover
            ? [effectiveCover]
            : [];

      const cleanDesc =
        description.trim() ||
        `${cleanTitle} in ${cleanLocation} curated by V.V Properties.`;

      const offerBadgeText =
        badgeTag !== 'None'
          ? badgeTag
          : editingProperty?.offerBadgeText;

      const payload: Omit<Property, 'id' | 'createdAt' | 'updatedAt'> = {
        slug: editingProperty?.slug || `${makePropertySlug(cleanTitle)}-${Date.now().toString(36).slice(-4)}`,
        title: cleanTitle,
        area,
        city,
        type: normalizedType,
        customTypeLabel: cleanTypeLabel,
        priceInr: parsedPriceInr,
        hasOffer: hasValidOffer || badgeTag === 'Special Offer',
        offerPriceInr: hasValidOffer
          ? parsedOffer
          : editingProperty?.offerPriceInr &&
              editingProperty.offerPriceInr < parsedPriceInr
            ? editingProperty.offerPriceInr
            : undefined,
        offerBadgeText,
        offerEndDate: editingProperty?.offerEndDate,
        badgeTag,
        availability,
        publishStatus,
        displayOrder: editingProperty?.displayOrder ?? nextDisplayOrder,
        coverImage: effectiveCover,
        galleryImages: mergedGallery,
        shortDescription: cleanDesc,
        longDescription:
          editingProperty?.longDescription &&
          editingProperty.shortDescription === cleanDesc
            ? editingProperty.longDescription
            : [cleanDesc],
        specifications: {
          bedrooms: parsedBedrooms,
          bathrooms:
            editingProperty?.specifications.bathrooms ??
            (parsedBedrooms ? Math.max(2, parsedBedrooms) : undefined),
          areaSqFt:
            editingProperty?.specifications.areaSqFt ??
            (normalizedType === 'Plot' ? 2400 : 2850),
          plotOrFloor:
            editingProperty?.specifications.plotOrFloor ?? cleanTypeLabel,
          parkingSpaces: editingProperty?.specifications.parkingSpaces ?? 2,
          possessionStatus:
            editingProperty?.specifications.possessionStatus ??
            'Ready for Private Viewing',
          facing: editingProperty?.specifications.facing ?? 'North-East',
        },
        amenities,
        customAmenities,
        whyBuyPoints:
          editingProperty?.whyBuyPoints && editingProperty.whyBuyPoints.length > 0
            ? editingProperty.whyBuyPoints
            : [
                `Prime micro-market positioning in ${cleanLocation}`,
                'Clear title verification and dedicated V.V Properties concierge documentation',
              ],
        callNumber: editingProperty?.callNumber,
        whatsappNumber: editingProperty?.whatsappNumber,
      };

      await onSave(payload, editingProperty?.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="propModalTitle"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0221]/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2
            id="propModalTitle"
            className="font-sans text-base font-bold text-[#0D0221]"
          >
            {editingProperty ? 'Edit Property' : 'Add Property'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close property modal"
            className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-[#0D0221]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto p-6 text-xs">
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium text-slate-500">
                Property Name
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Property Name"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-500">
                Property Type
              </label>
              <input
                value={propertyTypeText}
                onChange={(e) => setPropertyTypeText(e.target.value)}
                placeholder="Property Type (e.g. Villa · 4 BHK)"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-500">
                Location / Area
              </label>
              <input
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="Location / Area (e.g. Whitefield, Bengaluru)"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-500">
                Price (INR)
              </label>
              <input
                value={priceText}
                onChange={(e) => setPriceText(e.target.value)}
                placeholder="Price (e.g. ₹1.85 Cr or ₹78 L)"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-500">
                Badge Tag
              </label>
              <select
                value={badgeTag}
                onChange={(e) => setBadgeTag(e.target.value as BadgeTag)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
              >
                <option value="None">None (No Badge)</option>
                <option value="Featured">Featured</option>
                <option value="New Launch">New Launch</option>
                <option value="Special Offer">Special Offer</option>
                <option value="Hot Deal">Hot Deal</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-500">
                Visibility & Availability
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  aria-label="Publication status"
                  value={publishStatus}
                  onChange={(e) =>
                    setPublishStatus(e.target.value as PublishStatus)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                >
                  <option value="published">Published</option>
                  <option value="unpublished">Draft</option>
                </select>
                <select
                  aria-label="Availability status"
                  value={availability}
                  onChange={(e) =>
                    setAvailability(e.target.value as AvailabilityStatus)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            {badgeTag === 'Special Offer' && (
              <div className="sm:col-span-2">
                <label className="mb-1 block font-medium text-slate-500">
                  Special Offer Price (Optional INR Discount)
                </label>
                <input
                  value={offerPriceText}
                  onChange={(e) => setOfferPriceText(e.target.value)}
                  placeholder="Optional discounted price (e.g. ₹6.25 Cr)"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="mb-1 block font-medium text-slate-500">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Property description and specifications..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
              />
            </div>

            {/* Cover Image */}
            <div className="border-t border-slate-100 pt-2 sm:col-span-2">
              <label className="mb-1.5 block font-medium text-slate-500">
                Cover Image (Stored in IndexedDB)
              </label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                aria-label="Upload cover photo"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  void handleCoverUpload(file);
                }}
              />
              {coverImage ? (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative h-24 w-36 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                    <IdbImage
                      src={coverImage}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-500">
                    <div className="mr-2">
                      <p className="font-bold text-[#0D0221]">
                        Current Cover Image
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Persisted across refreshes
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      {uploadingCover ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0F52BA]" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5 text-[#0F52BA]" />
                      )}
                      <span>Update</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#0F52BA]/40 bg-[#0F52BA]/5 text-[#0F52BA] transition-all hover:bg-[#0F52BA]/10"
                  >
                    {uploadingCover ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <Plus className="h-6 w-6 stroke-[2.5]" />
                    )}
                    <span className="mt-1 text-[10px] font-bold">Add Cover</span>
                  </button>
                  <div className="text-xs text-slate-500">
                    <p className="font-bold text-[#0D0221]">Upload Cover Image</p>
                    <p className="text-[11px] text-slate-400">
                      Click to select property cover photo (JPG, PNG, WebP)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Gallery Images (5 Photos) */}
            <div className="border-t border-slate-100 pt-2 sm:col-span-2">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <label className="font-medium text-slate-500">
                  Gallery Images (5 Photos)
                </label>
                <span className="text-[10px] text-slate-400">
                  Room, Swimming Pool, Kitchen, Balcony, Exterior
                </span>
              </div>
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                aria-label="Upload gallery photo"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  void handleGallerySlotUpload(file);
                }}
              />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {gallerySlots.map((slotUrl, idx) =>
                  slotUrl ? (
                    <div
                      key={idx}
                      className="group relative h-20 overflow-hidden rounded-xl border border-slate-200 shadow-sm"
                    >
                      <IdbImage
                        src={slotUrl}
                        alt={`Gallery ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-[#060112]/80 p-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            pendingSlotRef.current = idx;
                            galleryInputRef.current?.click();
                          }}
                          className="w-full cursor-pointer rounded bg-white py-0.5 text-[9px] font-bold text-[#0D0221] hover:bg-slate-100"
                        >
                          {uploadingSlotIdx === idx ? '...' : 'Update'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setGallerySlots((prev) =>
                              prev.map((item, sIdx) =>
                                sIdx === idx ? '' : item
                              )
                            )
                          }
                          className="w-full cursor-pointer rounded bg-red-600 py-0.5 text-[9px] font-bold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        pendingSlotRef.current = idx;
                        galleryInputRef.current?.click();
                      }}
                      className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition-all hover:border-[#0F52BA] hover:bg-[#0F52BA]/5 hover:text-[#0F52BA]"
                    >
                      {uploadingSlotIdx === idx ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                      )}
                      <span className="mt-0.5 text-[9px] font-bold">
                        Slot {idx + 1}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="border-t border-slate-100 pt-2 sm:col-span-2">
              <label className="mb-1 block font-medium text-slate-500">
                Amenities & Facilities
              </label>
              <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {allAmenityButtons.map((name) => {
                  const selected = selectedAmenities.includes(name);
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => toggleAmenity(name)}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-xl border p-2 text-left transition-all',
                        selected
                          ? 'border-[#0F52BA] bg-[#0F52BA]/10 font-bold text-[#0F52BA] shadow-sm'
                          : 'border-slate-200 bg-white font-medium text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {renderAmenityIcon(name)}
                      <span className="truncate text-xs">{name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <input
                  value={customAmenityInput}
                  onChange={(e) => setCustomAmenityInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomAmenity();
                    }
                  }}
                  placeholder="Add custom amenity..."
                  className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                />
                <button
                  type="button"
                  onClick={handleAddCustomAmenity}
                  className="cursor-pointer rounded-xl bg-[#0F52BA] px-4 py-2 text-xs font-bold text-white transition-all hover:bg-[#0A3F91]"
                >
                  + Add
                </button>
              </div>

              <div className="mt-2 flex min-h-[32px] flex-wrap gap-1.5 rounded-xl border border-dashed border-slate-200 bg-white p-2">
                {selectedAmenities.length === 0 ? (
                  <span className="text-[11px] font-medium text-slate-400">
                    No amenities selected. Click buttons above or add custom items.
                  </span>
                ) : (
                  selectedAmenities.map((item) => (
                    <span
                      key={item}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#0F52BA]/20 bg-[#0F52BA]/10 px-2.5 py-1 text-xs font-bold text-[#0F52BA]"
                    >
                      {renderAmenityIcon(item, 'w-3.5 h-3.5 flex-shrink-0')}
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => toggleAmenity(item)}
                        aria-label={`Remove ${item}`}
                        className="ml-1 cursor-pointer font-bold hover:text-red-500"
                      >
                        &times;
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving || uploadingCover || uploadingSlotIdx !== null}
            className="cursor-pointer rounded-xl bg-[#0F52BA] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#0F52BA]/25 hover:bg-[#0A3F91] disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Property'}
          </button>
        </div>
      </div>
    </div>
  );
}
