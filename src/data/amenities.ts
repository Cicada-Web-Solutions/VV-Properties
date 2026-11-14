import type { AmenityKey } from '@/types';

export interface AmenityMeta {
  key: AmenityKey;
  label: string;
}

export const AMENITIES_CATALOG: AmenityMeta[] = [
  { key: 'infinity-pool', label: 'Infinity Pool' },
  { key: 'private-garden', label: 'Private Garden' },
  { key: 'concierge', label: 'Private Concierge' },
  { key: 'smart-home', label: 'Smart Automation' },
  { key: 'security-24x7', label: '24/7 Gated Security' },
  { key: 'private-elevator', label: 'Private Elevator' },
  { key: 'clubhouse', label: 'Residents Clubhouse' },
  { key: 'fitness-spa', label: 'Wellness & Spa' },
  { key: 'covered-parking', label: 'Covered EV Parking' },
  { key: 'ocean-view', label: 'Panoramic Views' },
  { key: 'solar-ready', label: 'Solar Integration' },
  { key: 'vaastu-compliant', label: 'Vaastu Aligned' },
];

export function getAmenityLabel(key: AmenityKey): string {
  return AMENITIES_CATALOG.find((a) => a.key === key)?.label ?? key;
}
