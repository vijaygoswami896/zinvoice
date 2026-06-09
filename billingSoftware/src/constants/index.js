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
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',

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

// ── App ───────────────────────────────────────────────────────────────────────
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'GST Billing';

// ── GST ───────────────────────────────────────────────────────────────────────
export const GST_RATES = [0, 5, 12, 18, 28];

export const GST_RATE_OPTIONS = GST_RATES.map((r) => ({
    value: r,
    label: r === 0 ? '0% — Exempt' : `${r}%`,
}));

export const GST_TYPES = Object.freeze({
    B2B: 'B2B',
    B2C: 'B2C',
    EXPORT: 'export',
});

export const GST_TYPE_OPTIONS = Object.values(GST_TYPES).map((v) => ({
    value: v,
    label: v === 'B2B'
        ? 'B2B — Business (has GSTIN)'
        : v === 'B2C'
            ? 'B2C — Consumer (no GSTIN)'
            : 'Export / SEZ (zero-rated)',
}));

export const GST_BADGE = {
    B2B: 'badge-info',
    B2C: 'badge-neutral',
    export: 'badge-warning',
};

export const AVATAR_COLOR = {
    B2B: { bg: '#B5D4F4', color: '#0C447C' },
    B2C: { bg: '#FAC775', color: '#633806' },
    export: { bg: '#9FE1CB', color: '#085041' },
};

// ── Invoice ───────────────────────────────────────────────────────────────────
export const INVOICE_STATUS = Object.freeze({
    DRAFT: 'draft',
    SENT: 'sent',
    PAID: 'paid',
    CANCELLED: 'cancelled',
    OVERDUE: 'overdue',
});

export const INVOICE_STATUSES = Object.values(INVOICE_STATUS);

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
const PAYMENT_MODE_CONFIG = [
    { value: 'cash', label: 'Cash', reference: 'Receipt No.' },
    { value: 'upi', label: 'UPI', reference: 'UPI Transaction ID' },
    { value: 'bank_transfer', label: 'Bank Transfer', reference: 'Transaction Ref.' },
    { value: 'cheque', label: 'Cheque', reference: 'Cheque No.' },
    { value: 'neft', label: 'NEFT', reference: 'UTR Number' },
    { value: 'rtgs', label: 'RTGS', reference: 'UTR Number' },
    { value: 'imps', label: 'IMPS', reference: 'Transaction ID' },
    { value: 'other', label: 'Other', reference: 'Reference No.' },
];

export const PAYMENT_MODE_OPTIONS = PAYMENT_MODE_CONFIG;
export const PAYMENT_MODE_LABELS = Object.fromEntries(PAYMENT_MODE_CONFIG.map((o) => [o.value, o.label]));
export const PAYMENT_MODES = PAYMENT_MODE_CONFIG.map((o) => o.value);
export const REFERENCE_LABEL = Object.fromEntries(PAYMENT_MODE_CONFIG.map((o) => [o.value, o.reference]));

// ── Payment status ────────────────────────────────────────────────────────────
export const PAYMENT_STATUS_LABEL = {
    paid: 'Paid',
    partial: 'Partial',
    pending: 'Pending',
};

export const PAYMENT_STATUS_BADGE = {
    paid: 'badge-success',
    partial: 'badge-warning',
    pending: 'badge-neutral',
};

// ── Pagination ────────────────────────────────────────────────────────────────
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];
export const DEFAULT_PAGE_SIZE = 25;

// ── Query keys ────────────────────────────────────────────────────────────────
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

// ── Indian states ─────────────────────────────────────────────────────────────
// Ordered by GST state code (01–38, then UT codes 97, 99)
export const INDIAN_STATE_CONFIG = [
    { name: 'Andaman and Nicobar Islands', code: '35' },
    { name: 'Andhra Pradesh', code: '28' },
    { name: 'Arunachal Pradesh', code: '12' },
    { name: 'Assam', code: '18' },
    { name: 'Bihar', code: '10' },
    { name: 'Centre Jurisdiction', code: '99' },
    { name: 'Chandigarh', code: '04' },
    { name: 'Chhattisgarh', code: '22' },
    { name: 'Dadra and Nagar Haveli and Daman and Diu', code: '26' },
    { name: 'Delhi', code: '07' },
    { name: 'Goa', code: '30' },
    { name: 'Gujarat', code: '24' },
    { name: 'Haryana', code: '06' },
    { name: 'Himachal Pradesh', code: '02' },
    { name: 'Jammu and Kashmir', code: '01' },
    { name: 'Jharkhand', code: '20' },
    { name: 'Karnataka', code: '29' },
    { name: 'Kerala', code: '32' },
    { name: 'Ladakh', code: '38' },
    { name: 'Lakshadweep', code: '31' },
    { name: 'Madhya Pradesh', code: '23' },
    { name: 'Maharashtra', code: '27' },
    { name: 'Manipur', code: '14' },
    { name: 'Meghalaya', code: '17' },
    { name: 'Mizoram', code: '15' },
    { name: 'Nagaland', code: '13' },
    { name: 'Odisha', code: '21' },
    { name: 'Other Territory', code: '97' },
    { name: 'Puducherry', code: '34' },
    { name: 'Punjab', code: '03' },
    { name: 'Rajasthan', code: '08' },
    { name: 'Sikkim', code: '11' },
    { name: 'Tamil Nadu', code: '33' },
    { name: 'Telangana', code: '36' },
    { name: 'Tripura', code: '16' },
    { name: 'Uttar Pradesh', code: '09' },
    { name: 'Uttarakhand', code: '05' },
    { name: 'West Bengal', code: '19' },
];

// export const INDIAN_STATE_CONFIG = [
//     { name: 'Jammu and Kashmir', code: '01' },
//     { name: 'Himachal Pradesh', code: '02' },
//     { name: 'Punjab', code: '03' },
//     { name: 'Chandigarh', code: '04' },
//     { name: 'Uttarakhand', code: '05' },
//     { name: 'Haryana', code: '06' },
//     { name: 'Delhi', code: '07' },
//     { name: 'Rajasthan', code: '08' },
//     { name: 'Uttar Pradesh', code: '09' },
//     { name: 'Bihar', code: '10' },
//     { name: 'Sikkim', code: '11' },
//     { name: 'Arunachal Pradesh', code: '12' },
//     { name: 'Nagaland', code: '13' },
//     { name: 'Manipur', code: '14' },
//     { name: 'Mizoram', code: '15' },
//     { name: 'Tripura', code: '16' },
//     { name: 'Meghalaya', code: '17' },
//     { name: 'Assam', code: '18' },
//     { name: 'West Bengal', code: '19' },
//     { name: 'Jharkhand', code: '20' },
//     { name: 'Odisha', code: '21' },
//     { name: 'Chhattisgarh', code: '22' },
//     { name: 'Madhya Pradesh', code: '23' },
//     { name: 'Gujarat', code: '24' },
//     { name: 'Dadra and Nagar Haveli and Daman and Diu', code: '26' },
//     { name: 'Maharashtra', code: '27' },
//     { name: 'Andhra Pradesh', code: '28' },
//     { name: 'Karnataka', code: '29' },
//     { name: 'Goa', code: '30' },
//     { name: 'Lakshadweep', code: '31' },
//     { name: 'Kerala', code: '32' },
//     { name: 'Tamil Nadu', code: '33' },
//     { name: 'Puducherry', code: '34' },
//     { name: 'Andaman and Nicobar Islands', code: '35' },
//     { name: 'Telangana', code: '36' },
//     { name: 'Ladakh', code: '38' },
//     { name: 'Other Territory', code: '97' },
//     { name: 'Centre Jurisdiction', code: '99' },
// ];

export const INDIAN_STATES = INDIAN_STATE_CONFIG.map((s) => s.name);
export const INDIAN_STATE_CODES = INDIAN_STATE_CONFIG.map((s) => s.code);

// ── Products ──────────────────────────────────────────────────────────────────
export const PRODUCT_TYPES = [
    { value: 'goods', label: 'Goods', description: 'Physical product with HSN code' },
    { value: 'service', label: 'Service', description: 'Intangible service with SAC code' },
];

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
export const UNITS = FLAT_UNITS.map((u) => u.value);
export const UNIT_VALUES = UNITS; // alias for backwards compatibility