import mongoose, { Document, Schema, Types } from 'mongoose';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface ILineItem {
    _id?: Types.ObjectId;
    productId: Types.ObjectId | null;
    name: string;
    description: string;
    hsnSacCode: string;
    unit: string;
    itemType: 'goods' | 'service';
    quantity: number;
    rate: number;
    discountPct: number;
    gstRate: 0 | 5 | 12 | 18 | 28;
    taxIncluded: boolean;
    taxableAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    gstAmount: number;
    lineTotal: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'cancelled' | 'overdue';

export interface IInvoice extends Document {
    businessId: Types.ObjectId;
    invoiceNumber: string;
    financialYear: string;
    seq: number;
    customerId: Types.ObjectId;
    customerName: string;
    customerGstin: string;
    customerEmail: string;
    customerPhone: string;
    billingAddress: Record<string, unknown>;
    shippingAddress: Record<string, unknown>;
    sellerStateCode: string;
    placeOfSupply: string;
    isIGST: boolean;
    invoiceDate: Date;
    dueDate: Date | null;
    items: ILineItem[];
    subtotal: number;
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;
    totalTax: number;
    grandTotal: number;
    status: InvoiceStatus;
    notes: string;
    termsAndConditions: string;
    internalNotes: string;
    deletedAt: Date | null;
    deletedBy: Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

// ── Line item sub-schema ──────────────────────────────────────────────────────

const lineItemSchema = new Schema<ILineItem>(
    {
        /**
         * productId is OPTIONAL — invoices support two modes:
         *   A) Saved product: productId set, details COPIED at invoice time (snapshot)
         *   B) Manual entry:  productId null, all fields entered directly
         *
         * Copying details into the line item means invoice amounts are immutable
         * even if the linked product is later edited, repriced, or deleted.
         */
        productId: { type: Schema.Types.ObjectId, ref: 'Product', default: null },

        // Snapshot of product details OR manual entry — always stored on line item
        name: { type: String, required: true, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 500, default: '' },
        hsnSacCode: { type: String, trim: true, maxlength: 8, default: '' },
        unit: { type: String, default: 'PCS', maxlength: 5 },
        itemType: { type: String, enum: ['goods', 'service'], default: 'goods' },

        // Pricing inputs
        quantity: { type: Number, required: true, min: [0.001, 'Quantity must be > 0'] },
        rate: { type: Number, required: true, min: [0, 'Rate cannot be negative'] },
        discountPct: { type: Number, min: 0, max: 100, default: 0 },

        // Tax inputs
        gstRate: { type: Number, required: true, enum: [0, 5, 12, 18, 28] },
        taxIncluded: { type: Boolean, default: false },

        // Computed outputs — stored for immutability; recalculated only on edit
        taxableAmount: { type: Number, required: true },
        cgst: { type: Number, required: true, default: 0 },
        sgst: { type: Number, required: true, default: 0 },
        igst: { type: Number, required: true, default: 0 },
        gstAmount: { type: Number, required: true },
        lineTotal: { type: Number, required: true },
    },
    { _id: true },
);

// ── Invoice schema ────────────────────────────────────────────────────────────

const invoiceSchema = new Schema<IInvoice>(
    {
        businessId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        // ── Invoice number (immutable after first save) ────────────────────────────

        invoiceNumber: { type: String, required: true, trim: true },
        financialYear: { type: String, required: true }, // e.g. "2025-26"
        seq: { type: Number, required: true },  // raw sequence integer

        // ── Customer snapshot (copied at creation — immutable) ────────────────────

        customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
        customerName: { type: String, required: true, trim: true },
        customerGstin: { type: String, trim: true, uppercase: true, default: '' },
        customerEmail: { type: String, trim: true, lowercase: true, default: '' },
        customerPhone: { type: String, trim: true, default: '' },

        billingAddress: { type: Schema.Types.Mixed, default: {} },
        shippingAddress: { type: Schema.Types.Mixed, default: {} },

        // ── GST context (captured at creation time from seller + buyer state) ──────

        sellerStateCode: { type: String, maxlength: 2, default: '' },
        placeOfSupply: { type: String, maxlength: 2, default: '' }, // buyer state code
        isIGST: { type: Boolean, required: true, default: false },

        // ── Dates ─────────────────────────────────────────────────────────────────

        invoiceDate: { type: Date, required: true },
        dueDate: { type: Date, default: null },

        // ── Line items ────────────────────────────────────────────────────────────

        items: {
            type: [lineItemSchema],
            required: true,
            validate: {
                validator: (v: ILineItem[]) => Array.isArray(v) && v.length >= 1,
                message: 'Invoice must have at least one line item',
            },
        },

        // ── Invoice-level totals (server-computed, never trusted from client) ──────

        subtotal: { type: Number, required: true, default: 0 },
        totalCgst: { type: Number, required: true, default: 0 },
        totalSgst: { type: Number, required: true, default: 0 },
        totalIgst: { type: Number, required: true, default: 0 },
        totalTax: { type: Number, required: true, default: 0 },
        grandTotal: { type: Number, required: true, default: 0 },

        // ── Status ────────────────────────────────────────────────────────────────

        status: {
            type: String,
            enum: {
                values: ['draft', 'sent', 'paid', 'cancelled', 'overdue'],
                message: 'Invalid invoice status',
            },
            default: 'draft',
        },

        // ── Text fields ───────────────────────────────────────────────────────────

        notes: { type: String, trim: true, maxlength: 1000, default: '' },
        termsAndConditions: { type: String, trim: true, maxlength: 2000, default: '' },
        internalNotes: { type: String, trim: true, maxlength: 1000, default: '' },

        // ── Soft delete ───────────────────────────────────────────────────────────

        deletedAt: { type: Date, default: null },
        deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            transform: (_doc, ret) => {
                const { __v, ...rest } = ret;
                return rest;
                // delete ret.__v;
                // return ret;
            },
        },
    },
);

// ── Indexes ───────────────────────────────────────────────────────────────────

// Invoice number is unique per business — never reused
invoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ businessId: 1, deletedAt: 1 });
invoiceSchema.index({ businessId: 1, status: 1, deletedAt: 1 });
invoiceSchema.index({ businessId: 1, customerId: 1, deletedAt: 1 });
invoiceSchema.index({ businessId: 1, invoiceDate: -1, deletedAt: 1 });
invoiceSchema.index({ businessId: 1, dueDate: 1, status: 1, deletedAt: 1 });

export const Invoice = mongoose.model<IInvoice>('Invoice', invoiceSchema);