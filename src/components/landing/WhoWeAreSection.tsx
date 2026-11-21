'use client';

import React, { useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { AccentHeadline } from '@/components/ui/AccentHeadline';
import { IdbImage } from '@/components/ui/IdbImage';
import { ASSETS } from '@/config/assets';
import { SITE_CONFIG } from '@/config/site';
import { useCountUpOnScroll, useScrollReveal } from '@/hooks/useGsapReveal';

export function WhoWeAreSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollReveal(sectionRef, '[data-reveal]');
  useCountUpOnScroll(sectionRef, '[data-countup]');

  const scrollToAbout = () => {
    const target = document.getElementById('about');
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      id="who-we-are"
      ref={sectionRef}
      className="bg-[#FAF6F4] pt-20 pb-0 lg:pt-28"
    >
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-24">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-12 lg:gap-16">
          {/* Editorial Copy Column */}
          <div className="lg:col-span-6">
            <div
              data-reveal
              className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.26em] text-[#9A5F1D] uppercase"
            >
              <span>{SITE_CONFIG.whoWeAre.eyebrow}</span>
              <span className="h-px w-10 bg-[#CE8936]/55" aria-hidden="true" />
            </div>

            <AccentHeadline
              as="h2"
              text={SITE_CONFIG.whoWeAre.headline}
              accentWord={SITE_CONFIG.whoWeAre.accentWord}
              className="mt-3.5 font-display text-[34px] leading-[1.12] font-semibold text-[#491F40] sm:text-[42px] lg:text-[46px]"
            />

            <p
              data-reveal
              className="mt-5 max-w-xl text-base leading-[1.78] text-[#491F40]/76"
            >
              {SITE_CONFIG.whoWeAre.intro}
            </p>

            <div data-reveal className="mt-8">
              <button
                type="button"
                onClick={scrollToAbout}
                className="inline-flex items-center gap-2.5 rounded-sm border border-[#491F40] bg-transparent px-6 py-3 text-[13px] font-semibold tracking-wider text-[#491F40] uppercase transition-colors hover:bg-[#491F40] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#CE8936]"
              >
                <span>Discover Our Approach</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Architectural Framed Photo + Floating Plum Signature Box */}
          <div data-reveal className="relative pb-6 sm:pl-4 lg:col-span-6">
            <div className="vv-frame-corners">
              <span className="vv-c3" aria-hidden="true" />
              <span className="vv-c4" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-sm bg-[#DBCCC6]/40 shadow-sm">
                <IdbImage
                  src={ASSETS.about.team}
                  alt="V.V Properties real estate team reviewing property developments"
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>

            <div className="relative z-10 -mt-10 ml-3 max-w-[260px] rounded-sm border border-[#E0C188]/30 bg-[#491F40] px-7 py-6 text-white shadow-[0_24px_48px_rgba(73,31,64,0.32)] sm:absolute sm:-bottom-2 sm:-left-2 sm:mt-0 sm:ml-0">
              <p className="font-display text-[23px] leading-[1.25] font-medium">
                Your Trusted{' '}
                <span className="text-[#E0C188]">Property Partner</span>
              </p>
              <p className="mt-2 text-[11px] tracking-[0.18em] text-[#DBCCC6]/80 uppercase">
                Saibaba Colony, Coimbatore
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Crisp White 4-Column Architectural Highlight Strip (Latitude-Inspired) */}
      <div className="border-y border-[#DBCCC6]/80 bg-white py-14">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {SITE_CONFIG.whoWeAre.sampleStats.map((stat) => (
            <div
              key={stat.label}
              data-reveal
              className="border-t-2 border-[#CE8936] pt-5"
            >
              <div
                data-countup
                data-target={stat.value}
                data-suffix={stat.suffix}
                className="font-display text-4xl font-semibold text-[#491F40] sm:text-[42px]"
              >
                {stat.value}
                {stat.suffix}
              </div>
              <p className="mt-2 text-[13.5px] leading-snug text-[#491F40]/70">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
