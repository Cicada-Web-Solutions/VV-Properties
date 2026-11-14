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
 * Renders the exact user-supplied V.V Properties logo mark alongside the editorial wordmark.
 */
export function BrandLogo({
  tone = 'dark',
  showWordmark = true,
  size = 'md',
  className,
}: BrandLogoProps) {
  const imgSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const dim = size === 'sm' ? 32 : 40;

  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <span
        className={cn(
          'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-white shadow-xs',
          imgSize,
          tone === 'light'
            ? 'border-white/25'
            : 'border-[#0D0221]/12'
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
              'font-display text-[19px] font-medium tracking-[0.06em] sm:text-[21px]',
              tone === 'light' ? 'text-white' : 'text-[#0D0221]'
            )}
          >
            {SITE_CONFIG.shortWordmark}
          </span>
        </span>
      )}
    </span>
  );
}
