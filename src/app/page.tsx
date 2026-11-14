import React, { Suspense } from 'react';
import { AboutSection } from '@/components/landing/AboutSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { HeroCarousel } from '@/components/landing/HeroCarousel';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { WhoWeAreSection } from '@/components/landing/WhoWeAreSection';

/**
 * Landing Page following the exact wireframe order:
 * Header (RootLayout) -> Banner Carousel -> Who We Are -> Testimonials -> About -> Contact -> Footer (RootLayout)
 */
export default function LandingPage() {
  return (
    <>
      <HeroCarousel />
      <WhoWeAreSection />
      <TestimonialsSection />
      <AboutSection />
      <Suspense
        fallback={
          <section id="contact" className="bg-[#CDE6F5]/20 py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="h-96 animate-pulse rounded-2xl bg-white/70" />
            </div>
          </section>
        }
      >
        <ContactSection />
      </Suspense>
    </>
  );
}
