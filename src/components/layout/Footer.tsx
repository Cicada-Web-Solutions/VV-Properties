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
      <footer className="border-t border-[#E0C188]/20 bg-[#32132B] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
            {/* Column 1: Logo & Tagline */}
            <div className="lg:col-span-4">
              <Link href="/" className="inline-block">
                <BrandLogo tone="light" />
              </Link>
              <p className="mt-5 max-w-sm font-display text-lg leading-snug text-[#E0C188]">
                {SITE_CONFIG.tagline}
              </p>
              <p className="mt-3 max-w-sm text-xs leading-relaxed text-[#DBCCC6]/80">
                Trusted residential and commercial real estate sales, land and
                plot transactions, investment guidance, and consultation in
                Coimbatore.
              </p>
              <div className="mt-5 inline-flex items-center gap-1.5 rounded-sm border border-[#E0C188]/30 bg-[#491F40]/70 px-3 py-1.5 text-xs font-medium text-[#E0C188]">
                <Star className="h-3.5 w-3.5 fill-[#CE8936] text-[#CE8936]" />
                <span>{SITE_CONFIG.contact.rating.label}</span>
              </div>
            </div>

            {/* Column 2: Quick Links */}
            <div className="lg:col-span-2">
              <h3 className="text-[11px] font-semibold tracking-[0.22em] text-[#E0C188] uppercase">
                Quick Links
              </h3>
              <ul className="mt-5 space-y-2.5 text-sm text-[#DBCCC6]/85">
                <li>
                  <Link
                    href="/"
                    className="transition-colors hover:text-[#E0C188]"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties"
                    className="transition-colors hover:text-[#E0C188]"
                  >
                    Properties
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#who-we-are"
                    className="transition-colors hover:text-[#E0C188]"
                  >
                    Who We Are
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#about"
                    className="transition-colors hover:text-[#E0C188]"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#testimonials"
                    className="transition-colors hover:text-[#E0C188]"
                  >
                    Testimonials
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="transition-colors hover:text-[#E0C188]"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Contact */}
            <div className="lg:col-span-4">
              <h3 className="text-[11px] font-semibold tracking-[0.22em] text-[#E0C188] uppercase">
                Contact Us
              </h3>
              <ul className="mt-5 space-y-3.5 text-sm text-[#DBCCC6]/90">
                <li>
                  <a
                    href={SITE_CONFIG.contact.phoneHref}
                    className="inline-flex items-center gap-2.5 transition-colors hover:text-[#E0C188]"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-[#CE8936]" />
                    <span>
                      {SITE_CONFIG.contact.phoneDisplay} (
                      {SITE_CONFIG.contact.primaryContactName})
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${SITE_CONFIG.contact.email}`}
                    className="inline-flex items-center gap-2.5 break-all transition-colors hover:text-[#E0C188]"
                  >
                    <Mail className="h-4 w-4 shrink-0 text-[#CE8936]" />
                    <span>{SITE_CONFIG.contact.email}</span>
                  </a>
                </li>
                <li className="flex items-start gap-2.5 text-[#DBCCC6]/80">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#CE8936]" />
                  <span>{SITE_CONFIG.contact.fullAddress}</span>
                </li>
                <li className="flex items-start gap-2.5 text-[#DBCCC6]/80">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-[#CE8936]" />
                  <span>{SITE_CONFIG.contact.workingHours}</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Follow Us */}
            <div className="lg:col-span-2">
              <h3 className="text-[11px] font-semibold tracking-[0.22em] text-[#E0C188] uppercase">
                Connect
              </h3>
              <div className="mt-5 flex flex-col items-start gap-3">
                <a
                  href={SITE_CONFIG.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="V.V Properties YouTube Channel"
                  className="inline-flex items-center gap-2.5 rounded-sm border border-[#E0C188]/30 bg-[#491F40]/60 px-4 py-2.5 text-xs font-medium tracking-wide text-white transition-colors hover:border-[#CE8936] hover:bg-[#491F40] hover:text-[#E0C188]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4 shrink-0 text-[#E0C188]"
                    aria-hidden="true"
                  >
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <path d="m10 15 5-3-5-3v6Z" />
                  </svg>
                  <span>YouTube</span>
                </a>
              </div>

              <div className="mt-7">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs text-[#DBCCC6]/55 transition-colors hover:text-[#E0C188]"
                >
                  <Lock className="h-3 w-3" />
                  <span>Admin Dashboard</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-[#E0C188]/15 pt-7 text-xs text-[#DBCCC6]/65 sm:flex-row">
            <p>
              &copy; {copyrightYear} {SITE_CONFIG.brandName}. All rights
              reserved.
            </p>
            <div className="flex items-center gap-5">
              <button
                type="button"
                onClick={() => setLegalOpen('privacy')}
                className="transition-colors hover:text-[#E0C188]"
              >
                Privacy Policy
              </button>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setLegalOpen('terms')}
                className="transition-colors hover:text-[#E0C188]"
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
          className="fixed inset-0 z-[90] flex items-center justify-center bg-[#32132B]/70 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[82vh] w-full max-w-xl overflow-y-auto rounded-md border border-[#DBCCC6] bg-white p-6 text-[#491F40] shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-[#DBCCC6] pb-4">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] text-[#9A5F1D] uppercase">
                  V.V Properties Legal Notice
                </p>
                <h2 className="mt-1 font-display text-3xl font-semibold text-[#491F40]">
                  {legalOpen === 'privacy' ? 'Privacy Policy' : 'Terms of Use'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setLegalOpen(null)}
                className="rounded-sm p-1.5 text-[#491F40]/50 hover:bg-[#FAF6F4] hover:text-[#491F40]"
                aria-label="Close legal modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm leading-relaxed text-[#491F40]/80">
              {legalOpen === 'privacy' ? (
                <>
                  <p>
                    This Privacy Policy outlines how enquiry details (such as
                    name, telephone number, email address, and property
                    preference) are handled by V.V Properties.
                  </p>
                  <p>
                    Enquiry submissions are recorded so our team can respond
                    promptly with requested property information, pricing, and
                    site-visit assistance.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    Property listings, INR pricing figures, availability badges,
                    and specifications displayed on this website are presented
                    for informational guidance subject to final verification.
                  </p>
                  <p>
                    All real estate transactions remain subject to formal legal
                    due diligence, title review, regulatory clearances, and
                    executed sale agreements.
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setLegalOpen(null)}
                className="rounded-sm bg-[#491F40] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#32132B]"
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
