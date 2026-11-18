'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  Building2,
  Calendar,
  ClipboardList,
  ExternalLink,
  Images,
  LayoutGrid,
  LogOut,
  Menu,
  MessageSquare,
  ShieldCheck,
  Star,
  X,
} from 'lucide-react';
import { ActivityLogsTab } from '@/components/admin/ActivityLogsTab';
import { AdminLoginScreen } from '@/components/admin/AdminLoginScreen';
import { AdminProfileTab } from '@/components/admin/AdminProfileTab';
import { BannersTab } from '@/components/admin/BannersTab';
import { DashboardOverviewTab } from '@/components/admin/DashboardOverviewTab';
import { EnquiriesTab } from '@/components/admin/EnquiriesTab';
import { EnquiryDossierDrawer } from '@/components/admin/EnquiryDossierDrawer';
import { PropertiesTab } from '@/components/admin/PropertiesTab';
import { PropertyEditorModal } from '@/components/admin/PropertyEditorModal';
import { RenamePropertyModal } from '@/components/admin/RenamePropertyModal';
import { TestimonialsTab } from '@/components/admin/TestimonialsTab';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { IdbImage } from '@/components/ui/IdbImage';
import { useVVStore } from '@/context/VVStoreContext';
import { triggerTextDownload } from '@/lib/adminUtils';
import {
  authenticateExecutiveUser,
  getAdminSession,
  logoutAdminSession,
} from '@/lib/auth';
import { cn } from '@/lib/utils';
import type {
  AdminSession,
  Enquiry,
  HeroSlide,
  Property,
  TeamAccount,
  Testimonial,
} from '@/types';

type AdminTab =
  | 'dashboard'
  | 'properties'
  | 'banners'
  | 'enquiries'
  | 'testimonials'
  | 'admin'
  | 'logs';

type ConfirmDialogState =
  | { kind: 'delete-property'; item: Property }
  | { kind: 'delete-banner'; item: HeroSlide }
  | { kind: 'delete-testimonial'; item: Testimonial }
  | { kind: 'delete-enquiry'; item: Enquiry }
  | { kind: 'delete-account'; item: TeamAccount }
  | { kind: 'logout' }
  | { kind: 'reset-demo' }
  | null;

const noopSubscribe = () => () => {};

function useIsClient(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

export function AdminDashboard() {
  const {
    properties,
    heroSlides,
    testimonials,
    enquiries,
    adminProfile,
    teamAccounts,
    activityLogs,
    isHydrated,
    notify,
    recordActivity,
    addProperty,
    updateProperty,
    renameProperty,
    deleteProperty,
    setPropertyAvailability,
    setPropertyPublishStatus,
    addHeroSlide,
    updateHeroSlide,
    deleteHeroSlide,
    moveHeroSlide,
    reorderHeroSlides,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    toggleTestimonialVisibility,
    markEnquiryStatus,
    deleteEnquiry,
    updateAdminProfile,
    addTeamAccount,
    toggleTeamAccountStatus,
    deleteTeamAccount,
    exportCatalogBackup,
    importCatalogBackup,
    resetAllDemoData,
    refreshCatalog,
  } = useVVStore();

  const isClient = useIsClient();
  const [sessionState, setSessionState] = useState<AdminSession | null>(() =>
    getAdminSession()
  );
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals & Drawers
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [renamingProperty, setRenamingProperty] = useState<Property | null>(
    null
  );
  const [openEnquiryId, setOpenEnquiryId] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmDialogState>(null);
  const [liveDisplayNamePreview, setLiveDisplayNamePreview] = useState<
    string | null
  >(null);

  const session = useMemo(() => {
    if (sessionState) return sessionState;
    return isClient ? getAdminSession() : null;
  }, [sessionState, isClient]);

  const activeEnquiry = useMemo(
    () => enquiries.find((e) => e.id === openEnquiryId) ?? null,
    [enquiries, openEnquiryId]
  );

  const newLeadsCount = useMemo(
    () => enquiries.filter((e) => e.status === 'new').length,
    [enquiries]
  );

  const headerDateText = isClient
    ? new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Executive Workspace';

  const handleLogin = (username: string, password: string) => {
    const res = authenticateExecutiveUser(
      username,
      password,
      adminProfile,
      teamAccounts
    );
    if (res.success) {
      setSessionState(res.session);
      setLiveDisplayNamePreview(null);
      void recordActivity(
        `User "${res.session.displayName}" signed in to portal`,
        'Authentication',
        res.session.displayName
      );
      notify(`Welcome back, ${res.session.displayName}`, 'success');
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const navigateTab = (tab: AdminTab) => {
    setOpenEnquiryId(null);
    setActiveTab(tab);
    setMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  };

  const handleConfirmAction = async () => {
    const target = confirmState;
    setConfirmState(null);
    if (!target) return;

    if (target.kind === 'delete-property') {
      await deleteProperty(target.item.id);
      notify(`Deleted "${target.item.title}"`, 'info');
    } else if (target.kind === 'delete-banner') {
      await deleteHeroSlide(target.item.id);
      notify('Banner slide deleted', 'info');
    } else if (target.kind === 'delete-testimonial') {
      await deleteTestimonial(target.item.id);
      notify('Testimonial removed', 'info');
    } else if (target.kind === 'delete-enquiry') {
      if (openEnquiryId === target.item.id) setOpenEnquiryId(null);
      await deleteEnquiry(target.item.id);
      notify('Enquiry deleted', 'info');
    } else if (target.kind === 'delete-account') {
      await deleteTeamAccount(target.item.id);
      notify(`Account "${target.item.username}" removed`, 'info');
    } else if (target.kind === 'logout') {
      const actor = session?.displayName || 'Administrator';
      await recordActivity(
        `${actor} logged out of session`,
        'Authentication',
        actor
      );
      logoutAdminSession();
      setSessionState(null);
      setOpenEnquiryId(null);
      setActiveTab('dashboard');
      notify('Session ended', 'info');
    } else if (target.kind === 'reset-demo') {
      await resetAllDemoData();
      notify('Catalog reset to seeded defaults', 'info');
    }
  };

  const confirmDialogCopy = (() => {
    if (!confirmState) {
      return { title: '', description: '', confirmLabel: 'Confirm', variant: 'danger' as const };
    }
    switch (confirmState.kind) {
      case 'delete-property':
        return {
          title: 'Delete Property',
          description: `Are you sure you want to delete "${confirmState.item.title}"? This removes the listing from both Admin and public catalogue.`,
          confirmLabel: 'Delete Property',
          variant: 'danger' as const,
        };
      case 'delete-banner':
        return {
          title: 'Delete Banner Slide',
          description: `Remove "${confirmState.item.headline}" from homepage carousel management?`,
          confirmLabel: 'Delete Banner',
          variant: 'danger' as const,
        };
      case 'delete-testimonial':
        return {
          title: 'Delete Testimonial',
          description: `Delete review by "${confirmState.item.clientName}"?`,
          confirmLabel: 'Delete Review',
          variant: 'danger' as const,
        };
      case 'delete-enquiry':
        return {
          title: 'Delete Enquiry',
          description: `Permanently delete enquiry from "${confirmState.item.fullName}"?`,
          confirmLabel: 'Delete Enquiry',
          variant: 'danger' as const,
        };
      case 'delete-account':
        return {
          title: 'Remove Team Account',
          description: `Remove portal access for "${confirmState.item.name}" (${confirmState.item.username})?`,
          confirmLabel: 'Remove Account',
          variant: 'danger' as const,
        };
      case 'logout':
        return {
          title: 'Sign Out',
          description: 'End your current V.V Properties Executive Suite session?',
          confirmLabel: 'Logout',
          variant: 'primary' as const,
        };
      case 'reset-demo':
        return {
          title: 'Reset All Seeded Data',
          description:
            'Restore the initial 6 properties, hero banners, testimonials, enquiries, and clear uploaded IndexedDB photos?',
          confirmLabel: 'Reset Data',
          variant: 'danger' as const,
        };
    }
  })();

  if (!isClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black font-sans text-xs text-slate-400">
        Initializing Executive Admin Suite...
      </div>
    );
  }

  if (!session) {
    return <AdminLoginScreen onLogin={handleLogin} />;
  }

  const resolvedAvatar = (() => {
    const matched = teamAccounts.find(
      (a) => a.username.toLowerCase() === session.username.toLowerCase()
    );
    if (
      session.username.toLowerCase() === adminProfile.username.toLowerCase() ||
      session.username.toLowerCase() === 'victor'
    ) {
      return adminProfile.avatar || matched?.photo || null;
    }
    return matched?.photo || null;
  })();

  const displayedName =
    liveDisplayNamePreview !== null
      ? liveDisplayNamePreview || adminProfile.displayName
      : session.username.toLowerCase() ===
            adminProfile.username.toLowerCase() ||
          session.username.toLowerCase() === 'victor'
        ? adminProfile.displayName
        : session.displayName;

  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'banners', label: 'Banner Management', icon: Images },
    {
      id: 'enquiries',
      label: 'Enquiries',
      icon: MessageSquare,
      badge: newLeadsCount,
    },
    { id: 'testimonials', label: 'Testimonials', icon: Star },
  ];

  const preferenceItems: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'admin', label: 'Admin', icon: ShieldCheck },
    { id: 'logs', label: 'Activity Logs', icon: ClipboardList },
  ];

  return (
    <div className="flex min-h-screen overflow-x-clip bg-slate-50 font-sans text-xs text-slate-800 lg:h-screen lg:overflow-hidden">
      {/* Mobile Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR (Deep Authority Navy #0D0221) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-shrink-0 flex-col border-r border-[#17083B] bg-[#0D0221] transition-transform duration-200 select-none lg:static lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between border-b border-[#17083B]/80 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center">
              <IdbImage
                src="/assets/branding/admin-logo.png"
                alt="V.V Properties Logo"
                className="h-full w-full object-contain"
                fallbackSrc="/assets/branding/logo.jpg"
              />
            </div>
            <div>
              <h1 className="font-sans text-base leading-none font-extrabold tracking-wider text-white">
                V.V PROPERTIES
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-1 text-slate-400 hover:text-white lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-6">
          <div>
            <p className="mb-2 px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Overview
            </p>
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => navigateTab(item.id)}
                      className={cn(
                        'flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-left transition-all',
                        active
                          ? 'bg-[#0F52BA] font-bold text-white shadow-lg shadow-[#0F52BA]/30'
                          : 'font-semibold text-slate-300 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </span>
                      {typeof item.badge === 'number' && (
                        <span className="rounded-full bg-[#10B981]/20 px-2 py-0.5 text-[10px] font-bold text-[#10B981]">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <p className="mb-2 px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
              Preferences
            </p>
            <ul className="space-y-1">
              {preferenceItems.map((item) => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => navigateTab(item.id)}
                      className={cn(
                        'flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
                        active
                          ? 'bg-[#0F52BA] font-bold text-white shadow-lg shadow-[#0F52BA]/30'
                          : 'font-semibold text-slate-300 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}

              <li>
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left font-semibold text-slate-300 transition-all hover:bg-white/5 hover:text-white"
                >
                  <span className="flex items-center gap-3">
                    <ExternalLink className="h-4 w-4" />
                    <span>Public Website</span>
                  </span>
                </Link>
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => setConfirmState({ kind: 'logout' })}
                  className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left font-semibold text-[#EF4444] transition-all hover:bg-[#EF4444]/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </aside>

      {/* MAIN WORKSPACE */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-200/90 bg-white px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
              <Calendar className="h-4 w-4 text-[#0F52BA]" />
              <span>{headerDateText}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#CBD5E1] bg-[#E9F1F7] text-xs font-extrabold text-[#0F52BA]">
              {resolvedAvatar ? (
                <IdbImage
                  src={resolvedAvatar}
                  alt={displayedName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{displayedName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="text-right">
              <h2 className="leading-tight text-xs font-bold text-[#0D0221]">
                {displayedName}
              </h2>
              <p className="text-[9px] font-medium tracking-wide text-slate-400">
                {session.role}
              </p>
            </div>
          </div>
        </header>

        {/* Page View Container */}
        <main className="relative flex-1 overflow-y-auto p-4 sm:p-8">
          {!isHydrated ? (
            <div className="space-y-4">
              <div className="h-12 w-64 animate-pulse rounded-xl bg-slate-200" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
                <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
                <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
                <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
              </div>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardOverviewTab
                  properties={properties}
                  enquiries={enquiries}
                  onNavigateTab={navigateTab}
                  onOpenEnquiry={(enq) => setOpenEnquiryId(enq.id)}
                  onEditProperty={(p) => {
                    setEditingProperty(p);
                    setPropertyModalOpen(true);
                  }}
                  onRenameProperty={(p) => setRenamingProperty(p)}
                  onTogglePublishProperty={(p) => {
                    const nextStatus =
                      p.publishStatus === 'published'
                        ? 'unpublished'
                        : 'published';
                    void setPropertyPublishStatus(p.id, nextStatus).then(() =>
                      notify(
                        nextStatus === 'published'
                          ? `"${p.title}" published live`
                          : `"${p.title}" moved to Draft`,
                        'info'
                      )
                    );
                  }}
                  onToggleAvailabilityProperty={(p) => {
                    const nextAvail =
                      p.availability === 'sold' ? 'available' : 'sold';
                    void setPropertyAvailability(p.id, nextAvail).then(() =>
                      notify(
                        `"${p.title}" marked ${nextAvail}`,
                        'info'
                      )
                    );
                  }}
                  onDeleteProperty={(p) =>
                    setConfirmState({ kind: 'delete-property', item: p })
                  }
                />
              )}

              {activeTab === 'properties' && (
                <PropertiesTab
                  properties={properties}
                  isHydrated={isHydrated}
                  onRefresh={refreshCatalog}
                  onAddProperty={() => {
                    setEditingProperty(null);
                    setPropertyModalOpen(true);
                  }}
                  onEditProperty={(p) => {
                    setEditingProperty(p);
                    setPropertyModalOpen(true);
                  }}
                  onRenameProperty={(p) => setRenamingProperty(p)}
                  onTogglePublishProperty={(p) => {
                    const nextStatus =
                      p.publishStatus === 'published'
                        ? 'unpublished'
                        : 'published';
                    void setPropertyPublishStatus(p.id, nextStatus).then(() =>
                      notify(
                        nextStatus === 'published'
                          ? `"${p.title}" published live`
                          : `"${p.title}" moved to Draft`,
                        'info'
                      )
                    );
                  }}
                  onToggleAvailabilityProperty={(p) => {
                    const nextAvail =
                      p.availability === 'sold' ? 'available' : 'sold';
                    void setPropertyAvailability(p.id, nextAvail).then(() =>
                      notify(
                        `"${p.title}" marked ${nextAvail}`,
                        'info'
                      )
                    );
                  }}
                  onDeleteProperty={(p) =>
                    setConfirmState({ kind: 'delete-property', item: p })
                  }
                />
              )}

              {activeTab === 'banners' && (
                <BannersTab
                  heroSlides={heroSlides}
                  onAddBanner={async (slide) => {
                    await addHeroSlide(slide);
                    notify('Banner slide added', 'success');
                  }}
                  onToggleBannerActive={async (slide) => {
                    await updateHeroSlide(slide.id, { active: !slide.active });
                    notify(
                      slide.active ? 'Slide Deactivated' : 'Slide Activated',
                      'info'
                    );
                  }}
                  onReorderBanners={async (fromIdx, toIdx) => {
                    await reorderHeroSlides(fromIdx, toIdx);
                    notify(`Slide moved to position #${toIdx + 1}`, 'success');
                  }}
                  onMoveBanner={async (id, dir) => {
                    await moveHeroSlide(id, dir);
                    notify('Slide order updated', 'success');
                  }}
                  onDeleteBanner={(slide) =>
                    setConfirmState({ kind: 'delete-banner', item: slide })
                  }
                />
              )}

              {activeTab === 'enquiries' && (
                <EnquiriesTab
                  enquiries={enquiries}
                  onOpenEnquiry={(enq) => setOpenEnquiryId(enq.id)}
                  onCsvExported={async (count) => {
                    await recordActivity(
                      `Exported ${count} customer enquiries to sanitized CSV`,
                      'Enquiries'
                    );
                    notify(`Exported ${count} enquiries CSV`, 'success');
                  }}
                />
              )}

              {activeTab === 'testimonials' && (
                <TestimonialsTab
                  testimonials={testimonials}
                  onAddTestimonial={async (payload) => {
                    await addTestimonial(payload);
                    notify('Testimonial added', 'success');
                  }}
                  onUpdateTestimonial={async (id, patch) => {
                    await updateTestimonial(id, patch);
                    notify('Testimonial updated', 'success');
                  }}
                  onToggleVisibility={async (id) => {
                    await toggleTestimonialVisibility(id);
                    notify('Testimonial visibility updated', 'info');
                  }}
                  onDeleteTestimonial={(t) =>
                    setConfirmState({ kind: 'delete-testimonial', item: t })
                  }
                />
              )}

              {activeTab === 'admin' && (
                <AdminProfileTab
                  key={`${adminProfile.username}|${adminProfile.displayName}|${adminProfile.password}|${adminProfile.avatar ?? ''}`}
                  session={session}
                  adminProfile={adminProfile}
                  teamAccounts={teamAccounts}
                  onSaveProfile={async (patch) => {
                    await updateAdminProfile(patch);
                    setLiveDisplayNamePreview(null);
                    setSessionState(getAdminSession());
                    notify(
                      patch.password !== undefined
                        ? 'Password updated successfully'
                        : patch.avatar !== undefined
                          ? 'Admin profile photo saved and synchronized'
                          : 'Admin profile saved successfully',
                      'success'
                    );
                  }}
                  onAddTeamAccount={async (input) => {
                    const result = await addTeamAccount(input);
                    if (result.success) {
                      notify(
                        `Account "${input.username.trim().toLowerCase()}" created`,
                        'success'
                      );
                    }
                    return result;
                  }}
                  onToggleAccountStatus={async (id) => {
                    await toggleTeamAccountStatus(id);
                    notify('Team account status updated', 'info');
                  }}
                  onDeleteAccount={(acc) =>
                    setConfirmState({ kind: 'delete-account', item: acc })
                  }
                  onExportBackup={async () => {
                    const payload = await exportCatalogBackup();
                    triggerTextDownload(
                      'vv_properties_catalog.json',
                      JSON.stringify(payload, null, 2),
                      'application/json'
                    );
                    notify(
                      'Downloaded vv_properties_catalog.json backup',
                      'success'
                    );
                  }}
                  onImportBackup={async (rawJson) => {
                    try {
                      const summary = await importCatalogBackup(rawJson);
                      notify(
                        `Imported ${summary.propertiesCount} properties, ${summary.bannersCount} banners, and ${summary.enquiriesCount} enquiries`,
                        'success'
                      );
                    } catch (err) {
                      notify(
                        err instanceof Error
                          ? err.message
                          : 'Failed to import JSON backup.',
                        'error'
                      );
                    }
                  }}
                  onRequestResetDemoData={() =>
                    setConfirmState({ kind: 'reset-demo' })
                  }
                  onDisplayNamePreviewChange={setLiveDisplayNamePreview}
                />
              )}

              {activeTab === 'logs' && (
                <ActivityLogsTab
                  logs={activityLogs}
                  onExportedJson={() =>
                    notify('Downloaded activity_logs.json', 'success')
                  }
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Add / Edit Property Modal */}
      {propertyModalOpen && (
        <PropertyEditorModal
          key={editingProperty?.id ?? 'new-property'}
          isOpen={propertyModalOpen}
          editingProperty={editingProperty}
          nextDisplayOrder={
            properties.reduce((min, p) => Math.min(min, p.displayOrder), 1) - 1
          }
          onClose={() => {
            setPropertyModalOpen(false);
            setEditingProperty(null);
          }}
          onSave={async (payload, existingId) => {
            if (existingId) {
              await updateProperty(existingId, payload);
              notify(`Updated "${payload.title}"`, 'success');
            } else {
              await addProperty(payload);
              notify(`Added "${payload.title}"`, 'success');
            }
            await refreshCatalog();
          }}
        />
      )}

      {/* Quick Rename Property Modal */}
      {renamingProperty && (
        <RenamePropertyModal
          key={`${renamingProperty.id}|${renamingProperty.title}`}
          property={renamingProperty}
          onClose={() => setRenamingProperty(null)}
          onSaveRename={async (id, nextTitle) => {
            await renameProperty(id, nextTitle);
            notify(`Renamed property to "${nextTitle}"`, 'success');
          }}
        />
      )}

      {/* Slide-out Customer Enquiry Dossier Drawer */}
      <EnquiryDossierDrawer
        enquiry={activeEnquiry}
        onClose={() => setOpenEnquiryId(null)}
        onChangeStatus={async (id, nextStatus) => {
          await markEnquiryStatus(id, nextStatus);
          notify('Enquiry status updated', 'success');
        }}
        onDelete={(enq) =>
          setConfirmState({ kind: 'delete-enquiry', item: enq })
        }
        onCopiedPhone={() =>
          notify('Phone number copied to clipboard', 'info')
        }
      />

      {/* Global Confirmation Modal */}
      <ConfirmModal
        open={Boolean(confirmState)}
        title={confirmDialogCopy.title}
        description={confirmDialogCopy.description}
        confirmLabel={confirmDialogCopy.confirmLabel}
        variant={confirmDialogCopy.variant}
        onConfirm={() => void handleConfirmAction()}
        onCancel={() => setConfirmState(null)}
      />
    </div>
  );
}
