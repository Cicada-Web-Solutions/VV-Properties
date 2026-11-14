/**
 * Centralized brand settings, navigation, and clearly marked replaceable sample content.
 * Replace placeholder values here before connecting your live agency details and backend.
 */
export const SITE_CONFIG = {
  brandName: 'VV Properties',
  shortWordmark: 'VV PROPERTIES',
  tagline: 'Curated Luxury Residences & Strategic Real Estate Advisory',
  currency: {
    code: 'INR',
    symbol: '₹',
  },
  contact: {
    /** Replaceable sample contact details */
    phoneDisplay: '+91 98000 00000',
    phoneHref: 'tel:+919800000000',
    whatsappNumber: '919800000000',
    email: 'advisory@vvproperties-sample.example',
    addressLine1: 'Sample Advisory Suite 402, Meridian Tower',
    addressLine2: 'Financial District, Bengaluru 560001 (Sample Address)',
    workingHours: 'Monday – Saturday: 9:30 AM – 6:30 PM IST (Sample Hours)',
    mapCoordinates: {
      lat: 12.9716,
      lng: 77.5946,
      label: 'VV Properties Sample Advisory Office',
      googleMapsUrl: 'https://maps.google.com/?q=12.9716,77.5946',
    },
  },
  social: {
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    youtube: 'https://youtube.com',
  },
  whoWeAre: {
    eyebrow: 'WHO WE ARE',
    headline: 'Trusted Real Estate Guidance for Discerning Buyers.',
    accentWord: 'Discerning',
    /** 60-90 word editorial intro — replaceable sample copy */
    intro:
      'VV Properties is a boutique real estate advisory focused on architecturally distinct residences, waterfront estates, and prime land parcels for domestic and international buyers. Every property in our portfolio undergoes thorough title review, transparent valuation, and private inspection so overseas investors and families can acquire landmark spaces with clarity, discretion, and long-term confidence.',
    /** Clearly replaceable sample figures for the scroll count-up showcase */
    sampleStats: [
      { value: 12, suffix: '+', label: 'Years Advisory Focus (Sample)' },
      { value: 180, suffix: '+', label: 'Properties Curated (Sample)' },
      { value: 18, suffix: '+', label: 'Investor Jurisdictions (Sample)' },
      { value: 100, suffix: '%', label: 'Title Verification Focus (Sample)' },
    ],
  },
  about: {
    eyebrow: 'ABOUT VV PROPERTIES',
    headline: 'Building Dreams, Creating Value.',
    accentWord: 'Value.',
    storyParagraphs: [
      'Founded to elevate how discerning homeowners and overseas investors navigate prime Indian real estate, VV Properties pairs architectural taste with disciplined legal and commercial diligence. Rather than listing thousands of unvetted units, our curators select residences distinguished by light, proportion, neighborhood resilience, and generational appreciation.',
      'From initial shortlisting and virtual private walk-throughs for international buyers to final documentation and handover coordination, our dedicated advisors remain a single, accountable point of contact at every milestone.',
    ],
    pillars: [
      {
        title: 'Premium Properties',
        description: 'Architecturally vetted villas, penthouses, and prime land.',
      },
      {
        title: 'Trusted Transactions',
        description: 'Clear title diligence and transparent INR valuations.',
      },
      {
        title: 'Dedicated Support',
        description: 'End-to-end advisory for local & overseas clients.',
      },
    ],
    missionVisionValues: [
      {
        label: 'Mission',
        title: 'Clarity in Every Acquisition',
        description:
          'To represent exceptional residential and commercial assets with uncompromising transparency, verified documentation, and bespoke advisory tailored to each buyer.',
      },
      {
        label: 'Vision',
        title: 'International Benchmark',
        description:
          'To stand as the most trusted boutique property bridge connecting global diaspora and institutional private buyers with enduring architectural real estate.',
      },
      {
        label: 'Values',
        title: 'Discretion, Rigor & Craft',
        description:
          'We value long-term client stewardship over transaction volume—grounded in verified facts, honest counsel, and architectural excellence.',
      },
    ],
    leadershipNote: {
      role: 'Principal Advisory Practice (Sample Profile)',
      title: 'Private Portfolio & Cross-Border Desk',
      description:
        'Our leadership team brings together residential brokerage, NRI acquisition coordination, and architectural assessment. Replace this sample profile with actual partner biographies, credentials, and regulatory registration details before launch.',
      registrationLabel: 'Regulatory Credentials: Placeholder — Add RERA / Agency Licence IDs Here',
    },
  },
} as const;
