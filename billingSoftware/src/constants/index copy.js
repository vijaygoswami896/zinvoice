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

// export const INVOICE_STATUSES = ['draft', 'sent', 'paid', 'cancelled', 'overdue'];
export const INVOICE_STATUSES = Object.values(INVOICE_STATUS);

// ── Payment modes ─────────────────────────────────────────────────────────────
// export const PAYMENT_MODES = Object.freeze({
//     CASH: 'cash',
//     UPI: 'upi',
//     BANK_TRANSFER: 'bank_transfer',
//     CHEQUE: 'cheque',
// });

// export const PAYMENT_MODE_LABELS = {
//     cash: 'Cash',
//     upi: 'UPI',
//     bank_transfer: 'Bank Transfer',
//     cheque: 'Cheque',
// };

// export const PAYMENT_MODE_OPTIONS = [
//     { value: 'cash', label: 'Cash' },
//     { value: 'upi', label: 'UPI' },
//     { value: 'bank_transfer', label: 'Bank Transfer' },
//     { value: 'cheque', label: 'Cheque' },
//     { value: 'neft', label: 'NEFT' },
//     { value: 'rtgs', label: 'RTGS' },
//     { value: 'imps', label: 'IMPS' },
//     { value: 'other', label: 'Other' },
// ];

// export const PAYMENT_MODES = PAYMENT_MODE_OPTIONS.map((o) => o.value);

const PAYMENT_MODE_CONFIG = [
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'neft', label: 'NEFT' },
    { value: 'rtgs', label: 'RTGS' },
    { value: 'imps', label: 'IMPS' },
    { value: 'other', label: 'Other' },
];

export const PAYMENT_MODE_OPTIONS = PAYMENT_MODE_CONFIG;
export const PAYMENT_MODE_LABELS = Object.fromEntries(PAYMENT_MODE_CONFIG.map(o => [o.value, o.label]));
export const PAYMENT_MODES = PAYMENT_MODE_CONFIG.map(o => o.value);

// Reference label for each mode (used in tables)
export const REFERENCE_LABEL = {
    cash: 'Receipt No.',
    upi: 'UPI Transaction ID',
    bank_transfer: 'Transaction Ref.',
    cheque: 'Cheque No.',
    neft: 'UTR Number',
    rtgs: 'UTR Number',
    imps: 'Transaction ID',
    other: 'Reference No.',
};

// ── Payment status (derived, not stored) ──────────────────────────────────────

export const PAYMENT_STATUS_BADGE = {
    paid: 'badge-success',
    partial: 'badge-warning',
    pending: 'badge-neutral',
};

export const PAYMENT_STATUS_LABEL = {
    paid: 'Paid',
    partial: 'Partial',
    pending: 'Pending',
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

export const GST_TYPE_OPTIONS = [
    { value: 'B2B', label: 'B2B — Business (has GSTIN)' },
    { value: 'B2C', label: 'B2C — Consumer (no GSTIN)' },
    { value: 'export', label: 'Export / SEZ (zero-rated)' },
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

export const AVATAR_COLOR = {
    B2B: { bg: '#B5D4F4', color: '#0C447C' },
    B2C: { bg: '#FAC775', color: '#633806' },
    export: { bg: '#9FE1CB', color: '#085041' },
};

export const GST_BADGE = {
    B2B: 'badge-info',
    B2C: 'badge-neutral',
    export: 'badge-warning',
};

export const PRODUCT_TYPES = [
    { value: 'goods', label: 'Goods', description: 'Physical product with HSN code' },
    { value: 'service', label: 'Service', description: 'Intangible service with SAC code' },
];

/**
 * UQC units grouped for select display.
 * Mirrors the UNITS array in product.model.js exactly.
 */
export const UNIT_GROUPS = [
    {
        label: 'Count',
        options: [
            { value: 'PCS', label: 'PCS — Pieces' },
            { value: 'NOS', label: 'NOS — Numbers' },
            { value: 'SET', label: 'SET — Set' },
            { value: 'PAR', label: 'PAR — Pair' },
        ],
    },
    {
        label: 'Weight',
        options: [
            { value: 'KGS', label: 'KGS — Kilograms' },
            { value: 'GMS', label: 'GMS — Grams' },
        ],
    },
    {
        label: 'Volume',
        options: [
            { value: 'LTR', label: 'LTR — Litres' },
            { value: 'MLT', label: 'MLT — Millilitres' },
        ],
    },
    {
        label: 'Length / Area',
        options: [
            { value: 'MTR', label: 'MTR — Metres' },
            { value: 'SQM', label: 'SQM — Sq. metres' },
            { value: 'CBM', label: 'CBM — Cu. metres' },
            { value: 'ROL', label: 'ROL — Roll' },
        ],
    },
    {
        label: 'Packaging',
        options: [
            { value: 'BOX', label: 'BOX — Box' },
            { value: 'PKT', label: 'PKT — Packet' },
            { value: 'BAG', label: 'BAG — Bag' },
            { value: 'TUB', label: 'TUB — Tube' },
        ],
    },
    {
        label: 'Services',
        options: [
            { value: 'HRS', label: 'HRS — Hours' },
            { value: 'DAY', label: 'DAY — Days' },
            { value: 'MON', label: 'MON — Month' },
            { value: 'JOB', label: 'JOB — Job' },
        ],
    },
    {
        label: 'Other',
        options: [{ value: 'OTH', label: 'OTH — Others' }],
    },
];

export const FLAT_UNITS = UNIT_GROUPS.flatMap((g) => g.options);

export const GST_RATE_OPTIONS = VALID_GST_RATES.map((r) => ({
    value: r,
    label: r === 0 ? '0% — Exempt' : `${r}%`,
}));

export const UNIT_VALUES = FLAT_UNITS.map((u) => u.value);