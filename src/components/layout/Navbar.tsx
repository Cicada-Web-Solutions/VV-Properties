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
  {
    key: 'testimonials',
    label: 'Testimonials',
    href: '/#testimonials',
    sectionId: 'testimonials',
  },
  { key: 'about', label: 'About', href: '/#about', sectionId: 'about' },
  { key: 'contact', label: 'Contact', href: '/#contact', sectionId: 'contact' },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrollActiveKey, setScrollActiveKey] = useState<NavKey>('home');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuPath, setMobileMenuPath] = useState<string | null>(null);

  const isAdminRoute = pathname?.startsWith('/admin');
  const isPropertiesRoute = pathname?.startsWith('/properties');
  const mobileOpen = mobileMenuPath !== null && mobileMenuPath === pathname;
  const activeKey: NavKey = isPropertiesRoute ? 'properties' : scrollActiveKey;

  useEffect(() => {
    const sectionIds: Array<{ id: string; key: NavKey }> = [
      { id: 'who-we-are', key: 'who-we-are' },
      { id: 'testimonials', key: 'testimonials' },
      { id: 'about', key: 'about' },
      { id: 'contact', key: 'contact' },
    ];

    const onScroll = () => {
      setScrolled(window.scrollY > 18);
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
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-[#0D0221]/10 bg-white/95 shadow-[0_4px_24px_rgba(13,2,33,0.04)] backdrop-blur-md'
          : 'border-b border-[#0D0221]/6 bg-white/90 backdrop-blur-sm'
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={(e) => {
            if (pathname === '/') {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className="shrink-0 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4062BB]"
        >
          <BrandLogo />
        </Link>

        <nav
          aria-label="Primary Navigation"
          className="hidden items-center gap-7 lg:flex"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeKey === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={(e) => handleNavClick(e, item)}
                className={cn(
                  'relative py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-[#0D0221]'
                    : 'text-[#0D0221]/65 hover:text-[#4062BB]'
                )}
              >
                {item.label}
                <span
                  className={cn(
                    'absolute right-0 bottom-0 left-0 h-[1.5px] origin-left bg-[#4062BB] transition-transform duration-300',
                    isActive ? 'scale-x-100' : 'scale-x-0'
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
            className="hidden items-center gap-2 rounded-full bg-[#0D0221] px-5 py-2.5 text-xs font-medium tracking-wide text-white transition-all hover:bg-[#4062BB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4062BB] sm:inline-flex"
          >
            <span>Enquire Now</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={() =>
              setMobileMenuPath(mobileOpen ? null : pathname || '/')
            }
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[#0D0221]/15 text-[#0D0221] transition-colors hover:bg-[#CDE6F5]/40 lg:hidden"
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

      {/* Mobile Menu Drawer */}
      {mobileOpen && (
        <div className="border-t border-[#0D0221]/10 bg-white px-4 pt-3 pb-6 shadow-lg lg:hidden">
          <nav
            aria-label="Mobile Navigation"
            className="flex flex-col divide-y divide-[#0D0221]/8"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeKey === item.key;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    'flex items-center justify-between py-3.5 text-base font-medium transition-colors',
                    isActive ? 'text-[#4062BB]' : 'text-[#0D0221]/85'
                  )}
                >
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#4062BB]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-4 flex flex-col gap-2.5">
            <Link
              href="/#contact"
              onClick={handleEnquireClick}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#4062BB] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-[#0D0221]"
            >
              <span>Enquire Now</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
