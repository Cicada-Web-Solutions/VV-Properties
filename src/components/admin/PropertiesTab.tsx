'use client';

import React, { useMemo, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { PropertyCardAdmin } from '@/components/admin/PropertyCardAdmin';
import { inferBadgeTag } from '@/lib/adminUtils';
import type { Property } from '@/types';

interface PropertiesTabProps {
  properties: Property[];
  onAddProperty: () => void;
  onEditProperty: (property: Property) => void;
  onRenameProperty: (property: Property) => void;
  onTogglePublishProperty: (property: Property) => void;
  onToggleAvailabilityProperty: (property: Property) => void;
  onDeleteProperty: (property: Property) => void;
}

export function PropertiesTab({
  properties,
  onAddProperty,
  onEditProperty,
  onRenameProperty,
  onTogglePublishProperty,
  onToggleAvailabilityProperty,
  onDeleteProperty,
}: PropertiesTabProps) {
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [badgeFilter, setBadgeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const locationOptions = useMemo(() => {
    const set = new Set<string>();
    for (const p of properties) {
      if (p.area) set.add(p.area);
      if (p.city) set.add(p.city);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [properties]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return properties.filter((p) => {
      const matchSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        (p.customTypeLabel || p.type).toLowerCase().includes(q);

      const matchLoc =
        locationFilter === 'All' ||
        p.area.toLowerCase() === locationFilter.toLowerCase() ||
        p.city.toLowerCase() === locationFilter.toLowerCase();

      const tag = inferBadgeTag(p);
      const matchBadge = badgeFilter === 'All' || tag === badgeFilter;

      const matchStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Published' && p.publishStatus === 'published') ||
        (statusFilter === 'Draft' && p.publishStatus === 'unpublished') ||
        (statusFilter === 'Available' && p.availability === 'available') ||
        (statusFilter === 'Sold' && p.availability === 'sold');

      return matchSearch && matchLoc && matchBadge && matchStatus;
    });
  }, [properties, search, locationFilter, badgeFilter, statusFilter]);

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-[#0D0221] lg:text-3xl">
            Properties
          </h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500 lg:text-sm">
            Active residential and commercial real estate portfolio.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddProperty}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl bg-[#0F52BA] px-4 py-2 text-xs font-bold text-white shadow-lg shadow-[#0F52BA]/25 transition-all hover:bg-[#0A3F91]"
        >
          <Plus className="h-4 w-4" />
          <span>Add Property</span>
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col items-stretch gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 text-xs shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search property name or locality..."
            className="w-full rounded-xl border border-slate-200 py-2 pr-4 pl-10 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter by locality"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
          >
            <option value="All">All Locations</option>
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by badge"
            value={badgeFilter}
            onChange={(e) => setBadgeFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
          >
            <option value="All">All Badges</option>
            <option value="Featured">Featured</option>
            <option value="Special Offer">Special Offer</option>
            <option value="New Launch">New Launch</option>
            <option value="Hot Deal">Hot Deal</option>
            <option value="None">No Badge</option>
          </select>

          <select
            aria-label="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
          >
            <option value="All">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-xs font-medium text-slate-400">
          No properties found matching your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((prop) => (
            <PropertyCardAdmin
              key={prop.id}
              property={prop}
              onEdit={onEditProperty}
              onRename={onRenameProperty}
              onTogglePublish={onTogglePublishProperty}
              onToggleAvailability={onToggleAvailabilityProperty}
              onDelete={onDeleteProperty}
            />
          ))}
        </div>
      )}
    </section>
  );
}
