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
        ? row.total_price * 100000
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
 * Loads all properties from Supabase cloud (direct or via API).
 * Returns null if network error, or an array (including empty []).
 */
export async function fetchPropertiesFromSupabase(): Promise<Property[] | null> {
  // Try direct Supabase select (public read allowed by RLS)
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map(toAppProperty);
    }
  } catch (err) {
    console.warn('[Supabase Direct Read Fallback]', err);
  }

  // Fallback to internal API route
  try {
    const res = await fetch('/api/properties');
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.properties)) {
        return json.properties;
      }
    }
  } catch (apiErr) {
    console.warn('[API properties fetch error]', apiErr);
  }

  return null;
}

/**
 * Inserts or updates a property in Supabase cloud via API route (bypasses RLS safely).
 */
export async function savePropertyToSupabase(p: Property): Promise<boolean> {
  try {
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property: p }),
    });
    if (res.ok) {
      return true;
    }
  } catch {
    // If running offline or serverless cold start, try direct client upsert
  }

  try {
    const row = toSupabaseRow(p);
    const { error } = await (supabase.from('properties') as any).upsert(row);
    return !error;
  } catch {
    return false;
  }
}

/**
 * Deletes a property from Supabase cloud by id via API route (bypasses RLS safely).
 */
export async function deletePropertyFromSupabase(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/properties?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      return true;
    }
  } catch {
    // Fallback to direct client delete
  }

  try {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}
