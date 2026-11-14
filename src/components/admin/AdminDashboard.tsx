'use client';

import React, { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  Building2,
  CheckCircle2,
  Database,
  ExternalLink,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  RotateCcw,
  Tag,
} from 'lucide-react';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { EnquiriesManager } from '@/components/admin/EnquiriesManager';
import { HeroSlidesManager } from '@/components/admin/HeroSlidesManager';
import { PropertyManager } from '@/components/admin/PropertyManager';
import { TestimonialsManager } from '@/components/admin/TestimonialsManager';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { IdbImage } from '@/components/ui/IdbImage';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useVVStore } from '@/context/VVStoreContext';
import { getAdminSession, logoutDemoAdmin } from '@/lib/auth';
import { formatINRCompact, formatShortDate } from '@/lib/format';
import { getStorageDiagnostics } from '@/lib/idb';
import { cn } from '@/lib/utils';
import type { AdminSession } from '@/types';

type AdminTab =
  | 'overview'
  | 'properties'
  | 'hero'
  | 'testimonials'
  | 'enquiries';

const emptySubscribe = () => () => {};

export function AdminDashboard() {
  const {
    properties,
    heroSlides,
    testimonials,
    enquiries,
    resetAllDemoData,
    notify,
  } = useVVStore();

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [sessionOverride, setSessionOverride] = useState<
    AdminSession | null | undefined
  >(undefined);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [storageInfo, setStorageInfo] = useState<{
    mediaCount: number;
    usedBytes: number;
    quotaBytes: number | null;
  } | null>(null);

  const session =
    sessionOverride !== undefined
      ? sessionOverride
      : isClient
        ? getAdminSession()
        : null;
  const checkedSession = isClient;

  useEffect(() => {
    if (!session) return;
    let active = true;
    void getStorageDiagnostics().then((info) => {
      if (active) setStorageInfo(info);
    });
    return () => {
      active = false;
    };
  }, [session, properties, heroSlides, testimonials]);

  const metrics = useMemo(() => {
    const total = properties.length;
    const available = properties.filter(
      (p) => p.availability === 'available'
    ).length;
    const sold = properties.filter((p) => p.availability === 'sold').length;
    const newEnquiries = enquiries.filter((e) => e.status === 'new').length;

    const recent = [...properties]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    return { total, available, sold, newEnquiries, recent };
  }, [properties, enquiries]);

  if (!checkedSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#CDE6F5]/20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4062BB] border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return (
      <AdminLogin
        onSuccess={(nextSession) => {
          setSessionOverride(nextSession);
          notify('Signed in to VV Admin', 'success');
        }}
      />
    );
  }

  const handleLogout = () => {
    logoutDemoAdmin();
    setSessionOverride(null);
    notify('Signed out', 'info');
  };

  const handleResetDemo = async () => {
    await resetAllDemoData();
    setResetConfirmOpen(false);
    notify(
      'Demo data restored',
      'info',
      'All sample listings, hero slides, and reviews reset cleanly.'
    );
  };

  const navTabs: Array<{
    key: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      key: 'properties',
      label: 'Properties',
      icon: Building2,
      badge: properties.length,
    },
    {
      key: 'hero',
      label: 'Hero Slides',
      icon: ImageIcon,
      badge: heroSlides.length,
    },
    {
      key: 'testimonials',
      label: 'Testimonials',
      icon: MessageSquareQuote,
      badge: testimonials.length,
    },
    {
      key: 'enquiries',
      label: 'Enquiries',
      icon: Inbox,
      badge: metrics.newEnquiries || undefined,
    },
  ];

  const formatMb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <div className="min-h-screen bg-[#f6f9fc] text-[#0D0221]">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 border-b border-[#0D0221]/10 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/" className="shrink-0">
              <BrandLogo size="sm" />
            </Link>
            <span className="hidden rounded-full border border-[#4062BB]/25 bg-[#CDE6F5]/45 px-3 py-1 text-[11px] font-semibold text-[#4062BB] sm:inline-block">
              Frontend Demo · IndexedDB + localStorage
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/properties"
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#0D0221]/15 bg-white px-3 py-2 text-xs font-medium text-[#0D0221] transition-colors hover:border-[#4062BB] hover:text-[#4062BB]"
            >
              <span>Public Site</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="hidden items-center gap-1.5 rounded-lg border border-[#0D0221]/15 bg-white px-3 py-2 text-xs font-medium text-[#0D0221]/75 hover:border-[#F06543] hover:text-[#F06543] sm:inline-flex"
              title="Restore initial sample dataset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Demo</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0D0221] px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-[#4062BB]"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        {/* Tab Bar */}
        <div className="border-t border-[#0D0221]/8 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'relative inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold tracking-wide transition-colors sm:text-sm',
                    isActive
                      ? 'border-[#4062BB] text-[#4062BB]'
                      : 'border-transparent text-[#0D0221]/65 hover:text-[#0D0221]'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {typeof tab.badge === 'number' && tab.badge > 0 && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold',
                        isActive
                          ? 'bg-[#4062BB] text-white'
                          : 'bg-[#CDE6F5]/70 text-[#0D0221]'
                      )}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Greeting + Prototype Notice */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.18em] text-[#4062BB] uppercase">
                  Administration Console
                </p>
                <h1 className="mt-1 font-display text-3xl font-medium text-[#0D0221] sm:text-4xl">
                  Portfolio Dashboard
                </h1>
                <p className="mt-1 text-xs text-[#0D0221]/65">
                  Signed in as {session.email}. Changes synchronize live with
                  Landing &amp; Properties pages.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('properties')}
                className="inline-flex items-center justify-center rounded-lg bg-[#4062BB] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#0D0221]"
              >
                Manage Properties &rarr;
              </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-[#0D0221]/10 bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-[#0D0221]/60 uppercase">
                    Total Properties
                  </span>
                  <Building2 className="h-4 w-4 text-[#4062BB]" />
                </div>
                <p className="mt-3 font-display text-4xl font-medium text-[#0D0221]">
                  {metrics.total}
                </p>
                <p className="mt-1 text-xs text-[#0D0221]/60">
                  {
                    properties.filter((p) => p.publishStatus === 'published')
                      .length
                  }{' '}
                  published publicly
                </p>
              </div>

              <div className="rounded-2xl border border-[#0D0221]/10 bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-[#0D0221]/60 uppercase">
                    Available Properties
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-[#49A078]" />
                </div>
                <p className="mt-3 font-display text-4xl font-medium text-[#49A078]">
                  {metrics.available}
                </p>
                <p className="mt-1 text-xs text-[#0D0221]/60">
                  Active for acquisition
                </p>
              </div>

              <div className="rounded-2xl border border-[#0D0221]/10 bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-[#0D0221]/60 uppercase">
                    Sold Properties
                  </span>
                  <Tag className="h-4 w-4 text-[#F06543]" />
                </div>
                <p className="mt-3 font-display text-4xl font-medium text-[#F06543]">
                  {metrics.sold}
                </p>
                <p className="mt-1 text-xs text-[#0D0221]/60">
                  Marked Sold on public catalogue
                </p>
              </div>

              <div className="rounded-2xl border border-[#0D0221]/10 bg-white p-5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider text-[#0D0221]/60 uppercase">
                    New Enquiries
                  </span>
                  <Inbox className="h-4 w-4 text-[#4062BB]" />
                </div>
                <p className="mt-3 font-display text-4xl font-medium text-[#0D0221]">
                  {metrics.newEnquiries}
                </p>
                <p className="mt-1 text-xs text-[#0D0221]/60">
                  {enquiries.length} total captured leads
                </p>
              </div>
            </div>

            {/* Recently Added Properties + IndexedDB Storage Diagnostics */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="rounded-2xl border border-[#0D0221]/10 bg-white p-6 lg:col-span-8">
                <div className="flex items-center justify-between border-b border-[#0D0221]/10 pb-4">
                  <h2 className="font-display text-2xl font-medium text-[#0D0221]">
                    Recently Added Properties
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('properties')}
                    className="text-xs font-semibold text-[#4062BB] hover:underline"
                  >
                    View all
                  </button>
                </div>

                <div className="mt-4 divide-y divide-[#0D0221]/8">
                  {metrics.recent.map((prop) => (
                    <div
                      key={prop.id}
                      className="flex flex-wrap items-center justify-between gap-3 py-3.5"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-[#0D0221]/10 bg-[#CDE6F5]/25">
                          <IdbImage
                            src={prop.coverImage}
                            alt={prop.title}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#0D0221]">
                            {prop.title}
                          </p>
                          <p className="text-xs text-[#0D0221]/60">
                            {prop.area}, {prop.city} ·{' '}
                            {formatINRCompact(
                              prop.hasOffer && prop.offerPriceInr
                                ? prop.offerPriceInr
                                : prop.priceInr
                            )}{' '}
                            · Added {formatShortDate(prop.createdAt)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status={prop.availability} />
                    </div>
                  ))}
                </div>
              </div>

              {/* IndexedDB & Security Limitations Panel */}
              <div className="flex flex-col justify-between rounded-2xl border border-[#0D0221]/10 bg-[#CDE6F5]/25 p-6 lg:col-span-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#4062BB] uppercase">
                    <Database className="h-4 w-4" />
                    <span>Browser Storage Architecture</span>
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-medium text-[#0D0221]">
                    Prototype Persistence
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-[#0D0221]/75">
                    Uploaded images are persisted locally in{' '}
                    <strong>IndexedDB</strong> as compressed binary Blobs and
                    rendered via ObjectURLs. Demo session state uses{' '}
                    <strong>localStorage</strong>.
                  </p>

                  {storageInfo && (
                    <div className="mt-4 space-y-2 rounded-xl border border-[#0D0221]/10 bg-white p-3.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[#0D0221]/65">
                          Uploaded Media Blobs:
                        </span>
                        <span className="font-semibold text-[#0D0221]">
                          {storageInfo.mediaCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#0D0221]/65">
                          Origin Storage Used:
                        </span>
                        <span className="font-semibold text-[#0D0221]">
                          {formatMb(storageInfo.usedBytes)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 border-t border-[#0D0221]/10 pt-4">
                  <p className="text-[11px] leading-relaxed text-[#0D0221]/65">
                    Not a production database or cloud CDN. Clearing browser
                    site data removes local edits.
                  </p>
                  <button
                    type="button"
                    onClick={() => setResetConfirmOpen(true)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-[#0D0221]/20 bg-white py-2 text-xs font-medium text-[#0D0221] hover:border-[#F06543] hover:text-[#F06543]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Reset All Demo Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'properties' && <PropertyManager />}
        {activeTab === 'hero' && <HeroSlidesManager />}
        {activeTab === 'testimonials' && <TestimonialsManager />}
        {activeTab === 'enquiries' && <EnquiriesManager />}
      </main>

      <ConfirmModal
        open={resetConfirmOpen}
        title="Reset Demo Data"
        description="Restore all properties, hero slides, and testimonials back to the initial sample dataset and clear locally uploaded IndexedDB images and enquiries?"
        confirmLabel="Reset Everything"
        onConfirm={handleResetDemo}
        onCancel={() => setResetConfirmOpen(false)}
      />
    </div>
  );
}
