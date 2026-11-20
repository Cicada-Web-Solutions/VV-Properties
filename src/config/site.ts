/**
 * Centralized brand settings, navigation, and official V.V Properties business information.
 */
export const SITE_CONFIG = {
  brandName: 'V.V Properties',
  shortWordmark: 'V.V PROPERTIES',
  tagline: 'Building Trust. Creating Value. Finding the Right Property for You.',
  currency: {
    code: 'INR',
    symbol: '₹',
  },
  contact: {
    primaryContactName: 'Victor Paul',
    phoneDisplay: '+91 99948 89221',
    phoneShort: '9994889221',
    phoneHref: 'tel:+919994889221',
    whatsappNumber: '919994889221',
    whatsappUrl: 'https://wa.me/919994889221',
    email: 'vvpropertiespealty@gmail.com',
    addressLine1: 'Gandhinagar, Saibaba Colony',
    addressLine2: 'Coimbatore, Tamil Nadu 641043, India',
    fullAddress:
      'Gandhinagar, Saibaba Colony, Coimbatore, Tamil Nadu 641043, India',
    workingHours: 'Monday – Sunday: 9:00 AM – 9:00 PM',
    rating: {
      score: '5/5',
      reviewCount: 8,
      label: '5/5 (8 reviews)',
    },
    mapCoordinates: {
      lat: 11.0282,
      lng: 76.9465,
      label: 'Gandhinagar, Saibaba Colony, Coimbatore',
      embedUrl:
        'https://maps.google.com/maps?q=Gandhinagar,+Saibaba+Colony,+Coimbatore,+Tamil+Nadu+641043,+India&z=15&output=embed',
      googleMapsUrl:
        'https://www.google.com/maps/dir/?api=1&destination=Gandhinagar,+Saibaba+Colony,+Coimbatore,+Tamil+Nadu+641043,+India',
    },
  },
  social: {
    youtube: 'https://youtube.com/@v.vproperties',
  },
  whoWeAre: {
    eyebrow: 'WHO WE ARE',
    headline: 'Trusted Real Estate Guidance for Discerning Buyers.',
    accentWord: 'Discerning',
    intro:
      'V.V Properties is a trusted real estate company committed to helping clients buy, sell, and invest in properties with confidence. We specialize in residential and commercial real estate, offering transparent services, expert guidance, and personalized support. With deep market knowledge, we assist individuals, families, and investors in finding properties that match their needs, budget, and future goals.',
    /** Clearly replaceable sample figures for the scroll count-up showcase */
    sampleStats: [
      { value: 12, suffix: '+', label: 'Years Advisory Focus (Sample)' },
      { value: 180, suffix: '+', label: 'Properties Curated (Sample)' },
      { value: 18, suffix: '+', label: 'Investor Jurisdictions (Sample)' },
      { value: 100, suffix: '%', label: 'Title Verification Focus (Sample)' },
    ],
  },
  about: {
    eyebrow: 'ABOUT V.V PROPERTIES',
    headline: 'Building Trust. Creating Value.',
    accentWord: 'Value.',
    storyParagraphs: [
      'V.V Properties is a trusted real estate company committed to helping clients buy, sell, and invest in properties with confidence. We specialize in residential and commercial real estate, offering transparent services, expert guidance, and personalized support. With deep market knowledge, we assist individuals, families, and investors in finding properties that match their needs, budget, and future goals.',
      'Our services include residential and commercial property sales, land and plot transactions, investment guidance, and real estate consultation. At V.V Properties, we focus on integrity, reliability, and customer satisfaction, ensuring a smooth and hassle-free property journey.',
      'Building Trust. Creating Value. Finding the Right Property for You.',
    ],
    pillars: [
      {
        title: 'Residential & Commercial',
        description: 'Property sales tailored to your needs and budget.',
      },
      {
        title: 'Land & Plots',
        description: 'Transparent land and plot transactions.',
      },
      {
        title: 'Investment Guidance',
        description: 'Expert real estate consultation and support.',
      },
    ],
    missionVisionValues: [
      {
        label: 'Mission',
        title: 'Invest with Confidence',
        description:
          'To offer transparent services, expert guidance, and personalized support across residential and commercial property sales, land and plot transactions, and real estate consultation.',
      },
      {
        label: 'Vision',
        title: 'Finding the Right Property',
        description:
          'To assist individuals, families, and investors with deep market knowledge in finding properties that match their needs, budget, and future goals.',
      },
      {
        label: 'Values',
        title: 'Integrity & Reliability',
        description:
          'At V.V Properties, we focus on integrity, reliability, and customer satisfaction, ensuring a smooth and hassle-free property journey.',
      },
    ],
    businessCard: {
      badge: 'V.V Properties',
      title: 'Coimbatore Office',
    },
  },
} as const;
