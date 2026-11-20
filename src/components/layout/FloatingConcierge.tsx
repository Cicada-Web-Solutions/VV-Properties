'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { SITE_CONFIG } from '@/config/site';
import { cn } from '@/lib/utils';

/**
 * Floating WhatsApp quick-chat button.
 * Hidden on /admin and elevated cleanly on mobile detail pages so it never overlaps sticky CTAs.
 */
export function FloatingConcierge() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) return null;

  const isPropertyDetail = /^\/properties\/.+/.test(pathname || '');

  return (
    <div
      className={cn(
        'fixed right-4 z-40 sm:right-6',
        isPropertyDetail ? 'bottom-20 md:bottom-6' : 'bottom-5 sm:bottom-6'
      )}
    >
      <a
        href={SITE_CONFIG.contact.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with V.V Properties on WhatsApp"
        className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.38)] transition-all duration-200 hover:scale-105 hover:bg-[#1EBE5D] hover:shadow-[0_10px_28px_rgba(37,211,102,0.48)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        <svg
          viewBox="0 0 32 32"
          fill="currentColor"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path d="M16.004 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.256.588 4.458 1.706 6.398L3.1 28.9l6.678-1.752a12.74 12.74 0 0 0 6.226 1.616h.006c7.058 0 12.8-5.742 12.8-12.8 0-3.42-1.332-6.634-3.752-9.052A12.716 12.716 0 0 0 16.004 3.2zm0 23.384h-.004a10.58 10.58 0 0 1-5.394-1.478l-.386-.23-3.964 1.04 1.058-3.864-.252-.4a10.553 10.553 0 0 1-1.622-5.652c0-5.844 4.756-10.6 10.606-10.6 2.832 0 5.492 1.104 7.494 3.108a10.526 10.526 0 0 1 3.102 7.496c0 5.846-4.756 10.58-10.638 10.58zm5.814-7.926c-.318-.16-1.884-.93-2.176-1.036-.292-.106-.504-.16-.716.16-.212.318-.822 1.036-1.008 1.248-.186.212-.372.238-.69.08-.318-.16-1.344-.496-2.56-1.58-.946-.844-1.586-1.886-1.772-2.204-.186-.318-.02-.49.14-.648.144-.142.318-.372.478-.558.16-.186.212-.318.318-.53.106-.212.054-.398-.026-.558-.08-.16-.716-1.726-.982-2.362-.258-.62-.52-.536-.716-.546-.186-.01-.398-.012-.61-.012s-.558.08-.85.398c-.292.318-1.114 1.088-1.114 2.654s1.14 3.078 1.3 3.29c.16.212 2.244 3.428 5.438 4.806.76.328 1.352.524 1.814.67.762.242 1.456.208 2.004.126.612-.092 1.884-.77 2.15-1.514.266-.744.266-1.382.186-1.514-.08-.132-.292-.212-.61-.372z" />
        </svg>
      </a>
    </div>
  );
}
