'use client';

import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  Building,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileEdit,
  Mail,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { PropertyCardAdmin } from '@/components/admin/PropertyCardAdmin';
import { computeTrafficChart } from '@/lib/adminUtils';
import type { Enquiry, Property, TrafficRangeKey } from '@/types';

interface DashboardOverviewTabProps {
  properties: Property[];
  enquiries: Enquiry[];
  onNavigateTab: (
    tab:
      | 'dashboard'
      | 'properties'
      | 'banners'
      | 'enquiries'
      | 'testimonials'
      | 'admin'
      | 'logs'
  ) => void;
  onOpenEnquiry: (enquiry: Enquiry) => void;
  onEditProperty: (property: Property) => void;
  onRenameProperty: (property: Property) => void;
  onTogglePublishProperty: (property: Property) => void;
  onToggleAvailabilityProperty: (property: Property) => void;
  onDeleteProperty: (property: Property) => void;
}

export function DashboardOverviewTab({
  properties,
  enquiries,
  onNavigateTab,
  onOpenEnquiry,
  onEditProperty,
  onRenameProperty,
  onTogglePublishProperty,
  onToggleAvailabilityProperty,
  onDeleteProperty,
}: DashboardOverviewTabProps) {
  const [rangeKey, setRangeKey] = useState<TrafficRangeKey>('3M');
  const [customPopoverOpen, setCustomPopoverOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState('2026-06-14');
  const [customTo, setCustomTo] = useState('2026-09-14');
  const [appliedFrom, setAppliedFrom] = useState('2026-06-14');
  const [appliedTo, setAppliedTo] = useState('2026-09-14');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const publishedCount = useMemo(
    () => properties.filter((p) => p.publishStatus === 'published').length,
    [properties]
  );
  const draftCount = useMemo(
    () => properties.filter((p) => p.publishStatus === 'unpublished').length,
    [properties]
  );
  const newLeads = useMemo(
    () => enquiries.filter((e) => e.status === 'new'),
    [enquiries]
  );
  const priorityLeads = useMemo(() => newLeads.slice(0, 4), [newLeads]);
  const recentFive = useMemo(() => properties.slice(0, 5), [properties]);

  const chart = useMemo(
    () => computeTrafficChart(rangeKey, appliedFrom, appliedTo),
    [rangeKey, appliedFrom, appliedTo]
  );

  const handleRangeChange = (nextVal: string) => {
    const typed = nextVal as TrafficRangeKey;
    if (typed === 'custom') {
      setCustomPopoverOpen(true);
    } else {
      setCustomPopoverOpen(false);
      setRangeKey(typed);
    }
  };

  const applyCustomDateRange = () => {
    if (!customFrom || !customTo) return;
    setAppliedFrom(customFrom);
    setAppliedTo(customTo);
    setRangeKey('custom');
    setCustomPopoverOpen(false);
  };

  const activeHoverPoint =
    hoveredIdx !== null ? chart.points[hoveredIdx] ?? null : null;

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-extrabold tracking-tight text-[#0D0221] lg:text-3xl">
          Executive Dashboard
        </h1>
        <p className="mt-0.5 text-xs font-medium text-slate-500 lg:text-sm">
          Real-time overview of listing portfolios, lead generation, and
          performance.
        </p>
      </div>

      {/* 4 KPI Sparkline Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:border-[#0F52BA]/40 hover:shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <span className="flex items-center gap-2">
              <Building className="h-3.5 w-3.5 text-[#0F52BA]" />
              <span className="tracking-wider">Total Properties</span>
            </span>
            <span className="flex items-center gap-1 rounded-full border border-[#0F52BA]/20 bg-[#0F52BA]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#0F52BA]">
              <TrendingUp className="h-3 w-3" />
              <span>{properties.length} Total</span>
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div
                id="dashTotalProps"
                className="text-3xl font-extrabold tracking-tight text-[#0D0221]"
              >
                {publishedCount}
              </div>
              <span className="text-xs font-medium text-slate-400">
                Active Listings
              </span>
            </div>
            <svg
              className="h-8 w-16 text-[#0F52BA]/60"
              viewBox="0 0 60 25"
              fill="none"
            >
              <path
                d="M2 20 L15 14 L28 17 L40 8 L58 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 20 L15 14 L28 17 L40 8 L58 4 L58 25 L2 25 Z"
                fill="currentColor"
                fillOpacity="0.08"
              />
            </svg>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:border-[#0F52BA]/40 hover:shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <span className="flex items-center gap-2">
              <FileEdit className="h-3.5 w-3.5 text-[#0F52BA]" />
              <span className="tracking-wider">Draft Properties</span>
            </span>
            <span className="flex items-center gap-1 rounded-full border border-[#0F52BA]/20 bg-[#0F52BA]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#0F52BA]">
              <Clock3 className="h-3 w-3" />
              <span>Reviewing</span>
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div
                id="dashDraftProps"
                className="text-3xl font-extrabold tracking-tight text-[#0D0221]"
              >
                {draftCount}
              </div>
              <span className="text-xs font-medium text-slate-400">
                Awaiting publication
              </span>
            </div>
            <svg
              className="h-8 w-16 text-[#0F52BA]/60"
              viewBox="0 0 60 25"
              fill="none"
            >
              <path
                d="M2 12 L15 16 L28 10 L42 14 L58 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12 L15 16 L28 10 L42 14 L58 6 L58 25 L2 25 Z"
                fill="currentColor"
                fillOpacity="0.08"
              />
            </svg>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:border-[#0F52BA]/40 hover:shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <span className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-[#0F52BA]" />
              <span className="tracking-wider">Total Enquiries</span>
            </span>
            <span className="flex items-center gap-1 rounded-full border border-[#0F52BA]/20 bg-[#0F52BA]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#0F52BA]">
              <CheckCircle2 className="h-3 w-3" />
              <span>Verified</span>
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div
                id="dashTotalEnquiries"
                className="text-3xl font-extrabold tracking-tight text-[#0D0221]"
              >
                {enquiries.length}
              </div>
              <span className="text-xs font-medium text-slate-400">
                Verified leads
              </span>
            </div>
            <svg
              className="h-8 w-16 text-[#0F52BA]/60"
              viewBox="0 0 60 25"
              fill="none"
            >
              <path
                d="M2 18 L16 15 L30 19 L44 8 L58 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 18 L16 15 L30 19 L44 8 L58 3 L58 25 L2 25 Z"
                fill="currentColor"
                fillOpacity="0.08"
              />
            </svg>
          </div>
        </div>

        <div className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 hover:border-[#0F52BA]/40 hover:shadow-md">
          <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-500 uppercase">
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-[#0F52BA]" />
              <span className="tracking-wider">New Leads</span>
            </span>
            <span className="flex items-center gap-1 rounded-full border border-[#0F52BA]/20 bg-[#0F52BA]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#0F52BA]">
              <Bell className="h-3 w-3" />
              <span>Needs follow-up</span>
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <div
                id="dashNewLeads"
                className="text-3xl font-extrabold tracking-tight text-[#0D0221]"
              >
                {newLeads.length}
              </div>
              <span className="text-xs font-medium text-slate-400">
                Needs follow-up
              </span>
            </div>
            <svg
              className="h-8 w-16 text-[#0F52BA]/60"
              viewBox="0 0 60 25"
              fill="none"
            >
              <path
                d="M2 15 L14 18 L28 12 L42 15 L58 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 15 L14 18 L28 12 L42 15 L58 5 L58 25 L2 25 Z"
                fill="currentColor"
                fillOpacity="0.08"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* 2-Column Analytics Graph + Priority Leads */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Performance & Website Trafficking */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm lg:col-span-2">
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-sans text-sm font-bold text-[#0D0221]">
                  Performance
                </h3>
                <p className="text-xs font-medium text-slate-400">
                  Website Trafficking · {chart.totalVisits.toLocaleString('en-IN')} Visits ({chart.rangeSummary})
                </p>
              </div>

              <div className="relative flex items-center gap-2">
                <select
                  aria-label="Select traffic time range"
                  value={customPopoverOpen ? 'custom' : rangeKey}
                  onChange={(e) => handleRangeChange(e.target.value)}
                  className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                >
                  <option value="24h">24 Hours</option>
                  <option value="1W">1 Week</option>
                  <option value="1M">1 Month</option>
                  <option value="3M">3 Months</option>
                  <option value="6M">6 Months</option>
                  <option value="1Y">1 Year</option>
                  <option value="MAX">MAX</option>
                  <option value="custom">Customize Date Range...</option>
                </select>

                {customPopoverOpen && (
                  <div className="absolute top-10 right-0 z-40 w-72 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
                    <p className="text-xs font-bold text-[#0D0221]">
                      Select Custom Date Range
                    </p>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">
                          From Date
                        </label>
                        <input
                          type="date"
                          value={customFrom}
                          onChange={(e) => setCustomFrom(e.target.value)}
                          className="w-full cursor-pointer rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase">
                          To Date
                        </label>
                        <input
                          type="date"
                          value={customTo}
                          onChange={(e) => setCustomTo(e.target.value)}
                          className="w-full cursor-pointer rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        onClick={() => setCustomPopoverOpen(false)}
                        className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={applyCustomDateRange}
                        className="cursor-pointer rounded-lg bg-[#0F52BA] px-3 py-1 text-xs font-bold text-white"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive SVG Traffic Line Graph */}
            <div className="relative mt-2 h-48 w-full">
              {activeHoverPoint && (
                <div className="pointer-events-none absolute top-1 right-2 z-20 rounded-lg border border-slate-200 bg-[#0D0221] px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                  {activeHoverPoint.label}: {activeHoverPoint.visits} visits
                </div>
              )}
              <svg
                viewBox="0 0 500 150"
                className="h-full w-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="vvChartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0F52BA" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0F52BA" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line
                  x1="0"
                  y1="20"
                  x2="500"
                  y2="20"
                  stroke="#F1F5F9"
                  strokeWidth="1.5"
                />
                <line
                  x1="0"
                  y1="65"
                  x2="500"
                  y2="65"
                  stroke="#F1F5F9"
                  strokeWidth="1.5"
                />
                <line
                  x1="0"
                  y1="110"
                  x2="500"
                  y2="110"
                  stroke="#F1F5F9"
                  strokeWidth="1.5"
                />

                <polygon points={chart.areaPoints} fill="url(#vvChartGrad)" />
                <polyline
                  fill="none"
                  stroke="#0F52BA"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chart.polylinePoints}
                />

                <g>
                  {chart.points.map((pt, idx) => (
                    <circle
                      key={`${pt.label}-${idx}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoveredIdx === idx ? 5 : 3.5}
                      fill="#0F52BA"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onMouseLeave={() => setHoveredIdx(null)}
                    >
                      <title>{`${pt.label}: ${pt.visits} visits`}</title>
                    </circle>
                  ))}
                </g>
              </svg>
            </div>

            <div className="mt-3 flex justify-between border-t border-slate-100 pt-2 text-[11px] font-semibold text-slate-400">
              {chart.xLabels.map((lbl, idx) => (
                <span key={`${lbl}-${idx}`}>{lbl}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Leads */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
          <div>
            <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-sans text-sm font-bold text-[#0D0221]">
                  Priority Leads
                </h3>
                <p className="text-xs font-medium text-slate-400">
                  Fresh incoming inquiries ({newLeads.length} New Leads)
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('enquiries')}
                className="flex cursor-pointer items-center gap-1 text-xs font-bold text-[#0F52BA] hover:underline"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {priorityLeads.length === 0 ? (
                <p className="py-8 text-center text-xs font-medium text-slate-400">
                  No new unread priority leads right now.
                </p>
              ) : (
                priorityLeads.map((enq) => (
                  <button
                    key={enq.id}
                    type="button"
                    onClick={() => onOpenEnquiry(enq)}
                    className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-transparent p-2.5 text-left transition-all duration-200 hover:border-slate-200/80 hover:bg-slate-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700">
                        {enq.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-xs font-bold tracking-tight text-[#0D0221] transition-colors group-hover:text-[#0F52BA]">
                          {enq.fullName}
                        </h4>
                        <p className="truncate text-[11px] font-medium text-slate-500">
                          {enq.propertyTitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        </span>
                        <span>New</span>
                      </span>

                      <span className="flex h-6 w-6 translate-x-1 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 opacity-0 shadow-xs transition-all duration-200 group-hover:translate-x-0 group-hover:text-[#0F52BA] group-hover:opacity-100">
                        <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recently Added Properties (5-Card Grid) */}
      <div className="space-y-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="font-sans text-base font-bold text-[#0D0221]">
              Recently Added Properties
            </h3>
            <p className="text-xs font-medium text-slate-500">
              Latest curated listings added to the active portfolio
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('properties')}
            className="flex cursor-pointer items-center gap-1 text-xs font-bold text-[#0F52BA] hover:underline"
          >
            <span>View All Properties</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {recentFive.map((prop) => (
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
      </div>
    </section>
  );
}
