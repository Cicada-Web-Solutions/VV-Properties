'use client';

import React, { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import {
  exportEnquiriesToSafeCsv,
  formatEnquiryShortTimestamp,
  triggerTextDownload,
} from '@/lib/adminUtils';
import { cn } from '@/lib/utils';
import type { Enquiry, EnquiryStatus } from '@/types';

interface EnquiriesTabProps {
  enquiries: Enquiry[];
  onOpenEnquiry: (enquiry: Enquiry) => void;
  onCsvExported: (count: number) => Promise<void>;
}

const STATUS_BADGE: Record<
  EnquiryStatus,
  { label: string; className: string }
> = {
  new: {
    label: 'New',
    className: 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20 font-bold',
  },
  contacted: {
    label: 'Contacted',
    className: 'bg-blue-50 text-[#0F52BA] border-blue-200 font-bold',
  },
  closed: {
    label: 'Closed',
    className: 'bg-red-50 text-red-600 border-red-200 font-bold',
  },
  reviewed: {
    label: 'None',
    className: 'bg-slate-100 text-slate-500 border-slate-200 font-semibold',
  },
};

export function EnquiriesTab({
  enquiries,
  onOpenEnquiry,
  onCsvExported,
}: EnquiriesTabProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | EnquiryStatus>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return enquiries.filter((e) => {
      const matchSearch =
        !q ||
        e.fullName.toLowerCase().includes(q) ||
        e.phone.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.propertyTitle.toLowerCase().includes(q);
      const matchStatus =
        statusFilter === 'all' || e.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [enquiries, search, statusFilter]);

  const handleExportCsv = async () => {
    const csvContent = exportEnquiriesToSafeCsv(filtered);
    const todayIso = new Date().toISOString().split('T')[0];
    triggerTextDownload(
      `vv_enquiries_export_${todayIso}.csv`,
      csvContent,
      'text/csv;charset=utf-8;'
    );
    await onCsvExported(filtered.length);
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-sans text-2xl font-extrabold tracking-tight text-[#0D0221] lg:text-3xl">
            Customer Enquiries
          </h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500 lg:text-sm">
            Inbound buyer and investor requests submitted across website
            listings.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleExportCsv()}
          className="inline-flex cursor-pointer items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0D0221] shadow-sm transition-all hover:bg-slate-50"
        >
          <Download className="h-4 w-4 text-[#0F52BA]" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 text-xs shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute top-2.5 left-3.5 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name, phone, email, or property..."
            className="w-full rounded-xl border border-slate-200 py-2 pr-4 pl-10 text-xs font-medium text-slate-900 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
          />
        </div>
        <select
          aria-label="Filter enquiries by status"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as 'all' | EnquiryStatus)
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="closed">Closed</option>
          <option value="reviewed">None (Reviewed)</option>
        </select>
      </div>

      {/* Enquiries Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold tracking-wider text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-3.5">Client Name</th>
                <th className="px-6 py-3.5">Phone / Email</th>
                <th className="px-6 py-3.5">Interested Property</th>
                <th className="px-6 py-3.5">Submitted</th>
                <th className="px-6 py-3.5">Label As</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center font-medium text-slate-400"
                  >
                    No matching customer enquiries found.
                  </td>
                </tr>
              ) : (
                filtered.map((enq) => {
                  const badge = STATUS_BADGE[enq.status] ?? STATUS_BADGE.reviewed;
                  return (
                    <tr
                      key={enq.id}
                      onClick={() => onOpenEnquiry(enq)}
                      className="cursor-pointer transition-colors hover:bg-slate-50"
                    >
                      <td className="px-6 py-3.5 font-bold text-[#0D0221]">
                        {enq.fullName}
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="font-semibold text-slate-600">
                          {enq.phone}
                        </div>
                        {enq.email && (
                          <div className="text-[11px] text-slate-400">
                            {enq.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3.5 font-bold text-[#0D0221]">
                        {enq.propertyTitle}
                      </td>
                      <td className="px-6 py-3.5 font-medium whitespace-nowrap text-slate-400">
                        {formatEnquiryShortTimestamp(enq.createdAt)}
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-[10px]',
                            badge.className
                          )}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
