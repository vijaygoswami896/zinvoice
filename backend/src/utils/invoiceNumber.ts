import { Types } from 'mongoose';
import { InvoiceCounter } from '../models/invoiceCounter.model.js';

// ── Financial year ────────────────────────────────────────────────────────────

/**
 * Returns the Indian financial year string for a given date.
 *
 * India's FY runs April 1 → March 31.
 * Jan–Mar belong to the FY that STARTED the previous April.
 *
 * Examples:
 *   new Date('2026-01-15') → "2025-26"  (Jan is still in FY started Apr 2025)
 *   new Date('2026-04-05') → "2026-27"  (Apr starts the new FY)
 */
export const getFinancialYear = (date: Date = new Date()): string => {
    const month = date.getMonth() + 1; // 1-indexed
    const year = date.getFullYear();
    const fyStart = month >= 4 ? year : year - 1;
    const fyEnd = String(fyStart + 1).slice(-2); // last 2 digits of end year
    return `${fyStart}-${fyEnd}`;
};

// ── Atomic counter ────────────────────────────────────────────────────────────

/**
 * Atomically increments the business counter for a given FY and returns
 * the next sequence number. Uses $inc inside findOneAndUpdate with upsert
 * so the counter document is auto-created for a new (businessId, FY) pair.
 *
 * This is the ONLY path that ever writes to InvoiceCounter.
 */
const nextSeq = async (
    businessId: string | Types.ObjectId,
    financialYear: string,
): Promise<number> => {
    const counter = await InvoiceCounter.findOneAndUpdate(
        { businessId, financialYear },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
    );

    // findOneAndUpdate with { new: true } always returns the updated doc
    // when upsert is true, so this cast is safe.
    return counter!.seq;
};

// ── Public API ────────────────────────────────────────────────────────────────

export interface GenerateInvoiceNumberOptions {
    businessId: string | Types.ObjectId;
    prefix?: string; // from Settings.invoicePrefix — defaults to 'INV'
    invoiceDate?: Date;
}

export interface GeneratedInvoiceNumber {
    invoiceNumber: string;
    financialYear: string;
    seq: number;
}

/**
 * Generates a formatted, guaranteed-unique invoice number.
 *
 * Format:  {PREFIX}-{CALENDAR_YEAR}-{SEQ_PADDED_4}
 * Example: INV-2026-0001
 *
 * We use CALENDAR YEAR in the display number (not FY notation like "2025-26")
 * because customers see the invoice date year, not the accounting year.
 * The counter itself is bucketed by FY so the sequence resets each April.
 */
export const generateInvoiceNumber = async ({
    businessId,
    prefix = 'INV',
    invoiceDate,
}: GenerateInvoiceNumberOptions): Promise<GeneratedInvoiceNumber> => {
    const date = invoiceDate ? new Date(invoiceDate) : new Date();
    const financialYear = getFinancialYear(date);
    const calendarYear = date.getFullYear();

    const seq = await nextSeq(businessId, financialYear);
    const paddedSeq = String(seq).padStart(4, '0');
    const invoiceNumber = `${prefix}-${calendarYear}-${paddedSeq}`;

    return { invoiceNumber, financialYear, seq };
};