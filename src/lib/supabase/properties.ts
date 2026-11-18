import { supabase } from './client';
import type { Property } from '@/types';

/**
 * Transforms a Supabase database row into the application Property model.
 */
export function toAppProperty(row: any): Property {
  let extra: any = {};
  if (row.ai_generated_summary) {
    try {
      extra = JSON.parse(row.ai_generated_summary);
    } catch {
      // Ignore parse failure
    }
  }

  const locationParts = (row.location || '').split(',');
  const area = extra.area || (locationParts[0] ? locationParts[0].trim() : 'Chennai');
  const city = extra.city || (locationParts[1] ? locationParts[1].trim() : 'Tamil Nadu');

  const priceInr =
    typeof extra.priceInr === 'number'
      ? extra.priceInr
      : typeof row.total_price === 'number'
        ? row.total_price * 100000 // If stored in lakhs
        : 5000000;

  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title || 'Untitled Property',
    area,
    city,
    type: (row.type as any) || 'Villa',
    priceInr,
    hasOffer: Boolean(extra.hasOffer),
    offerPriceInr: extra.offerPriceInr,
    offerBadgeText: extra.offerBadgeText,
    offerEndDate: extra.offerEndDate,
    badgeTag: row.badge || extra.badgeTag || 'None',
    customTypeLabel: extra.customTypeLabel,
    customAmenities: extra.customAmenities,
    availability: row.status === 'Sold Out' ? 'sold' : 'available',
    publishStatus: row.status === 'Draft' ? 'unpublished' : 'published',
    displayOrder: typeof extra.displayOrder === 'number' ? extra.displayOrder : 1,
    coverImage: row.cover_image || '',
    galleryImages: Array.isArray(row.gallery)
      ? row.gallery
      : row.cover_image
        ? [row.cover_image]
        : [],
    shortDescription: row.description || '',
    longDescription: Array.isArray(extra.longDescription)
      ? extra.longDescription
      : [row.description || ''],
    specifications: extra.specifications || {
      bedrooms: row.bedrooms || 3,
      bathrooms: row.bathrooms || 3,
      areaSqFt: row.area_sqft || 2000,
      possessionStatus: row.status || 'Ready for Handover',
      facing: extra.facing || 'East',
    },
    amenities: Array.isArray(row.amenities) ? row.amenities : [],
    whyBuyPoints: Array.isArray(extra.whyBuyPoints) ? extra.whyBuyPoints : [],
    callNumber: extra.callNumber,
    whatsappNumber: extra.whatsappNumber,
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}

/**
 * Transforms an application Property model into a Supabase database row.
 */
export function toSupabaseRow(p: Property): any {
  const extra = {
    area: p.area,
    city: p.city,
    priceInr: p.priceInr,
    hasOffer: p.hasOffer,
    offerPriceInr: p.offerPriceInr,
    offerBadgeText: p.offerBadgeText,
    offerEndDate: p.offerEndDate,
    badgeTag: p.badgeTag,
    customTypeLabel: p.customTypeLabel,
    customAmenities: p.customAmenities,
    displayOrder: p.displayOrder,
    longDescription: p.longDescription,
    specifications: p.specifications,
    whyBuyPoints: p.whyBuyPoints,
    callNumber: p.callNumber,
    whatsappNumber: p.whatsappNumber,
    facing: p.specifications?.facing,
  };

  const totalPriceLakhs = Math.round(p.priceInr / 100000);
  const priceDisplay =
    p.priceInr >= 10000000
      ? `₹${(p.priceInr / 10000000).toFixed(2)} Cr`
      : `₹${(p.priceInr / 100000).toFixed(1)} L`;

  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    project_title: p.title,
    type: p.type,
    location: `${p.area}, ${p.city}`,
    total_price: totalPriceLakhs,
    price_display: priceDisplay,
    area_sqft: p.specifications?.areaSqFt || 2000,
    bedrooms: p.specifications?.bedrooms || 3,
    bathrooms: p.specifications?.bathrooms || 3,
    status:
      p.availability === 'sold'
        ? 'Sold Out'
        : p.publishStatus === 'unpublished'
          ? 'Draft'
          : 'Available',
    badge: p.badgeTag && p.badgeTag !== 'None' ? p.badgeTag : null,
    cover_image: p.coverImage || '',
    gallery: p.galleryImages || [],
    amenities: p.amenities || [],
    description: p.shortDescription || '',
    ai_generated_summary: JSON.stringify(extra),
    is_featured: p.badgeTag === 'Featured',
    updated_at: new Date().toISOString(),
  };
}

/**
 * Loads all properties from Supabase cloud.
 * Returns null if network error or unconfigured, or an array (including empty []).
 */
export async function fetchPropertiesFromSupabase(): Promise<Property[] | null> {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Supabase] Failed to fetch properties:', error.message);
      return null;
    }

    if (!Array.isArray(data)) return null;

    return data.map(toAppProperty);
  } catch (err) {
    console.warn('[Supabase] Unexpected error fetching properties:', err);
    return null;
  }
}

/**
 * Inserts or updates a property in Supabase cloud.
 */
export async function savePropertyToSupabase(p: Property): Promise<boolean> {
  try {
    const row = toSupabaseRow(p);
    const { error } = await supabase.from('properties').upsert(row);
    if (error) {
      console.warn('[Supabase] Failed to upsert property:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Unexpected error saving property:', err);
    return false;
  }
}

/**
 * Deletes a property from Supabase cloud by id.
 */
export async function deletePropertyFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      console.warn('[Supabase] Failed to delete property:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('[Supabase] Unexpected error deleting property:', err);
    return false;
  }
}
