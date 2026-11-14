'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  Inbox,
  Mail,
  Phone,
  Trash2,
} from 'lucide-react';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useVVStore } from '@/context/VVStoreContext';
import { formatShortDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Enquiry } from '@/types';

export function EnquiriesManager() {
  const { enquiries, markEnquiryStatus, deleteEnquiry, notify } = useVVStore();
  const [deleteTarget, setDeleteTarget] = useState<Enquiry | null>(null);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[#0D0221]/10 bg-white p-5">
        <h2 className="font-display text-2xl font-medium text-[#0D0221]">
          Contact Enquiries Inbox
        </h2>
        <p className="mt-1 text-xs text-[#0D0221]/65">
          Submissions from the public Contact Us form appear here immediately via
          local browser storage.
        </p>
      </div>

      {enquiries.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0D0221]/20 bg-white px-6 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#CDE6F5]/40 text-[#4062BB]">
            <Inbox className="h-5 w-5" />
          </div>
          <h3 className="mt-3 font-display text-2xl font-medium text-[#0D0221]">
            No enquiries yet
          </h3>
          <p className="mt-1 max-w-sm text-xs text-[#0D0221]/65">
            Submit the Contact form on the public Landing Page or click
            &ldquo;Enquire about this property&rdquo; on any listing to test
            live lead routing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((item) => {
            const isNew = item.status === 'new';
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-[#0D0221]/10 bg-white p-5 sm:flex-row sm:items-start"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                        isNew
                          ? 'bg-[#4062BB] text-white'
                          : 'bg-[#49A078]/15 text-[#2d7251]'
                      )}
                    >
                      {isNew ? 'New Enquiry' : 'Reviewed'}
                    </span>
                    <span className="text-xs text-[#0D0221]/55">
                      {formatShortDate(item.createdAt)}
                    </span>
                    <span className="rounded-md bg-[#CDE6F5]/45 px-2.5 py-0.5 text-xs font-medium text-[#0D0221]">
                      {item.propertyTitle}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-medium text-[#0D0221]">
                    {item.fullName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#0D0221]/75">
                    <a
                      href={`tel:${item.phone}`}
                      className="inline-flex items-center gap-1.5 text-[#4062BB] hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{item.phone}</span>
                    </a>
                    {item.email && (
                      <a
                        href={`mailto:${item.email}`}
                        className="inline-flex items-center gap-1.5 text-[#4062BB] hover:underline"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span>{item.email}</span>
                      </a>
                    )}
                  </div>

                  {item.message && (
                    <p className="rounded-xl bg-[#CDE6F5]/20 p-3 text-sm text-[#0D0221]/80">
                      {item.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={async () => {
                      await markEnquiryStatus(
                        item.id,
                        isNew ? 'reviewed' : 'new'
                      );
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#0D0221]/15 px-3 py-2 text-xs font-medium text-[#0D0221] hover:border-[#4062BB]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#49A078]" />
                    <span>{isNew ? 'Mark Reviewed' : 'Reopen'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="rounded-lg border border-[#F06543]/25 p-2 text-[#F06543] hover:bg-[#F06543] hover:text-white"
                    title="Delete enquiry"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Enquiry"
        description={`Delete enquiry from "${deleteTarget?.fullName ?? ''}"?`}
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteEnquiry(deleteTarget.id);
            notify('Enquiry deleted', 'info');
          }
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
