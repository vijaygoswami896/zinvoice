import { ComputedLineItem, ComputeInvoiceOptions, ComputeInvoiceResult, HSNSummaryRow, InvoiceInput, InvoiceTotals, NonGSTComputedItem, NonGSTInvoiceItem, NonGSTInvoiceResult, PlaceOfSupply, RawLineItem, TaxRateSummaryRow } from '../types/index.js';
import { SUPPLY_TYPES, ITEM_TYPES } from './gstConstants.js';
import {
    round2,
    splitGSTRate,
    applyDiscount,
    extractTaxableFromInclusive,
    calculateGSTOnExclusive,
    determinePlaceOfSupply,
    amountInWords,
    PlaceOfSupplyResult,
} from './gstUtils.js';
import { validateInvoiceInput } from './gstValidator.js';

// ── Single line item computation ──────────────────────────────────────────────

/**
 * Computes complete tax breakdown for a single line item.
 *
 * Handles all three pricing modes:
 *   1. Exclusive (default): tax is ADDED on top of rate
 *   2. Inclusive:           tax is EXTRACTED from rate (back-calculation)
 *   3. Zero-rated (GST 0%): no tax, line total = taxable amount
 *
 * The applyIGST flag determines whether CGST+SGST or IGST is used.
 * Set once at invoice level — you cannot mix IGST and CGST/SGST lines.
 */
export const computeLineItem = (
    item: RawLineItem,
    applyIGST: boolean,
): ComputedLineItem => {
    const {
        name = '',
        quantity,
        rate,
        gstRate,
        taxIncluded = false,
        discountPct = 0,
        ...rest
    } = item;

    const effectiveRate = applyDiscount(rate, discountPct);
    const discountAmt = round2((rate - effectiveRate) * quantity);

    let taxableAmount: number;
    let lineTotal: number;

    if (gstRate === 0) {
        // Zero-rated: no tax computation needed
        taxableAmount = round2(effectiveRate * quantity);
        lineTotal = taxableAmount;
    } else if (taxIncluded) {
        // Inclusive pricing: back-calculate taxable base
        const grossLine = round2(effectiveRate * quantity);
        taxableAmount = extractTaxableFromInclusive(grossLine, gstRate);
        lineTotal = grossLine;
    } else {
        // Exclusive pricing: add GST on top
        taxableAmount = round2(effectiveRate * quantity);
        lineTotal = round2(taxableAmount + calculateGSTOnExclusive(taxableAmount, gstRate));
    }

    const gstAmount = round2(lineTotal - taxableAmount);

    const { cgstRate, sgstRate } = splitGSTRate(gstRate);
    const cgst = applyIGST ? 0 : round2(gstAmount / 2);
    const sgst = applyIGST ? 0 : round2(gstAmount / 2);
    const igst = applyIGST ? gstAmount : 0;
    const igstRate = applyIGST ? gstRate : 0;

    return {
        ...rest,
        name,
        quantity,
        rate,
        effectiveRate,
        gstRate,
        discountPct,
        discountAmt,
        taxIncluded,
        taxableAmount,
        gstAmount,
        cgst,
        sgst,
        igst,
        cgstRate: applyIGST ? 0 : cgstRate,
        sgstRate: applyIGST ? 0 : sgstRate,
        igstRate,
        lineTotal,
    };
};

// ── Invoice-level aggregation ─────────────────────────────────────────────────

/**
 * Aggregates computed line items into invoice-level totals.
 */
export const aggregateTotals = (computedItems: ComputedLineItem[]): InvoiceTotals => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    for (const item of computedItems) {
        subtotal += item.taxableAmount;
        totalDiscount += item.discountAmt ?? 0;
        totalCgst += item.cgst;
        totalSgst += item.sgst;
        totalIgst += item.igst;
    }

    subtotal = round2(subtotal);
    totalDiscount = round2(totalDiscount);
    totalCgst = round2(totalCgst);
    totalSgst = round2(totalSgst);
    totalIgst = round2(totalIgst);

    const totalTax = round2(totalCgst + totalSgst + totalIgst);
    const grandTotal = round2(subtotal + totalTax);
    const grandTotalRounded = Math.round(grandTotal);
    const roundOff = round2(grandTotalRounded - grandTotal);

    return {
        subtotal,
        totalDiscount,
        totalCgst,
        totalSgst,
        totalIgst,
        totalTax,
        grandTotal,
        roundOff,
        grandTotalRounded,
    };
};

// ── HSN-wise tax summary ──────────────────────────────────────────────────────

/**
 * Groups computed line items by HSN/SAC code and tax rate.
 * Required for the HSN Summary table on GSTR-1 and e-invoices.
 */
export const buildHSNSummary = (computedItems: ComputedLineItem[]): HSNSummaryRow[] => {
    const summaryMap = new Map<string, HSNSummaryRow>();

    for (const item of computedItems) {
        const key = `${item.hsnSacCode ?? 'UNCLASSIFIED'}__${item.gstRate}`;

        if (!summaryMap.has(key)) {
            summaryMap.set(key, {
                hsnSacCode: item.hsnSacCode ?? '',
                description: item.hsnSacCode ? '' : item.name,
                itemType: item.itemType ?? ITEM_TYPES.GOODS,
                gstRate: item.gstRate,
                taxableAmount: 0,
                cgst: 0,
                sgst: 0,
                igst: 0,
                gstAmount: 0,
                total: 0,
            });
        }

        const row = summaryMap.get(key)!;
        row.taxableAmount = round2(row.taxableAmount + item.taxableAmount);
        row.cgst = round2(row.cgst + item.cgst);
        row.sgst = round2(row.sgst + item.sgst);
        row.igst = round2(row.igst + item.igst);
        row.gstAmount = round2(row.gstAmount + item.gstAmount);
        row.total = round2(row.total + item.lineTotal);
    }

    return [...summaryMap.values()].sort(
        (a, b) => a.hsnSacCode.localeCompare(b.hsnSacCode) || a.gstRate - b.gstRate,
    );
};

// ── Tax rate summary (for invoice footer) ────────────────────────────────────

/**
 * Groups by GST rate — for the "Tax breakdown" section on invoice PDFs.
 */
export const buildTaxRateSummary = (
    computedItems: ComputedLineItem[],
    isIGST: boolean,
): TaxRateSummaryRow[] => {
    const map = new Map<number, TaxRateSummaryRow>();

    for (const item of computedItems) {
        const rate = item.gstRate;

        if (!map.has(rate)) {
            const { cgstRate, sgstRate } = splitGSTRate(rate);
            map.set(rate, {
                gstRate: rate,
                taxableAmount: 0,
                cgstRate: isIGST ? 0 : cgstRate,
                cgst: 0,
                sgstRate: isIGST ? 0 : sgstRate,
                sgst: 0,
                igstRate: isIGST ? rate : 0,
                igst: 0,
                totalTax: 0,
            });
        }

        const row = map.get(rate)!;
        row.taxableAmount = round2(row.taxableAmount + item.taxableAmount);
        row.cgst = round2(row.cgst + item.cgst);
        row.sgst = round2(row.sgst + item.sgst);
        row.igst = round2(row.igst + item.igst);
        row.totalTax = round2(row.totalTax + item.gstAmount);
    }

    return [...map.values()].sort((a, b) => a.gstRate - b.gstRate);
};

// ── Main compute invoice function ─────────────────────────────────────────────

/**
 * Full invoice computation pipeline.
 *
 * Input → validation → place-of-supply → per-line computation → aggregation → summaries
 */
export const computeInvoice = (
    input: InvoiceInput,
    options: ComputeInvoiceOptions = {},
): ComputeInvoiceResult => {
    const {
        skipValidation = false,
        includeAmountInWords = true,
        includeHSNSummary = true,
        includeTaxRateSummary = true,
    } = options;

    // 1. Validate
    if (!skipValidation) {
        const validation = validateInvoiceInput(input);
        if (!validation.valid) {
            return { valid: false, errors: validation.errors };
        }
    }

    // 2. Determine place of supply → IGST or CGST+SGST
    const placeOfSupply = determinePlaceOfSupply({
        sellerStateCode: input.sellerStateCode ?? '',
        buyerStateCode: input.buyerStateCode ?? '',
        gstType: input.gstType ?? 'B2C',
    });

    const { isIGST, supplyType } = placeOfSupply;

    // 3. Compute each line item
    const computedItems = (input.items ?? []).map((item) => computeLineItem(item, isIGST));

    // 4. Aggregate invoice totals
    const totals = aggregateTotals(computedItems);

    // 5. Optional summaries
    const hsnSummary = includeHSNSummary ? buildHSNSummary(computedItems) : [];
    const taxRateSummary = includeTaxRateSummary ? buildTaxRateSummary(computedItems, isIGST) : [];

    // 6. Amount in words
    const totalInWords = includeAmountInWords ? amountInWords(totals.grandTotal) : '';

    return {
        valid: true,
        errors: [],
        placeOfSupply,
        isIGST,
        supplyType,
        items: computedItems,
        totals,
        hsnSummary,
        taxRateSummary,
        amountInWords: totalInWords,
    };
};

// ── Non-GST invoice computation ───────────────────────────────────────────────

/**
 * Computes totals for a non-GST invoice (items outside GST scope).
 * All tax fields will be zero.
 */
export const computeNonGSTInvoice = (items: NonGSTInvoiceItem[]): NonGSTInvoiceResult => {
    const computed: NonGSTComputedItem[] = items.map((item) => {
        const effectiveRate = applyDiscount(item.rate, item.discountPct ?? 0);
        const lineTotal = round2(effectiveRate * item.quantity);
        const discountAmt = round2((item.rate - effectiveRate) * item.quantity);

        return {
            ...item,
            effectiveRate,
            discountAmt,
            taxableAmount: lineTotal,
            gstAmount: 0 as const,
            cgst: 0 as const,
            sgst: 0 as const,
            igst: 0 as const,
            gstRate: 0 as const,
            lineTotal,
        };
    });

    const subtotal = round2(computed.reduce((s, i) => s + i.lineTotal, 0));
    const grandTotal = subtotal;

    return {
        items: computed,
        subtotal,
        totalDiscount: round2(computed.reduce((s, i) => s + (i.discountAmt ?? 0), 0)),
        totalTax: 0,
        totalCgst: 0,
        totalSgst: 0,
        totalIgst: 0,
        grandTotal,
        amountInWords: amountInWords(grandTotal),
        supplyType: SUPPLY_TYPES.NON_GST,
        isIGST: false,
    };
};