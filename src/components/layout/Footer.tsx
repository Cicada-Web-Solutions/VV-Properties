'use client';

import React, { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Clock, Lock, Mail, MapPin, Phone, Star, X } from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { SITE_CONFIG } from '@/config/site';

type LegalDoc = 'privacy' | 'terms' | null;

const emptySubscribe = () => () => {};

export function Footer() {
  const pathname = usePathname();
  const [legalOpen, setLegalOpen] = useState<LegalDoc>(null);
  const copyrightYear = useSyncExternalStore(
    emptySubscribe,
    () => new Date().getFullYear(),
    () => 2026
  );

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <footer className="border-t border-[#0D0221]/10 bg-[#0D0221] text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
            {/* Column 1: Logo & Tagline */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-block">
                <BrandLogo tone="light" />
              </Link>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
                {SITE_CONFIG.tagline}
              </p>
              <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/60">
                Trusted residential and commercial real estate sales, land and
                plot transactions, investment guidance, and consultation in
                Coimbatore.
              </p>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-[#CDE6F5]">
                <Star className="h-3.5 w-3.5 fill-[#CDE6F5] text-[#CDE6F5]" />
                <span>{SITE_CONFIG.contact.rating.label}</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-semibold tracking-[0.16em] text-[#CDE6F5] uppercase">
                Quick Links
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm text-white/75">
                <li>
                  <Link href="/" className="transition-colors hover:text-white">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties"
                    className="transition-colors hover:text-white"
                  >
                    Properties
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#who-we-are"
                    className="transition-colors hover:text-white"
                  >
                    Who We Are
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#testimonials"
                    className="transition-colors hover:text-white"
                  >
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#about"
                    className="transition-colors hover:text-white"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="transition-colors hover:text-white"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="lg:col-span-4">
              <h3 className="text-xs font-semibold tracking-[0.16em] text-[#CDE6F5] uppercase">
                Contact Us
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-white/75">
                <li>
                  <a
                    href={SITE_CONFIG.contact.phoneHref}
                    className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-[#CDE6F5]" />
                    <span>
                      {SITE_CONFIG.contact.phoneDisplay} (
                      {SITE_CONFIG.contact.primaryContactName})
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${SITE_CONFIG.contact.email}`}
                    className="inline-flex items-center gap-2.5 break-all transition-colors hover:text-white"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-[#CDE6F5]" />
                    <span>{SITE_CONFIG.contact.email}</span>
                  </a>
                </li>
                <li className="flex items-start gap-2.5 text-white/70">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#CDE6F5]" />
                  <span>{SITE_CONFIG.contact.fullAddress}</span>
                </li>
                <li className="flex items-start gap-2.5 text-white/70">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#CDE6F5]" />
                  <span>{SITE_CONFIG.contact.workingHours}</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Follow Us */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-semibold tracking-[0.16em] text-[#CDE6F5] uppercase">
                Follow Us
              </h3>
              <div className="mt-4 flex flex-col items-start gap-3">
                <a
                  href={SITE_CONFIG.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="V.V Properties YouTube Channel"
                  className="inline-flex items-center gap-2.5 rounded-lg border border-white/15 px-3.5 py-2.5 text-xs font-medium text-white/85 transition-colors hover:border-[#CDE6F5] hover:bg-white/10 hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 shrink-0 text-[#CDE6F5]"
                    aria-hidden="true"
                  >
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3v6Z" />
                  </svg>
                  <span>YouTube</span>
                </a>
              </div>

              <div className="mt-6">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs text-white/55 transition-colors hover:text-[#CDE6F5]"
                >
                  <Lock className="h-3 w-3" />
                  <span>Admin Dashboard</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/12 pt-7 text-xs text-white/60 sm:flex-row">
            <p>
              &copy; {copyrightYear} {SITE_CONFIG.brandName}. All
              rights reserved.
            </p>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setLegalOpen('privacy')}
                className="transition-colors hover:text-white"
              >
                Privacy Policy
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setLegalOpen('terms')}
                className="transition-colors hover:text-white"
              >
                Terms of Use
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Privacy & Terms Drawer Modal */}
      {legalOpen && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#0D0221]/60 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[82vh] w-full max-w-xl overflow-y-auto rounded-xl border border-[#0D0221]/10 bg-white p-6 text-[#0D0221] shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-[#0D0221]/10 pb-4">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.16em] text-[#4062BB] uppercase">
                  V.V Properties Legal Notice
                </p>
                <h2 className="mt-1 font-display text-3xl font-medium">
                  {legalOpen === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setLegalOpen(null)}
                className="rounded-lg p-1.5 text-[#0D0221]/50 hover:bg-[#CDE6F5]/40 hover:text-[#0D0221]"
                aria-label="Close legal modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#0D0221]/80">
              {legalOpen === 'privacy' ? (
                <>
                  <p>
                    This placeholder Privacy Policy outlines how enquiry details
                    (such as name, telephone number, email address, and property
                    preference) are handled in the VV Properties frontend
                    prototype.
                  </p>
                  <p>
                    In this frontend-only preview, enquiry submissions and admin
                    updates are saved locally in your own browser storage
                    (IndexedDB and localStorage) and are not transmitted to any
                    external server. Replace this text with your formal agency
                    privacy policy before production launch.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Property listings, INR pricing figures, availability badges,
                    and descriptive specifications displayed on this website
                    constitute illustrative sample material pending final agency
                    verification.
                  </p>
                  <p>
                    All real estate acquisitions remain subject to formal legal
                    due diligence, title review, regulatory clearances, and
                    executed sale agreements. Replace these placeholder Terms
                    with counsel-approved language prior to live deployment.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setLegalOpen(null)}
                className="rounded-lg bg-[#0D0221] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#4062BB]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
