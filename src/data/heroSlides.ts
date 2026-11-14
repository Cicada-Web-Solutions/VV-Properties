import { ASSETS } from '@/config/assets';
import type { HeroSlide } from '@/types';

/**
 * Initial Hero / Banner Carousel slides managed in /admin -> Hero Slides.
 */
export const INITIAL_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-01',
    eyebrow: 'PREMIUM REAL ESTATE',
    headline: 'Find a place to call home.',
    accentWord: 'home.',
    supportingText:
      'Discover curated luxury residences and investment-grade estates with trust, transparency, and ease.',
    ctaText: 'Explore Properties',
    ctaLink: '/properties',
    image: ASSETS.hero.slide01,
    order: 1,
    active: true,
  },
  {
    id: 'slide-02',
    eyebrow: 'ARCHITECTURAL SKY RESIDENCES',
    headline: 'Elevated living crafted for tomorrow.',
    accentWord: 'tomorrow.',
    supportingText:
      'Private full-floor penthouses and sea-facing sanctuaries tailored for discerning domestic and overseas buyers.',
    ctaText: 'View Sky Residences',
    ctaLink: '/properties?type=Penthouse',
    image: ASSETS.hero.slide02,
    order: 2,
    active: true,
  },
  {
    id: 'slide-03',
    eyebrow: 'PRIVATE ESTATES & LAND',
    headline: 'Timeless spaces, enduring value.',
    accentWord: 'value.',
    supportingText:
      'Every estate thoroughly vetted for architectural permanence, clear title diligence, and long-term appreciation.',
    ctaText: 'Schedule Private Consultation',
    ctaLink: '/#contact',
    image: ASSETS.hero.slide03,
    order: 3,
    active: true,
  },
];
