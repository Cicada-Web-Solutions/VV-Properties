/**
 * Centralized asset path registry for VV Properties.
 * Replace image files in /public/assets/... to update photography across the entire site.
 */
export const ASSETS = {
  branding: {
    logo: '/assets/branding/logo.jpg',
    favicon: '/assets/branding/favicon.png',
    // Drop vector logos into /public/assets/branding/ when supplied by brand team:
    svgLogoSlot: '/assets/branding/logo.svg',
    svgLogoWhiteSlot: '/assets/branding/logo-white.svg',
  },
  hero: {
    slide01: '/assets/hero/hero-01.jpg',
    slide02: '/assets/hero/hero-02.jpg',
    slide03: '/assets/hero/hero-03.jpg',
  },
  about: {
    company: '/assets/about/company-image.jpg',
    interior: '/assets/about/interior-image.jpg',
    team: '/assets/about/team-image.jpg',
  },
  properties: {
    p01: [
      '/assets/properties/property-01/cover.jpg',
      '/assets/properties/property-01/gallery-01.jpg',
      '/assets/properties/property-01/gallery-02.jpg',
      '/assets/properties/property-01/gallery-03.jpg',
      '/assets/properties/property-01/gallery-04.jpg',
    ],
    p02: [
      '/assets/properties/property-02/cover.jpg',
      '/assets/properties/property-02/gallery-01.jpg',
      '/assets/properties/property-02/gallery-02.jpg',
      '/assets/properties/property-02/gallery-03.jpg',
      '/assets/properties/property-02/gallery-04.jpg',
    ],
    p03: [
      '/assets/properties/property-03/cover.jpg',
      '/assets/properties/property-03/gallery-01.jpg',
      '/assets/properties/property-03/gallery-02.jpg',
      '/assets/properties/property-03/gallery-03.jpg',
    ],
    p04: [
      '/assets/properties/property-04/cover.jpg',
      '/assets/properties/property-04/gallery-01.jpg',
      '/assets/properties/property-04/gallery-02.jpg',
    ],
    p05: [
      '/assets/properties/property-05/cover.jpg',
      '/assets/properties/property-05/gallery-01.jpg',
      '/assets/properties/property-05/gallery-02.jpg',
      '/assets/properties/property-05/gallery-03.jpg',
    ],
    p06: [
      '/assets/properties/property-06/cover.jpg',
      '/assets/properties/property-06/gallery-01.jpg',
      '/assets/properties/property-06/gallery-02.jpg',
    ],
  },
} as const;
