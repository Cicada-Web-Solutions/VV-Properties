import React from 'react';
import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description:
    'VV Properties frontend-only property portfolio, banner, testimonial, and enquiry administration console.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
