'use client';

import React, { useEffect } from 'react';
import { Copy, MessageCircle, Trash2, X } from 'lucide-react';
import {
  buildWhatsAppDispatchUrl,
  formatEnquiryShortTimestamp,
} from '@/lib/adminUtils';
import { cn } from '@/lib/utils';
import type { Enquiry, EnquiryStatus } from '@/types';

interface EnquiryDossierDrawerProps {
  enquiry: Enquiry | null;
  onClose: () => void;
  onChangeStatus: (id: string, status: EnquiryStatus) => Promise<void>;
  onDelete: (enquiry: Enquiry) => void;
  onCopiedPhone: () => void;
}

export function EnquiryDossierDrawer({
  enquiry,
  onClose,
  onChangeStatus,
  onDelete,
  onCopiedPhone,
}: EnquiryDossierDrawerProps) {
  useEffect(() => {
    if (!enquiry) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [enquiry, onClose]);

  const isOpen = Boolean(enquiry);
  const whatsappUrl = enquiry ? buildWhatsAppDispatchUrl(enquiry) : '#';

  const handleCopy = async () => {
    if (!enquiry) return;
    try {
      await navigator.clipboard.writeText(enquiry.phone);
      onCopiedPhone();
    } catch {
      onCopiedPhone();
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0D0221]/30 backdrop-blur-[1px]"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="enquiryDrawer"
        aria-label="Customer Enquiry Dossier"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        )}
      >
        {enquiry && (
          <>
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[#CBD5E1] bg-[#E9F1F7] text-base font-extrabold text-[#0F52BA] shadow-sm">
                  {enquiry.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-sans text-base leading-tight font-bold text-[#0D0221]">
                    {enquiry.fullName}
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold text-slate-500">
                    {enquiry.phone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close customer dossier"
                className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-[#0D0221]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto py-4 text-xs">
              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Property of Interest
                </label>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-bold text-[#0D0221]">
                  {enquiry.propertyTitle}
                </div>
              </div>

              <div>
                <label
                  htmlFor="drawerStatusSelect"
                  className="mb-1 block text-[10px] font-bold tracking-wider text-slate-400 uppercase"
                >
                  Live Status Selector (&quot;Label As&quot;)
                </label>
                <select
                  id="drawerStatusSelect"
                  value={enquiry.status}
                  onChange={(e) =>
                    void onChangeStatus(
                      enquiry.id,
                      e.target.value as EnquiryStatus
                    )
                  }
                  className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-[#0D0221] transition-all outline-none focus:ring-2 focus:ring-[#0F52BA]/20"
                >
                  <option value="new">New Lead (Fresh)</option>
                  <option value="contacted">Contacted (In Progress)</option>
                  <option value="closed">Closed (Completed)</option>
                  <option value="reviewed">None (Reviewed)</option>
                </select>
                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  Changing status updates Executive Dashboard metrics immediately.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Email Address
                </label>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs font-semibold text-[#0D0221]">
                  {enquiry.email || 'Not provided'}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Customer Message
                </label>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 leading-relaxed font-medium text-slate-700">
                  {enquiry.message ||
                    'Requested brochure details and a private consultation.'}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  Submitted Timestamp
                </label>
                <p className="font-semibold text-slate-600">
                  {formatEnquiryShortTimestamp(enquiry.createdAt)} (Web Contact Form)
                </p>
              </div>
            </div>

            <div className="mt-auto space-y-2 border-t border-slate-100 pt-3">
              <a
                id="whatsappLink"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#10B981] py-2.5 text-xs font-bold text-white shadow-md shadow-[#10B981]/20 transition-all hover:bg-[#059669]"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Chat on WhatsApp</span>
              </a>
              <div className="grid grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => void handleCopy()}
                  className="col-span-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  <Copy className="h-3.5 w-3.5 text-slate-400" />
                  <span>Copy Phone Number</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(enquiry)}
                  aria-label="Delete enquiry"
                  title="Delete enquiry"
                  className="col-span-1 flex cursor-pointer items-center justify-center rounded-xl border border-red-200 py-2.5 text-[#EF4444] transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
