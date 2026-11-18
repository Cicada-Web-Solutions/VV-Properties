import type { Property } from '@/types';

/**
 * Empty by default so that all properties are strictly fetched from Supabase Cloud.
 * Eliminates ghost/mock properties on fresh devices or when all listings are deleted.
 */
export const INITIAL_PROPERTIES: Property[] = [];
