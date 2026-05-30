// ── Roles ─────────────────────────────────────────────────────────────────────
export const ROLES = Object.freeze({
    ADMIN: 'admin',
    STAFF: 'staff',
});

// ── Route paths ───────────────────────────────────────────────────────────────
export const ROUTES = Object.freeze({
    // Auth
    LOGIN: '/login',
    REGISTER: '/register',

    // App
    DASHBOARD: '/dashboard',
    INVOICES: '/invoices',
    INVOICE_NEW: '/invoices/new',
    INVOICE_DETAIL: '/invoices/:id',
    INVOICE_EDIT: '/invoices/:id/edit',
    CUSTOMERS: '/customers',
    PRODUCTS: '/products',
    PAYMENTS: '/payments',
    REPORTS: '/reports',
    SETTINGS: '/settings',

    // Admin only
    ADMIN: '/admin',

    // Errors
    FORBIDDEN: '/403',
    NOT_FOUND: '/404',
});

// ── API ───────────────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'GST Billing';

// ── GST ───────────────────────────────────────────────────────────────────────
export const GST_RATES = [0, 5, 12, 18, 28];

export const GST_TYPES = Object.freeze({
    B2B: 'B2B',
    B2C: 'B2C',
    EXPORT: 'export',
});

// ── Invoice ───────────────────────────────────────────────────────────────────
export const INVOICE_STATUS = Object.freeze({
    DRAFT: 'draft',
    SENT: 'sent',
    PAID: 'paid',
    CANCELLED: 'cancelled',
    OVERDUE: 'overdue',
});

export const INVOICE_STATUS_LABEL = {
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    cancelled: 'Cancelled',
    overdue: 'Overdue',
};

export const INVOICE_STATUS_BADGE = {
    draft: 'badge-neutral',
    sent: 'badge-info',
    paid: 'badge-success',
    cancelled: 'badge-danger',
    overdue: 'badge-warning',
};

// ── Payment modes ─────────────────────────────────────────────────────────────
export const PAYMENT_MODES = Object.freeze({
    CASH: 'cash',
    UPI: 'upi',
    BANK_TRANSFER: 'bank_transfer',
    CHEQUE: 'cheque',
});

export const PAYMENT_MODE_LABELS = {
    cash: 'Cash',
    upi: 'UPI',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
};

// ── Pagination ────────────────────────────────────────────────────────────────
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;

// ── Query keys ────────────────────────────────────────────────────────────────
// Used to identify TanStack Query cache entries — namespaced to avoid collisions
export const QUERY_KEYS = Object.freeze({
    INVOICES: 'invoices',
    CUSTOMERS: 'customers',
    PRODUCTS: 'products',
    PAYMENTS: 'payments',
    SETTINGS: 'settings',
    REPORTS: 'reports',
    DASHBOARD: 'dashboard',
    ME: 'me',
});

export const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
    'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
];

export const INDIAN_STATE_CODES = [
    '01', '02', '03', '04', '05', '06', '07', '08', '09', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19', '20',
    '21', '22', '23', '24', '25', '26', '27', '28', '29', '30',
    '31', '32', '33', '34', '35', '36', '37', '38', '97', '99',
];

// src/constants/products.ts
export const UNITS = [
    'PCS', // Pieces
    'NOS', // Numbers
    'KGS', // Kilograms
    'GMS', // Grams
    'LTR', // Litres
    'MLT', // Millilitres
    'MTR', // Metres
    'SQM', // Square metres
    'CBM', // Cubic metres
    'BOX', // Box
    'PKT', // Packet
    'BAG', // Bag
    'SET', // Set
    'PAR', // Pair
    'ROL', // Roll
    'TUB', // Tube
    'HRS', // Hours — for services
    'DAY', // Days — for services
    'MON', // Month — for services
    'JOB', // Job — for services
    'OTH', // Others
];

export const VALID_GST_RATES = [0, 5, 12, 18, 28];