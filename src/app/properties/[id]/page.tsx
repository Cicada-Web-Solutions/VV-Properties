import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { PropertyDetailView } from '@/components/properties/PropertyDetailView';

export const metadata: Metadata = {
  title: 'Property Details',
  description:
    'Explore architectural specifications, gallery views, INR valuation, amenities, and advisory enquiry options.',
};

export default function PropertyDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="h-96 animate-pulse rounded-2xl bg-[#CDE6F5]/30" />
        </div>
      }
    >
      <PropertyDetailView />
    </Suspense>
  );
}
