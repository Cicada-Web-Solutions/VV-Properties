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

  let priceInr = 0;
  if (typeof extra.priceInr === 'number' && Number.isFinite(extra.priceInr) && extra.priceInr > 0) {
    priceInr = extra.priceInr;
  } else if (typeof row.total_price === 'number' && Number.isFinite(row.total_price) && row.total_price > 0) {
    priceInr = row.total_price < 10000 ? row.total_price * 100000 : row.total_price;
  } else if (row.price_display) {
    const rawVal = parseFloat(String(row.price_display).replace(/[₹,\s]/g, ''));
    if (Number.isFinite(rawVal) && rawVal > 0) {
      priceInr = rawVal < 10000 ? rawVal * 100000 : rawVal;
    }
  }

  // Status mapping: 'Available' -> available, 'Sold'/'Sold Out' -> sold, 'Draft' -> unpublished
  const isSold = String(row.status || '').toLowerCase().includes('sold');
  const isDraft = String(row.status || '').toLowerCase() === 'draft';

  const plainTextSummary =
    typeof row.ai_generated_summary === 'string' && !row.ai_generated_summary.trim().startsWith('{')
      ? row.ai_generated_summary.trim()
      : '';

  const parsedDesc =
    row.description?.trim() ||
    (typeof extra.shortDescription === 'string' ? extra.shortDescription.trim() : '') ||
    plainTextSummary;

  const longDesc =
    Array.isArray(extra.longDescription) && extra.longDescription.length > 0
      ? extra.longDescription
      : parsedDesc
        ? parsedDesc.split('\n\n').filter(Boolean)
        : [parsedDesc || ''];

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
    availability: isSold ? 'sold' : 'available',
    publishStatus: isDraft ? 'unpublished' : 'published',
    displayOrder: typeof extra.displayOrder === 'number' ? extra.displayOrder : 1,
    coverImage: row.cover_image || '',
    galleryImages: Array.isArray(row.gallery)
      ? row.gallery
      : row.cover_image
        ? [row.cover_image]
        : [],
    shortDescription: parsedDesc,
    longDescription: longDesc,
    specifications: extra.specifications || {
      bedrooms: row.bedrooms || 3,
      bathrooms: extra.bathrooms || 3,
      areaSqFt: row.area_sqft || 2000,
      possessionStatus: row.status || 'Available',
      facing: extra.facing || 'North-East',
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
 * NOTE: The Supabase `properties` table schema does NOT contain a `bathrooms` column.
 * `bathrooms` is safely serialized inside `ai_generated_summary`.
 */
export function toSupabaseRow(p: Property): any {
  const extra = {
    area: p.area,
    city: p.city,
    priceInr: p.priceInr,
    shortDescription: p.shortDescription,
    longDescription: p.longDescription,
    hasOffer: p.hasOffer,
    offerPriceInr: p.offerPriceInr,
    offerBadgeText: p.offerBadgeText,
    offerEndDate: p.offerEndDate,
    badgeTag: p.badgeTag,
    customTypeLabel: p.customTypeLabel,
    customAmenities: p.customAmenities,
    displayOrder: p.displayOrder,
    specifications: p.specifications,
    whyBuyPoints: p.whyBuyPoints,
    callNumber: p.callNumber,
    whatsappNumber: p.whatsappNumber,
    facing: p.specifications?.facing,
  };

  const totalPriceLakhs = Number((p.priceInr / 100000).toFixed(2));
  const priceDisplay =
    p.priceInr >= 10000000
      ? `₹${(p.priceInr / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`
      : `₹${(p.priceInr / 100000).toFixed(2).replace(/\.00$/, '')} L`;

  // Map to valid status: 'Available', 'Sold', or 'Draft'
  const status =
    p.availability === 'sold'
      ? 'Sold'
      : p.publishStatus === 'unpublished'
        ? 'Draft'
        : (p.badgeTag === 'New Launch' ? 'New Launch' : (p.badgeTag === 'Fast Selling' ? 'Fast Selling' : 'Available'));

  const verbatimDesc =
    p.shortDescription?.trim() ||
    (Array.isArray(p.longDescription) && p.longDescription.length > 0 ? p.longDescription.join('\n\n') : '') ||
    `${p.title} in ${p.area || 'Tamil Nadu'} curated by V.V Properties.`;

  return {
    id: p.id,
    title: p.title,
    slug: p.slug || `${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${p.id.slice(-4)}`,
    project_title: p.title,
    type: p.type || 'Villa',
    location: `${p.area || 'Chennai'}, ${p.city || 'Tamil Nadu'}`,
    total_price: totalPriceLakhs || 100,
    price_display: priceDisplay,
    area_sqft: p.specifications?.areaSqFt || 2000,
    bedrooms: p.specifications?.bedrooms || 3,
    status,
    badge: p.badgeTag && p.badgeTag !== 'None' ? p.badgeTag : null,
    cover_image: p.coverImage || 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80',
    gallery: p.galleryImages || [],
    amenities: p.amenities || [],
    description: verbatimDesc,
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
  // 1. Try direct Supabase select (public read is allowed by RLS)
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data)) {
      const validRows = data.filter((r: any) => !String(r.id || '').startsWith('__system_config'));
      console.log(`[Supabase Direct Read] Successfully loaded ${validRows.length} properties.`);
      return validRows.map(toAppProperty);
    }
    if (error) {
      console.warn('[Supabase Direct Read Warning]', error.message, error.details);
    }
  } catch (err) {
    console.warn('[Supabase Direct Read Fallback]', err);
  }

  // 2. Fallback to internal API route if direct read encountered issues
  try {
    const res = await fetch('/api/properties', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.properties)) {
        console.log(`[API properties fetch] Successfully loaded ${json.properties.length} properties.`);
        return json.properties;
      }
    } else {
      console.warn(`[API properties fetch] HTTP status ${res.status}`);
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
  const row = toSupabaseRow(p);

  // 1. Try server-side API route (uses server admin client to bypass RLS)
  try {
    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property: p }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        console.log(`[Supabase API Save] Successfully saved "${p.title}" (ID: ${p.id})`);
        return true;
      }
      console.warn('[Supabase API Save Error Response]', data.error);
    } else {
      const errText = await res.text();
      console.warn(`[Supabase API Save] HTTP ${res.status}:`, errText);
    }
  } catch (apiErr) {
    console.warn('[Supabase API Save Request Failed]', apiErr);
  }

  // 2. Direct Supabase client fallback
  try {
    const { error } = await (supabase.from('properties') as any).upsert(row);
    if (error) {
      console.error('[Supabase Direct Save Error]', error.message, error.details);
      return false;
    }
    console.log(`[Supabase Direct Save] Successfully upserted "${p.title}" (ID: ${p.id})`);
    return true;
  } catch (err) {
    console.error('[Supabase Direct Save Unexpected Error]', err);
    return false;
  }
}

/**
 * Deletes a property from Supabase cloud by id via API route (bypasses RLS safely).
 */
export async function deletePropertyFromSupabase(id: string): Promise<boolean> {
  // 1. Try server-side API route
  try {
    const res = await fetch(`/api/properties?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        console.log(`[Supabase API Delete] Successfully deleted ID: ${id}`);
        return true;
      }
    }
  } catch (apiErr) {
    console.warn('[Supabase API Delete Fallback]', apiErr);
  }

  // 2. Fallback to direct client delete
  try {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      console.error('[Supabase Direct Delete Error]', error.message);
      return false;
    }
    console.log(`[Supabase Direct Delete] Successfully deleted ID: ${id}`);
    return true;
  } catch (err) {
    console.error('[Supabase Direct Delete Unexpected Error]', err);
    return false;
  }
}
