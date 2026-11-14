export type PropertyType =
  | 'Villa'
  | 'Penthouse'
  | 'Apartment'
  | 'Plot'
  | 'Commercial';

export type AvailabilityStatus = 'available' | 'sold';

export type PublishStatus = 'published' | 'unpublished';

export type AmenityKey =
  | 'infinity-pool'
  | 'private-garden'
  | 'concierge'
  | 'smart-home'
  | 'security-24x7'
  | 'private-elevator'
  | 'clubhouse'
  | 'fitness-spa'
  | 'covered-parking'
  | 'ocean-view'
  | 'solar-ready'
  | 'vaastu-compliant';

export interface PropertySpecifications {
  bedrooms?: number;
  bathrooms?: number;
  areaSqFt: number;
  plotOrFloor?: string;
  parkingSpaces?: number;
  possessionStatus: string;
  facing?: string;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  area: string;
  city: string;
  type: PropertyType;
  /** Authoritative listing price in INR */
  priceInr: number;
  hasOffer: boolean;
  /** Discounted offer price in INR when hasOffer is true */
  offerPriceInr?: number;
  offerBadgeText?: string;
  offerEndDate?: string;
  availability: AvailabilityStatus;
  publishStatus: PublishStatus;
  displayOrder: number;
  coverImage: string;
  galleryImages: string[];
  shortDescription: string;
  longDescription: string[];
  specifications: PropertySpecifications;
  amenities: AmenityKey[];
  whyBuyPoints: string[];
  callNumber?: string;
  whatsappNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlide {
  id: string;
  eyebrow: string;
  headline: string;
  /** Optional word inside headline rendered in Royal Blue (#4062BB) */
  accentWord?: string;
  supportingText: string;
  ctaText?: string;
  ctaLink?: string;
  image: string;
  order: number;
  active: boolean;
}

export interface Testimonial {
  id: string;
  clientName: string;
  locationOrProperty: string;
  rating: number;
  reviewText: string;
  photo?: string;
  visible: boolean;
  reviewUrl?: string;
  createdAt: string;
}

export interface Enquiry {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  propertyId: string;
  propertyTitle: string;
  message: string;
  status: 'new' | 'reviewed';
  createdAt: string;
}

export interface PropertyFilterState {
  search: string;
  areas: string[];
  type: PropertyType | 'all';
  minPrice: number | null;
  maxPrice: number | null;
  availability: AvailabilityStatus | 'all';
  sort: 'featured' | 'price-asc' | 'price-desc' | 'newest';
}

export interface AdminSession {
  email: string;
  name: string;
  loggedInAt: string;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}
