'use client';

import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_ADMIN_PROFILE,
  INITIAL_ENQUIRIES,
  INITIAL_TEAM_ACCOUNTS,
} from '@/data/adminSeed';
import { INITIAL_HERO_SLIDES } from '@/data/heroSlides';
import { INITIAL_PROPERTIES } from '@/data/properties';
import { INITIAL_TESTIMONIALS } from '@/data/testimonials';
import { pruneActivityLogs } from '@/lib/adminUtils';
import {
  clearAllMedia,
  loadCatalogState,
  saveCatalogState,
} from '@/lib/idb';
import type {
  ActivityLogEntry,
  AdminProfile,
  Enquiry,
  HeroSlide,
  Property,
  TeamAccount,
  Testimonial,
} from '@/types';

export interface VVCatalogSnapshot {
  version: number;
  properties: Property[];
  heroSlides: HeroSlide[];
  testimonials: Testimonial[];
  enquiries: Enquiry[];
  adminProfile: AdminProfile;
  teamAccounts: TeamAccount[];
  activityLogs: ActivityLogEntry[];
  updatedAt: string;
}

const CATALOG_KEY = 'vv_catalog_v1';
const LIGHTWEIGHT_SYNC_KEY = 'vv_catalog_sync_ts';
export const SYNC_CHANNEL_NAME = 'vv-properties-sync-v1';

export function getInitialSnapshot(): VVCatalogSnapshot {
  return {
    version: 2,
    properties: [],
    heroSlides: INITIAL_HERO_SLIDES,
    testimonials: INITIAL_TESTIMONIALS,
    enquiries: INITIAL_ENQUIRIES,
    adminProfile: INITIAL_ADMIN_PROFILE,
    teamAccounts: INITIAL_TEAM_ACCOUNTS,
    activityLogs: INITIAL_ACTIVITY_LOGS,
    updatedAt: new Date().toISOString(),
  };
}

function migrateSnapshot(raw: Partial<VVCatalogSnapshot>): VVCatalogSnapshot {
  const hasSeededEnquiries = Array.isArray(raw.enquiries);
  const enquiriesList =
    hasSeededEnquiries && raw.enquiries!.length > 0
      ? raw.enquiries!
      : raw.version && raw.version >= 2
        ? (raw.enquiries ?? [])
        : INITIAL_ENQUIRIES;

  return {
    version: 2,
    properties: Array.isArray(raw.properties)
      ? raw.properties.filter((p) => p && !p.title?.includes('(Sample)'))
      : [],
    heroSlides: Array.isArray(raw.heroSlides)
      ? raw.heroSlides
      : INITIAL_HERO_SLIDES,
    testimonials: Array.isArray(raw.testimonials)
      ? raw.testimonials
      : INITIAL_TESTIMONIALS,
    enquiries: enquiriesList,
    adminProfile: raw.adminProfile?.username
      ? raw.adminProfile
      : INITIAL_ADMIN_PROFILE,
    teamAccounts:
      Array.isArray(raw.teamAccounts) && raw.teamAccounts.length > 0
        ? raw.teamAccounts
        : INITIAL_TEAM_ACCOUNTS,
    activityLogs: pruneActivityLogs(
      Array.isArray(raw.activityLogs) && raw.activityLogs.length > 0
        ? raw.activityLogs
        : INITIAL_ACTIVITY_LOGS
    ),
    updatedAt: raw.updatedAt ?? new Date().toISOString(),
  };
}

export async function loadPersistedCatalog(): Promise<VVCatalogSnapshot> {
  try {
    const idbData = await loadCatalogState<Partial<VVCatalogSnapshot>>(CATALOG_KEY);
    if (idbData && Array.isArray(idbData.properties)) {
      const migrated = migrateSnapshot(idbData);
      if ((idbData.version ?? 1) < 2) {
        await persistCatalogSnapshot(migrated, false);
      }
      return migrated;
    }
  } catch {
    // Fall back to lightweight localStorage snapshot if IndexedDB is blocked
    try {
      const lsRaw = window.localStorage.getItem(CATALOG_KEY);
      if (lsRaw) {
        const parsed = JSON.parse(lsRaw) as Partial<VVCatalogSnapshot>;
        if (parsed && Array.isArray(parsed.properties)) {
          return migrateSnapshot(parsed);
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
    version: 2,
    activityLogs: pruneActivityLogs(snapshot.activityLogs ?? []),
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
