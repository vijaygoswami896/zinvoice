import mongoose, { Document, Schema, Model } from 'mongoose';
import { INDIAN_STATES, IndianState } from '../constants/india';

// ── Constants ─────────────────────────────────────────────────────────────────

// export const INDIAN_STATES = [
//     'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
//     'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
//     'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
//     'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
//     'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
//     'Andaman and Nicobar Islands', 'Chandigarh',
//     'Dadra and Nagar Haveli and Daman and Diu',
//     'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry',
// ] as const;

// export type IndianState = typeof INDIAN_STATES[number];
export type GstType = 'B2B' | 'B2C' | 'export';

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface IAddress {
    line1?: string;
    line2?: string;
    city?: string;
    state?: IndianState;
    pincode?: string;
    country?: string;
}

export interface ICustomer extends Document {
    businessId: mongoose.Types.ObjectId;
    name: string;
    gstin?: string;
    gstType: GstType;
    stateCode?: string;
    email?: string;
    phone?: string;
    billingAddress: IAddress;
    shippingAddress: IAddress;
    sameAsShipping: boolean;
    notes?: string;
    deletedAt: Date | null;
    deletedBy: mongoose.Types.ObjectId | null;
    createdAt: Date;
    updatedAt: Date;
}

// ── Sub-schema ────────────────────────────────────────────────────────────────

const addressSchema = new Schema<IAddress>(
    {
        line1: { type: String, trim: true, maxlength: [200, 'Too long'] },
        line2: { type: String, trim: true, maxlength: [200, 'Too long'] },
        city: { type: String, trim: true, maxlength: [100, 'Too long'] },
        state: { type: String, trim: true, enum: { values: INDIAN_STATES, message: 'Invalid Indian state' } },
        pincode: { type: String, trim: true, match: [/^\d{6}$/, 'Pincode must be 6 digits'] },
        country: { type: String, trim: true, default: 'India' },
    },
    { _id: false },
);

// ── Main schema ───────────────────────────────────────────────────────────────

const customerSchema = new Schema<ICustomer>(
    {
        businessId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Business',
            required: [true, 'businessId is required'],
        },

        name: {
            type: String,
            required: [true, 'Customer name is required'],
            trim: true,
            minlength: [2, 'At least 2 characters'],
            maxlength: [150, 'Max 150 characters'],
        },

        gstin: {
            type: String,
            trim: true,
            uppercase: true,
            match: [
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                'Invalid GSTIN format (e.g. 27AAPFU0939F1ZV)',
            ],
        },

        /**
         * B2B    → GSTIN required, inter-party GST invoices, ITC-eligible
         * B2C    → consumer, no GSTIN, aggregate in GSTR-1
         * export → zero-rated, SEZ / overseas
         */
        gstType: {
            type: String,
            enum: { values: ['B2B', 'B2C', 'export'], message: 'Must be B2B, B2C, or export' },
            default: 'B2C',
        },

        stateCode: { type: String, maxlength: 2 },

        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
        },

        phone: {
            type: String,
            trim: true,
            match: [/^[6-9]\d{9}$/, 'Invalid 10-digit Indian mobile number'],
        },

        billingAddress: { type: addressSchema, default: () => ({}) },
        shippingAddress: { type: addressSchema, default: () => ({}) },
        sameAsShipping: { type: Boolean, default: true },

        notes: { type: String, trim: true, maxlength: [1000, 'Max 1000 characters'] },

        // Soft delete
        deletedAt: { type: Date, default: null },
        deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },
    {
        timestamps: true,
        toJSON: {
            transform: (_doc: Document, ret: Record<string, unknown>) => {
                delete ret.__v;
                delete ret.deletedAt;       //--added
                delete ret.deletedBy;       //--added
                return ret;
            },
        },
    },
);

// ── Indexes ───────────────────────────────────────────────────────────────────

customerSchema.index({ businessId: 1, deletedAt: 1 });
customerSchema.index({ businessId: 1, name: 1, deletedAt: 1 });
customerSchema.index({ businessId: 1, email: 1, deletedAt: 1 });
customerSchema.index(
    { businessId: 1, gstin: 1 },
    {
        unique: true,
        sparse: true,
        partialFilterExpression: {
            gstin: { $exists: true, $ne: null },
            deletedAt: null,
        },
    },
);

// ── Pre-save: derive stateCode + coerce gstType from GSTIN ────────────────────

customerSchema.pre('save', function (next: mongoose.CallbackWithoutResultAndOptionalError) {
    if (this.isModified('gstin')) {
        if (this.gstin) {
            this.stateCode = this.gstin.slice(0, 2);
            if (this.gstType === 'B2C') this.gstType = 'B2B';
        } else {
            this.stateCode = undefined;
        }
    }
    next();
});

// ── Model ─────────────────────────────────────────────────────────────────────

export const Customer: Model<ICustomer> = mongoose.model<ICustomer>('Customer', customerSchema);