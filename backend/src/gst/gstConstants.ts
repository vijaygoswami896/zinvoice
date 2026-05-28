/**
 * gstConstants.ts
 *
 * Single source of truth for all Indian GST reference data.
 * All other GST modules import from here — never define these inline.
 *
 * Sources:
 *   - State codes: GSTIN format (first 2 digits = state code)
 *   - GST rates:   CGST Act, 2017 schedules
 *   - HSN/SAC:     CBIC classification
 */

// ── Valid GST tax slab rates ──────────────────────────────────────────────────

export const VALID_GST_RATES = Object.freeze([0, 5, 12, 18, 28] as const);

export type GSTRate = (typeof VALID_GST_RATES)[number];

// ── Customer / supply types ───────────────────────────────────────────────────

export const GST_TYPES = Object.freeze({
    B2B: 'B2B',     // Registered business — GSTIN required, ITC-eligible
    B2C: 'B2C',     // Unregistered consumer — no GSTIN
    EXPORT: 'export',  // Export / SEZ — zero-rated supply
} as const);

export type GSTType = (typeof GST_TYPES)[keyof typeof GST_TYPES];

// ── Supply categories ─────────────────────────────────────────────────────────

export const SUPPLY_TYPES = Object.freeze({
    INTRA_STATE: 'intra-state',   // CGST + SGST
    INTER_STATE: 'inter-state',   // IGST
    EXPORT: 'export',        // Zero-rated (IGST class)
    EXEMPT: 'exempt',        // Fully exempt — 0% GST, no filing needed
    NIL_RATED: 'nil-rated',     // 0% GST per schedule
    NON_GST: 'non-gst',       // Outside GST scope entirely
} as const);

export type SupplyType = (typeof SUPPLY_TYPES)[keyof typeof SUPPLY_TYPES];

// ── Item types for HSN vs SAC ─────────────────────────────────────────────────

export const ITEM_TYPES = Object.freeze({
    GOODS: 'goods',   // Physical goods → HSN code
    SERVICE: 'service', // Intangible service → SAC code
} as const);

export type ItemType = (typeof ITEM_TYPES)[keyof typeof ITEM_TYPES];

// ── Indian state codes ────────────────────────────────────────────────────────

/**
 * Complete map of Indian state/UT codes used as the first 2 digits of a GSTIN.
 * Source: CBIC GSTIN format specification.
 *
 * Key: 2-digit state code  →  Value: state name
 */
export const STATE_CODE_MAP = new Map<string, string>([
    ['01', 'Jammu and Kashmir'],
    ['02', 'Himachal Pradesh'],
    ['03', 'Punjab'],
    ['04', 'Chandigarh'],
    ['05', 'Uttarakhand'],
    ['06', 'Haryana'],
    ['07', 'Delhi'],
    ['08', 'Rajasthan'],
    ['09', 'Uttar Pradesh'],
    ['10', 'Bihar'],
    ['11', 'Sikkim'],
    ['12', 'Arunachal Pradesh'],
    ['13', 'Nagaland'],
    ['14', 'Manipur'],
    ['15', 'Mizoram'],
    ['16', 'Tripura'],
    ['17', 'Meghalaya'],
    ['18', 'Assam'],
    ['19', 'West Bengal'],
    ['20', 'Jharkhand'],
    ['21', 'Odisha'],
    ['22', 'Chhattisgarh'],
    ['23', 'Madhya Pradesh'],
    ['24', 'Gujarat'],
    ['25', 'Dadra and Nagar Haveli and Daman and Diu'],
    ['26', 'Maharashtra'],  // Note: 26 was Daman & Diu; now merged with 25; 27 is MH
    ['27', 'Maharashtra'],
    ['28', 'Andhra Pradesh (before bifurcation)'],
    ['29', 'Karnataka'],
    ['30', 'Goa'],
    ['31', 'Lakshadweep'],
    ['32', 'Kerala'],
    ['33', 'Tamil Nadu'],
    ['34', 'Puducherry'],
    ['35', 'Andaman and Nicobar Islands'],
    ['36', 'Telangana'],
    ['37', 'Andhra Pradesh'],
    ['38', 'Ladakh'],
    ['97', 'Other Territory'],
    ['99', 'Centre Jurisdiction'],
]);

/** All valid 2-digit state codes */
export const VALID_STATE_CODES = Object.freeze([...STATE_CODE_MAP.keys()]);

/** All state names in sorted order (deduped) */
export const INDIAN_STATES = Object.freeze(
    [...new Set(STATE_CODE_MAP.values())].sort(),
);

// ── GSTIN / PAN patterns ──────────────────────────────────────────────────────

/**
 * Full GSTIN regex.
 * Format: SS AAAAA NNNN A N Z A
 *   SS    = 2-digit state code
 *   AAAAA = 5-letter PAN prefix
 *   NNNN  = 4-digit PAN number
 *   A     = 1-letter PAN suffix
 *   N     = 1-digit entity number (1-9 or A-Z)
 *   Z     = always 'Z' (checksum placeholder)
 *   A     = 1-char checksum
 */
export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

/** PAN regex (extracted from GSTIN positions 3–12) */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// ── Unit Quantity Codes (UQC) — GST Council standard ─────────────────────────

export const UNIT_CODES = Object.freeze({
    PCS: 'Pieces',
    NOS: 'Numbers',
    KGS: 'Kilograms',
    GMS: 'Grams',
    LTR: 'Litres',
    MLT: 'Millilitres',
    MTR: 'Metres',
    SQM: 'Square Metres',
    CBM: 'Cubic Metres',
    BOX: 'Box',
    PKT: 'Packet',
    BAG: 'Bag',
    SET: 'Set',
    PAR: 'Pair',
    ROL: 'Roll',
    TUB: 'Tube',
    HRS: 'Hours',
    DAY: 'Days',
    MON: 'Month',
    JOB: 'Job',
    OTH: 'Others',
} as const);

export type UnitCode = keyof typeof UNIT_CODES;

export const VALID_UNIT_CODES = Object.freeze(
    Object.keys(UNIT_CODES) as UnitCode[],
);

// ── Financial year helpers ────────────────────────────────────────────────────

/**
 * Returns the Indian financial year string for a given date.
 * FY runs April 1 → March 31.
 *
 * @example getFinancialYear(new Date('2025-06-01')) // "2025-26"
 * @example getFinancialYear(new Date('2026-01-15')) // "2025-26"
 */
export const getFinancialYear = (date: Date = new Date()): string => {
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const fyStart = month >= 4 ? year : year - 1;
    return `${fyStart}-${String(fyStart + 1).slice(-2)}`;
};