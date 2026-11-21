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
        <div className="bg-[#FAF6F4] pt-28 pb-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="h-96 animate-pulse rounded-md bg-[#DBCCC6]/40" />
          </div>
        </div>
      }
    >
      <PropertyDetailView />
    </Suspense>
  );
}
