'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, Phone, Send, X } from 'lucide-react';
import { SITE_CONFIG } from '@/config/site';
import { getWhatsAppUrl } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * Minimal, understated concierge quick-action trigger.
 * Hidden on /admin and elevated cleanly on mobile detail pages so it never overlaps sticky CTAs.
 */
export function FloatingConcierge() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname?.startsWith('/admin')) return null;

  const isPropertyDetail = /^\/properties\/.+/.test(pathname || '');

  return (
    <div
      className={cn(
        'fixed right-4 z-40 sm:right-6',
        isPropertyDetail ? 'bottom-20 md:bottom-6' : 'bottom-5 sm:bottom-6'
      )}
    >
      {open && (
        <div className="mb-3 w-64 rounded-xl border border-[#0D0221]/12 bg-white p-3.5 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#0D0221]/10 pb-2">
            <span className="text-xs font-semibold tracking-wider text-[#0D0221] uppercase">
              Private Concierge
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded p-1 text-[#0D0221]/50 hover:bg-[#CDE6F5]/40 hover:text-[#0D0221]"
              aria-label="Close concierge options"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2.5 flex flex-col gap-1.5">
            <a
              href={SITE_CONFIG.contact.phoneHref}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#0D0221] transition-colors hover:bg-[#CDE6F5]/40"
            >
              <Phone className="h-4 w-4 text-[#4062BB]" />
              <span>Call Advisory Desk</span>
            </a>
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#0D0221] transition-colors hover:bg-[#CDE6F5]/40"
            >
              <MessageCircle className="h-4 w-4 text-[#49A078]" />
              <span>WhatsApp Advisor</span>
            </a>
            <Link
              href="/#contact"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg bg-[#4062BB] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0D0221]"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Request Callback</span>
            </Link>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center gap-2 rounded-full border border-[#0D0221]/15 bg-[#0D0221] px-4 py-2.5 text-xs font-medium tracking-wide text-white shadow-lg transition-all hover:bg-[#4062BB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4062BB]"
        aria-expanded={open}
        aria-label="Open private property concierge menu"
      >
        <MessageCircle className="h-4 w-4 text-[#CDE6F5]" />
        <span className="hidden sm:inline">Private Concierge</span>
        <span className="sm:hidden">Concierge</span>
      </button>
    </div>
  );
}
