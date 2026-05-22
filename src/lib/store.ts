import { create } from 'zustand';

// Types aligning with Prisma Schema
export interface Agency {
  id: string;
  name: string;
  subdomain: string;
  logoUrl?: string;
  primaryColor: string;
  secondaryColor: string;
  subscriptionPlan: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  agencyId: string;
  role: string; // Admin, Sales, Operations, Finance, Vendor, Customer
}

export interface Lead {
  id: string;
  agencyId: string;
  title: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  status: 'NEW' | 'CONTACTED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'CONFIRMED' | 'LOST';
  value: number;
  source?: string;
  assignedToId?: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeadNote {
  id: string;
  leadId: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface LeadActivity {
  id: string;
  leadId: string;
  type: 'EMAIL' | 'PHONE' | 'NOTE' | 'STAGE_CHANGE' | 'MEET';
  description: string;
  createdBy: string;
  createdAt: string;
}

export interface LeadFollowup {
  id: string;
  leadId: string;
  scheduledAt: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdBy: string;
}

export interface Customer {
  id: string;
  agencyId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  passportNumber?: string;
  passportExpiry?: string;
  travelHistory: string[];
  documents: { name: string; url: string; category: string; size: string }[];
}

export interface ItineraryItem {
  id: string;
  type: 'FLIGHT' | 'HOTEL' | 'TRANSFER' | 'ACTIVITY' | 'MEAL' | 'NOTE';
  title: string;
  details: string;
  costPrice: number;
  sellingPrice: number;
}

export interface ItineraryDay {
  id: string;
  dayNumber: number;
  title: string;
  description: string;
  items: ItineraryItem[];
}

export interface Itinerary {
  id: string;
  agencyId: string;
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  customerId?: string;
  status: 'DRAFT' | 'SENT' | 'APPROVED' | 'REJECTED';
  totalPrice: number;
  markupMargin: number; // percentage
  taxRate: number; // percentage
  isTemplate: boolean;
  days: ItineraryDay[];
  proposalTheme?: 'luxury' | 'classic' | 'emerald' | 'sunset';
}

export interface VendorRate {
  id: string;
  rate: number;
  seasonStart: string;
  seasonEnd: string;
}

export interface Vendor {
  id: string;
  agencyId: string;
  name: string;
  type: 'SERVICE' | 'PACKAGE';
  email: string;
  phone: string;
  address: string;
  ledgerBalance: number;
  rates: { name: string; type: string; price: number }[];
}

export interface Booking {
  id: string;
  agencyId: string;
  customerId: string;
  itineraryId?: string;
  status: 'PENDING' | 'PROCESSING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  voucherUrl?: string;
  ticketUrl?: string;
  hotelConfirmationCode?: string;
  driverName?: string;
  driverPhone?: string;
  visaStatus?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  agencyId: string;
  bookingId: string;
  invoiceNumber: string;
  amount: number;
  dueDate: string;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
}

export interface Payment {
  id: string;
  agencyId: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  transactionReference?: string;
  paymentDate: string;
}

export interface Expense {
  id: string;
  agencyId: string;
  amount: number;
  category: string;
  description: string;
  expenseDate: string;
}

export interface VendorPayout {
  id: string;
  agencyId: string;
  vendorId: string;
  amount: number;
  paymentDate: string;
}

export interface AuditLog {
  id: string;
  agencyId: string;
  userName: string;
  action: string;
  entityType: string;
  details: string;
  createdAt: string;
}

// Zustand Store State Definition
interface CRMStore {
  // Current session & multi-tenant active profile
  agencies: Agency[];
  currentAgency: Agency;
  currentUser: User | null;
  users: User[];
  
  // Data lists
  leads: Lead[];
  leadNotes: LeadNote[];
  leadActivities: LeadActivity[];
  leadFollowups: LeadFollowup[];
  customers: Customer[];
  itineraries: Itinerary[];
  vendors: Vendor[];
  bookings: Booking[];
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  vendorPayouts: VendorPayout[];
  auditLogs: AuditLog[];

  // Theme state
  theme: 'light' | 'dark';

  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentAgency: (agencyId: string) => void;
  setCurrentUser: (user: User | null) => void;
  registerAgency: (agencyName: string, subdomain: string, adminName: string, email: string) => Agency;

  // Lead actions
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'agencyId'>) => void;
  updateLeadStatus: (leadId: string, status: Lead['status']) => void;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  deleteLead: (leadId: string) => void;
  addLeadNote: (leadId: string, content: string) => void;
  addLeadFollowup: (leadId: string, scheduledAt: string, notes: string) => void;

  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'agencyId' | 'documents' | 'travelHistory'>) => void;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  uploadCustomerDoc: (customerId: string, doc: { name: string; category: string; size: string }) => void;

  // Itinerary actions
  addItinerary: (itinerary: Omit<Itinerary, 'id' | 'agencyId'>) => Itinerary;
  updateItinerary: (itineraryId: string, updates: Partial<Itinerary>) => void;
  addItineraryDay: (itineraryId: string, title: string, description: string) => void;
  updateItineraryDay: (itineraryId: string, dayId: string, updates: Partial<ItineraryDay>) => void;
  deleteItineraryDay: (itineraryId: string, dayId: string) => void;
  addItineraryItem: (itineraryId: string, dayId: string, item: Omit<ItineraryItem, 'id'>) => void;
  updateItineraryItem: (itineraryId: string, dayId: string, itemId: string, updates: Partial<ItineraryItem>) => void;
  deleteItineraryItem: (itineraryId: string, dayId: string, itemId: string) => void;
  reorderItineraryDays: (itineraryId: string, days: ItineraryDay[]) => void;

  // Booking actions
  createBooking: (customerId: string, itineraryId: string) => Booking;
  updateBooking: (bookingId: string, updates: Partial<Booking>) => void;

  // Finance actions
  createInvoice: (bookingId: string, amount: number, dueDate: string) => void;
  recordPayment: (invoiceId: string, amount: number, method: string, ref?: string) => void;
  recordExpense: (amount: number, category: string, description: string) => void;
  recordVendorPayout: (vendorId: string, amount: number) => void;

  // Vendor actions
  addVendor: (vendor: Omit<Vendor, 'id' | 'agencyId' | 'ledgerBalance'>) => void;
  updateVendor: (vendorId: string, updates: Partial<Vendor>) => void;

  // Audit helper
  logAction: (action: string, entityType: string, details: string) => void;
}

// Initial Seed Data
const defaultAgencies: Agency[] = [
  {
    id: 'agency-1',
    name: 'Bharat Travel Solutions',
    subdomain: 'bharattravel',
    logoUrl: '/agency-logo.svg',
    primaryColor: '#0d6efd', // Bootstrap primary blue
    secondaryColor: '#6c757d', // Bootstrap secondary gray
    subscriptionPlan: 'GROWTH',
  },
];

const defaultUsers: User[] = [
  { id: 'user-admin', email: 'admin@bharattravel.in', name: 'Dhruv Shah', agencyId: 'agency-1', role: 'Agency Admin' },
  { id: 'user-sales', email: 'sales@bharattravel.in', name: 'Neha Kapoor', agencyId: 'agency-1', role: 'Sales Agent' },
  { id: 'user-ops', email: 'ops@bharattravel.in', name: 'Arjun Nair', agencyId: 'agency-1', role: 'Operations' },
  { id: 'user-finance', email: 'finance@bharattravel.in', name: 'Kavya Rao', agencyId: 'agency-1', role: 'Finance' },
  { id: 'user-vendor', email: 'reservations@dalviewretreat.in', name: 'Faisal Mir', agencyId: 'agency-1', role: 'Vendor' },
  { id: 'user-customer', email: 'aarav.mehta@gmail.com', name: 'Aarav Mehta', agencyId: 'agency-1', role: 'Customer' },
];

const defaultCustomers: Customer[] = [
  {
    id: 'cust-1',
    agencyId: 'agency-1',
    firstName: 'Aarav',
    lastName: 'Mehta',
    email: 'aarav.mehta@gmail.com',
    phone: '+91 98765 43210',
    passportNumber: 'N8765432',
    passportExpiry: '2031-10-15',
    travelHistory: ['Jaipur, Rajasthan (2024)', 'Kochi, Kerala (2025)'],
    documents: [
      { name: 'passport_scan.pdf', url: '#', category: 'Passport', size: '1.2 MB' },
      { name: 'kashmir_permit.pdf', url: '#', category: 'Permit', size: '840 KB' }
    ]
  },
  {
    id: 'cust-2',
    agencyId: 'agency-1',
    firstName: 'Priya',
    lastName: 'Iyer',
    email: 'priya.iyer@gmail.com',
    phone: '+91 99887 77665',
    passportNumber: 'P1234567',
    passportExpiry: '2029-04-12',
    travelHistory: ['Hampi, Karnataka (2023)', 'Darjeeling, West Bengal (2024)'],
    documents: [
      { name: 'passport_priya.pdf', url: '#', category: 'Passport', size: '2.1 MB' }
    ]
  }
];

const defaultLeads: Lead[] = [
  {
    id: 'lead-1',
    agencyId: 'agency-1',
    title: 'Kashmir Honeymoon Escape 6D',
    firstName: 'Aarav',
    lastName: 'Mehta',
    email: 'aarav.mehta@gmail.com',
    phone: '+91 98765 43210',
    status: 'PROPOSAL_SENT',
    value: 285000.00,
    source: 'Website Quote',
    assignedToId: 'user-sales',
    customerId: 'cust-1',
    createdAt: '2026-05-10T14:32:00Z',
    updatedAt: '2026-05-22T12:00:00Z',
  },
  {
    id: 'lead-2',
    agencyId: 'agency-1',
    title: 'Rajasthan Heritage Circuit 8D',
    firstName: 'Rohan',
    lastName: 'Singh',
    email: 'rohan.singh@gmail.com',
    phone: '+91 98110 22334',
    status: 'NEW',
    value: 198000.00,
    source: 'Referral',
    assignedToId: 'user-sales',
    createdAt: '2026-05-21T09:15:00Z',
    updatedAt: '2026-05-21T09:15:00Z',
  },
  {
    id: 'lead-3',
    agencyId: 'agency-1',
    title: 'Kerala Backwater Retreat',
    firstName: 'Ananya',
    lastName: 'Menon',
    email: 'ananya.menon@gmail.com',
    phone: '+91 94470 55667',
    status: 'NEGOTIATION',
    value: 164000.00,
    source: 'Instagram Ads',
    assignedToId: 'user-sales',
    createdAt: '2026-05-15T11:00:00Z',
    updatedAt: '2026-05-22T08:30:00Z',
  },
  {
    id: 'lead-4',
    agencyId: 'agency-1',
    title: 'Varanasi Spiritual Trail',
    firstName: 'Ishaan',
    lastName: 'Banerjee',
    email: 'ishaan.banerjee@gmail.com',
    phone: '+91 98300 77889',
    status: 'CONFIRMED',
    value: 112000.00,
    source: 'Google Search',
    assignedToId: 'user-sales',
    createdAt: '2026-05-02T10:45:00Z',
    updatedAt: '2026-05-18T16:20:00Z',
  }
];

const defaultLeadActivities: LeadActivity[] = [
  { id: 'act-1', leadId: 'lead-1', type: 'NOTE', description: 'Interested in a Dal Lake houseboat night and a private Gulmarg snow day.', createdBy: 'Neha Kapoor', createdAt: '2026-05-10T14:35:00Z' },
  { id: 'act-2', leadId: 'lead-1', type: 'EMAIL', description: 'Sent the first Kashmir itinerary draft with flight quotes.', createdBy: 'Neha Kapoor', createdAt: '2026-05-12T16:00:00Z' },
  { id: 'act-3', leadId: 'lead-1', type: 'PHONE', description: 'Discussed markup options. Client requested a private shikara dinner.', createdBy: 'Neha Kapoor', createdAt: '2026-05-22T11:00:00Z' }
];

const defaultLeadNotes: LeadNote[] = [
  { id: 'note-1', leadId: 'lead-1', content: 'Client prefers morning departures. Budget is flexible for a premium Srinagar stay.', createdBy: 'Neha Kapoor', createdAt: '2026-05-10T14:40:00Z' }
];

const defaultLeadFollowups: LeadFollowup[] = [
  { id: 'fup-1', leadId: 'lead-1', scheduledAt: '2026-05-25T10:00:00Z', status: 'PENDING', notes: 'Call client to review final pricing and confirm the advance payment.', createdBy: 'Neha Kapoor' }
];

const defaultVendors: Vendor[] = [
  {
    id: 'vend-1',
    agencyId: 'agency-1',
    name: 'Dal View Retreat Srinagar',
    type: 'SERVICE',
    email: 'reservations@dalviewretreat.in',
    phone: '+91 194 245 7788',
    address: 'Boulevard Road, Srinagar, Jammu and Kashmir',
    ledgerBalance: 96000.00,
    rates: [
      { name: 'Lake View Deluxe Room', type: 'HOTEL', price: 14000 },
      { name: 'Premium Houseboat Suite', type: 'HOTEL', price: 22000 }
    ]
  },
  {
    id: 'vend-2',
    agencyId: 'agency-1',
    name: 'IndiGo Agency Desk',
    type: 'SERVICE',
    email: 'agencydesk@goindigo.in',
    phone: '+91 124 617 3838',
    address: 'Gurugram, Haryana',
    ledgerBalance: 54000.00,
    rates: [
      { name: 'DEL-SXR Flexi Return', type: 'FLIGHT', price: 28000 },
      { name: 'BOM-SXR Economy Return', type: 'FLIGHT', price: 18500 }
    ]
  },
  {
    id: 'vend-3',
    agencyId: 'agency-1',
    name: 'Kashmir Valley Cabs',
    type: 'SERVICE',
    email: 'bookings@kashmirvalleycabs.in',
    phone: '+91 99065 44321',
    address: 'Rajbagh, Srinagar, Jammu and Kashmir',
    ledgerBalance: 18000.00,
    rates: [
      { name: 'Full-Day Innova Crysta (10h)', type: 'VEHICLE', price: 6500 },
      { name: 'Srinagar Airport SUV Transfer', type: 'VEHICLE', price: 2200 }
    ]
  }
];

const defaultItineraries: Itinerary[] = [
  {
    id: 'itin-1',
    agencyId: 'agency-1',
    title: 'Signature Kashmir Luxury Discovery',
    description: 'A hand-crafted Kashmir escape covering Dal Lake, Gulmarg views, Srinagar gardens, and warm local hospitality.',
    startDate: '2026-07-15',
    endDate: '2026-07-22',
    customerId: 'cust-1',
    status: 'SENT',
    totalPrice: 285000.00,
    markupMargin: 15.00,
    taxRate: 10.00,
    isTemplate: false,
    proposalTheme: 'luxury',
    days: [
      {
        id: 'day-1',
        dayNumber: 1,
        title: 'Arrival & Dal Lake Welcome',
        description: 'Arrive at Srinagar Airport, meet your private host, and transfer to your Dal Lake retreat.',
        items: [
          { id: 'item-1', type: 'FLIGHT', title: 'IndiGo 6E DEL-SXR Return', details: 'Flexi fare, seats 12A and 12B', costPrice: 28000, sellingPrice: 32000 },
          { id: 'item-2', type: 'TRANSFER', title: 'Srinagar Airport Welcome & Private SUV Transfer', details: 'Driver Name: Imtiyaz. Signboard: MEHTA FAMILY', costPrice: 2200, sellingPrice: 3200 },
          { id: 'item-3', type: 'HOTEL', title: 'Dal View Retreat Srinagar', details: 'Lake View Deluxe Room (1 Room, 5 Nights)', costPrice: 70000, sellingPrice: 84000 }
        ]
      },
      {
        id: 'day-2',
        dayNumber: 2,
        title: 'Gulmarg Meadows & Gondola',
        description: 'Explore Gulmarg with a private vehicle, local guide, and gondola assistance.',
        items: [
          { id: 'item-4', type: 'TRANSFER', title: 'Full-Day Innova Crysta Chauffeur Tour', details: 'Private vehicle for Srinagar to Gulmarg sightseeing', costPrice: 6500, sellingPrice: 8200 },
          { id: 'item-5', type: 'ACTIVITY', title: 'Gulmarg Gondola & Local Guide Support', details: 'Phase 1 tickets and local English-speaking guide included', costPrice: 7600, sellingPrice: 9800 }
        ]
      }
    ]
  }
];

const defaultBookings: Booking[] = [
  {
    id: 'book-1',
    agencyId: 'agency-1',
    customerId: 'cust-1',
    itineraryId: 'itin-1',
    status: 'PROCESSING',
    hotelConfirmationCode: 'DVR-876543-IN',
    driverName: 'Imtiyaz Wani',
    driverPhone: '+91 99065 11223',
    visaStatus: 'DOCUMENTS_SUBMITTED',
    createdAt: '2026-05-18T16:30:00Z'
  }
];

const defaultInvoices: Invoice[] = [
  {
    id: 'inv-1',
    agencyId: 'agency-1',
    bookingId: 'book-1',
    invoiceNumber: 'INV-2026-001',
    amount: 285000.00,
    dueDate: '2026-06-15',
    status: 'PARTIALLY_PAID'
  }
];

const defaultPayments: Payment[] = [
  {
    id: 'pay-1',
    agencyId: 'agency-1',
    invoiceId: 'inv-1',
    amount: 120000.00,
    paymentMethod: 'UPI',
    transactionReference: 'UPI-982173918',
    paymentDate: '2026-05-19T10:00:00Z'
  }
];

const defaultExpenses: Expense[] = [
  { id: 'exp-1', agencyId: 'agency-1', amount: 15000.00, category: 'MARKETING', description: 'Instagram ads for Kashmir honeymoon campaigns', expenseDate: '2026-05-05T09:00:00Z' },
  { id: 'exp-2', agencyId: 'agency-1', amount: 8000.00, category: 'UTILITIES', description: 'Travel CRM software subscription', expenseDate: '2026-05-12T00:00:00Z' }
];

const defaultVendorPayouts: VendorPayout[] = [
  { id: 'pout-1', agencyId: 'agency-1', vendorId: 'vend-1', amount: 50000.00, paymentDate: '2026-05-20T14:00:00Z' }
];

const defaultAuditLogs: AuditLog[] = [
  { id: 'log-1', agencyId: 'agency-1', userName: 'Dhruv Shah', action: 'CREATE', entityType: 'Lead', details: 'Added new Lead: Kashmir Honeymoon Escape', createdAt: '2026-05-10T14:32:00Z' },
  { id: 'log-2', agencyId: 'agency-1', userName: 'Neha Kapoor', action: 'UPDATE', entityType: 'Itinerary', details: 'Modified pricing markup margins on Gulmarg tour day', createdAt: '2026-05-22T11:00:00Z' }
];

export const useStore = create<CRMStore>((set, get) => ({
  agencies: defaultAgencies,
  currentAgency: defaultAgencies[0],
  currentUser: defaultUsers[0],
  users: defaultUsers,

  leads: defaultLeads,
  leadNotes: defaultLeadNotes,
  leadActivities: defaultLeadActivities,
  leadFollowups: defaultLeadFollowups,
  customers: defaultCustomers,
  itineraries: defaultItineraries,
  vendors: defaultVendors,
  bookings: defaultBookings,
  invoices: defaultInvoices,
  payments: defaultPayments,
  expenses: defaultExpenses,
  vendorPayouts: defaultVendorPayouts,
  auditLogs: defaultAuditLogs,
  
  theme: 'dark', // Premium dark mode by default

  setTheme: (theme) => set({ theme }),
  
  setCurrentAgency: (agencyId) => {
    const agency = get().agencies.find(a => a.id === agencyId);
    if (agency) {
      set({ currentAgency: agency });
      // update current user if their agency doesn't match
      const matchingUser = get().users.find(u => u.agencyId === agencyId);
      if (matchingUser) {
        set({ currentUser: matchingUser });
      }
    }
  },

  setCurrentUser: (user) => set({ currentUser: user }),

  registerAgency: (agencyName, subdomain, adminName, email) => {
    const newAgency: Agency = {
      id: `agency-${Date.now()}`,
      name: agencyName,
      subdomain: subdomain.toLowerCase().replace(/\s+/g, '-'),
      primaryColor: '#3b82f6',
      secondaryColor: '#1e293b',
      subscriptionPlan: 'FREE',
    };

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name: adminName,
      agencyId: newAgency.id,
      role: 'Agency Admin',
    };

    set((state) => ({
      agencies: [...state.agencies, newAgency],
      users: [...state.users, newUser],
      currentAgency: newAgency,
      currentUser: newUser,
    }));

    get().logAction('CREATE', 'Agency', `Registered new tenant: ${agencyName} (${subdomain})`);
    return newAgency;
  },

  // Lead CRM Operations
  addLead: (leadData) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      agencyId: get().currentAgency.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      leads: [newLead, ...state.leads],
      leadActivities: [
        {
          id: `act-${Date.now()}`,
          leadId: newLead.id,
          type: 'NOTE',
          description: `Lead created from source: ${leadData.source || 'Manual Input'}`,
          createdBy: get().currentUser?.name || 'System',
          createdAt: new Date().toISOString(),
        },
        ...state.leadActivities,
      ],
    }));

    get().logAction('CREATE', 'Lead', `Created lead ${newLead.title} for ${newLead.firstName} ${newLead.lastName}`);
  },

  updateLeadStatus: (leadId, status) => {
    const oldLead = get().leads.find(l => l.id === leadId);
    if (!oldLead) return;

    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, status, updatedAt: new Date().toISOString() } : l
      ),
      leadActivities: [
        {
          id: `act-${Date.now()}`,
          leadId,
          type: 'STAGE_CHANGE',
          description: `Moved stage from ${oldLead.status} to ${status}`,
          createdBy: get().currentUser?.name || 'System',
          createdAt: new Date().toISOString(),
        },
        ...state.leadActivities,
      ],
    }));

    get().logAction('UPDATE', 'Lead', `Updated lead status of ${oldLead.title} to ${status}`);
  },

  updateLead: (leadId, updates) => {
    set((state) => ({
      leads: state.leads.map((l) =>
        l.id === leadId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      ),
    }));
    get().logAction('UPDATE', 'Lead', `Updated lead fields for lead ID: ${leadId}`);
  },

  deleteLead: (leadId) => {
    set((state) => ({
      leads: state.leads.filter((l) => l.id !== leadId),
    }));
    get().logAction('DELETE', 'Lead', `Deleted lead ID: ${leadId}`);
  },

  addLeadNote: (leadId, content) => {
    const newNote: LeadNote = {
      id: `note-${Date.now()}`,
      leadId,
      content,
      createdBy: get().currentUser?.name || 'System',
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      leadNotes: [newNote, ...state.leadNotes],
      leadActivities: [
        {
          id: `act-note-${Date.now()}`,
          leadId,
          type: 'NOTE',
          description: `Added note: "${content.substring(0, 40)}${content.length > 40 ? '...' : ''}"`,
          createdBy: get().currentUser?.name || 'System',
          createdAt: new Date().toISOString(),
        },
        ...state.leadActivities,
      ],
    }));
  },

  addLeadFollowup: (leadId, scheduledAt, notes) => {
    const newFollowup: LeadFollowup = {
      id: `fup-${Date.now()}`,
      leadId,
      scheduledAt,
      status: 'PENDING',
      notes,
      createdBy: get().currentUser?.name || 'System',
    };

    set((state) => ({
      leadFollowups: [newFollowup, ...state.leadFollowups],
    }));
    get().logAction('CREATE', 'Followup', `Scheduled follow-up reminder for lead ID: ${leadId}`);
  },

  // Customer Operations
  addCustomer: (custData) => {
    const newCustomer: Customer = {
      ...custData,
      id: `cust-${Date.now()}`,
      agencyId: get().currentAgency.id,
      travelHistory: [],
      documents: [],
    };

    set((state) => ({
      customers: [newCustomer, ...state.customers],
    }));
    get().logAction('CREATE', 'Customer', `Added customer: ${custData.firstName} ${custData.lastName}`);
  },

  updateCustomer: (customerId, updates) => {
    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId ? { ...c, ...updates } : c
      ),
    }));
    get().logAction('UPDATE', 'Customer', `Updated customer metadata for ID: ${customerId}`);
  },

  uploadCustomerDoc: (customerId, doc) => {
    const newDoc = {
      name: doc.name,
      url: '#',
      category: doc.category,
      size: doc.size,
    };

    set((state) => ({
      customers: state.customers.map((c) =>
        c.id === customerId ? { ...c, documents: [...c.documents, newDoc] } : c
      ),
    }));
    get().logAction('UPDATE', 'Customer', `Uploaded ${doc.category} document for Customer ID: ${customerId}`);
  },

  // Itinerary Planner Actions
  addItinerary: (itinData) => {
    const newItinerary: Itinerary = {
      ...itinData,
      id: `itin-${Date.now()}`,
      agencyId: get().currentAgency.id,
      days: itinData.days || [],
      proposalTheme: itinData.proposalTheme || 'luxury',
    };

    set((state) => ({
      itineraries: [newItinerary, ...state.itineraries],
    }));
    get().logAction('CREATE', 'Itinerary', `Created itinerary plan: ${itinData.title}`);
    return newItinerary;
  },

  updateItinerary: (itineraryId, updates) => {
    set((state) => ({
      itineraries: state.itineraries.map((it) => {
        if (it.id === itineraryId) {
          const updated = { ...it, ...updates };
          
          // Re-calculate aggregate total price when day-items change, markup changes, or tax changes
          let baseCost = 0;
          updated.days.forEach((day) => {
            day.items.forEach((item) => {
              baseCost += Number(item.sellingPrice || 0);
            });
          });
          
          const markupMult = 1 + Number(updated.markupMargin || 0) / 100;
          const taxMult = 1 + Number(updated.taxRate || 0) / 100;
          updated.totalPrice = Number((baseCost * markupMult * taxMult).toFixed(2));
          
          return updated;
        }
        return it;
      }),
    }));
  },

  addItineraryDay: (itineraryId, title, description) => {
    set((state) => ({
      itineraries: state.itineraries.map((it) => {
        if (it.id === itineraryId) {
          const existingDays = it.days ?? [];
          const nextDayNum = existingDays.length + 1;
          const newDay: ItineraryDay = {
            id: `day-${Date.now()}`,
            dayNumber: nextDayNum,
            title,
            description,
            items: [],
          };
          return { ...it, days: [...existingDays, newDay] };
        }
        return it;
      }),
    }));
    get().logAction('UPDATE', 'Itinerary', `Added day "${title}" to itinerary ID: ${itineraryId}`);
  },

  updateItineraryDay: (itineraryId, dayId, updates) => {
    set((state) => ({
      itineraries: state.itineraries.map((it) => {
        if (it.id === itineraryId) {
          return {
            ...it,
            days: (it.days ?? []).map((d) => (d.id === dayId ? { ...d, ...updates } : d)),
          };
        }
        return it;
      }),
    }));
  },

  deleteItineraryDay: (itineraryId, dayId) => {
    set((state) => ({
      itineraries: state.itineraries.map((it) => {
        if (it.id === itineraryId) {
          const filteredDays = it.days.filter((d) => d.id !== dayId);
          // Recalculate day numbers sequentially
          const reorderedDays = filteredDays.map((d, index) => ({
            ...d,
            dayNumber: index + 1,
          }));
          
          const updated = { ...it, days: reorderedDays };
          // Trigger pricing recalculation
          let baseCost = 0;
          updated.days.forEach((d) => d.items.forEach((item) => { baseCost += Number(item.sellingPrice); }));
          const markupMult = 1 + Number(updated.markupMargin) / 100;
          const taxMult = 1 + Number(updated.taxRate) / 100;
          updated.totalPrice = Number((baseCost * markupMult * taxMult).toFixed(2));
          
          return updated;
        }
        return it;
      }),
    }));
  },

  addItineraryItem: (itineraryId, dayId, itemData) => {
    set((state) => ({
      itineraries: state.itineraries.map((it) => {
        if (it.id === itineraryId) {
          const updatedDays = it.days.map((d) => {
            if (d.id === dayId) {
              const newItem: ItineraryItem = {
                ...itemData,
                id: `item-${Date.now()}`,
              };
              return { ...d, items: [...d.items, newItem] };
            }
            return d;
          });
          
          const updated = { ...it, days: updatedDays };
          // Price auto calculations
          let baseCost = 0;
          updated.days.forEach((d) => d.items.forEach((item) => { baseCost += Number(item.sellingPrice); }));
          const markupMult = 1 + Number(updated.markupMargin) / 100;
          const taxMult = 1 + Number(updated.taxRate) / 100;
          updated.totalPrice = Number((baseCost * markupMult * taxMult).toFixed(2));
          
          return updated;
        }
        return it;
      }),
    }));
  },

  updateItineraryItem: (itineraryId, dayId, itemId, updates) => {
    set((state) => ({
      itineraries: state.itineraries.map((it) => {
        if (it.id === itineraryId) {
          const updatedDays = it.days.map((d) => {
            if (d.id === dayId) {
              return {
                ...d,
                items: d.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
              };
            }
            return d;
          });
          
          const updated = { ...it, days: updatedDays };
          // Price recalculation
          let baseCost = 0;
          updated.days.forEach((d) => d.items.forEach((item) => { baseCost += Number(item.sellingPrice); }));
          const markupMult = 1 + Number(updated.markupMargin) / 100;
          const taxMult = 1 + Number(updated.taxRate) / 100;
          updated.totalPrice = Number((baseCost * markupMult * taxMult).toFixed(2));
          
          return updated;
        }
        return it;
      }),
    }));
  },

  deleteItineraryItem: (itineraryId, dayId, itemId) => {
    set((state) => ({
      itineraries: state.itineraries.map((it) => {
        if (it.id === itineraryId) {
          const updatedDays = it.days.map((d) => {
            if (d.id === dayId) {
              return {
                ...d,
                items: d.items.filter((i) => i.id !== itemId),
              };
            }
            return d;
          });
          
          const updated = { ...it, days: updatedDays };
          // Price recalculation
          let baseCost = 0;
          updated.days.forEach((d) => d.items.forEach((item) => { baseCost += Number(item.sellingPrice); }));
          const markupMult = 1 + Number(updated.markupMargin) / 100;
          const taxMult = 1 + Number(updated.taxRate) / 100;
          updated.totalPrice = Number((baseCost * markupMult * taxMult).toFixed(2));
          
          return updated;
        }
        return it;
      }),
    }));
  },

  reorderItineraryDays: (itineraryId, days) => {
    set((state) => ({
      itineraries: state.itineraries.map((it) => {
        if (it.id === itineraryId) {
          // Re-index day numbers sequentially
          const reindexed = days.map((d, index) => ({
            ...d,
            dayNumber: index + 1,
          }));
          return { ...it, days: reindexed };
        }
        return it;
      }),
    }));
    get().logAction('UPDATE', 'Itinerary', `Reordered days in Itinerary ID: ${itineraryId}`);
  },

  // Booking Operations
  createBooking: (customerId, itineraryId) => {
    const itinerary = get().itineraries.find((i) => i.id === itineraryId);
    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      agencyId: get().currentAgency.id,
      customerId,
      itineraryId,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      visaStatus: 'PENDING',
    };

    set((state) => ({
      bookings: [newBooking, ...state.bookings],
    }));

    // Auto-create invoice for this booking
    if (itinerary) {
      get().createInvoice(newBooking.id, itinerary.totalPrice, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    }

    get().logAction('CREATE', 'Booking', `Created booking from itinerary ID: ${itineraryId}`);
    return newBooking;
  },

  updateBooking: (bookingId, updates) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? { ...b, ...updates } : b
      ),
    }));
    get().logAction('UPDATE', 'Booking', `Updated booking status and operations data for ID: ${bookingId}`);
  },

  // Finance operations
  createInvoice: (bookingId, amount, dueDate) => {
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      agencyId: get().currentAgency.id,
      bookingId,
      invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
      amount,
      dueDate,
      status: 'UNPAID',
    };
    set((state) => ({
      invoices: [newInvoice, ...state.invoices],
    }));
    get().logAction('CREATE', 'Invoice', `Generated Invoice ${newInvoice.invoiceNumber} for Booking ID: ${bookingId}`);
  },

  recordPayment: (invoiceId, amount, method, ref) => {
    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      agencyId: get().currentAgency.id,
      invoiceId,
      amount,
      paymentMethod: method,
      transactionReference: ref,
      paymentDate: new Date().toISOString(),
    };

    set((state) => {
      // Adjust invoice status based on amount paid
      const updatedInvoices = state.invoices.map((inv) => {
        if (inv.id === invoiceId) {
          const totalPaid = Number(amount) + state.payments
            .filter((p) => p.invoiceId === invoiceId)
            .reduce((sum, p) => sum + Number(p.amount), 0);
          
          let status: Invoice['status'] = 'PARTIALLY_PAID';
          if (totalPaid >= inv.amount) {
            status = 'PAID';
          }
          return { ...inv, status };
        }
        return inv;
      });

      return {
        payments: [newPayment, ...state.payments],
        invoices: updatedInvoices,
      };
    });

    get().logAction('CREATE', 'Payment', `Recorded payment of ₹${amount} for Invoice ID: ${invoiceId}`);
  },

  recordExpense: (amount, category, description) => {
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      agencyId: get().currentAgency.id,
      amount,
      category,
      description,
      expenseDate: new Date().toISOString(),
    };
    set((state) => ({
      expenses: [newExpense, ...state.expenses],
    }));
    get().logAction('CREATE', 'Expense', `Logged expense: ₹${amount} under category: ${category}`);
  },

  recordVendorPayout: (vendorId, amount) => {
    const newPayout: VendorPayout = {
      id: `pout-${Date.now()}`,
      agencyId: get().currentAgency.id,
      vendorId,
      amount,
      paymentDate: new Date().toISOString(),
    };

    set((state) => {
      // Deduct vendor ledger balances
      const updatedVendors = state.vendors.map((v) =>
        v.id === vendorId ? { ...v, ledgerBalance: Math.max(0, Number(v.ledgerBalance) - Number(amount)) } : v
      );
      return {
        vendorPayouts: [newPayout, ...state.vendorPayouts],
        vendors: updatedVendors,
      };
    });

    get().logAction('CREATE', 'VendorPayout', `Disbursed ₹${amount} payout to Vendor ID: ${vendorId}`);
  },

  addVendor: (vendorData) => {
    const newVendor: Vendor = {
      ...vendorData,
      id: `vend-${Date.now()}`,
      agencyId: get().currentAgency.id,
      ledgerBalance: 0.00,
    };
    set((state) => ({
      vendors: [...state.vendors, newVendor],
    }));
    get().logAction('CREATE', 'Vendor', `Registered new partner vendor: ${vendorData.name}`);
  },

  updateVendor: (vendorId, updates) => {
    set((state) => ({
      vendors: state.vendors.map((v) => (v.id === vendorId ? { ...v, ...updates } : v)),
    }));
  },

  logAction: (action, entityType, details) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      agencyId: get().currentAgency.id,
      userName: get().currentUser?.name || 'System',
      action,
      entityType,
      details,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      auditLogs: [newLog, ...state.auditLogs],
    }));
  },
}));
