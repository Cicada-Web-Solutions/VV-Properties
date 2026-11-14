import type { Testimonial } from '@/types';

/**
 * Clearly marked illustrative sample client testimonials.
 * Managed in /admin -> Testimonials with per-review visibility toggles.
 */
export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: 'test-01',
    clientName: 'Arjun & Meera N. (Sample Review)',
    locationOrProperty: 'Acquired in Whitefield, Bengaluru (Sample)',
    rating: 5,
    reviewText:
      'Living overseas, we worried about verifying documents remotely. VV Properties shared transparent inspection videos, structured legal checks, and seamless handover support.',
    visible: true,
    reviewUrl: 'https://google.com',
    createdAt: '2026-10-01T10:00:00.000Z',
  },
  {
    id: 'test-02',
    clientName: 'Rohan K. (Sample Review)',
    locationOrProperty: 'Worli Residence Advisory (Sample)',
    rating: 5,
    reviewText:
      'Measured, unhurried, and completely candid about every micro-market detail. Rather than pushing volume listings, they narrowed our search to three exceptional options.',
    visible: true,
    reviewUrl: 'https://google.com',
    createdAt: '2026-10-05T14:30:00.000Z',
  },
  {
    id: 'test-03',
    clientName: 'Elena & Vikram S. (Sample Review)',
    locationOrProperty: 'North Goa Coastal Plot (Sample)',
    rating: 5,
    reviewText:
      'From initial site elevation reviews to final title diligence, the team operated with international clarity and discretion throughout the entire acquisition.',
    visible: true,
    createdAt: '2026-10-09T16:45:00.000Z',
  },
  {
    id: 'test-04',
    clientName: 'Siddharth P. (Sample Review)',
    locationOrProperty: 'Commercial Flagship Advisory (Sample)',
    rating: 4,
    reviewText:
      'Clear INR pricing analysis, realistic rental yield projections, and responsive scheduling across time zones made our family office investment straightforward.',
    visible: true,
    createdAt: '2026-10-14T11:20:00.000Z',
  },
];
