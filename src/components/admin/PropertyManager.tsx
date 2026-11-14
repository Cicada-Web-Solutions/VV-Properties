'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';
import { PropertyFormModal } from '@/components/admin/PropertyFormModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { IdbImage } from '@/components/ui/IdbImage';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useVVStore } from '@/context/VVStoreContext';
import { formatINR, formatINRCompact } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Property } from '@/types';

export function PropertyManager() {
  const {
    properties,
    addProperty,
    updateProperty,
    deleteProperty,
    setPropertyAvailability,
    setPropertyPublishStatus,
    notify,
  } = useVVStore();

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'available' | 'sold' | 'unpublished'
  >('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Property | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return [...properties]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .filter((p) => {
        if (q) {
          const hay = `${p.title} ${p.area} ${p.city} ${p.type}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        if (statusFilter === 'available' && p.availability !== 'available') {
          return false;
        }
        if (statusFilter === 'sold' && p.availability !== 'sold') {
          return false;
        }
        if (
          statusFilter === 'unpublished' &&
          p.publishStatus !== 'unpublished'
        ) {
          return false;
        }
        return true;
      });
  }, [properties, query, statusFilter]);

  const handleSave = async (
    payload: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    if (existingId) {
      await updateProperty(existingId, payload);
      notify(
        'Property updated',
        'success',
        'Changes reflected immediately across public pages.'
      );
    } else {
      await addProperty(payload);
      notify(
        'Property created',
        'success',
        'New listing added to portfolio and public catalogue.'
      );
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await deleteProperty(deleteTarget.id);
    notify('Property deleted', 'info', `${deleteTarget.title} was removed.`);
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-[#0D0221]/10 bg-white p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#0D0221]/45" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter listings..."
              className="w-full rounded-lg border border-[#0D0221]/15 py-2 pr-3 pl-9 text-sm focus:border-[#4062BB] focus:outline-none"
            />
          </div>

          <select
            aria-label="Filter admin listings by status"
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as typeof statusFilter)
            }
            className="rounded-lg border border-[#0D0221]/15 bg-white px-3 py-2 text-sm focus:border-[#4062BB] focus:outline-none"
          >
            <option value="all">All Listings ({properties.length})</option>
            <option value="available">Available Only</option>
            <option value="sold">Sold Only</option>
            <option value="unpublished">Unpublished / Hidden</option>
          </select>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#4062BB] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0D0221]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#0D0221]/20 bg-white p-12 text-center">
          <p className="font-display text-2xl font-medium text-[#0D0221]">
            No matching properties
          </p>
          <p className="mt-1.5 text-sm text-[#0D0221]/65">
            Adjust your filter or add a new property listing to populate the
            portfolio.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map((prop) => {
            const isSold = prop.availability === 'sold';
            const isPublished = prop.publishStatus === 'published';
            const price =
              prop.hasOffer && prop.offerPriceInr
                ? prop.offerPriceInr
                : prop.priceInr;

            return (
              <div
                key={prop.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-[#0D0221]/10 bg-white p-4 shadow-xs transition-colors hover:border-[#4062BB]/35 md:flex-row md:items-center"
              >
                {/* Media + Info */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl border border-[#0D0221]/10 bg-[#CDE6F5]/25">
                    <IdbImage
                      src={prop.coverImage}
                      alt={prop.title}
                      className={cn(
                        'h-full w-full object-cover',
                        isSold && 'grayscale-[40%]'
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={prop.availability} />
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium',
                          isPublished
                            ? 'bg-[#CDE6F5]/55 text-[#0D0221]'
                            : 'bg-[#0D0221]/8 text-[#0D0221]/60'
                        )}
                      >
                        {isPublished ? 'Published' : 'Hidden'}
                      </span>
                      <span className="text-[11px] font-medium text-[#0D0221]/55">
                        #{prop.displayOrder} · {prop.type}
                      </span>
                    </div>

                    <h3 className="mt-1.5 truncate font-display text-xl font-medium text-[#0D0221]">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-[#0D0221]/65">
                      {prop.area}, {prop.city} ·{' '}
                      <strong className="font-semibold text-[#0D0221]">
                        {formatINR(price)}
                      </strong>{' '}
                      ({formatINRCompact(price)}) · {prop.galleryImages.length}{' '}
                      {prop.galleryImages.length === 1 ? 'photo' : 'photos'}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      const next = isSold ? 'available' : 'sold';
                      await setPropertyAvailability(prop.id, next);
                      notify(
                        next === 'sold'
                          ? 'Marked as Sold'
                          : 'Restored to Available',
                        next === 'sold' ? 'info' : 'success',
                        `${prop.title} synced immediately on public pages.`
                      );
                    }}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors',
                      isSold
                        ? 'border-[#49A078]/35 bg-[#49A078]/10 text-[#2e7251] hover:bg-[#49A078] hover:text-white'
                        : 'border-[#F06543]/35 bg-[#F06543]/10 text-[#c74525] hover:bg-[#F06543] hover:text-white'
                    )}
                  >
                    {isSold ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Restore Available</span>
                      </>
                    ) : (
                      <>
                        <Tag className="h-3.5 w-3.5" />
                        <span>Mark Sold</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      const next = isPublished ? 'unpublished' : 'published';
                      await setPropertyPublishStatus(prop.id, next);
                      notify(
                        next === 'published'
                          ? 'Listing Published'
                          : 'Listing Hidden',
                        'info',
                        `${prop.title} is now ${next}.`
                      );
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#0D0221]/15 bg-white px-3 py-2 text-xs font-medium text-[#0D0221] hover:border-[#4062BB] hover:text-[#4062BB]"
                    title={
                      isPublished
                        ? 'Unpublish from public catalogue'
                        : 'Publish to public catalogue'
                    }
                  >
                    {isPublished ? (
                      <>
                        <EyeOff className="h-3.5 w-3.5" />
                        <span>Unpublish</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3.5 w-3.5" />
                        <span>Publish</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditing(prop);
                      setModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#0D0221]/15 bg-white px-3 py-2 text-xs font-medium text-[#0D0221] hover:border-[#4062BB] hover:text-[#4062BB]"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>

                  {isPublished && (
                    <Link
                      href={`/properties/${prop.slug || prop.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 rounded-lg border border-[#0D0221]/15 bg-white px-2.5 py-2 text-xs font-medium text-[#4062BB] hover:bg-[#CDE6F5]/30"
                      title="Preview public property details page"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(prop)}
                    className="inline-flex items-center gap-1 rounded-lg border border-[#F06543]/25 bg-white px-2.5 py-2 text-xs font-medium text-[#F06543] hover:bg-[#F06543] hover:text-white"
                    title="Delete property"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PropertyFormModal
        open={modalOpen}
        initialProperty={editing}
        nextDisplayOrder={properties.length + 1}
        onSave={handleSave}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Property Listing"
        description={`Are you sure you want to permanently remove "${deleteTarget?.title ?? ''}" from this browser portfolio? This action cannot be undone.`}
        confirmLabel="Delete Property"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
