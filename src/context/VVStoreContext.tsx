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
import { INITIAL_HERO_SLIDES } from '@/data/heroSlides';
import { INITIAL_PROPERTIES } from '@/data/properties';
import { INITIAL_TESTIMONIALS } from '@/data/testimonials';
import { deleteMediaRefs } from '@/lib/idb';
import {
  LIGHTWEIGHT_SYNC_KEY,
  loadPersistedCatalog,
  persistCatalogSnapshot,
  resetPersistedCatalog,
  SYNC_CHANNEL_NAME,
  type VVCatalogSnapshot,
} from '@/lib/storage';
import type {
  AvailabilityStatus,
  Enquiry,
  HeroSlide,
  Property,
  PublishStatus,
  Testimonial,
  ToastMessage,
  ToastType,
} from '@/types';

interface VVStoreContextValue {
  properties: Property[];
  publishedProperties: Property[];
  heroSlides: HeroSlide[];
  activeHeroSlides: HeroSlide[];
  testimonials: Testimonial[];
  visibleTestimonials: Testimonial[];
  enquiries: Enquiry[];
  isHydrated: boolean;
  toasts: ToastMessage[];
  notify: (title: string, type?: ToastType, description?: string) => void;
  dismissToast: (id: string) => void;
  addProperty: (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Property>;
  updateProperty: (id: string, patch: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  setPropertyAvailability: (id: string, availability: AvailabilityStatus) => Promise<void>;
  setPropertyPublishStatus: (id: string, publishStatus: PublishStatus) => Promise<void>;
  addHeroSlide: (slide: Omit<HeroSlide, 'id'>) => Promise<void>;
  updateHeroSlide: (id: string, patch: Partial<HeroSlide>) => Promise<void>;
  deleteHeroSlide: (id: string) => Promise<void>;
  moveHeroSlide: (id: string, direction: 'up' | 'down') => Promise<void>;
  addTestimonial: (testimonial: Omit<Testimonial, 'id' | 'createdAt'>) => Promise<void>;
  updateTestimonial: (id: string, patch: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  toggleTestimonialVisibility: (id: string) => Promise<void>;
  submitEnquiry: (
    payload: Omit<Enquiry, 'id' | 'status' | 'createdAt'>
  ) => Promise<Enquiry>;
  markEnquiryStatus: (id: string, status: 'new' | 'reviewed') => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;
  resetAllDemoData: () => Promise<void>;
}

const VVStoreContext = createContext<VVStoreContextValue | null>(null);

export function VVStoreProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = useState<VVCatalogSnapshot>(() => ({
    version: 1,
    properties: INITIAL_PROPERTIES,
    heroSlides: INITIAL_HERO_SLIDES,
    testimonials: INITIAL_TESTIMONIALS,
    enquiries: [],
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

  // Initial hydration + multi-tab live synchronization
  useEffect(() => {
    let cancelled = false;

    const refreshFromStore = async () => {
      const loaded = await loadPersistedCatalog();
      if (!cancelled) {
        setSnapshot(loaded);
        setIsHydrated(true);
      }
    };

    void refreshFromStore();

    let channel: BroadcastChannel | null = null;
    if ('BroadcastChannel' in window) {
      channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.onmessage = () => {
        void refreshFromStore();
      };
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === LIGHTWEIGHT_SYNC_KEY) {
        void refreshFromStore();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      cancelled = true;
      channel?.close();
      window.removeEventListener('storage', onStorage);
    };
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

  const addProperty = useCallback(
    async (input: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const created: Property = {
        ...input,
        id: `prop-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: now,
        updatedAt: now,
      };
      await commitUpdate((curr) => ({
        ...curr,
        properties: [created, ...curr.properties],
      }));
      return created;
    },
    [commitUpdate]
  );

  const updateProperty = useCallback(
    async (id: string, patch: Partial<Property>) => {
      const existing = snapshotRef.current.properties.find((p) => p.id === id);
      if (existing && (patch.galleryImages || patch.coverImage)) {
        const nextSet = new Set([
          ...(patch.galleryImages ?? existing.galleryImages),
          ...(patch.coverImage ? [patch.coverImage] : [existing.coverImage]),
        ]);
        const removed = [
          existing.coverImage,
          ...existing.galleryImages,
        ].filter((img) => !nextSet.has(img));
        if (removed.length > 0) {
          void deleteMediaRefs(removed);
        }
      }

      await commitUpdate((curr) => ({
        ...curr,
        properties: curr.properties.map((p) =>
          p.id === id
            ? { ...p, ...patch, updatedAt: new Date().toISOString() }
            : p
        ),
      }));
    },
    [commitUpdate]
  );

  const deleteProperty = useCallback(
    async (id: string) => {
      const target = snapshotRef.current.properties.find((p) => p.id === id);
      if (target) {
        void deleteMediaRefs([target.coverImage, ...target.galleryImages]);
      }
      await commitUpdate((curr) => ({
        ...curr,
        properties: curr.properties.filter((p) => p.id !== id),
      }));
    },
    [commitUpdate]
  );

  const setPropertyAvailability = useCallback(
    async (id: string, availability: AvailabilityStatus) => {
      await updateProperty(id, { availability });
    },
    [updateProperty]
  );

  const setPropertyPublishStatus = useCallback(
    async (id: string, publishStatus: PublishStatus) => {
      await updateProperty(id, { publishStatus });
    },
    [updateProperty]
  );

  const addHeroSlide = useCallback(
    async (slide: Omit<HeroSlide, 'id'>) => {
      const created: HeroSlide = {
        ...slide,
        id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      await commitUpdate((curr) => ({
        ...curr,
        heroSlides: [...curr.heroSlides, created].sort(
          (a, b) => a.order - b.order
        ),
      }));
    },
    [commitUpdate]
  );

  const updateHeroSlide = useCallback(
    async (id: string, patch: Partial<HeroSlide>) => {
      const existing = snapshotRef.current.heroSlides.find((s) => s.id === id);
      if (existing && patch.image && patch.image !== existing.image) {
        void deleteMediaRefs([existing.image]);
      }
      await commitUpdate((curr) => ({
        ...curr,
        heroSlides: curr.heroSlides
          .map((s) => (s.id === id ? { ...s, ...patch } : s))
          .sort((a, b) => a.order - b.order),
      }));
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
          .map((s, idx) => ({ ...s, order: idx + 1 })),
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
      }));
    },
    [commitUpdate]
  );

  const toggleTestimonialVisibility = useCallback(
    async (id: string) => {
      await commitUpdate((curr) => ({
        ...curr,
        testimonials: curr.testimonials.map((t) =>
          t.id === id ? { ...t, visible: !t.visible } : t
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
      }));
      return created;
    },
    [commitUpdate]
  );

  const markEnquiryStatus = useCallback(
    async (id: string, status: 'new' | 'reviewed') => {
      await commitUpdate((curr) => ({
        ...curr,
        enquiries: curr.enquiries.map((e) =>
          e.id === id ? { ...e, status } : e
        ),
      }));
    },
    [commitUpdate]
  );

  const deleteEnquiry = useCallback(
    async (id: string) => {
      await commitUpdate((curr) => ({
        ...curr,
        enquiries: curr.enquiries.filter((e) => e.id !== id),
      }));
    },
    [commitUpdate]
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
    isHydrated,
    toasts,
    notify,
    dismissToast,
    addProperty,
    updateProperty,
    deleteProperty,
    setPropertyAvailability,
    setPropertyPublishStatus,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    moveHeroSlide,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialVisibility,
    submitEnquiry,
    markEnquiryStatus,
    deleteEnquiry,
    resetAllDemoData,
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
