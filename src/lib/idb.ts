'use client';

/**
 * IndexedDB storage layer for uploaded media Blobs (property galleries, hero slides,
 * testimonial portraits) and large frontend catalog state.
 *
 * Lightweight preferences and demo admin sessions remain in localStorage.
 */

const DB_NAME = 'vv_properties_db';
const DB_VERSION = 1;
const MEDIA_STORE = 'media';
const CATALOG_STORE = 'catalog';

export const IDB_MEDIA_PREFIX = 'idb://';

const objectUrlCache = new Map<string, string>();
const inflightUrlLookups = new Map<string, Promise<string | null>>();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      reject(new Error('IndexedDB is unavailable in this environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(MEDIA_STORE)) {
        db.createObjectStore(MEDIA_STORE);
      }
      if (!db.objectStoreNames.contains(CATALOG_STORE)) {
        db.createObjectStore(CATALOG_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error('Failed to open IndexedDB.'));
  });
}

export function isIdbMediaRef(src?: string): boolean {
  return Boolean(src && src.startsWith(IDB_MEDIA_PREFIX));
}

function extractMediaId(ref: string): string {
  return ref.slice(IDB_MEDIA_PREFIX.length);
}

/**
 * Compresses an uploaded image smoothly if it is extremely large while preserving
 * luxury visual sharpness, then stores the resulting Blob in IndexedDB.
 */
async function prepareImageBlob(file: File): Promise<Blob> {
  if (typeof document === 'undefined' || !file.type.startsWith('image/')) {
    return file;
  }

  // Keep SVG or crisp small files untouched
  if (file.type === 'image/svg+xml' || file.size <= 450 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const tempUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(tempUrl);
      const maxDim = 1800;
      let { width, height } = img;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim / width, maxDim / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          resolve(blob ?? file);
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        0.86
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(tempUrl);
      resolve(file);
    };
    img.src = tempUrl;
  });
}

/**
 * Stores a user-uploaded image in IndexedDB and eagerly populates a live ObjectURL
 * so previews render instantly and survive full page reloads.
 */
export async function saveMediaFile(file: File): Promise<string> {
  const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ref = `${IDB_MEDIA_PREFIX}${id}`;
  const blob = await prepareImageBlob(file);

  // Immediately cache browser ObjectURL so UI responds instantaneously
  const objectUrl = URL.createObjectURL(blob);
  objectUrlCache.set(ref, objectUrl);

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, 'readwrite');
      tx.objectStore(MEDIA_STORE).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.warn('IndexedDB media persist fallback to session ObjectURL:', err);
  }

  return ref;
}

/**
 * Resolves either a static /assets/... URL directly or retrieves a persisted Blob
 * from IndexedDB and caches a live browser ObjectURL.
 */
export async function resolveMediaUrl(ref: string): Promise<string | null> {
  if (!ref) return null;
  if (!isIdbMediaRef(ref)) return ref;

  const cached = objectUrlCache.get(ref);
  if (cached) return cached;

  const existingPromise = inflightUrlLookups.get(ref);
  if (existingPromise) return existingPromise;

  const lookupPromise = (async () => {
    try {
      const db = await openDatabase();
      const id = extractMediaId(ref);
      const blob = await new Promise<Blob | undefined>((resolve, reject) => {
        const tx = db.transaction(MEDIA_STORE, 'readonly');
        const req = tx.objectStore(MEDIA_STORE).get(id);
        req.onsuccess = () => resolve(req.result as Blob | undefined);
        req.onerror = () => reject(req.error);
      });
      db.close();

      if (!blob) return null;
      const url = URL.createObjectURL(blob);
      objectUrlCache.set(ref, url);
      return url;
    } catch {
      return null;
    } finally {
      inflightUrlLookups.delete(ref);
    }
  })();

  inflightUrlLookups.set(ref, lookupPromise);
  return lookupPromise;
}

export async function deleteMediaRefs(refs: string[]): Promise<void> {
  const idbRefs = refs.filter(isIdbMediaRef);
  if (idbRefs.length === 0) return;

  for (const ref of idbRefs) {
    const url = objectUrlCache.get(ref);
    if (url) {
      URL.revokeObjectURL(url);
      objectUrlCache.delete(ref);
    }
  }

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, 'readwrite');
      const store = tx.objectStore(MEDIA_STORE);
      for (const ref of idbRefs) {
        store.delete(extractMediaId(ref));
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore cleanup errors
  }
}

export async function clearAllMedia(): Promise<void> {
  for (const url of objectUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  objectUrlCache.clear();

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, 'readwrite');
      tx.objectStore(MEDIA_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore cleanup errors
  }
}

export async function saveCatalogState<T>(key: string, data: T): Promise<void> {
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(CATALOG_STORE, 'readwrite');
    tx.objectStore(CATALOG_STORE).put(data, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadCatalogState<T>(key: string): Promise<T | null> {
  const db = await openDatabase();
  const data = await new Promise<T | null>((resolve, reject) => {
    const tx = db.transaction(CATALOG_STORE, 'readonly');
    const req = tx.objectStore(CATALOG_STORE).get(key);
    req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return data;
}

export async function getStorageDiagnostics(): Promise<{
  mediaCount: number;
  usedBytes: number;
  quotaBytes: number | null;
}> {
  let mediaCount = 0;
  try {
    const db = await openDatabase();
    mediaCount = await new Promise<number>((resolve) => {
      const tx = db.transaction(MEDIA_STORE, 'readonly');
      const req = tx.objectStore(MEDIA_STORE).count();
      req.onsuccess = () => resolve(req.result ?? 0);
      req.onerror = () => resolve(0);
    });
    db.close();
  } catch {
    mediaCount = objectUrlCache.size;
  }

  let usedBytes = 0;
  let quotaBytes: number | null = null;
  if (typeof navigator !== 'undefined' && navigator.storage?.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      usedBytes = estimate.usage ?? 0;
      quotaBytes = estimate.quota ?? null;
    } catch {
      // Ignore estimate errors
    }
  }

  return { mediaCount, usedBytes, quotaBytes };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () =>
      reject(reader.error ?? new Error('Failed to serialize media blob.'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Exports referenced idb:// media Blobs as portable Base64 Data URLs
 * for 1-Click JSON Catalog Backup.
 */
export async function exportMediaMapAsDataUrls(
  refs: string[]
): Promise<Record<string, string>> {
  const uniqueIdbRefs = Array.from(new Set(refs.filter(isIdbMediaRef)));
  const result: Record<string, string> = {};
  if (uniqueIdbRefs.length === 0) return result;

  try {
    const db = await openDatabase();
    for (const ref of uniqueIdbRefs) {
      const id = extractMediaId(ref);
      const blob = await new Promise<Blob | undefined>((resolve) => {
        const tx = db.transaction(MEDIA_STORE, 'readonly');
        const req = tx.objectStore(MEDIA_STORE).get(id);
        req.onsuccess = () => resolve(req.result as Blob | undefined);
        req.onerror = () => resolve(undefined);
      });
      if (blob) {
        result[ref] = await blobToDataUrl(blob);
      }
    }
    db.close();
  } catch {
    // Ignore export failure for unavailable IndexedDB entries
  }

  return result;
}

/**
 * Restores a serialized Base64 Data URL image back into IndexedDB and returns a live idb:// ref.
 */
export async function saveMediaDataUrl(dataUrl: string): Promise<string> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const id = `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ref = `${IDB_MEDIA_PREFIX}${id}`;

  const objectUrl = URL.createObjectURL(blob);
  objectUrlCache.set(ref, objectUrl);

  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(MEDIA_STORE, 'readwrite');
      tx.objectStore(MEDIA_STORE).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch (err) {
    console.warn('IndexedDB restore fallback:', err);
  }

  return ref;
}
