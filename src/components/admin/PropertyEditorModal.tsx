'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  ArrowUpDown,
  BatteryCharging,
  BedDouble,
  Car,
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
  Image as ImageIcon,
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
import { formatINR, formatINRCompact } from '@/lib/format';
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
  return <Sparkles className={className} />;
}

function Sparkles({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
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
      : 'Villa'
  );
  const [locationText, setLocationText] = useState(
    editingProperty ? getDisplayLocation(editingProperty) : ''
  );
  const [priceText, setPriceText] = useState(
    editingProperty
      ? `${(editingProperty.priceInr >= 10000000 ? (editingProperty.priceInr / 10000000).toFixed(2) : (editingProperty.priceInr / 100000).toFixed(2)).replace(/\.00$/, '')} ${editingProperty.priceInr >= 10000000 ? 'Cr' : 'L'}`
      : ''
  );
  const [offerPriceText, setOfferPriceText] = useState(
    editingProperty?.hasOffer && editingProperty.offerPriceInr
      ? `${(editingProperty.offerPriceInr >= 10000000 ? (editingProperty.offerPriceInr / 10000000).toFixed(2) : (editingProperty.offerPriceInr / 100000).toFixed(2)).replace(/\.00$/, '')} ${editingProperty.offerPriceInr >= 10000000 ? 'Cr' : 'L'}`
      : ''
  );
  const [areaInput, setAreaInput] = useState(
    editingProperty?.specifications?.areaSqFt
      ? `${editingProperty.specifications.areaSqFt}`
      : ''
  );
  const [bedroomsInput, setBedroomsInput] = useState(
    editingProperty?.specifications?.bedrooms
      ? `${editingProperty.specifications.bedrooms}`
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
  const [coverUrlInput, setCoverUrlInput] = useState('');
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
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    location?: string;
    price?: string;
  }>({});

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const pendingSlotRef = useRef<number>(0);

  // Live currency computation supporting decimal floats
  const livePriceInr = useMemo(() => {
    return parseInrPriceInput(priceText);
  }, [priceText]);

  const liveOfferInr = useMemo(() => {
    return parseInrPriceInput(offerPriceText);
  }, [offerPriceText]);

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
    } catch (e: any) {
      setFormError(`Cover upload failed: ${e?.message || 'Storage error'}`);
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
    } catch (e: any) {
      setFormError(`Gallery upload failed: ${e?.message || 'Storage error'}`);
    } finally {
      setUploadingSlotIdx(null);
    }
  };

  const handleSubmit = async () => {
    const cleanTitle = title.trim();
    const cleanLocation = locationText.trim();
    const parsedPriceInr = parseInrPriceInput(priceText);

    // Validate required fields
    const errors: { title?: string; location?: string; price?: string } = {};
    if (!cleanTitle) errors.title = 'Property Name is required';
    if (!cleanLocation) errors.location = 'Location / Area is required';
    if (!parsedPriceInr || parsedPriceInr <= 0) {
      errors.price = 'Enter a valid price (e.g. 4.5 Cr, 1.25 Cr, 45.5 L, or 4500000)';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError('Please resolve the highlighted fields before saving.');
      return;
    }

    setFieldErrors({});
    setFormError('');
    setSaving(true);

    try {
      const parsedOffer = liveOfferInr;
      const hasValidOffer = parsedOffer > 0 && parsedOffer < parsedPriceInr;

      const { area, city } = splitLocationAreaCity(
        cleanLocation,
        editingProperty?.city || 'Chennai'
      );
      const cleanTypeLabel = propertyTypeText.trim() || 'Villa';
      const normalizedType = normalizePropertyType(cleanTypeLabel);

      const parsedBedrooms = bedroomsInput.trim()
        ? parseInt(bedroomsInput, 10)
        : extractBhkCount(cleanTypeLabel) ?? editingProperty?.specifications.bedrooms ?? 3;

      const parsedAreaSqFt = areaInput.trim()
        ? parseFloat(areaInput)
        : editingProperty?.specifications.areaSqFt ?? (normalizedType === 'Plot' ? 2400 : 2850);

      const { amenities, customAmenities } = mapAmenityLabelsToStore(selectedAmenities);

      const nonEmptyGallery = gallerySlots.filter(Boolean);
      const effectiveCover = coverImage || nonEmptyGallery[0] || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80';
      const mergedGallery =
        nonEmptyGallery.length > 0
          ? nonEmptyGallery
          : [effectiveCover];

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
        offerPriceInr: hasValidOffer ? parsedOffer : undefined,
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
          editingProperty?.longDescription && editingProperty.shortDescription === cleanDesc
            ? editingProperty.longDescription
            : [cleanDesc],
        specifications: {
          bedrooms: Number.isFinite(parsedBedrooms) ? parsedBedrooms : 3,
          bathrooms: editingProperty?.specifications.bathrooms ?? 3,
          areaSqFt: Number.isFinite(parsedAreaSqFt) ? parsedAreaSqFt : 2000,
          plotOrFloor: editingProperty?.specifications.plotOrFloor ?? cleanTypeLabel,
          parkingSpaces: editingProperty?.specifications.parkingSpaces ?? 2,
          possessionStatus: editingProperty?.specifications.possessionStatus ?? (availability === 'available' ? 'Available' : 'Sold'),
          facing: editingProperty?.specifications.facing ?? 'North-East',
        },
        amenities,
        customAmenities,
        whyBuyPoints:
          editingProperty?.whyBuyPoints && editingProperty.whyBuyPoints.length > 0
            ? editingProperty.whyBuyPoints
            : [
                `Prime micro-market positioning in ${cleanLocation}`,
                'Clear title verification and dedicated V.V Properties documentation',
              ],
        callNumber: editingProperty?.callNumber,
        whatsappNumber: editingProperty?.whatsappNumber,
      };

      await onSave(payload, editingProperty?.id);
      onClose();
    } catch (saveErr: any) {
      console.error('[PropertyEditorModal] Save mutation error:', saveErr);
      setFormError(saveErr?.message || 'Database mutation failed. Please verify network and Supabase connection.');
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 id="propModalTitle" className="font-sans text-base font-bold text-[#0D0221]">
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

        {/* Body */}
        <div className="space-y-4 overflow-y-auto p-6 text-xs">
          {formError && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-semibold text-red-600">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Property Title */}
            <div>
              <label className="mb-1 block font-medium text-slate-600">
                Property Name <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (fieldErrors.title) setFieldErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="e.g. Emerald Bay Luxury Villa"
                className={cn(
                  'w-full rounded-xl border px-3.5 py-2 text-slate-900 outline-none focus:ring-2',
                  fieldErrors.title
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-200 focus:ring-[#0F52BA]/20'
                )}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-[11px] font-medium text-red-500">{fieldErrors.title}</p>
              )}
            </div>

            {/* Property Type */}
            <div>
              <label className="mb-1 block font-medium text-slate-600">
                Property Type <span className="text-red-500">*</span>
              </label>
              <input
                value={propertyTypeText}
                onChange={(e) => setPropertyTypeText(e.target.value)}
                placeholder="e.g. Villa · 4 BHK, Apartment, Plot"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
              />
            </div>

            {/* Location / Area */}
            <div>
              <label className="mb-1 block font-medium text-slate-600">
                Location / Locality <span className="text-red-500">*</span>
              </label>
              <input
                value={locationText}
                onChange={(e) => {
                  setLocationText(e.target.value);
                  if (fieldErrors.location) setFieldErrors((prev) => ({ ...prev, location: undefined }));
                }}
                placeholder="e.g. ECR, Chennai or Whitefield, Bengaluru"
                className={cn(
                  'w-full rounded-xl border px-3.5 py-2 text-slate-900 outline-none focus:ring-2',
                  fieldErrors.location
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-200 focus:ring-[#0F52BA]/20'
                )}
              />
              {fieldErrors.location && (
                <p className="mt-1 text-[11px] font-medium text-red-500">{fieldErrors.location}</p>
              )}
            </div>

            {/* Price (INR) with Float & Live Currency Preview */}
            <div>
              <label className="mb-1 block font-medium text-slate-600">
                Price (INR) <span className="text-red-500">*</span>
              </label>
              <input
                value={priceText}
                step="0.01"
                onChange={(e) => {
                  setPriceText(e.target.value);
                  if (fieldErrors.price) setFieldErrors((prev) => ({ ...prev, price: undefined }));
                }}
                placeholder="e.g. 1.85 Cr, 4.5, 45.5 L, or 18500000"
                className={cn(
                  'w-full rounded-xl border px-3.5 py-2 text-slate-900 outline-none focus:ring-2',
                  fieldErrors.price
                    ? 'border-red-400 focus:ring-red-200'
                    : 'border-slate-200 focus:ring-[#0F52BA]/20'
                )}
              />
              {fieldErrors.price ? (
                <p className="mt-1 text-[11px] font-medium text-red-500">{fieldErrors.price}</p>
              ) : livePriceInr > 0 ? (
                <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                  Preview: {formatINRCompact(livePriceInr)} ({formatINR(livePriceInr)})
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-slate-400">
                  Enter decimals or units: e.g. 4.5 Cr, 1.25 Cr, 45.5 L, or 7500000
                </p>
              )}
            </div>

            {/* Area in Sq.Ft or Cents */}
            <div>
              <label className="mb-1 block font-medium text-slate-600">
                Area (Sq.Ft / Cents)
              </label>
              <input
                value={areaInput}
                onChange={(e) => setAreaInput(e.target.value)}
                placeholder="e.g. 2400 sq.ft or 5.5 cents"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
              />
            </div>

            {/* Bedrooms (BHK) */}
            <div>
              <label className="mb-1 block font-medium text-slate-600">
                Bedrooms (BHK Count)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={bedroomsInput}
                onChange={(e) => setBedroomsInput(e.target.value)}
                placeholder="e.g. 3 or 4"
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
              />
            </div>

            {/* Badge Tag Dropdown */}
            <div>
              <label className="mb-1 block font-medium text-slate-600">
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
                <option value="Fast Selling">Fast Selling</option>
                <option value="Available">Available</option>
                <option value="Special Offer">Special Offer</option>
                <option value="Hot Deal">Hot Deal</option>
              </select>
            </div>

            {/* Visibility & Availability */}
            <div>
              <label className="mb-1 block font-medium text-slate-600">
                Visibility & Availability
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  aria-label="Publication status"
                  value={publishStatus}
                  onChange={(e) => setPublishStatus(e.target.value as PublishStatus)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                >
                  <option value="published">Published</option>
                  <option value="unpublished">Draft</option>
                </select>
                <select
                  aria-label="Availability status"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as AvailabilityStatus)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-800 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                >
                  <option value="available">Available</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            </div>

            {/* Optional Special Offer Discount */}
            {badgeTag === 'Special Offer' && (
              <div className="sm:col-span-2">
                <label className="mb-1 block font-medium text-slate-600">
                  Special Offer Price (Discounted Float INR)
                </label>
                <input
                  value={offerPriceText}
                  step="0.01"
                  onChange={(e) => setOfferPriceText(e.target.value)}
                  placeholder="e.g. 1.65 Cr or 40 L"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                />
                {liveOfferInr > 0 && (
                  <p className="mt-1 text-[11px] font-semibold text-emerald-600">
                    Offer: {formatINRCompact(liveOfferInr)} ({formatINR(liveOfferInr)})
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="mb-1 block font-medium text-slate-600">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed property specifications, architecture, and luxury features..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
              />
            </div>

            {/* Cover Image Upload & URL input */}
            <div className="border-t border-slate-100 pt-3 sm:col-span-2">
              <label className="mb-1.5 block font-medium text-slate-600">
                Cover Image (Upload File or Paste Image URL)
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
              <div className="mb-3 flex items-center gap-2">
                <input
                  value={coverUrlInput}
                  onChange={(e) => setCoverUrlInput(e.target.value)}
                  placeholder="Paste direct image URL (Unsplash, Supabase Storage, CDN)..."
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-1.5 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (coverUrlInput.trim()) {
                      setCoverImage(coverUrlInput.trim());
                      setCoverUrlInput('');
                    }
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Set URL
                </button>
              </div>

              {coverImage ? (
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative h-24 w-36 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                    <IdbImage
                      src={coverImage}
                      alt="Cover preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <div>
                      <p className="font-bold text-[#0D0221]">Current Cover Image</p>
                      <p className="text-[11px] text-slate-400">Synchronized with Supabase</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      disabled={uploadingCover}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                    >
                      {uploadingCover ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0F52BA]" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5 text-[#0F52BA]" />
                      )}
                      <span>Upload New</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={uploadingCover}
                    className="flex h-20 w-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#0F52BA]/40 bg-[#0F52BA]/5 text-[#0F52BA] hover:bg-[#0F52BA]/10"
                  >
                    {uploadingCover ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Plus className="h-5 w-5 stroke-[2.5]" />
                    )}
                    <span className="mt-1 text-[10px] font-bold">Upload File</span>
                  </button>
                  <p className="text-[11px] text-slate-400">
                    JPG, PNG, or WebP. Or use the URL input above.
                  </p>
                </div>
              )}
            </div>

            {/* Gallery Images (5 Photos) */}
            <div className="border-t border-slate-100 pt-3 sm:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <label className="font-medium text-slate-600">
                  Gallery Images (Up to 5 Photos)
                </label>
                <span className="text-[10px] text-slate-400">
                  Living room, Pool, Elevation, Floor plan
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
                          {uploadingSlotIdx === idx ? '...' : 'Replace'}
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setGallerySlots((prev) =>
                              prev.map((item, sIdx) => (sIdx === idx ? '' : item))
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
                      className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 hover:border-[#0F52BA] hover:bg-[#0F52BA]/5 hover:text-[#0F52BA]"
                    >
                      {uploadingSlotIdx === idx ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                      )}
                      <span className="mt-0.5 text-[9px] font-bold">Slot {idx + 1}</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Amenities & Facilities */}
            <div className="border-t border-slate-100 pt-3 sm:col-span-2">
              <label className="mb-1.5 block font-medium text-slate-600">
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
                  className="cursor-pointer rounded-xl bg-[#0F52BA] px-4 py-2 text-xs font-bold text-white hover:bg-[#0A3F91]"
                >
                  + Add
                </button>
              </div>

              <div className="mt-2 flex min-h-[32px] flex-wrap gap-1.5 rounded-xl border border-dashed border-slate-200 bg-white p-2">
                {selectedAmenities.length === 0 ? (
                  <span className="text-[11px] font-medium text-slate-400">
                    No amenities selected. Click items above or type custom tags.
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

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-white px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="cursor-pointer rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving || uploadingCover || uploadingSlotIdx !== null}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0F52BA] px-5 py-2 text-xs font-bold text-white shadow-md shadow-[#0F52BA]/25 hover:bg-[#0A3F91] disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving to Supabase...</span>
              </>
            ) : (
              <span>Save Property</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
