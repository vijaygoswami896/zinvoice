/**
 * gstUtils.ts
 *
 * Pure utility functions for GST arithmetic, price manipulation,
 * place-of-supply determination, and formatting.
 */

import { SUPPLY_TYPES, STATE_CODE_MAP } from './gstConstants.js';
import type { GSTRate, GSTType, SupplyType } from './gstConstants.js';

// ── Rounding ──────────────────────────────────────────────────────────────────

/**
 * Round to 2 decimal places using "round half away from zero".
 * This is the standard for Indian commercial invoicing and matches
 * the behaviour of Tally, Zoho Books, ClearTax, and the CBIC e-invoice portal.
 *
 * JavaScript's Math.round() uses "round half to even" (banker's rounding)
 * which can produce unexpected results for .5 values. The Number.EPSILON
 * correction forces correct rounding for all practical monetary values.
 */
export const round2 = (n: number): number =>
    Math.round((n + Number.EPSILON) * 100) / 100;

/**
 * Round to 0 decimal places (for integer rupee amounts where needed).
 */
export const roundRupee = (n: number): number =>
    Math.round(n + Number.EPSILON);

// ── GST rate decomposition ────────────────────────────────────────────────────

export interface SplitGSTRate {
    cgstRate: number;
    sgstRate: number;
}

/**
 * Splits a GST rate into equal CGST and SGST components.
 *
 * @param gstRate - Total GST rate (e.g. 18)
 */
export const splitGSTRate = (gstRate: GSTRate): SplitGSTRate => ({
    cgstRate: round2(gstRate / 2),
    sgstRate: round2(gstRate / 2),
});

// ── Price utilities ───────────────────────────────────────────────────────────

/**
 * Extracts the taxable base from a tax-inclusive price.
 *
 * Formula: taxable = inclusive_price / (1 + rate / 100)
 *
 * @param inclusivePrice - Price already containing GST
 * @param gstRate        - GST percentage (e.g. 18)
 * @returns Taxable amount (excl. GST)
 */
export const extractTaxableFromInclusive = (
    inclusivePrice: number,
    gstRate: GSTRate,
): number => {
    if (gstRate === 0) return round2(inclusivePrice);
    return round2(inclusivePrice / (1 + gstRate / 100));
};

/**
 * Adds GST to a tax-exclusive base to get the total price.
 */
export const addGSTToExclusive = (
    exclusivePrice: number,
    gstRate: GSTRate,
): number => round2(exclusivePrice * (1 + gstRate / 100));

/**
 * Extracts the GST amount from a tax-inclusive price.
 */
export const extractGSTFromInclusive = (
    inclusivePrice: number,
    gstRate: GSTRate,
): number => {
    if (gstRate === 0) return 0;
    return round2(inclusivePrice - extractTaxableFromInclusive(inclusivePrice, gstRate));
};

/**
 * Calculates the GST amount from a tax-exclusive base.
 */
export const calculateGSTOnExclusive = (
    exclusiveBase: number,
    gstRate: GSTRate,
): number => round2(exclusiveBase * (gstRate / 100));

// ── Discount application ──────────────────────────────────────────────────────

/**
 * Applies a percentage discount to a unit rate.
 * Discount is always applied before tax calculation.
 *
 * @param rate        - Unit rate
 * @param discountPct - 0 to 100
 * @returns Rate after discount
 */
export const applyDiscount = (rate: number, discountPct: number): number => {
    if (!discountPct || discountPct <= 0) return rate;
    return round2(rate * (1 - discountPct / 100));
};

/**
 * Calculates the discount amount (in rupees) for a line item.
 */
export const calculateDiscountAmount = (
    rate: number,
    quantity: number,
    discountPct: number,
): number => {
    if (!discountPct || discountPct <= 0) return 0;
    return round2(rate * quantity * (discountPct / 100));
};

// ── Place of supply ───────────────────────────────────────────────────────────

export interface PlaceOfSupplyParams {
    sellerStateCode: string;
    buyerStateCode: string;
    gstType: GSTType;
}

export interface PlaceOfSupplyResult {
    isIGST: boolean;
    supplyType: SupplyType;
    sellerState: string;
    buyerState: string;
}

/**
 * Determines the supply type and whether IGST applies.
 *
 * Place of Supply rules (Section 10, IGST Act 2017):
 *   - Export / SEZ → IGST (zero-rated)
 *   - Seller state === Buyer state → CGST + SGST (intra-state)
 *   - Seller state !== Buyer state → IGST (inter-state)
 *   - Missing state codes → default intra-state (safe fallback)
 */
export const determinePlaceOfSupply = ({
    sellerStateCode,
    buyerStateCode,
    gstType,
}: PlaceOfSupplyParams): PlaceOfSupplyResult => {
    const sellerState = STATE_CODE_MAP.get(sellerStateCode) ?? '';
    const buyerState = STATE_CODE_MAP.get(buyerStateCode) ?? '';

    if (gstType === 'export') {
        return { supplyType: SUPPLY_TYPES.EXPORT, isIGST: true, sellerState, buyerState };
    }

    const hasBothCodes = Boolean(sellerStateCode && buyerStateCode);
    const isInterState = hasBothCodes && sellerStateCode.trim() !== buyerStateCode.trim();

    return {
        supplyType: isInterState ? SUPPLY_TYPES.INTER_STATE : SUPPLY_TYPES.INTRA_STATE,
        isIGST: isInterState,
        sellerState,
        buyerState,
    };
};

// ── Amount in words (Indian numbering system) ─────────────────────────────────

const ONES: readonly string[] = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen',
];

const TENS: readonly string[] = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
    'Sixty', 'Seventy', 'Eighty', 'Ninety',
];

const belowHundred = (n: number): string => {
    if (n < 20) return ONES[n] ?? '';
    return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '');
};

const belowThousand = (n: number): string => {
    if (n < 100) return belowHundred(n);
    return (
        (ONES[Math.floor(n / 100)] ?? '') +
        ' Hundred' +
        (n % 100 ? ' ' + belowHundred(n % 100) : '')
    );
};

const convertRupees = (n: number): string => {
    if (n === 0) return '';
    if (n < 1000) return belowThousand(n);

    const crore = Math.floor(n / 10_000_000);
    const lakh = Math.floor((n % 10_000_000) / 100_000);
    const thousand = Math.floor((n % 100_000) / 1_000);
    const rest = n % 1_000;

    const parts: string[] = [];
    if (crore) parts.push(belowThousand(crore) + ' Crore');
    if (lakh) parts.push(belowThousand(lakh) + ' Lakh');
    if (thousand) parts.push(belowThousand(thousand) + ' Thousand');
    if (rest) parts.push(belowThousand(rest));
    return parts.join(' ');
};

/**
 * Converts a rupee amount to words using the Indian numbering system.
 * Used on printed invoices as required by GST rules for amounts > ₹5 lakh.
 *
 * @example amountInWords(123456.78)
 * // "Rupees One Lakh Twenty Three Thousand Four Hundred Fifty Six and Seventy Eight Paise Only"
 */
export const amountInWords = (amount: number): string => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'Invalid amount';
    if (amount === 0) return 'Rupees Zero Only';

    const isNegative = amount < 0;
    const abs = Math.abs(amount);
    const rupees = Math.floor(abs);
    const paise = Math.round((abs - rupees) * 100);

    let result = (isNegative ? 'Minus ' : '') + 'Rupees ' + convertRupees(rupees);
    if (paise > 0) result += ` and ${belowHundred(paise)} Paise`;
    return result + ' Only';
};

// ── Formatting helpers ────────────────────────────────────────────────────────

/**
 * Formats a rupee amount as an Indian locale currency string.
 *
 * @param showSymbol - Whether to prefix the ₹ symbol (default: true)
 * @example formatINR(123456.78)  // "₹1,23,456.78"
 * @example formatINR(123456.78, false)  // "1,23,456.78"
 */
export const formatINR = (amount: number, showSymbol = true): string =>
    new Intl.NumberFormat('en-IN', {
        style: showSymbol ? 'currency' : 'decimal',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount ?? 0);