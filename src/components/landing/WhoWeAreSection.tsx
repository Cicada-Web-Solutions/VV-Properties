'use client';

import React, { useRef } from 'react';
import { ArrowDownRight } from 'lucide-react';
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
      className="border-b border-[#0D0221]/8 bg-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Image Column (Top on mobile per wireframe spec) */}
          <div data-reveal className="lg:col-span-6">
            <div className="relative overflow-hidden rounded-2xl border border-[#0D0221]/10 bg-[#CDE6F5]/25 shadow-sm">
              <IdbImage
                src={ASSETS.about.team}
                alt="VV Properties senior advisory team reviewing architectural estate blueprints"
                loading="lazy"
                className="aspect-[4/3] w-full object-cover"
              />
            </div>
          </div>

          {/* Copy + Key Metrics Column */}
          <div className="lg:col-span-6">
            <div
              data-reveal
              className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-[#0D0221]/65 uppercase"
            >
              <span>{SITE_CONFIG.whoWeAre.eyebrow}</span>
              <span className="h-px w-10 bg-[#0D0221]/20" aria-hidden="true" />
            </div>

            <AccentHeadline
              as="h2"
              text={SITE_CONFIG.whoWeAre.headline}
              accentWord={SITE_CONFIG.whoWeAre.accentWord}
              className="mt-3 font-display text-3xl leading-[1.12] font-medium text-[#0D0221] sm:text-4xl lg:text-[44px]"
            />

            <p
              data-reveal
              className="mt-5 text-base leading-relaxed text-[#0D0221]/75"
            >
              {SITE_CONFIG.whoWeAre.intro}
            </p>

            {/* 4 Key Numbers with Count-Up Animation */}
            <div
              data-reveal
              className="mt-8 grid grid-cols-2 gap-4 sm:gap-5"
            >
              {SITE_CONFIG.whoWeAre.sampleStats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-[#0D0221]/10 bg-[#CDE6F5]/20 p-4 sm:p-5"
                >
                  <div
                    data-countup
                    data-target={stat.value}
                    data-suffix={stat.suffix}
                    className="font-display text-3xl font-medium text-[#0D0221] sm:text-4xl"
                  >
                    {stat.value}
                    {stat.suffix}
                  </div>
                  <p className="mt-1 text-xs font-medium text-[#0D0221]/65">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div data-reveal className="mt-8">
              <button
                type="button"
                onClick={scrollToAbout}
                className="inline-flex items-center gap-2 rounded-lg border border-[#4062BB] bg-white px-5 py-2.5 text-sm font-medium text-[#0D0221] transition-all hover:bg-[#4062BB] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4062BB]"
              >
                <span>Read more</span>
                <ArrowDownRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
