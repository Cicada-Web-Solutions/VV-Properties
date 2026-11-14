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
 * Matches the supplied Design System UI Elements:
 * - Available: #49A078 green dot & label on soft tint
 * - Sold: #F06543 coral red alert icon & label on soft tint
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
        'inline-flex items-center gap-1.5 rounded-full font-medium tracking-tight',
        size === 'sm' ? 'px-3 py-1 text-xs' : 'px-3.5 py-1.5 text-sm',
        isAvailable
          ? 'bg-[#49A078]/12 text-[#337B59] border border-[#49A078]/25'
          : 'bg-[#F06543]/12 text-[#D24B2B] border border-[#F06543]/25',
        className
      )}
    >
      {isAvailable ? (
        <span
          className="h-2 w-2 rounded-full bg-[#49A078]"
          aria-hidden="true"
        />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 text-[#F06543]" aria-hidden="true" />
      )}
      <span>{isAvailable ? 'Available' : 'Sold'}</span>
    </span>
  );
}
