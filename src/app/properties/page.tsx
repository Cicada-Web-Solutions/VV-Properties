import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PropertiesCatalog } from '@/components/properties/PropertiesCatalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Curated Properties',
  description:
    'Browse residential homes, villas, plots, land parcels, and commercial spaces represented by V.V Properties in INR.',
};

export default function PropertiesPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#FAF6F4] pt-28 pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-48 animate-pulse rounded-md bg-[#DBCCC6]/40" />
          </div>
        </div>
      }
    >
      <PropertiesCatalog />
    </Suspense>
  );
}
