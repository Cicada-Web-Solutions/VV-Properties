import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PropertiesCatalog } from '@/components/properties/PropertiesCatalog';

export const metadata: Metadata = {
  title: 'Curated Properties',
  description:
    'Browse luxury villas, penthouses, residences, land parcels, and commercial spaces curated by VV Properties in INR.',
};

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="h-44 animate-pulse rounded-2xl bg-[#CDE6F5]/30" />
        </div>
      }
    >
      <PropertiesCatalog />
    </Suspense>
  );
}
