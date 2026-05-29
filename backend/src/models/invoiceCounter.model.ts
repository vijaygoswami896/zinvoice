import mongoose, { Document, Schema, Types } from 'mongoose';

// ── Interface ─────────────────────────────────────────────────────────────────

export interface IInvoiceCounter extends Document {
    businessId: Types.ObjectId;
    financialYear: string;
    seq: number;
}

/**
 * InvoiceCounter — one document per (businessId + financialYear).
 *
 * Designed for atomic, lock-free sequential number generation using
 * MongoDB's findOneAndUpdate + $inc pattern. This is the only collection
 * that must never be written to directly — always use the invoiceNumber
 * utility function which wraps the atomic operation.
 *
 * Indian financial year: April 1 → March 31.
 * Stored as "2025-26" (start year → end year short form).
 *
 * CRITICAL RULES:
 *   - seq is NEVER decremented
 *   - seq is NEVER reset within a financial year
 *   - Cancelled invoices retain their number forever
 *   - No number is ever reused under any circumstance
 */
const invoiceCounterSchema = new Schema<IInvoiceCounter>(
    {
        businessId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        financialYear: { type: String, required: true }, // e.g. "2025-26"
        seq: { type: Number, default: 0 },     // last used — never gaps
    },
    { timestamps: false },
);

invoiceCounterSchema.index({ businessId: 1, financialYear: 1 }, { unique: true });

export const InvoiceCounter = mongoose.model<IInvoiceCounter>('InvoiceCounter', invoiceCounterSchema);