import React from 'react';
import Image from 'next/image';
import { ASSETS } from '@/config/assets';
import { SITE_CONFIG } from '@/config/site';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  tone?: 'dark' | 'light';
  showWordmark?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Renders the official V.V Properties logo mark alongside a sculpted two-tier architectural wordmark.
 */
export function BrandLogo({
  tone = 'dark',
  showWordmark = true,
  size = 'md',
  className,
}: BrandLogoProps) {
  const imgSize = size === 'sm' ? 'h-9 w-9' : 'h-11 w-11';
  const dim = size === 'sm' ? 36 : 44;

  return (
    <span className={cn('group inline-flex items-center gap-3', className)}>
      <span
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-sm border bg-white shadow-sm transition-transform duration-300 group-hover:scale-[1.03]',
          imgSize,
          tone === 'light'
            ? 'border-[#E0C188]/50'
            : 'border-[#DBCCC6]'
        )}
      >
        <Image
          src={ASSETS.branding.logo}
          alt={SITE_CONFIG.brandName}
          width={dim}
          height={dim}
          className="h-full w-full object-cover"
          priority
        />
      </span>
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'font-display text-[20px] font-semibold tracking-[0.12em] transition-colors sm:text-[22px]',
              tone === 'light'
                ? 'text-white group-hover:text-[#E0C188]'
                : 'text-[#491F40] group-hover:text-[#CE8936]'
            )}
          >
            {SITE_CONFIG.shortWordmark}
          </span>
          <span
            className={cn(
              'mt-[3px] text-[9px] font-semibold tracking-[0.32em] uppercase',
              tone === 'light' ? 'text-[#E0C188]' : 'text-[#9A5F1D]'
            )}
          >
            Coimbatore
          </span>
        </span>
      )}
    </span>
  );
}
