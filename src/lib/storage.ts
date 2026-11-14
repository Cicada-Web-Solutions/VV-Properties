'use client';

import { INITIAL_HERO_SLIDES } from '@/data/heroSlides';
import { INITIAL_PROPERTIES } from '@/data/properties';
import { INITIAL_TESTIMONIALS } from '@/data/testimonials';
import {
  clearAllMedia,
  loadCatalogState,
  saveCatalogState,
} from '@/lib/idb';
import type { Enquiry, HeroSlide, Property, Testimonial } from '@/types';

export interface VVCatalogSnapshot {
  version: number;
  properties: Property[];
  heroSlides: HeroSlide[];
  testimonials: Testimonial[];
  enquiries: Enquiry[];
  updatedAt: string;
}

const CATALOG_KEY = 'vv_catalog_v1';
const LIGHTWEIGHT_SYNC_KEY = 'vv_catalog_sync_ts';
export const SYNC_CHANNEL_NAME = 'vv-properties-sync-v1';

export function getInitialSnapshot(): VVCatalogSnapshot {
  return {
    version: 1,
    properties: INITIAL_PROPERTIES,
    heroSlides: INITIAL_HERO_SLIDES,
    testimonials: INITIAL_TESTIMONIALS,
    enquiries: [],
    updatedAt: new Date().toISOString(),
  };
}

export async function loadPersistedCatalog(): Promise<VVCatalogSnapshot> {
  try {
    const idbData = await loadCatalogState<VVCatalogSnapshot>(CATALOG_KEY);
    if (idbData && Array.isArray(idbData.properties)) {
      return idbData;
    }
  } catch {
    // Fall back to lightweight localStorage snapshot if IndexedDB is blocked
    try {
      const lsRaw = window.localStorage.getItem(CATALOG_KEY);
      if (lsRaw) {
        const parsed = JSON.parse(lsRaw) as VVCatalogSnapshot;
        if (parsed && Array.isArray(parsed.properties)) {
          return parsed;
        }
      }
    } catch {
      // Ignore fallback parse error
    }
  }

  const initial = getInitialSnapshot();
  await persistCatalogSnapshot(initial, false);
  return initial;
}

export async function persistCatalogSnapshot(
  snapshot: VVCatalogSnapshot,
  broadcast = true
): Promise<void> {
  const stamped: VVCatalogSnapshot = {
    ...snapshot,
    updatedAt: new Date().toISOString(),
  };

  try {
    await saveCatalogState(CATALOG_KEY, stamped);
  } catch {
    // Fallback to localStorage only if IndexedDB is unavailable
    try {
      window.localStorage.setItem(CATALOG_KEY, JSON.stringify(stamped));
    } catch {
      // Ignore quota failures
    }
  }

  if (broadcast && typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(LIGHTWEIGHT_SYNC_KEY, stamped.updatedAt);
    } catch {
      // Ignore
    }

    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage({ type: 'CATALOG_UPDATED', updatedAt: stamped.updatedAt });
      channel.close();
    }
  }
}

export async function resetPersistedCatalog(): Promise<VVCatalogSnapshot> {
  await clearAllMedia();
  const initial = getInitialSnapshot();
  await persistCatalogSnapshot(initial, true);
  return initial;
}

export { LIGHTWEIGHT_SYNC_KEY };
