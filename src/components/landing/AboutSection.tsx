'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Clock,
  Handshake,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { AccentHeadline } from '@/components/ui/AccentHeadline';
import { IdbImage } from '@/components/ui/IdbImage';
import { ASSETS } from '@/config/assets';
import { SITE_CONFIG } from '@/config/site';
import { useScrollReveal } from '@/hooks/useGsapReveal';

const PILLAR_ICONS = [Building2, ShieldCheck, Handshake];

const WHY_CHOOSE_ITEMS = [
  {
    num: '01',
    title: 'Residential & Commercial Sales',
    description:
      'Specialized support for buying and selling residential homes and commercial properties aligned with your requirements.',
  },
  {
    num: '02',
    title: 'Land & Plot Transactions',
    description:
      'Structured assistance for land and plot opportunities selected to fit your budget and long-term plans.',
  },
  {
    num: '03',
    title: 'Deep Market Knowledge',
    description:
      'Grounded local insight helping individuals, families, and investors evaluate property value with clarity.',
  },
  {
    num: '04',
    title: 'Transparent Services',
    description:
      'Honest, clear communication at every stage so clients can make confident real estate decisions.',
  },
  {
    num: '05',
    title: 'Investment Guidance',
    description:
      'Practical real estate consultation focused on matching opportunities with your needs and future goals.',
  },
  {
    num: '06',
    title: 'Personalized Support',
    description:
      'Dedicated attention built on integrity, reliability, and customer satisfaction for a smooth property journey.',
  },
] as const;

export function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  useScrollReveal(sectionRef, '[data-reveal]');

  return (
    <div ref={sectionRef}>
      {/* Why Choose V.V Properties — Signature Deep Plum 01–06 Architectural Grid */}
      <section className="bg-[#491F40] py-20 text-white lg:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-reveal className="max-w-2xl">
            <div className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.26em] text-[#E0C188] uppercase">
              <span>WHY CHOOSE V.V PROPERTIES</span>
              <span className="h-px w-10 bg-[#E0C188]/45" aria-hidden="true" />
            </div>
            <AccentHeadline
              as="h2"
              text="Property Decisions Built on Confidence."
              accentWord="Confidence."
              accentClassName="text-[#E0C188]"
              className="mt-3.5 font-display text-[34px] leading-[1.12] font-semibold text-white sm:text-[42px] lg:text-[46px]"
            />
          </div>

          <div className="mt-14 grid grid-cols-1 gap-px border border-[#E0C188]/20 bg-[#E0C188]/20 sm:grid-cols-2 lg:grid-cols-3">
            {WHY_CHOOSE_ITEMS.map((item) => (
              <div
                key={item.num}
                data-reveal
                className="bg-[#491F40] px-7 py-9 transition-colors duration-300 hover:bg-[#3B1733] sm:px-8"
              >
                <span className="font-display text-lg font-semibold tracking-[0.14em] text-[#E0C188]">
                  {item.num}
                </span>
                <h3 className="mt-3.5 font-display text-[24px] leading-snug font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[14.5px] leading-[1.7] text-[#DBCCC6]/88">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About V.V Properties — Editorial Story & Business Information */}
      <section
        id="about"
        className="border-b border-[#DBCCC6]/80 bg-white py-20 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Top Asymmetric Brand Editorial Block */}
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12">
            {/* Left Architectural Feature Image */}
            <div data-reveal className="lg:col-span-5">
              <div className="vv-frame-corners">
                <span className="vv-c3" aria-hidden="true" />
                <span className="vv-c4" aria-hidden="true" />
                <div className="relative overflow-hidden rounded-sm bg-[#DBCCC6]/35 shadow-sm">
                  <IdbImage
                    src={ASSETS.about.company}
                    alt="V.V Properties architectural showcase facade"
                    loading="lazy"
                    className="aspect-[4/4.2] w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Center Editorial Story + Trust Pillars */}
            <div data-reveal className="lg:col-span-4">
              <div className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.26em] text-[#9A5F1D] uppercase">
                <span>{SITE_CONFIG.about.eyebrow}</span>
                <span className="h-px w-10 bg-[#CE8936]/55" aria-hidden="true" />
              </div>

              <AccentHeadline
                as="h2"
                text={SITE_CONFIG.about.headline}
                accentWord={SITE_CONFIG.about.accentWord}
                className="mt-3.5 font-display text-[34px] leading-[1.08] font-semibold text-[#491F40] sm:text-4xl lg:text-[42px]"
              />

              <div className="mt-5 space-y-3.5 text-sm leading-[1.75] text-[#491F40]/76 sm:text-[15px]">
                {SITE_CONFIG.about.storyParagraphs.map((para, idx) => (
                  <p
                    key={idx}
                    className={
                      idx === SITE_CONFIG.about.storyParagraphs.length - 1
                        ? 'font-display text-lg font-semibold text-[#491F40]'
                        : undefined
                    }
                  >
                    {para}
                  </p>
                ))}
              </div>

              {/* 3 Subtle Vertical-Divided Service Pillars */}
              <div className="mt-7 grid grid-cols-3 divide-x divide-[#DBCCC6] border-y border-[#DBCCC6] py-4">
                {SITE_CONFIG.about.pillars.map((pillar, idx) => {
                  const Icon = PILLAR_ICONS[idx % PILLAR_ICONS.length];
                  return (
                    <div
                      key={pillar.title}
                      className="flex flex-col items-start gap-2 px-2.5 first:pl-0 last:pr-0"
                    >
                      <Icon className="h-5 w-5 text-[#CE8936]" />
                      <span className="text-xs leading-tight font-semibold text-[#491F40]">
                        {pillar.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Inset Living Interior Card + CTA */}
            <div data-reveal className="lg:col-span-3">
              <div className="overflow-hidden rounded-md border border-[#DBCCC6] bg-[#FAF6F4] p-2 shadow-sm">
                <IdbImage
                  src={ASSETS.about.interior}
                  alt="Curated residence interior represented by V.V Properties"
                  loading="lazy"
                  className="aspect-square w-full rounded-sm object-cover"
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Link
                  href="/properties"
                  className="inline-flex items-center gap-2 border-b border-[#CE8936] pb-1 text-sm font-semibold text-[#491F40] transition-colors hover:border-[#491F40] hover:text-[#9A5F1D]"
                >
                  <span>Explore Portfolio</span>
                  <ArrowRight className="h-4 w-4 text-[#CE8936]" />
                </Link>
                <span className="text-[10.5px] font-semibold tracking-[0.18em] text-[#9A5F1D] uppercase">
                  Coimbatore
                </span>
              </div>
            </div>
          </div>

          {/* Mission, Vision, Values + Official Business Information Card */}
          <div
            data-reveal
            className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
          >
            {SITE_CONFIG.about.missionVisionValues.map((item) => (
              <div
                key={item.label}
                className="flex flex-col justify-between rounded-md border border-[#DBCCC6] bg-[#FAF6F4] p-6 transition-colors hover:border-[#CE8936]"
              >
                <div>
                  <span className="inline-block rounded-sm bg-[#DBA79C]/25 px-3 py-1 text-[10.5px] font-semibold tracking-[0.18em] text-[#491F40] uppercase">
                    {item.label}
                  </span>
                  <h3 className="mt-4 font-display text-2xl font-semibold text-[#491F40]">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[#491F40]/74">
                    {item.description}
                  </p>
                </div>
                <div className="mt-5 h-[2px] w-10 bg-[#CE8936]/70" />
              </div>
            ))}

            {/* Official V.V Properties Business Information Card */}
            <div className="flex flex-col justify-between rounded-md border border-[#E0C188]/40 bg-[#491F40] p-6 text-white shadow-[0_14px_34px_rgba(73,31,64,0.18)]">
              <div>
                <span className="inline-block rounded-sm bg-[#E0C188] px-3 py-1 text-[10.5px] font-bold tracking-[0.16em] text-[#491F40] uppercase">
                  {SITE_CONFIG.about.businessCard.badge}
                </span>
                <h3 className="mt-4 font-display text-2xl font-semibold text-white">
                  {SITE_CONFIG.about.businessCard.title}
                </h3>
                <ul className="mt-3.5 space-y-2.5 text-xs leading-relaxed text-[#DBCCC6]/92">
                  <li className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#E0C188]" />
                    <span>{SITE_CONFIG.contact.fullAddress}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#E0C188]" />
                    <a
                      href={SITE_CONFIG.contact.phoneHref}
                      className="font-medium text-[#E0C188] hover:underline"
                    >
                      {SITE_CONFIG.contact.phoneDisplay} (
                      {SITE_CONFIG.contact.primaryContactName})
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#E0C188]" />
                    <a
                      href={`mailto:${SITE_CONFIG.contact.email}`}
                      className="break-all text-[#E0C188] hover:underline"
                    >
                      {SITE_CONFIG.contact.email}
                    </a>
                  </li>
                  <li className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#E0C188]" />
                    <span>{SITE_CONFIG.contact.workingHours}</span>
                  </li>
                </ul>
              </div>
              <div className="mt-4 flex items-center gap-1.5 border-t border-[#E0C188]/20 pt-3 text-xs font-medium text-[#E0C188]">
                <Star className="h-3.5 w-3.5 fill-[#CE8936] text-[#CE8936]" />
                <span>{SITE_CONFIG.contact.rating.label}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full-Bleed Property Ownership & Consultation Banner (Latitude-Inspired) */}
      <section className="relative overflow-hidden bg-[#32132B] py-24 text-white lg:py-28">
        <div className="absolute inset-0">
          <IdbImage
            src={ASSETS.hero.slide02}
            alt="V.V Properties featured estate vista"
            loading="lazy"
            className="h-full w-full object-cover object-center"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#32132B]/84 via-[#491F40]/82 to-[#32132B]/90"
            aria-hidden="true"
          />
        </div>

        <div
          data-reveal
          className="relative z-10 mx-auto max-w-2xl px-4 text-center sm:px-6"
        >
          <p className="text-[11px] font-semibold tracking-[0.28em] text-[#E0C188] uppercase">
            OWNERSHIP &amp; INVESTMENT GUIDANCE
          </p>
          <h2 className="mt-3.5 font-display text-[36px] leading-[1.12] font-semibold text-white sm:text-[46px]">
            Finding the Right Property{' '}
            <span className="text-[#E0C188]">for You.</span>
          </h2>
          <p className="mt-4 text-base leading-[1.75] text-[#FAF6F4]/85">
            Experience our listings, locations, and real estate guidance
            firsthand. Speak directly with Victor Paul and the V.V Properties
            team to arrange a visit or explore property tours.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-sm bg-gradient-to-br from-[#E0C188] to-[#CE8936] px-7 py-3.5 text-[13px] font-semibold tracking-wider text-[#491F40] uppercase shadow-lg transition-all hover:-translate-y-0.5 hover:brightness-105"
            >
              <span>Schedule a Consultation</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={SITE_CONFIG.contact.phoneHref}
              className="inline-flex items-center gap-2 rounded-sm border border-[#E0C188]/55 px-6 py-3.5 text-[13px] font-semibold tracking-wider text-white uppercase transition-colors hover:border-[#E0C188] hover:bg-white/10"
            >
              <Phone className="h-4 w-4 text-[#E0C188]" />
              <span>Call {SITE_CONFIG.contact.phoneDisplay}</span>
            </a>
            <a
              href={SITE_CONFIG.social.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm border border-white/35 px-6 py-3.5 text-[13px] font-semibold tracking-wider text-[#E0C188] uppercase transition-colors hover:border-[#E0C188] hover:bg-white/10"
            >
              <span>YouTube Channel</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
