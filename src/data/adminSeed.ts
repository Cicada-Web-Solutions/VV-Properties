import type {
  ActivityLogEntry,
  AdminProfile,
  Enquiry,
  TeamAccount,
} from '@/types';

export const INITIAL_ADMIN_PROFILE: AdminProfile = {
  displayName: 'Victor Paul',
  username: 'victor',
  password: 'victorpaul',
  role: 'Super Administrator',
  avatar: null,
};

export const INITIAL_TEAM_ACCOUNTS: TeamAccount[] = [
  {
    id: 'acc-victor',
    name: 'Victor Paul',
    username: 'victor',
    password: 'victorpaul',
    role: 'Super Administrator',
    status: 'Active',
    created: '01 Nov 2026',
    photo: null,
  },
  {
    id: 'acc-victorpaul',
    name: 'Victor Paul (Alias)',
    username: 'victorpaul',
    password: 'victorpaul',
    role: 'Super Administrator',
    status: 'Active',
    created: '01 Nov 2026',
    photo: null,
  },
  {
    id: 'acc-saran',
    name: 'Saran',
    username: 'saran',
    password: 'saran',
    role: 'Administrator',
    status: 'Active',
    created: '02 Nov 2026',
    photo: null,
  },
  {
    id: 'acc-vibhkar',
    name: 'Vibhkar',
    username: 'vibhkar',
    password: 'vibhkar',
    role: 'Property Manager',
    status: 'Active',
    created: '04 Nov 2026',
    photo: null,
  },
  {
    id: 'acc-umeshwar',
    name: 'Umeshwar',
    username: 'umeshwar',
    password: 'umeshwar',
    role: 'Marketing Lead',
    status: 'Active',
    created: '06 Nov 2026',
    photo: null,
  },
  {
    id: 'acc-sharmika',
    name: 'Sharmika Murugesan',
    username: 'sharmika',
    password: 'sharmika',
    role: 'Executive Administrator',
    status: 'Active',
    created: '08 Nov 2026',
    photo: null,
  },
];

export const INITIAL_ENQUIRIES: Enquiry[] = [
  {
    id: 'enq-seed-01',
    fullName: 'Suresh Kumar',
    phone: '+91 98765 43210',
    email: 'suresh@gmail.com',
    propertyId: 'prop-aurelia-crest-villa',
    propertyTitle: 'The Aurelia Crest Villa (Sample)',
    message:
      'I would like to know more about this villa and arrange a private family viewing this weekend. Please share master plan details.',
    status: 'new',
    createdAt: '2026-11-15T10:24:00.000+05:30',
  },
  {
    id: 'enq-seed-02',
    fullName: 'Meena Priya',
    phone: '+91 98765 12340',
    email: 'meena@gmail.com',
    propertyId: 'prop-skyline-atelier-penthouse',
    propertyTitle: 'Skyline Atelier Penthouse (Sample)',
    message:
      'Interested in the Worli Sea Face full-floor penthouse pricing and NRI escrow documentation workflow.',
    status: 'new',
    createdAt: '2026-11-15T09:15:00.000+05:30',
  },
  {
    id: 'enq-seed-03',
    fullName: 'Rohit Sharma',
    phone: '+91 99887 66554',
    email: 'rohit@gmail.com',
    propertyId: 'prop-cove-veranda-estate',
    propertyTitle: 'Cove Veranda Estate (Sample)',
    message:
      'Looking for an Assagao heritage courtyard residence with pool for seasonal residence and capital appreciation.',
    status: 'new',
    createdAt: '2026-11-14T16:40:00.000+05:30',
  },
  {
    id: 'enq-seed-04',
    fullName: 'Ananya Deshmukh',
    phone: '+91 98401 22334',
    email: 'ananya@outlook.com',
    propertyId: 'prop-aravalli-crown-manor',
    propertyTitle: 'Aravalli Crown Manor (Sample)',
    message:
      'Please schedule a virtual video inspection of the Chhatarpur manor and share title deed summary.',
    status: 'new',
    createdAt: '2026-11-14T11:30:00.000+05:30',
  },
  {
    id: 'enq-seed-05',
    fullName: 'Karthik Subramanian',
    phone: '+91 97910 88776',
    email: 'karthik@techcorp.in',
    propertyId: 'prop-serene-grove-enclave',
    propertyTitle: 'Serene Grove Plot Enclave (Sample)',
    message:
      'Requesting plot dimension options and boundary demarcation details in Jubilee Hills.',
    status: 'closed',
    createdAt: '2026-11-13T13:20:00.000+05:30',
  },
  {
    id: 'enq-seed-06',
    fullName: 'Deepak Raj',
    phone: '+91 98412 34567',
    email: 'deepak.raj@gmail.com',
    propertyId: 'prop-deccan-glass-pavilion',
    propertyTitle: 'Deccan Glass Pavilion (Sample)',
    message:
      'Would like follow-up details on handover timeline and maintenance association charges in Koregaon Park.',
    status: 'contacted',
    createdAt: '2026-11-12T09:15:00.000+05:30',
  },
];

export const INITIAL_ACTIVITY_LOGS: ActivityLogEntry[] = [
  {
    id: 'log-seed-01',
    timestamp: 1794718935000, // 2026-11-15T10:22:15+05:30
    username: 'Victor Paul',
    action: 'Approved listing publication for The Aurelia Crest Villa (Sample)',
    module: 'Properties',
    dateStr: '15 Nov 2026, 10:22:15 AM',
    status: 'Success',
  },
  {
    id: 'log-seed-02',
    timestamp: 1794717760000, // 2026-11-15T10:02:40+05:30
    username: 'Saran',
    action: 'Updated site visit schedule for Suresh Kumar',
    module: 'Enquiries',
    dateStr: '15 Nov 2026, 10:02:40 AM',
    status: 'Success',
  },
  {
    id: 'log-seed-03',
    timestamp: 1794716538000, // 2026-11-15T09:42:18+05:30
    username: 'Vibhkar',
    action: 'Followed up with lead Deepak Raj regarding Deccan Glass Pavilion',
    module: 'Enquiries',
    dateStr: '15 Nov 2026, 09:42:18 AM',
    status: 'Success',
  },
  {
    id: 'log-seed-04',
    timestamp: 1794715325000, // 2026-11-15T09:22:05+05:30
    username: 'Umeshwar',
    action: 'Verified active homepage hero carousel slide ordering',
    module: 'Banners',
    dateStr: '15 Nov 2026, 09:22:05 AM',
    status: 'Success',
  },
  {
    id: 'log-seed-05',
    timestamp: 1794713712000, // 2026-11-15T08:55:12+05:30
    username: 'Sharmika Murugesan',
    action: 'Reviewed visible client testimonials across public landing page',
    module: 'Testimonials',
    dateStr: '15 Nov 2026, 08:55:12 AM',
    status: 'Success',
  },
];
