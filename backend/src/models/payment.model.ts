import mongoose, { Document, Model, Schema } from 'mongoose';

export const PAYMENT_MODES = ['cash', 'upi', 'bank_transfer', 'cheque', 'neft', 'rtgs', 'imps', 'other'] as const;

export type PaymentMode = (typeof PAYMENT_MODES)[number];

export interface IPayment {
    /**
     * All payments are scoped to a business.
     * Every query must include { businessId, deletedAt: null }.
     */
    businessId: mongoose.Types.ObjectId;

    // ── Invoice link ──────────────────────────────────────────────────────────

    invoiceId: mongoose.Types.ObjectId;

    // Snapshot fields — so payment records remain useful even if invoice is deleted
    invoiceNumber: string;
    customerId?: mongoose.Types.ObjectId;
    customerName: string;

    // ── Payment details ───────────────────────────────────────────────────────

    amount: number;
    mode: PaymentMode;
    paymentDate: Date;

    /**
     * Reference number — cheque number, UPI transaction ID, NEFT UTR, etc.
     * Optional but strongly recommended for audit.
     */
    reference?: string;
    notes?: string;

    // ── Soft delete ───────────────────────────────────────────────────────────

    deletedAt: Date | null;
    deletedBy: mongoose.Types.ObjectId | null;
}

export interface IPaymentDocument extends IPayment, Document { }

const paymentSchema = new Schema<IPaymentDocument>(
    {
        businessId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'businessId is required'],
        },

        invoiceId: {
            type: Schema.Types.ObjectId,
            ref: 'Invoice',
            required: [true, 'Invoice is required'],
        },

        invoiceNumber: { type: String, required: true, trim: true },
        customerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
        customerName: { type: String, trim: true, default: '' },

        amount: {
            type: Number,
            required: [true, 'Payment amount is required'],
            min: [0.01, 'Amount must be greater than zero'],
        },

        mode: {
            type: String,
            required: [true, 'Payment mode is required'],
            enum: { values: PAYMENT_MODES, message: 'Invalid payment mode' },
        },

        paymentDate: {
            type: Date,
            required: [true, 'Payment date is required'],
            default: Date.now,
        },

        reference: { type: String, trim: true, maxlength: [100, 'Max 100 characters'] },
        notes: { type: String, trim: true, maxlength: [500, 'Max 500 characters'] },

        deletedAt: { type: Date, default: null },
        deletedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
        timestamps: true,
        toJSON: {
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

paymentSchema.index({ businessId: 1, deletedAt: 1 });
paymentSchema.index({ businessId: 1, invoiceId: 1, deletedAt: 1 });
paymentSchema.index({ businessId: 1, customerId: 1, deletedAt: 1 });
paymentSchema.index({ businessId: 1, paymentDate: -1, deletedAt: 1 });

export const Payment: Model<IPaymentDocument> = mongoose.model<IPaymentDocument>('Payment', paymentSchema);