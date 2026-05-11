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
