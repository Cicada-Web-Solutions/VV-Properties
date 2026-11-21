import React from 'react';
import { AlertCircle } from 'lucide-react';
import type { AvailabilityStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AvailabilityStatus;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Architectural availability indicator aligned with the Golden Raisin palette:
 * - Available: crisp deep-forest dot & readable label on soft warm ivory tint
 * - Sold: Terracotta Clay (#D6866B) alert icon & label
 */
export function StatusBadge({
  status,
  size = 'sm',
  className,
}: StatusBadgeProps) {
  const isAvailable = status === 'available';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm font-semibold tracking-wide uppercase',
        size === 'sm' ? 'px-2.5 py-1 text-[10.5px]' : 'px-3 py-1.5 text-xs',
        isAvailable
          ? 'border border-[#491F40]/15 bg-[#FAF6F4] text-[#2F6A4A]'
          : 'border border-[#D6866B]/45 bg-[#D6866B]/15 text-[#9C4429]',
        className
      )}
    >
      {isAvailable ? (
        <span
          className="h-1.5 w-1.5 rounded-full bg-[#2F7D57]"
          aria-hidden="true"
        />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 text-[#D6866B]" aria-hidden="true" />
      )}
      <span>{isAvailable ? 'Available' : 'Sold'}</span>
    </span>
  );
}
