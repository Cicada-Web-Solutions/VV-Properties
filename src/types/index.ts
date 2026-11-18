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

export type BadgeTag =
  | 'Featured'
  | 'New Launch'
  | 'Special Offer'
  | 'Hot Deal'
  | 'Fast Selling'
  | 'Available'
  | 'None';

export type EnquiryStatus = 'new' | 'contacted' | 'closed' | 'reviewed';

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
  badgeTag?: BadgeTag;
  customTypeLabel?: string;
  customAmenities?: string[];
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
  status: EnquiryStatus;
  createdAt: string;
}

export interface TeamAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  role: string;
  status: 'Active' | 'Suspended';
  created: string;
  photo?: string | null;
}

export interface AdminProfile {
  displayName: string;
  username: string;
  password: string;
  role: string;
  avatar?: string | null;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: number;
  username: string;
  action: string;
  module: string;
  dateStr: string;
  status: 'Success' | 'Info' | 'Warning';
}

export type TrafficRangeKey =
  | '24h'
  | '1W'
  | '1M'
  | '3M'
  | '6M'
  | '1Y'
  | 'MAX'
  | 'custom';

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
  username: string;
  name: string;
  displayName: string;
  email: string;
  role: string;
  loggedInAt: string;
  expiry?: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}
