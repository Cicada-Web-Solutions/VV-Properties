'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowRight, Menu, X } from 'lucide-react';
import { BrandLogo } from '@/components/layout/BrandLogo';
import { cn } from '@/lib/utils';

type NavKey =
  | 'home'
  | 'properties'
  | 'who-we-are'
  | 'testimonials'
  | 'about'
  | 'contact';

interface NavItem {
  key: NavKey;
  label: string;
  href: string;
  sectionId?: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'properties', label: 'Properties', href: '/properties' },
  {
    key: 'who-we-are',
    label: 'Who We Are',
    href: '/#who-we-are',
    sectionId: 'who-we-are',
  },
  { key: 'about', label: 'About', href: '/#about', sectionId: 'about' },
  {
    key: 'testimonials',
    label: 'Testimonials',
    href: '/#testimonials',
    sectionId: 'testimonials',
  },
  { key: 'contact', label: 'Contact', href: '/#contact', sectionId: 'contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrollActiveKey, setScrollActiveKey] = useState<NavKey>('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuPath, setMobileMenuPath] = useState<string | null>(null);

  const isAdminRoute = pathname?.startsWith('/admin');
  const isHomeRoute = pathname === '/';
  const isPropertiesRoute = pathname?.startsWith('/properties');
  const mobileOpen = mobileMenuPath !== null && mobileMenuPath === pathname;
  const activeKey: NavKey = isPropertiesRoute ? 'properties' : scrollActiveKey;
  const useSolidHeader = !isHomeRoute || scrolled;

  useEffect(() => {
    const sectionIds: Array<{ id: string; key: NavKey }> = [
      { id: 'who-we-are', key: 'who-we-are' },
      { id: 'about', key: 'about' },
      { id: 'testimonials', key: 'testimonials' },
      { id: 'contact', key: 'contact' },
    ];

    const onScroll = () => {
      setScrolled(window.scrollY > 28);
      if (pathname !== '/') return;
      if (window.scrollY < 180) {
        setScrollActiveKey('home');
        return;
      }

      const viewportFocus = window.scrollY + 180;
      let matched: NavKey = 'home';
      for (const item of sectionIds) {
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= viewportFocus) {
          matched = item.key;
        }
      }
      setScrollActiveKey(matched);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  if (isAdminRoute) return null;

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    item: NavItem
  ) => {
    setMobileMenuPath(null);

    if (item.key === 'home' && pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setScrollActiveKey('home');
      return;
    }

    if (item.sectionId) {
      if (pathname === '/') {
        e.preventDefault();
        const target = document.getElementById(item.sectionId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setScrollActiveKey(item.key);
        }
      } else {
        e.preventDefault();
        router.push(`/#${item.sectionId}`);
      }
    }
  };

  const handleEnquireClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setMobileMenuPath(null);
    if (pathname === '/') {
      e.preventDefault();
      const target = document.getElementById('contact');
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setScrollActiveKey('contact');
    }
  };

  return (
    <>
      <header
        className={cn(
          'fixed top-0 right-0 left-0 z-50 w-full transition-all duration-300',
          useSolidHeader
            ? 'border-b border-[#E0C188]/20 bg-[#491F40]/96 py-3 shadow-[0_10px_32px_rgba(40,14,35,0.28)] backdrop-blur-md'
            : 'bg-gradient-to-b from-[#32132B]/80 via-[#32132B]/40 to-transparent py-4 sm:py-5'
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            onClick={(e) => {
              if (pathname === '/') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="shrink-0 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E0C188]"
          >
            <BrandLogo tone="light" />
          </Link>

          <nav
            aria-label="Primary Navigation"
            className="hidden items-center gap-8 lg:flex"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeKey === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    'group relative py-1.5 text-[13.5px] font-medium tracking-wide transition-colors',
                    isActive
                      ? 'text-[#E0C188]'
                      : 'text-[#FAF6F4]/90 hover:text-[#E0C188]'
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      'absolute right-0 bottom-0 left-0 h-[1.5px] origin-left bg-[#E0C188] transition-transform duration-300',
                      isActive
                        ? 'scale-x-100'
                        : 'scale-x-0 group-hover:scale-x-100'
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/#contact"
              onClick={handleEnquireClick}
              className="hidden items-center gap-2 rounded-sm bg-gradient-to-br from-[#E0C188] to-[#CE8936] px-5 py-2.5 text-[12.5px] font-semibold tracking-wider text-[#491F40] uppercase shadow-sm transition-all hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E0C188] sm:inline-flex"
            >
              <span>Enquire Now</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <button
              type="button"
              onClick={() =>
                setMobileMenuPath(mobileOpen ? null : pathname || '/')
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-sm border border-[#E0C188]/30 bg-[#32132B]/40 text-white transition-colors hover:border-[#E0C188] hover:text-[#E0C188] lg:hidden"
              aria-label={
                mobileOpen ? 'Close navigation menu' : 'Open navigation menu'
              }
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Height Architectural Mobile Menu Drawer */}
      <div
        className={cn(
          'fixed inset-0 z-[70] flex flex-col justify-between bg-[#491F40] p-6 pt-24 pb-8 text-white transition-transform duration-300 ease-out lg:hidden',
          mobileOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        )}
        aria-hidden={!mobileOpen}
      >
        <div>
          <div className="mb-6 flex items-center justify-between border-b border-[#E0C188]/20 pb-5">
            <BrandLogo tone="light" size="sm" />
            <button
              type="button"
              onClick={() => setMobileMenuPath(null)}
              className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#E0C188]/30 text-white hover:border-[#E0C188] hover:text-[#E0C188]"
              aria-label="Close mobile menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav
            aria-label="Mobile Navigation"
            className="flex flex-col divide-y divide-[#E0C188]/15"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeKey === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    'flex items-center justify-between py-3.5 font-display text-[26px] font-medium transition-colors',
                    isActive
                      ? 'text-[#E0C188]'
                      : 'text-white/90 hover:text-[#E0C188]'
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-[#CE8936]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-6 border-t border-[#E0C188]/15 pt-5">
          <Link
            href="/#contact"
            onClick={handleEnquireClick}
            className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-gradient-to-br from-[#E0C188] to-[#CE8936] px-6 py-3.5 text-sm font-semibold tracking-wider text-[#491F40] uppercase shadow-lg"
          >
            <span>Enquire Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
