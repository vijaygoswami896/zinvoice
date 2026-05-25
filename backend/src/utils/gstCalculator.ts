/**
 * gstCalculator — pure functions for Indian GST computation.
 *
 * Place of Supply rule (Section 10, IGST Act):
 *   Seller state === Buyer state  →  CGST + SGST
 *   Seller state !== Buyer state  →  IGST
 *   Export / SEZ customer         →  Zero-rated
 *
 * Rounding:
 *   Round half away from zero to 2 decimal places.
 */

export type GstType = 'B2B' | 'B2C' | 'export';

export interface LineItemInput {
    quantity: number;
    rate: number;
    gstRate: number;
    taxIncluded: boolean;
    discountPct?: number;
}

export interface LineItemResult {
    taxableAmount: number;
    gstAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    lineTotal: number;
}

export interface InvoiceTotals {
    subtotal: number;
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;
    totalTax: number;
    grandTotal: number;
}

/**
 * Round to 2 decimal places.
 */
export const round2 = (n: number): number =>
    Math.round((n + Number.EPSILON) * 100) / 100;

// ── Inter-state determination ────────────────────────────────────────────────

/**
 * Returns true when IGST applies.
 *
 * @param sellerStateCode - 2-digit seller state code
 * @param buyerStateCode  - 2-digit buyer state code
 * @param gstType         - GST type
 */
export const shouldApplyIGST = (
    sellerStateCode?: string,
    buyerStateCode?: string,
    gstType?: GstType,
): boolean => {
    if (gstType === 'export') return true;

    if (!sellerStateCode || !buyerStateCode) {
        return false;
    }

    return sellerStateCode.trim() !== buyerStateCode.trim();
};

// ── Line item computation ────────────────────────────────────────────────────

/**
 * Computes GST values for a single invoice line item.
 */
export const computeLineItem = (
    item: LineItemInput,
    applyIGST: boolean,
): LineItemResult => {
    const {
        quantity,
        rate,
        gstRate,
        taxIncluded,
        discountPct = 0,
    } = item;

    // Apply line-level discount before tax
    const effectiveRate =
        discountPct > 0
            ? rate * (1 - discountPct / 100)
            : rate;

    const gstFraction = gstRate / 100;

    let taxableAmount: number;
    let lineTotal: number;

    if (taxIncluded) {
        // GST included in price
        lineTotal = round2(effectiveRate * quantity);

        taxableAmount = round2(
            lineTotal / (1 + gstFraction),
        );
    } else {
        // GST excluded from price
        taxableAmount = round2(
            effectiveRate * quantity,
        );

        lineTotal = round2(
            taxableAmount * (1 + gstFraction),
        );
    }

    const gstAmount = round2(
        lineTotal - taxableAmount,
    );

    const cgst = applyIGST
        ? 0
        : round2(gstAmount / 2);

    const sgst = applyIGST
        ? 0
        : round2(gstAmount / 2);

    const igst = applyIGST
        ? gstAmount
        : 0;

    return {
        taxableAmount,
        gstAmount,
        cgst,
        sgst,
        igst,
        lineTotal,
    };
};

// ── Invoice aggregation ──────────────────────────────────────────────────────

/**
 * Aggregates invoice totals from line items.
 */
export const computeInvoiceTotals = (
    items: LineItemInput[],
    applyIGST: boolean,
): InvoiceTotals => {
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    for (const item of items) {
        const result = computeLineItem(item, applyIGST);

        subtotal += result.taxableAmount;
        totalCgst += result.cgst;
        totalSgst += result.sgst;
        totalIgst += result.igst;
    }

    subtotal = round2(subtotal);
    totalCgst = round2(totalCgst);
    totalSgst = round2(totalSgst);
    totalIgst = round2(totalIgst);

    const totalTax = round2(
        totalCgst + totalSgst + totalIgst,
    );

    const grandTotal = round2(
        subtotal + totalTax,
    );

    return {
        subtotal,
        totalCgst,
        totalSgst,
        totalIgst,
        totalTax,
        grandTotal,
    };
};