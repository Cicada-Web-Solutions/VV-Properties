import { SITE_CONFIG } from '@/config/site';

/**
 * Formats an authoritative INR amount using the Indian numbering system (e.g. ₹ 6,85,00,000 or ₹ 25,00,000.50).
 */
export function formatINR(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return 'Price on Request';
  const hasDecimals = (amount % 1) !== 0;
  const intPart = Math.floor(amount);
  const decPart = hasDecimals ? (amount % 1).toFixed(2).slice(1) : '';
  return `₹ ${intPart.toLocaleString('en-IN')}${decPart}`;
}

/**
 * Mathematically expresses an exact INR figure in Crores or Lakhs for quick readability.
 * No currency conversion or exchange rates are used.
 */
export function formatINRCompact(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) return 'Price on Request';
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹ ${cr.toFixed(2).replace(/\.00$/, '')} Cr`;
  }
  if (amount >= 100000) {
    const lakh = amount / 100000;
    return `₹ ${lakh.toFixed(2).replace(/\.00$/, '')} L`;
  }
  return formatINR(amount);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[^\d]/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function formatShortDate(dateStr?: string): string {
  if (!dateStr) return '';
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getWhatsAppUrl(
  propertyTitle?: string,
  customNumber?: string
): string {
  const raw = (customNumber || SITE_CONFIG.contact.whatsappNumber).replace(
    /[^\d]/g,
    ''
  );
  const message = propertyTitle
    ? `Hi, I'm interested in ${propertyTitle} listed with VV Properties.`
    : `Hi VV Properties team, I would like to schedule a property consultation.`;
  return `https://wa.me/${raw}?text=${encodeURIComponent(message)}`;
}

export function getInitials(name: string): string {
  const clean = name.replace(/\(.*?\)/g, '').trim();
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'VV';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
