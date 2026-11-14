'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  Handshake,
  ShieldCheck,
} from 'lucide-react';
import { AccentHeadline } from '@/components/ui/AccentHeadline';
import { IdbImage } from '@/components/ui/IdbImage';
import { ASSETS } from '@/config/assets';
import { SITE_CONFIG } from '@/config/site';
import { useScrollReveal } from '@/hooks/useGsapReveal';

const PILLAR_ICONS = [Building2, ShieldCheck, Handshake];

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useScrollReveal(sectionRef, '[data-reveal]');

  return (
    <section
      id="about"
      ref={sectionRef}
      className="border-b border-[#0D0221]/8 bg-white py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Asymmetric Brand Editorial Block — Matches Supplied Visual Reference */}
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-12">
          {/* Left Architectural Feature Image */}
          <div data-reveal className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-tr-[110px] rounded-tl-2xl rounded-br-2xl rounded-bl-2xl border border-[#0D0221]/10 bg-[#CDE6F5]/30 shadow-sm">
              <IdbImage
                src={ASSETS.about.company}
                alt="VV Properties architectural showcase facade"
                loading="lazy"
                className="aspect-[4/4.2] w-full object-cover"
              />
            </div>
          </div>

          {/* Center Editorial Story + Trust Pillars */}
          <div data-reveal className="lg:col-span-4">
            <div className="inline-flex items-center gap-3 text-[11px] font-semibold tracking-[0.2em] text-[#0D0221]/65 uppercase">
              <span>{SITE_CONFIG.about.eyebrow}</span>
              <span className="h-px w-10 bg-[#0D0221]/20" aria-hidden="true" />
            </div>

            <AccentHeadline
              as="h2"
              text={SITE_CONFIG.about.headline}
              accentWord={SITE_CONFIG.about.accentWord}
              className="mt-3 font-display text-3xl leading-[1.08] font-medium text-[#0D0221] sm:text-4xl lg:text-[42px]"
            />

            <div className="mt-5 space-y-3.5 text-sm leading-relaxed text-[#0D0221]/75 sm:text-[15px]">
              {SITE_CONFIG.about.storyParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>

            {/* 3 Subtle Vertical-Divided Trust Pillars (Matches Design Reference) */}
            <div className="mt-7 grid grid-cols-3 divide-x divide-[#0D0221]/12 border-t border-b border-[#0D0221]/12 py-4">
              {SITE_CONFIG.about.pillars.map((pillar, idx) => {
                const Icon = PILLAR_ICONS[idx % PILLAR_ICONS.length];
                return (
                  <div
                    key={pillar.title}
                    className="flex flex-col items-start gap-2 px-2.5 first:pl-0 last:pr-0"
                  >
                    <Icon className="h-5 w-5 text-[#4062BB]" />
                    <span className="text-xs leading-tight font-medium text-[#0D0221]">
                      {pillar.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Inset Living Interior Card + CTA */}
          <div data-reveal className="lg:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-[#0D0221]/10 bg-white shadow-sm">
              <IdbImage
                src={ASSETS.about.interior}
                alt="Curated luxury interior residence represented by VV Properties"
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Link
                href="/properties"
                className="inline-flex items-center gap-2 border-b border-[#4062BB] pb-1 text-sm font-medium text-[#4062BB] transition-colors hover:border-[#0D0221] hover:text-[#0D0221]"
              >
                <span>Explore Portfolio</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <span className="text-[11px] font-medium tracking-wider text-[#0D0221]/50 uppercase">
                Curated Estates
              </span>
            </div>
          </div>
        </div>

        {/* Mission, Vision, Values + Advisory Team Cards (Wireframe Block 5) */}
        <div
          data-reveal
          className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {SITE_CONFIG.about.missionVisionValues.map((item) => (
            <div
              key={item.label}
              className="flex flex-col justify-between rounded-2xl border border-[#0D0221]/10 bg-white p-6 transition-colors hover:border-[#4062BB]/40"
            >
              <div>
                <span className="inline-block rounded-full bg-[#CDE6F5]/55 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-[#4062BB] uppercase">
                  {item.label}
                </span>
                <h3 className="mt-4 font-display text-2xl font-medium text-[#0D0221]">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#0D0221]/72">
                  {item.description}
                </p>
              </div>
              <div className="mt-5 h-px w-10 bg-[#4062BB]/35" />
            </div>
          ))}

          {/* Leadership / Regulatory Placeholder Card */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#0D0221]/12 bg-[#CDE6F5]/25 p-6">
            <div>
              <span className="inline-block rounded-full bg-[#0D0221] px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-white uppercase">
                Advisory Desk
              </span>
              <h3 className="mt-4 font-display text-2xl font-medium text-[#0D0221]">
                {SITE_CONFIG.about.leadershipNote.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#0D0221]/75">
                {SITE_CONFIG.about.leadershipNote.description}
              </p>
            </div>
            <p className="mt-4 border-t border-[#0D0221]/10 pt-3 text-[11px] font-medium text-[#4062BB]">
              {SITE_CONFIG.about.leadershipNote.registrationLabel}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
