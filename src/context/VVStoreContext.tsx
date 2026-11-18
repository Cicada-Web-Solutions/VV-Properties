'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_ADMIN_PROFILE,
  INITIAL_ENQUIRIES,
  INITIAL_TEAM_ACCOUNTS,
} from '@/data/adminSeed';
import { INITIAL_HERO_SLIDES } from '@/data/heroSlides';
import { INITIAL_PROPERTIES } from '@/data/properties';
import { INITIAL_TESTIMONIALS } from '@/data/testimonials';
import {
  formatExactAuditDateTime,
  makePropertySlug,
  pruneActivityLogs,
} from '@/lib/adminUtils';
import { getAdminSession, saveAdminSession } from '@/lib/auth';
import {
  clearAllMedia,
  deleteMediaRefs,
  exportMediaMapAsDataUrls,
  isIdbMediaRef,
  saveMediaDataUrl,
} from '@/lib/idb';
import {
  LIGHTWEIGHT_SYNC_KEY,
  loadPersistedCatalog,
  persistCatalogSnapshot,
  resetPersistedCatalog,
  SYNC_CHANNEL_NAME,
  type VVCatalogSnapshot,
} from '@/lib/storage';
import { supabase } from '@/lib/supabase/client';
import {
  deletePropertyFromSupabase,
  fetchPropertiesFromSupabase,
  savePropertyToSupabase,
} from '@/lib/supabase/properties';
import type {
  ActivityLogEntry,
  AdminProfile,
  AvailabilityStatus,
  Enquiry,
  EnquiryStatus,
  HeroSlide,
  Property,
  PublishStatus,
  TeamAccount,
  Testimonial,
  ToastMessage,
  ToastType,
} from '@/types';

export interface CatalogBackupPayload {
  format: 'vv-properties-catalog-backup';
  version: number;
  exportedAt: string;
  snapshot: Omit<VVCatalogSnapshot, 'updatedAt'>;
  mediaDataUrls: Record<string, string>;
}

interface VVStoreContextValue {
  properties: Property[];
  publishedProperties: Property[];
  heroSlides: HeroSlide[];
  activeHeroSlides: HeroSlide[];
  testimonials: Testimonial[];
  visibleTestimonials: Testimonial[];
  enquiries: Enquiry[];
  adminProfile: AdminProfile;
  teamAccounts: TeamAccount[];
  activityLogs: ActivityLogEntry[];
  isHydrated: boolean;
  toasts: ToastMessage[];
  notify: (title: string, type?: ToastType, description?: string) => void;
  dismissToast: (id: string) => void;
  recordActivity: (
    action: string,
    module?: string,
    actorName?: string
  ) => Promise<void>;
  addProperty: (
    property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Property>;
  updateProperty: (id: string, patch: Partial<Property>) => Promise<void>;
  renameProperty: (id: string, newTitle: string) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  setPropertyAvailability: (
    id: string,
    availability: AvailabilityStatus
  ) => Promise<void>;
  setPropertyPublishStatus: (
    id: string,
    publishStatus: PublishStatus
  ) => Promise<void>;
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => Promise<void>;
  updateHeroSlide: (id: string, patch: Partial<HeroSlide>) => Promise<void>;
  deleteHeroSlide: (id: string) => Promise<void>;
  moveHeroSlide: (id: string, direction: 'up' | 'down') => Promise<void>;
  reorderHeroSlides: (fromIndex: number, toIndex: number) => Promise<void>;
  addTestimonial: (
    testimonial: Omit<Testimonial, 'id' | 'createdAt'>
  ) => Promise<void>;
  updateTestimonial: (
    id: string,
    patch: Partial<Testimonial>
  ) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  toggleTestimonialVisibility: (id: string) => Promise<void>;
  submitEnquiry: (
    payload: Omit<Enquiry, 'id' | 'status' | 'createdAt'>
  ) => Promise<Enquiry>;
  markEnquiryStatus: (id: string, status: EnquiryStatus) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  updateAdminProfile: (patch: {
    displayName?: string;
    username?: string;
    password?: string;
    avatar?: string | null;
  }) => Promise<void>;
  addTeamAccount: (input: {
    name: string;
    username: string;
    password: string;
    role: string;
  }) => Promise<{ success: boolean; error?: string }>;
  toggleTeamAccountStatus: (id: string) => Promise<void>;
  deleteTeamAccount: (id: string) => Promise<void>;
  exportCatalogBackup: () => Promise<CatalogBackupPayload>;
  importCatalogBackup: (rawJson: string) => Promise<{
    propertiesCount: number;
    bannersCount: number;
    testimonialsCount: number;
    enquiriesCount: number;
  }>;
  resetAllDemoData: () => Promise<void>;
  refreshCatalog: () => Promise<void>;
}

const VVStoreContext = createContext<VVStoreContextValue | null>(null);

function resolveActorName(explicit?: string): string {
  if (explicit) return explicit;
  const session = getAdminSession();
  return session?.displayName || 'Victor Paul';
}

function createLogItem(
  action: string,
  moduleName: string,
  actorName?: string
): ActivityLogEntry {
  const now = new Date();
  return {
    id: `log-${now.getTime()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: now.getTime(),
    username: resolveActorName(actorName),
    action,
    module: moduleName,
    dateStr: formatExactAuditDateTime(now),
    status: 'Success',
  };
}

function appendLog(
  logs: ActivityLogEntry[],
  action: string,
  moduleName: string,
  actorName?: string
): ActivityLogEntry[] {
  return pruneActivityLogs([createLogItem(action, moduleName, actorName), ...logs]);
}

function collectAllMediaRefs(snapshot: VVCatalogSnapshot): string[] {
  const refs: string[] = [];
  for (const prop of snapshot.properties) {
    if (prop.coverImage) refs.push(prop.coverImage);
    for (const img of prop.galleryImages) {
      if (img) refs.push(img);
    }
  }
  for (const slide of snapshot.heroSlides) {
    if (slide.image) refs.push(slide.image);
  }
  for (const test of snapshot.testimonials) {
    if (test.photo) refs.push(test.photo);
  }
  if (snapshot.adminProfile?.avatar) {
    refs.push(snapshot.adminProfile.avatar);
  }
  for (const acc of snapshot.teamAccounts ?? []) {
    if (acc.photo) refs.push(acc.photo);
  }
  return refs;
}

export function VVStoreProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<VVCatalogSnapshot>(() => ({
    version: 2,
    properties: [],
    heroSlides: INITIAL_HERO_SLIDES,
    testimonials: INITIAL_TESTIMONIALS,
    enquiries: INITIAL_ENQUIRIES,
    adminProfile: INITIAL_ADMIN_PROFILE,
    teamAccounts: INITIAL_TEAM_ACCOUNTS,
    activityLogs: INITIAL_ACTIVITY_LOGS,
    updatedAt: '',
  }));
  const [isHydrated, setIsHydrated] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const snapshotRef = useRef(snapshot);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const notify = useCallback(
    (title: string, type: ToastType = 'info', description?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, description, type }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  // Initial hydration + multi-tab & multi-device live synchronization
  useEffect(() => {
    let cancelled = false;

    const refreshFromStore = async () => {
      const loaded = await loadPersistedCatalog();

      // Sync from authoritative Supabase Cloud database
      try {
        const cloudProperties = await fetchPropertiesFromSupabase();
        if (cloudProperties !== null) {
          // Cloud database is authoritative (including empty [] when properties deleted)
          loaded.properties = cloudProperties;
          void persistCatalogSnapshot(loaded, false);
        }
      } catch (err) {
        console.warn('[VVStore] Supabase properties sync warning:', err);
      }

      if (!cancelled) {
        snapshotRef.current = loaded;
        setSnapshot(loaded);
        setIsHydrated(true);
      }
    };

    void refreshFromStore();

    // Browser-local sync via BroadcastChannel
    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.onmessage = () => {
        void refreshFromStore();
      };
    }

    // Cross-device live Realtime sync via Supabase
    const supabaseChannel = supabase
      .channel('public_properties_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'properties' },
        () => {
          void refreshFromStore();
        }
      )
      .subscribe();

    const onStorage = (e: StorageEvent) => {
      if (e.key === LIGHTWEIGHT_SYNC_KEY) {
        void refreshFromStore();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      cancelled = true;
      channel?.close();
      void supabase.removeChannel(supabaseChannel);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const refreshCatalog = useCallback(async () => {
    try {
      console.log('[VVStore] refreshCatalog triggered: fetching latest from Supabase...');
      const cloudProperties = await fetchPropertiesFromSupabase();
      if (cloudProperties !== null) {
        setSnapshot((curr) => {
          const next = {
            ...curr,
            properties: cloudProperties,
            updatedAt: new Date().toISOString(),
          };
          snapshotRef.current = next;
          void persistCatalogSnapshot(next, false);
          return next;
        });
      }
    } catch (err) {
      console.warn('[VVStore] refreshCatalog error:', err);
    }
  }, []);

  const commitUpdate = useCallback(
    async (updater: (current: VVCatalogSnapshot) => VVCatalogSnapshot) => {
      const next = updater(snapshotRef.current);
      snapshotRef.current = next;
      setSnapshot(next);
      await persistCatalogSnapshot(next, true);
    },
    []
  );

  const recordActivity = useCallback(
    async (action: string, moduleName = 'General', actorName?: string) => {
      await commitUpdate((curr) => ({
        ...curr,
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          action,
          moduleName,
          actorName
        ),
      }));
    },
    [commitUpdate]
  );

  const addProperty = useCallback(
    async (input: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const created: Property = {
        ...input,
        id: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: now,
        updatedAt: now,
      };

      // 1. Immediately persist to Supabase cloud database
      const cloudSuccess = await savePropertyToSupabase(created);
      if (!cloudSuccess) {
        console.warn(`[VVStore] Cloud save had an issue; continuing with local persistence.`);
      }

      // 2. Commit to local context & IndexedDB
      await commitUpdate((curr) => ({
        ...curr,
        properties: [created, ...curr.properties.filter((p) => p.id !== created.id)],
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `Added new property listing "${created.title}"`,
          'Properties'
        ),
      }));

      return created;
    },
    [commitUpdate]
  );

  const updateProperty = useCallback(
    async (id: string, patch: Partial<Property>) => {
      const existing = snapshotRef.current.properties.find((p) => p.id === id);
      if (
        existing &&
        (patch.galleryImages !== undefined || patch.coverImage !== undefined)
      ) {
        const nextCover =
          patch.coverImage !== undefined
            ? patch.coverImage
            : existing.coverImage;
        const nextGallery =
          patch.galleryImages !== undefined
            ? patch.galleryImages
            : existing.galleryImages;
        const nextSet = new Set([nextCover, ...nextGallery].filter(Boolean));
        const removed = [
          existing.coverImage,
          ...existing.galleryImages,
        ].filter((img) => Boolean(img) && !nextSet.has(img));
        if (removed.length > 0) {
          void deleteMediaRefs(removed);
        }
      }

      if (existing) {
        const updated = {
          ...existing,
          ...patch,
          updatedAt: new Date().toISOString(),
        };
        await savePropertyToSupabase(updated);
      }

      await commitUpdate((curr) => {
        const title = patch.title ?? existing?.title ?? 'Property';
        return {
          ...curr,
          properties: curr.properties.map((p) =>
            p.id === id
              ? { ...p, ...patch, updatedAt: new Date().toISOString() }
              : p
          ),
          activityLogs: appendLog(
            curr.activityLogs ?? [],
            `Updated property listing "${title}"`,
            'Properties'
          ),
        };
      });
    },
    [commitUpdate]
  );

  const renameProperty = useCallback(
    async (id: string, newTitle: string) => {
      const trimmed = newTitle.trim();
      if (!trimmed) return;
      const existing = snapshotRef.current.properties.find((p) => p.id === id);
      if (!existing) return;

      const updatedTitleSlug = {
        ...existing,
        title: trimmed,
        slug: `${makePropertySlug(trimmed)}-${existing.id.slice(-4)}`,
        updatedAt: new Date().toISOString(),
      };
      await savePropertyToSupabase(updatedTitleSlug);

      await commitUpdate((curr) => ({
        ...curr,
        properties: curr.properties.map((p) =>
          p.id === id ? updatedTitleSlug : p
        ),
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `Renamed listing "${existing.title}" to "${trimmed}"`,
          'Properties'
        ),
      }));
    },
    [commitUpdate]
  );

  const deleteProperty = useCallback(
    async (id: string) => {
      // 1. Delete from Supabase cloud database
      await deletePropertyFromSupabase(id);

      const target = snapshotRef.current.properties.find((p) => p.id === id);
      if (target) {
        void deleteMediaRefs(
          [target.coverImage, ...target.galleryImages].filter(Boolean)
        );
      }
      await commitUpdate((curr) => ({
        ...curr,
        properties: curr.properties.filter((p) => p.id !== id),
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `Deleted property "${target?.title ?? id}"`,
          'Properties'
        ),
      }));
    },
    [commitUpdate]
  );

  const setPropertyAvailability = useCallback(
    async (id: string, availability: AvailabilityStatus) => {
      const existing = snapshotRef.current.properties.find((p) => p.id === id);
      if (existing) {
        await savePropertyToSupabase({
          ...existing,
          availability,
          updatedAt: new Date().toISOString(),
        });
      }
      await commitUpdate((curr) => ({
        ...curr,
        properties: curr.properties.map((p) =>
          p.id === id
            ? { ...p, availability, updatedAt: new Date().toISOString() }
            : p
        ),
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `Marked "${existing?.title ?? id}" as ${availability === 'sold' ? 'Sold' : 'Available'}`,
          'Properties'
        ),
      }));
    },
    [commitUpdate]
  );

  const setPropertyPublishStatus = useCallback(
    async (id: string, publishStatus: PublishStatus) => {
      const existing = snapshotRef.current.properties.find((p) => p.id === id);
      if (existing) {
        await savePropertyToSupabase({
          ...existing,
          publishStatus,
          updatedAt: new Date().toISOString(),
        });
      }
      await commitUpdate((curr) => ({
        ...curr,
        properties: curr.properties.map((p) =>
          p.id === id
            ? { ...p, publishStatus, updatedAt: new Date().toISOString() }
            : p
        ),
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `${publishStatus === 'published' ? 'Published' : 'Moved to Draft'} listing "${existing?.title ?? id}"`,
          'Properties'
        ),
      }));
    },
    [commitUpdate]
  );

  const addHeroSlide = useCallback(
    async (slide: Omit<HeroSlide, 'id'>) => {
      const created: HeroSlide = {
        ...slide,
        id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      await commitUpdate((curr) => {
        const nextSlides = [created, ...curr.heroSlides].map((s, idx) => ({
          ...s,
          order: idx + 1,
        }));
        return {
          ...curr,
          heroSlides: nextSlides,
          activityLogs: appendLog(
            curr.activityLogs ?? [],
            `Added banner slide "${created.headline}"`,
            'Banners'
          ),
        };
      });
    },
    [commitUpdate]
  );

  const updateHeroSlide = useCallback(
    async (id: string, patch: Partial<HeroSlide>) => {
      const existing = snapshotRef.current.heroSlides.find((s) => s.id === id);
      if (existing && patch.image && patch.image !== existing.image) {
        void deleteMediaRefs([existing.image]);
      }
      await commitUpdate((curr) => {
        const actionDesc =
          patch.active !== undefined
            ? `${patch.active ? 'Activated' : 'Deactivated'} banner slide "${existing?.headline ?? id}"`
            : `Updated banner slide "${patch.headline ?? existing?.headline ?? id}"`;
        return {
          ...curr,
          heroSlides: curr.heroSlides
            .map((s) => (s.id === id ? { ...s, ...patch } : s))
            .sort((a, b) => a.order - b.order),
          activityLogs: appendLog(curr.activityLogs ?? [], actionDesc, 'Banners'),
        };
      });
    },
    [commitUpdate]
  );

  const deleteHeroSlide = useCallback(
    async (id: string) => {
      const target = snapshotRef.current.heroSlides.find((s) => s.id === id);
      if (target) void deleteMediaRefs([target.image]);
      await commitUpdate((curr) => ({
        ...curr,
        heroSlides: curr.heroSlides
          .filter((s) => s.id !== id)
          .sort((a, b) => a.order - b.order)
          .map((s, idx) => ({ ...s, order: idx + 1 })),
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `Deleted banner slide "${target?.headline ?? id}"`,
          'Banners'
        ),
      }));
    },
    [commitUpdate]
  );

  const moveHeroSlide = useCallback(
    async (id: string, direction: 'up' | 'down') => {
      await commitUpdate((curr) => {
        const sorted = [...curr.heroSlides].sort((a, b) => a.order - b.order);
        const index = sorted.findIndex((s) => s.id === id);
        if (index === -1) return curr;
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= sorted.length) return curr;
        const temp = sorted[index];
        sorted[index] = sorted[swapIndex];
        sorted[swapIndex] = temp;
        return {
          ...curr,
          heroSlides: sorted.map((s, idx) => ({ ...s, order: idx + 1 })),
          activityLogs: appendLog(
            curr.activityLogs ?? [],
            `Reordered banner slide "${temp.headline}" to position #${swapIndex + 1}`,
            'Banners'
          ),
        };
      });
    },
    [commitUpdate]
  );

  const reorderHeroSlides = useCallback(
    async (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      await commitUpdate((curr) => {
        const sorted = [...curr.heroSlides].sort((a, b) => a.order - b.order);
        if (
          fromIndex < 0 ||
          fromIndex >= sorted.length ||
          toIndex < 0 ||
          toIndex >= sorted.length
        ) {
          return curr;
        }
        const [moved] = sorted.splice(fromIndex, 1);
        sorted.splice(toIndex, 0, moved);
        return {
          ...curr,
          heroSlides: sorted.map((s, idx) => ({ ...s, order: idx + 1 })),
          activityLogs: appendLog(
            curr.activityLogs ?? [],
            `Reordered carousel slide: moved "${moved.headline}" to position #${toIndex + 1}`,
            'Banners'
          ),
        };
      });
    },
    [commitUpdate]
  );

  const addTestimonial = useCallback(
    async (testimonial: Omit<Testimonial, 'id' | 'createdAt'>) => {
      const created: Testimonial = {
        ...testimonial,
        id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      await commitUpdate((curr) => ({
        ...curr,
        testimonials: [created, ...curr.testimonials],
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `Added customer testimonial from "${created.clientName}" (${created.rating} stars)`,
          'Testimonials'
        ),
      }));
    },
    [commitUpdate]
  );

  const updateTestimonial = useCallback(
    async (id: string, patch: Partial<Testimonial>) => {
      const existing = snapshotRef.current.testimonials.find((t) => t.id === id);
      if (existing?.photo && patch.photo && patch.photo !== existing.photo) {
        void deleteMediaRefs([existing.photo]);
      }
      await commitUpdate((curr) => ({
        ...curr,
        testimonials: curr.testimonials.map((t) =>
          t.id === id ? { ...t, ...patch } : t
        ),
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `Updated testimonial from "${patch.clientName ?? existing?.clientName ?? id}"`,
          'Testimonials'
        ),
      }));
    },
    [commitUpdate]
  );

  const deleteTestimonial = useCallback(
    async (id: string) => {
      const target = snapshotRef.current.testimonials.find((t) => t.id === id);
      if (target?.photo) void deleteMediaRefs([target.photo]);
      await commitUpdate((curr) => ({
        ...curr,
        testimonials: curr.testimonials.filter((t) => t.id !== id),
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `Deleted testimonial from "${target?.clientName ?? id}"`,
          'Testimonials'
        ),
      }));
    },
    [commitUpdate]
  );

  const toggleTestimonialVisibility = useCallback(
    async (id: string) => {
      const target = snapshotRef.current.testimonials.find((t) => t.id === id);
      await commitUpdate((curr) => ({
        ...curr,
        testimonials: curr.testimonials.map((t) =>
          t.id === id ? { ...t, visible: !t.visible } : t
        ),
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `${target?.visible ? 'Hidden' : 'Published'} testimonial from "${target?.clientName ?? id}"`,
          'Testimonials'
        ),
      }));
    },
    [commitUpdate]
  );

  const submitEnquiry = useCallback(
    async (payload: Omit<Enquiry, 'id' | 'status' | 'createdAt'>) => {
      const created: Enquiry = {
        ...payload,
        id: `enq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        status: 'new',
        createdAt: new Date().toISOString(),
      };
      await commitUpdate((curr) => ({
        ...curr,
        enquiries: [created, ...curr.enquiries],
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `Received website enquiry from "${created.fullName}" for "${created.propertyTitle}"`,
          'Enquiries',
          'Public Web Form'
        ),
      }));
      return created;
    },
    [commitUpdate]
  );

  const markEnquiryStatus = useCallback(
    async (id: string, status: EnquiryStatus) => {
      const existing = snapshotRef.current.enquiries.find((e) => e.id === id);
      if (!existing || existing.status === status) return;
      const statusLabel =
        status === 'new'
          ? 'New'
          : status === 'contacted'
            ? 'Contacted'
            : status === 'closed'
              ? 'Closed'
              : 'None';

      await commitUpdate((curr) => ({
        ...curr,
        enquiries: curr.enquiries.map((e) =>
          e.id === id ? { ...e, status } : e
        ),
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `Labeled lead "${existing.fullName}" as ${statusLabel}`,
          'Enquiries'
        ),
      }));
    },
    [commitUpdate]
  );

  const deleteEnquiry = useCallback(
    async (id: string) => {
      const existing = snapshotRef.current.enquiries.find((e) => e.id === id);
      await commitUpdate((curr) => ({
        ...curr,
        enquiries: curr.enquiries.filter((e) => e.id !== id),
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `Deleted enquiry from "${existing?.fullName ?? id}"`,
          'Enquiries'
        ),
      }));
    },
    [commitUpdate]
  );

  const updateAdminProfile = useCallback(
    async (patch: {
      displayName?: string;
      username?: string;
      password?: string;
      avatar?: string | null;
    }) => {
      const currProfile = snapshotRef.current.adminProfile;
      const session = getAdminSession();
      const prevSessionUsername = session?.username?.toLowerCase();

      if (
        patch.avatar !== undefined &&
        currProfile.avatar &&
        currProfile.avatar !== patch.avatar
      ) {
        void deleteMediaRefs([currProfile.avatar]);
      }

      const nextProfile: AdminProfile = {
        ...currProfile,
        displayName:
          patch.displayName?.trim() || currProfile.displayName,
        username:
          patch.username?.trim().toLowerCase() || currProfile.username,
        password: patch.password !== undefined ? patch.password : currProfile.password,
        avatar: patch.avatar !== undefined ? patch.avatar : currProfile.avatar,
      };

      await commitUpdate((curr) => {
        const updatedAccounts = curr.teamAccounts.map((acc) => {
          const matchesTarget =
            acc.username.toLowerCase() === currProfile.username.toLowerCase() ||
            (prevSessionUsername && acc.username.toLowerCase() === prevSessionUsername);
          if (!matchesTarget) return acc;
          return {
            ...acc,
            name: patch.displayName?.trim() || acc.name,
            photo: patch.avatar !== undefined ? patch.avatar : acc.photo,
            password: patch.password !== undefined ? patch.password : acc.password,
          };
        });

        return {
          ...curr,
          adminProfile: nextProfile,
          teamAccounts: updatedAccounts,
          activityLogs: appendLog(
            curr.activityLogs ?? [],
            patch.password !== undefined
              ? 'Updated administrator credentials'
              : patch.avatar !== undefined
                ? `Updated profile photo for "${nextProfile.displayName}"`
                : `Updated profile details for "${nextProfile.displayName}"`,
            'Security',
            nextProfile.displayName
          ),
        };
      });

      if (session) {
        saveAdminSession({
          ...session,
          username: nextProfile.username,
          name: nextProfile.displayName,
          displayName: nextProfile.displayName,
          email: `${nextProfile.username}@vvproperties.local`,
        });
      }
    },
    [commitUpdate]
  );

  const addTeamAccount = useCallback(
    async (input: {
      name: string;
      username: string;
      password: string;
      role: string;
    }): Promise<{ success: boolean; error?: string }> => {
      const cleanName = input.name.trim();
      const cleanUser = input.username.trim().toLowerCase();
      const cleanPw = input.password.trim();

      if (!cleanName || !cleanUser || !cleanPw) {
        return {
          success: false,
          error: 'Please enter Display Name, Username, and Temporary Password.',
        };
      }

      const exists = snapshotRef.current.teamAccounts.some(
        (a) => a.username.toLowerCase() === cleanUser
      );
      if (exists) {
        return {
          success: false,
          error: `Username "${cleanUser}" already exists in the directory.`,
        };
      }

      const d = new Date();
      const createdDate = `${String(d.getDate()).padStart(2, '0')} ${d.toLocaleDateString('en-GB', { month: 'short' })} ${d.getFullYear()}`;
      const newAcc: TeamAccount = {
        id: `acc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: cleanName,
        username: cleanUser,
        password: cleanPw,
        role: input.role || 'Property Manager',
        status: 'Active',
        created: createdDate,
        photo: null,
      };

      await commitUpdate((curr) => ({
        ...curr,
        teamAccounts: [...curr.teamAccounts, newAcc],
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `Created team account "${newAcc.username}" (${newAcc.role})`,
          'Security'
        ),
      }));

      return { success: true };
    },
    [commitUpdate]
  );

  const toggleTeamAccountStatus = useCallback(
    async (id: string) => {
      const target = snapshotRef.current.teamAccounts.find((a) => a.id === id);
      if (!target || target.username.toLowerCase() === 'victor') return;
      const nextStatus = target.status === 'Active' ? 'Suspended' : 'Active';

      await commitUpdate((curr) => ({
        ...curr,
        teamAccounts: curr.teamAccounts.map((a) =>
          a.id === id ? { ...a, status: nextStatus } : a
        ),
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `${nextStatus === 'Active' ? 'Activated' : 'Suspended'} team account "${target.username}"`,
          'Security'
        ),
      }));
    },
    [commitUpdate]
  );

  const deleteTeamAccount = useCallback(
    async (id: string) => {
      const target = snapshotRef.current.teamAccounts.find((a) => a.id === id);
      if (!target) return;
      if (target.photo) void deleteMediaRefs([target.photo]);
      await commitUpdate((curr) => ({
        ...curr,
        teamAccounts: curr.teamAccounts.filter((a) => a.id !== id),
        activityLogs: appendLog(
          curr.activityLogs ?? [],
          `Removed team account "${target.username}"`,
          'Security'
        ),
      }));
    },
    [commitUpdate]
  );

  const exportCatalogBackup =
    useCallback(async (): Promise<CatalogBackupPayload> => {
      const current = snapshotRef.current;
      const refs = collectAllMediaRefs(current);
      const mediaDataUrls = await exportMediaMapAsDataUrls(refs);
      const payload: CatalogBackupPayload = {
        format: 'vv-properties-catalog-backup',
        version: current.version,
        exportedAt: new Date().toISOString(),
        snapshot: {
          version: current.version,
          properties: current.properties,
          heroSlides: current.heroSlides,
          testimonials: current.testimonials,
          enquiries: current.enquiries,
          adminProfile: current.adminProfile,
          teamAccounts: current.teamAccounts,
          activityLogs: current.activityLogs,
        },
        mediaDataUrls,
      };

      await recordActivity(
        `Exported full JSON catalog backup (${current.properties.length} properties)`,
        'Backup'
      );

      return payload;
    }, [recordActivity]);

  const importCatalogBackup = useCallback(
    async (rawJson: string) => {
      let parsed: Partial<CatalogBackupPayload>;
      try {
        parsed = JSON.parse(rawJson) as Partial<CatalogBackupPayload>;
      } catch {
        throw new Error('Selected file is not valid JSON.');
      }

      if (
        !parsed ||
        parsed.format !== 'vv-properties-catalog-backup' ||
        !parsed.snapshot ||
        !Array.isArray(parsed.snapshot.properties)
      ) {
        throw new Error(
          'Unrecognized backup schema. Please select a valid vv_properties_catalog.json export.'
        );
      }

      // Clear previous dynamic media before hydrating restored blobs cleanly
      await clearAllMedia();

      const remap = new Map<string, string>();
      const entries = Object.entries(parsed.mediaDataUrls ?? {});
      for (const [oldRef, dataUrl] of entries) {
        if (typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
          const newRef = await saveMediaDataUrl(dataUrl);
          remap.set(oldRef, newRef);
        }
      }

      const mapMediaRef = (val?: string | null): string => {
        if (!val) return '';
        if (isIdbMediaRef(val)) {
          return remap.get(val) ?? '';
        }
        return val;
      };

      const incoming = parsed.snapshot;
      const restoredSnapshot: VVCatalogSnapshot = {
        version: 2,
        properties: incoming.properties.map((p) => ({
          ...p,
          coverImage: mapMediaRef(p.coverImage),
          galleryImages: (p.galleryImages ?? [])
            .map((g) => mapMediaRef(g))
            .filter(Boolean),
        })),
        heroSlides: (incoming.heroSlides ?? []).map((s) => ({
          ...s,
          image: mapMediaRef(s.image),
        })),
        testimonials: (incoming.testimonials ?? []).map((t) => ({
          ...t,
          photo: t.photo ? mapMediaRef(t.photo) : undefined,
        })),
        enquiries: incoming.enquiries ?? [],
        adminProfile: incoming.adminProfile
          ? {
              ...incoming.adminProfile,
              avatar: incoming.adminProfile.avatar
                ? mapMediaRef(incoming.adminProfile.avatar)
                : null,
            }
          : INITIAL_ADMIN_PROFILE,
        teamAccounts: (incoming.teamAccounts ?? INITIAL_TEAM_ACCOUNTS).map(
          (a) => ({
            ...a,
            photo: a.photo ? mapMediaRef(a.photo) : null,
          })
        ),
        activityLogs: appendLog(
          pruneActivityLogs(incoming.activityLogs ?? []),
          `Imported full JSON catalog backup (${incoming.properties.length} properties restored)`,
          'Backup'
        ),
        updatedAt: new Date().toISOString(),
      };

      snapshotRef.current = restoredSnapshot;
      setSnapshot(restoredSnapshot);
      await persistCatalogSnapshot(restoredSnapshot, true);

      return {
        propertiesCount: restoredSnapshot.properties.length,
        bannersCount: restoredSnapshot.heroSlides.length,
        testimonialsCount: restoredSnapshot.testimonials.length,
        enquiriesCount: restoredSnapshot.enquiries.length,
      };
    },
    []
  );

  const resetAllDemoData = useCallback(async () => {
    const fresh = await resetPersistedCatalog();
    snapshotRef.current = fresh;
    setSnapshot(fresh);
  }, []);

  const publishedProperties = useMemo(
    () =>
      [...snapshot.properties]
        .filter((p) => p.publishStatus === 'published')
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [snapshot.properties]
  );

  const activeHeroSlides = useMemo(
    () =>
      [...snapshot.heroSlides]
        .filter((s) => s.active)
        .sort((a, b) => a.order - b.order),
    [snapshot.heroSlides]
  );

  const visibleTestimonials = useMemo(
    () => snapshot.testimonials.filter((t) => t.visible),
    [snapshot.testimonials]
  );

  const value: VVStoreContextValue = {
    properties: snapshot.properties,
    publishedProperties,
    heroSlides: snapshot.heroSlides,
    activeHeroSlides,
    testimonials: snapshot.testimonials,
    visibleTestimonials,
    enquiries: snapshot.enquiries,
    adminProfile: snapshot.adminProfile,
    teamAccounts: snapshot.teamAccounts,
    activityLogs: snapshot.activityLogs,
    isHydrated,
    toasts,
    notify,
    dismissToast,
    recordActivity,
    addProperty,
    updateProperty,
    renameProperty,
    deleteProperty,
    setPropertyAvailability,
    setPropertyPublishStatus,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    moveHeroSlide,
    reorderHeroSlides,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialVisibility,
    submitEnquiry,
    markEnquiryStatus,
    deleteEnquiry,
    updateAdminProfile,
    addTeamAccount,
    toggleTeamAccountStatus,
    deleteTeamAccount,
    exportCatalogBackup,
    importCatalogBackup,
    resetAllDemoData,
    refreshCatalog,
  };

  return (
    <VVStoreContext.Provider value={value}>{children}</VVStoreContext.Provider>
  );
}

export function useVVStore(): VVStoreContextValue {
  const ctx = useContext(VVStoreContext);
  if (!ctx) {
    throw new Error('useVVStore must be used inside VVStoreProvider');
  }
  return ctx;
}
