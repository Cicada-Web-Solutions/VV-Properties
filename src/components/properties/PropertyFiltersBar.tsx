'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropertyFilterState, PropertyType } from '@/types';

const PROPERTY_TYPES: Array<{ value: PropertyType | 'all'; label: string }> = [
  { value: 'all', label: 'All Types' },
  { value: 'Villa', label: 'Villa' },
  { value: 'Penthouse', label: 'Penthouse' },
  { value: 'Apartment', label: 'Apartment' },
  { value: 'Plot', label: 'Plot' },
  { value: 'Commercial', label: 'Commercial' },
];

export const PRICE_PRESETS = [
  { id: 'all', label: 'Any Price Range (INR)', min: null, max: null },
  { id: 'under-5', label: 'Up to ₹ 5 Cr', min: null, max: 50000000 },
  { id: '5-8', label: '₹ 5 Cr – ₹ 8 Cr', min: 50000000, max: 80000000 },
  { id: '8-12', label: '₹ 8 Cr – ₹ 12 Cr', min: 80000000, max: 120000000 },
  { id: 'above-12', label: '₹ 12 Cr & Above', min: 120000000, max: null },
] as const;

interface PropertyFiltersBarProps {
  filters: PropertyFilterState;
  availableAreas: string[];
  onChange: (next: PropertyFilterState) => void;
  onReset: () => void;
}

export function PropertyFiltersBar({
  filters,
  availableAreas,
  onChange,
  onReset,
}: PropertyFiltersBarProps) {
  const [searchDraft, setSearchDraft] = useState(filters.search);
  const [areaOpen, setAreaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const areaRef = useRef<HTMLDivElement>(null);

  // Debounce text search per wireframe spec
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (searchDraft !== filters.search) {
        onChange({ ...filters, search: searchDraft });
      }
    }, 200);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDraft]);

  const handleReset = () => {
    setSearchDraft('');
    onReset();
  };

  // Close multi-select dropdown when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (areaRef.current && !areaRef.current.contains(e.target as Node)) {
        setAreaOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const toggleArea = (area: string) => {
    const exists = filters.areas.includes(area);
    const nextAreas = exists
      ? filters.areas.filter((a) => a !== area)
      : [...filters.areas, area];
    onChange({ ...filters, areas: nextAreas });
  };

  const selectedPricePresetId =
    PRICE_PRESETS.find(
      (p) => p.min === filters.minPrice && p.max === filters.maxPrice
    )?.id ?? 'all';

  const activeFilterCount =
    (filters.search.trim() ? 1 : 0) +
    (filters.areas.length > 0 ? 1 : 0) +
    (filters.type !== 'all' ? 1 : 0) +
    (filters.minPrice !== null || filters.maxPrice !== null ? 1 : 0) +
    (filters.availability !== 'all' ? 1 : 0);

  const filterControls = (
    <>
      {/* Multi-Select Region / Area Dropdown */}
      <div ref={areaRef} className="relative">
        <button
          type="button"
          onClick={() => setAreaOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-[#0D0221]/15 bg-white px-3.5 py-2.5 text-left text-sm text-[#0D0221] transition-colors hover:border-[#4062BB] focus:outline-none focus:ring-2 focus:ring-[#4062BB]/25"
          aria-expanded={areaOpen}
        >
          <span className="truncate">
            {filters.areas.length === 0
              ? 'Region / Area'
              : filters.areas.length === 1
                ? filters.areas[0]
                : `${filters.areas.length} Areas Selected`}
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-[#0D0221]/50 transition-transform',
              areaOpen && 'rotate-180'
            )}
          />
        </button>

        {areaOpen && (
          <div className="absolute left-0 z-30 mt-2 max-h-60 w-full min-w-[220px] overflow-y-auto rounded-xl border border-[#0D0221]/12 bg-white p-2 shadow-xl">
            {availableAreas.length === 0 ? (
              <p className="px-3 py-2 text-xs text-[#0D0221]/60">
                No regions available
              </p>
            ) : (
              availableAreas.map((area) => {
                const checked = filters.areas.includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(area)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-[#0D0221] transition-colors hover:bg-[#CDE6F5]/40"
                  >
                    <span className="truncate">{area}</span>
                    <span
                      className={cn(
                        'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                        checked
                          ? 'border-[#4062BB] bg-[#4062BB] text-white'
                          : 'border-[#0D0221]/25 bg-white'
                      )}
                    >
                      {checked && <Check className="h-3 w-3" />}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Property Type */}
      <div>
        <select
          aria-label="Filter by property type"
          value={filters.type}
          onChange={(e) =>
            onChange({
              ...filters,
              type: e.target.value as PropertyType | 'all',
            })
          }
          className="w-full rounded-lg border border-[#0D0221]/15 bg-white px-3.5 py-2.5 text-sm text-[#0D0221] transition-colors hover:border-[#4062BB] focus:border-[#4062BB] focus:outline-none focus:ring-2 focus:ring-[#4062BB]/25"
        >
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* INR Price Range */}
      <div>
        <select
          aria-label="Filter by price range in INR"
          value={selectedPricePresetId}
          onChange={(e) => {
            const preset =
              PRICE_PRESETS.find((p) => p.id === e.target.value) ??
              PRICE_PRESETS[0];
            onChange({
              ...filters,
              minPrice: preset.min,
              maxPrice: preset.max,
            });
          }}
          className="w-full rounded-lg border border-[#0D0221]/15 bg-white px-3.5 py-2.5 text-sm text-[#0D0221] transition-colors hover:border-[#4062BB] focus:border-[#4062BB] focus:outline-none focus:ring-2 focus:ring-[#4062BB]/25"
        >
          {PRICE_PRESETS.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.label}
            </option>
          ))}
        </select>
      </div>

      {/* Availability Status */}
      <div>
        <select
          aria-label="Filter by availability"
          value={filters.availability}
          onChange={(e) =>
            onChange({
              ...filters,
              availability: e.target.value as PropertyFilterState['availability'],
            })
          }
          className="w-full rounded-lg border border-[#0D0221]/15 bg-white px-3.5 py-2.5 text-sm text-[#0D0221] transition-colors hover:border-[#4062BB] focus:border-[#4062BB] focus:outline-none focus:ring-2 focus:ring-[#4062BB]/25"
        >
          <option value="all">All Statuses</option>
          <option value="available">Available Only</option>
          <option value="sold">Sold Archive</option>
        </select>
      </div>
    </>
  );

  return (
    <div className="rounded-2xl border border-[#0D0221]/10 bg-white p-4 shadow-xs sm:p-5">
      <div className="flex flex-col gap-3 md:grid md:grid-cols-12 md:items-center">
        {/* Search Input (Always visible on desktop & mobile) */}
        <div className="relative md:col-span-4">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#0D0221]/45" />
          <input
            type="search"
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            placeholder="Search by property name or area..."
            aria-label="Search by property name"
            className="w-full rounded-lg border border-[#0D0221]/15 bg-white py-2.5 pr-4 pl-10 text-sm text-[#0D0221] placeholder:text-[#0D0221]/45 focus:border-[#4062BB] focus:outline-none focus:ring-2 focus:ring-[#4062BB]/25"
          />
        </div>

        {/* Desktop Inline Filters */}
        <div className="hidden md:col-span-7 md:grid md:grid-cols-4 md:gap-2.5">
          {filterControls}
        </div>

        {/* Reset Button (Desktop) & Filter Sheet Trigger (Mobile) */}
        <div className="flex items-center justify-between gap-2 md:col-span-1 md:justify-end">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-[#0D0221]/15 bg-[#CDE6F5]/25 px-4 py-2.5 text-sm font-medium text-[#0D0221] md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#4062BB]" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#4062BB] px-1.5 text-[11px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={activeFilterCount === 0 && !searchDraft}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#0D0221]/15 bg-white px-3.5 py-2.5 text-sm font-medium text-[#0D0221] transition-colors hover:border-[#4062BB] hover:text-[#4062BB] disabled:cursor-not-allowed disabled:opacity-45"
            title="Reset all filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Mobile Slide-Up Filter Panel (Wireframe Block A spec) */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-end bg-[#0D0221]/50 backdrop-blur-[2px] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Property Filters"
        >
          <div className="w-full rounded-t-2xl bg-white p-5 pb-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#0D0221]/10 pb-3.5">
              <h3 className="font-display text-2xl font-medium text-[#0D0221]">
                Refine Properties
              </h3>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-[#0D0221]/60 hover:bg-[#CDE6F5]/40"
                aria-label="Close filters panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">{filterControls}</div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  handleReset();
                  setMobileOpen(false);
                }}
                className="flex-1 rounded-lg border border-[#0D0221]/20 py-3 text-sm font-medium text-[#0D0221]"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex-1 rounded-lg bg-[#4062BB] py-3 text-sm font-medium text-white"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
