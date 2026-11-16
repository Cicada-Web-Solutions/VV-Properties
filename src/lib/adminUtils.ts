import { getAmenityLabel } from '@/data/amenities';
import { TRAFFIC_DATASET } from '@/data/trafficData';
import type {
  ActivityLogEntry,
  AmenityKey,
  BadgeTag,
  Enquiry,
  EnquiryStatus,
  Property,
  PropertyType,
  TrafficRangeKey,
} from '@/types';

export interface PresetAmenityItem {
  name: string;
  iconName:
    | 'bed-double'
    | 'waves'
    | 'dumbbell'
    | 'shield-check'
    | 'car'
    | 'trees'
    | 'zap'
    | 'arrow-up-down'
    | 'droplets'
    | 'video'
    | 'smile'
    | 'battery-charging';
  mappedKey?: AmenityKey;
}

export const TEAMMATE_PRESET_AMENITIES: PresetAmenityItem[] = [
  { name: 'Bedrooms', iconName: 'bed-double' },
  { name: 'Swimming Pool', iconName: 'waves', mappedKey: 'infinity-pool' },
  { name: 'Clubhouse & Gym', iconName: 'dumbbell', mappedKey: 'clubhouse' },
  { name: '24/7 Security', iconName: 'shield-check', mappedKey: 'security-24x7' },
  { name: 'Covered Parking', iconName: 'car', mappedKey: 'covered-parking' },
  { name: 'Private Garden', iconName: 'trees', mappedKey: 'private-garden' },
  { name: 'Power Backup', iconName: 'zap', mappedKey: 'solar-ready' },
  { name: 'Elevator / Lift', iconName: 'arrow-up-down', mappedKey: 'private-elevator' },
  { name: 'Water Supply', iconName: 'droplets', mappedKey: 'vaastu-compliant' },
  { name: 'CCTV Surveillance', iconName: 'video', mappedKey: 'smart-home' },
  { name: 'Children Play Area', iconName: 'smile', mappedKey: 'concierge' },
  { name: 'EV Charging Station', iconName: 'battery-charging', mappedKey: 'fitness-spa' },
];

const KEY_TO_PRESET_LABEL: Record<AmenityKey, string> = {
  'infinity-pool': 'Swimming Pool',
  'private-garden': 'Private Garden',
  concierge: 'Children Play Area',
  'smart-home': 'CCTV Surveillance',
  'security-24x7': '24/7 Security',
  'private-elevator': 'Elevator / Lift',
  clubhouse: 'Clubhouse & Gym',
  'fitness-spa': 'EV Charging Station',
  'covered-parking': 'Covered Parking',
  'ocean-view': 'Ocean View',
  'solar-ready': 'Power Backup',
  'vaastu-compliant': 'Water Supply',
};

export function mapAmenityLabelsToStore(labels: string[]): {
  amenities: AmenityKey[];
  customAmenities: string[];
} {
  const keys = new Set<AmenityKey>();
  const custom: string[] = [];

  for (const raw of labels) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    const lower = trimmed.toLowerCase();

    const preset = TEAMMATE_PRESET_AMENITIES.find(
      (a) => a.name.toLowerCase() === lower
    );
    if (preset?.mappedKey) {
      keys.add(preset.mappedKey);
      if (!custom.includes(trimmed)) custom.push(trimmed);
      continue;
    }

    if (lower.includes('pool')) keys.add('infinity-pool');
    else if (lower.includes('garden') || lower.includes('lawn')) keys.add('private-garden');
    else if (lower.includes('security') || lower.includes('guard')) keys.add('security-24x7');
    else if (lower.includes('park')) keys.add('covered-parking');
    else if (lower.includes('lift') || lower.includes('elevat')) keys.add('private-elevator');
    else if (lower.includes('club') || lower.includes('gym')) keys.add('clubhouse');
    else if (lower.includes('spa') || lower.includes('ev ') || lower.includes('charg')) keys.add('fitness-spa');
    else if (lower.includes('smart') || lower.includes('cctv')) keys.add('smart-home');
    else if (lower.includes('solar') || lower.includes('power')) keys.add('solar-ready');
    else if (lower.includes('vaastu') || lower.includes('water')) keys.add('vaastu-compliant');
    else if (lower.includes('sea') || lower.includes('ocean') || lower.includes('view')) keys.add('ocean-view');
    else if (lower.includes('concierge') || lower.includes('play')) keys.add('concierge');

    if (!custom.includes(trimmed)) {
      custom.push(trimmed);
    }
  }

  return {
    amenities: Array.from(keys),
    customAmenities: custom,
  };
}

export function getAmenityLabelsForProperty(property: Property): string[] {
  if (property.customAmenities && property.customAmenities.length > 0) {
    return property.customAmenities;
  }
  return property.amenities.map(
    (key) => KEY_TO_PRESET_LABEL[key] ?? getAmenityLabel(key)
  );
}

/**
 * Parses INR price strings like "₹1.85 Cr", "₹78 L", "68500000", "₹45,00,000" into numeric INR.
 */
export function parseInrPriceInput(raw: string): number {
  const cleaned = raw.trim().toLowerCase().replace(/[₹,\s]/g, '');
  if (!cleaned) return 0;

  const crMatch = cleaned.match(/^([\d.]+)(?:cr|crore|crores)$/);
  if (crMatch) {
    return Math.round(parseFloat(crMatch[1]) * 10_000_000);
  }

  const lakhMatch = cleaned.match(/^([\d.]+)(?:l|lac|lacs|lakh|lakhs)$/);
  if (lakhMatch) {
    return Math.round(parseFloat(lakhMatch[1]) * 100_000);
  }

  const kMatch = cleaned.match(/^([\d.]+)k$/);
  if (kMatch) {
    return Math.round(parseFloat(kMatch[1]) * 1_000);
  }

  const num = Number(cleaned.replace(/[^0-9.]/g, ''));
  return Number.isFinite(num) && num > 0 ? Math.round(num) : 0;
}

export function normalizePropertyType(rawType: string): PropertyType {
  const lower = rawType.toLowerCase();
  if (lower.includes('penthouse')) return 'Penthouse';
  if (lower.includes('villa') || lower.includes('bungalow')) return 'Villa';
  if (lower.includes('plot') || lower.includes('land')) return 'Plot';
  if (lower.includes('commercial') || lower.includes('office') || lower.includes('retail')) {
    return 'Commercial';
  }
  return 'Apartment';
}

export function splitLocationAreaCity(
  locationInput: string,
  fallbackCity = 'Chennai'
): { area: string; city: string } {
  const parts = locationInput
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length >= 2) {
    return {
      area: parts.slice(0, -1).join(', '),
      city: parts[parts.length - 1],
    };
  }
  return {
    area: parts[0] ?? 'Prime Enclave',
    city: fallbackCity,
  };
}

export function inferBadgeTag(property: Property): BadgeTag {
  if (property.badgeTag) return property.badgeTag;
  const offer = (property.offerBadgeText ?? '').toLowerCase();
  if (offer.includes('special') || offer.includes('pre-launch') || offer.includes('launch') && offer.includes('offer')) {
    return 'Special Offer';
  }
  if (offer.includes('new') || offer.includes('launch')) return 'New Launch';
  if (offer.includes('hot')) return 'Hot Deal';
  if (offer.includes('featured') || property.hasOffer) return 'Featured';
  return 'None';
}

export function makePropertySlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return base || `property-${Date.now()}`;
}

export function extractBhkCount(typeText: string): number | undefined {
  const m = typeText.match(/(\d+)\s*bhk/i);
  if (m) return Number(m[1]);
  return undefined;
}

export function getDisplayLocation(property: Property): string {
  return property.city ? `${property.area}, ${property.city}` : property.area;
}

/**
 * Formats dates consistently across Activity Logs and Enquiry timestamps ("15 Nov 2026, 10:22:15 AM").
 */
export function formatExactAuditDateTime(dateInput: Date | string = new Date()): string {
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return '—';
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${month} ${year}, ${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
}

export function formatEnquiryShortTimestamp(isoDate: string): string {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;
  const day = String(d.getDate()).padStart(2, '0');
  const month = d.toLocaleDateString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${day} ${month} ${year}, ${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
}

const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export function pruneActivityLogs(
  logs: ActivityLogEntry[],
  referenceNowMs = Date.now()
): ActivityLogEntry[] {
  const cutoff = referenceNowMs - FOURTEEN_DAYS_MS;
  return logs.filter((entry) => entry.timestamp >= cutoff);
}

/**
 * CWE-1236 CSV formula-injection sanitizer + RFC 4180 quoting.
 */
function sanitizeCsvCell(value: string): string {
  let clean = (value ?? '').replace(/\r?\n/g, ' ').trim();
  if (/^[=+\-@\t\r]/.test(clean)) {
    clean = `'${clean}`;
  }
  if (clean.includes('"') || clean.includes(',') || clean.includes('\n')) {
    clean = `"${clean.replace(/"/g, '""')}"`;
  }
  return clean;
}

export function exportEnquiriesToSafeCsv(enquiries: Enquiry[]): string {
  const headers = [
    'Lead ID',
    'Client Name',
    'Phone Number',
    'Email Address',
    'Interested Property',
    'Status',
    'Submitted Timestamp',
    'Message',
  ];

  const statusMap: Record<EnquiryStatus, string> = {
    new: 'New',
    contacted: 'Contacted',
    closed: 'Closed',
    reviewed: 'None',
  };

  const rows = enquiries.map((e) => [
    e.id,
    e.fullName,
    e.phone,
    e.email || '—',
    e.propertyTitle,
    statusMap[e.status] ?? e.status,
    formatEnquiryShortTimestamp(e.createdAt),
    e.message || '—',
  ]);

  const csvLines = [
    headers.map(sanitizeCsvCell).join(','),
    ...rows.map((r) => r.map(sanitizeCsvCell).join(',')),
  ];
  return csvLines.join('\r\n');
}

export function triggerTextDownload(
  filename: string,
  content: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function buildWhatsAppDispatchUrl(enquiry: Enquiry): string {
  const digits = (enquiry.phone || '').replace(/[^0-9]/g, '');
  const formatted = digits.startsWith('91')
    ? digits
    : digits.length === 10
      ? `91${digits}`
      : digits;
  const text = `Hello ${enquiry.fullName}, thank you for contacting V.V Properties regarding ${enquiry.propertyTitle}. We would be delighted to assist you with property details and schedule a private site visit.`;
  return formatted
    ? `https://wa.me/${formatted}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export interface ChartDataPoint {
  x: number;
  y: number;
  label: string;
  visits: number;
}

export interface TrafficChartComputed {
  points: ChartDataPoint[];
  xLabels: string[];
  polylinePoints: string;
  areaPoints: string;
  totalVisits: number;
  rangeSummary: string;
}

const ANCHOR_END_DATE = new Date(2026, 10, 14); // 2026-11-14 end of traffic.json

function formatDdMmYy(d: Date, includeYear: boolean): string {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  if (!includeYear) return `${dd}/${mm}`;
  return `${dd}/${mm}/${String(d.getFullYear()).slice(-2)}`;
}

/**
 * Generates smooth SVG chart coordinates from teammate's traffic dataset (or hourly slice for 24h)
 * cleanly without making any backend API requests.
 */
export function computeTrafficChart(
  range: TrafficRangeKey,
  customFrom?: string,
  customTo?: string
): TrafficChartComputed {
  const width = 500;
  const minY = 18;
  const maxY = 128;

  if (range === '24h') {
    const hourlyVisits = [64, 58, 72, 86, 98, 114, 104, 121, 112, 134, 126, 141, 132];
    const hourLabels = ['12:00 AM', '6:00 AM', '12:00 PM', '6:00 PM', '11:59 PM'];
    const minV = Math.min(...hourlyVisits);
    const maxV = Math.max(...hourlyVisits);
    const span = Math.max(1, maxV - minV);

    const points: ChartDataPoint[] = hourlyVisits.map((visits, idx) => {
      const x = Math.round((idx / (hourlyVisits.length - 1)) * width);
      const norm = (visits - minV) / span;
      const y = Math.round(maxY - norm * (maxY - minY));
      return {
        x,
        y,
        label: `Today · ${String((idx * 2) % 24).padStart(2, '0')}:00`,
        visits,
      };
    });

    const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
    return {
      points,
      xLabels: hourLabels,
      polylinePoints,
      areaPoints: `0,150 ${polylinePoints} ${width},150`,
      totalVisits: hourlyVisits.reduce((acc, v) => acc + v, 0),
      rangeSummary: 'Last 24 Hours',
    };
  }

  let start = new Date(ANCHOR_END_DATE);
  let end = new Date(ANCHOR_END_DATE);

  if (range === '1W') start.setDate(end.getDate() - 7);
  else if (range === '1M') start.setDate(end.getDate() - 30);
  else if (range === '3M') start.setDate(end.getDate() - 90);
  else if (range === '6M') start.setDate(end.getDate() - 180);
  else if (range === '1Y') start.setDate(end.getDate() - 365);
  else if (range === 'MAX') start = new Date(2025, 0, 1);
  else if (range === 'custom' && customFrom && customTo) {
    const parsedFrom = new Date(customFrom);
    const parsedTo = new Date(customTo);
    if (!Number.isNaN(parsedFrom.getTime()) && !Number.isNaN(parsedTo.getTime())) {
      start = parsedFrom <= parsedTo ? parsedFrom : parsedTo;
      end = parsedFrom <= parsedTo ? parsedTo : parsedFrom;
    } else {
      start.setDate(end.getDate() - 90);
    }
  } else {
    start.setDate(end.getDate() - 90);
  }

  const startIso = start.toISOString().split('T')[0];
  const endIso = end.toISOString().split('T')[0];

  let filtered = TRAFFIC_DATASET.filter(
    (entry) => entry.date >= startIso && entry.date <= endIso
  );

  if (filtered.length < 2) {
    // Graceful undulating fallback if user chooses future custom dates beyond dataset
    filtered = TRAFFIC_DATASET.slice(-15);
  }

  const nPoints = Math.min(13, filtered.length);
  const step = (filtered.length - 1) / Math.max(1, nPoints - 1);
  const sampled = Array.from({ length: nPoints }, (_, idx) => {
    const rec = filtered[Math.round(idx * step)];
    return rec;
  });

  const visitsArr = sampled.map((s) => s.visits);
  const minV = Math.min(...visitsArr);
  const maxV = Math.max(...visitsArr);
  const span = Math.max(1, maxV - minV);

  const points: ChartDataPoint[] = sampled.map((rec, idx) => {
    const x = Math.round((idx / Math.max(1, sampled.length - 1)) * width);
    const norm = (rec.visits - minV) / span;
    const y = Math.round(maxY - norm * (maxY - minY));
    const [yr, mo, dy] = rec.date.split('-');
    return {
      x,
      y,
      label: `${dy}/${mo}/${yr}`,
      visits: rec.visits,
    };
  });

  const includeYear = range === '1Y' || range === 'MAX' || range === 'custom';
  const xLabels: string[] = [];
  for (let k = 0; k < 5; k++) {
    const idx = Math.round((k * (filtered.length - 1)) / 4);
    const rec = filtered[idx];
    const [yr, mo, dy] = rec.date.split('-').map(Number);
    const d = new Date(yr, mo - 1, dy);
    xLabels.push(formatDdMmYy(d, includeYear));
  }

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
  const firstRec = filtered[0];
  const lastRec = filtered[filtered.length - 1];

  return {
    points,
    xLabels,
    polylinePoints,
    areaPoints: `0,150 ${polylinePoints} ${width},150`,
    totalVisits: filtered.reduce((sum, r) => sum + r.visits, 0),
    rangeSummary: `${firstRec.date} – ${lastRec.date}`,
  };
}
