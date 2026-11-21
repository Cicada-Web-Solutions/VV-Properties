import React, { Suspense } from 'react';
import { AboutSection } from '@/components/landing/AboutSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { FeaturedPropertiesSection } from '@/components/landing/FeaturedPropertiesSection';
import { HeroCarousel } from '@/components/landing/HeroCarousel';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { WhoWeAreSection } from '@/components/landing/WhoWeAreSection';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Editorial Landing Page cadence:
 * Hero Carousel + Discovery Bar -> Who We Are -> Featured Properties ->
 * Why Choose / About / Ownership Banner -> Testimonials -> Contact -> Footer
 */
export default function LandingPage() {
  return (
    <>
      <HeroCarousel />
      <WhoWeAreSection />
      <FeaturedPropertiesSection />
      <AboutSection />
      <TestimonialsSection />
      <Suspense
        fallback={
          <section id="contact" className="bg-[#491F40] py-20 lg:py-28">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="h-96 animate-pulse rounded-md bg-white/10" />
            </div>
          </section>
        }
      >
        <ContactSection />
      </Suspense>
    </>
  );
}
