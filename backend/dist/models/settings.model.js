import mongoose, { Schema } from 'mongoose';
import { INDIAN_STATE_CODES, INDIAN_STATES } from '../constants/india.js';
// ── Sub-schemas ───────────────────────────────────────────────────────────────
const addressSchema = new Schema({
    line1: { type: String, trim: true, maxlength: 200 },
    line2: { type: String, trim: true, maxlength: 200 },
    city: { type: String, trim: true, maxlength: 100 },
    state: { type: String, trim: true, enum: { values: INDIAN_STATES, message: 'Invalid Indian state' } },
    pincode: { type: String, trim: true, match: [/^\d{6}$/, 'Pincode must be exactly 6 digits'] },
    country: { type: String, default: 'India', trim: true },
}, { _id: false });
const bankDetailsSchema = new Schema({
    bankName: { type: String, trim: true, maxlength: 100 },
    accountName: { type: String, trim: true, maxlength: 100 },
    accountNumber: { type: String, trim: true, maxlength: 20 },
    ifscCode: { type: String, trim: true, uppercase: true, match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format (e.g. SBIN0001234)'] },
    branch: { type: String, trim: true, maxlength: 100 },
    upiId: { type: String, trim: true, maxlength: 100 },
}, { _id: false });
const uploadedFileSchema = new Schema({
    url: { type: String, required: true },
    originalName: { type: String },
    mimetype: { type: String },
    size: { type: Number },
    uploadedAt: { type: Date, default: Date.now },
}, { _id: false });
// ── Main schema ───────────────────────────────────────────────────────────────
const settingsSchema = new Schema({
    businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true },
    businessName: { type: String, required: [true, 'Business name is required'], trim: true, minlength: [2, 'Business name must be at least 2 characters'], maxlength: [150, 'Business name must not exceed 150 characters'] },
    legalName: { type: String, trim: true, maxlength: [150, 'Legal name must not exceed 150 characters'] },
    gstin: { type: String, trim: true, uppercase: true, match: [/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Invalid GSTIN format (e.g. 27AAPFU0939F1ZV)'] },
    pan: { type: String, trim: true, uppercase: true, match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. AAPFU0939F)'] },
    registrationDate: { type: Date },
    gstRegistrationType: { type: String, enum: { values: ['regular', 'composition', 'unregistered'], message: 'Registration type must be regular, composition, or unregistered' }, required: [true, 'GST registration type is required'], },
    // gstRegistrationType: { type: String, enum: { values: ['regular', 'composition', 'unregistered'], message: 'Registration type must be regular, composition, or unregistered' }, default: 'regular' },
    email: { type: String, trim: true, lowercase: true, maxlength: 255 },
    phone: { type: String, trim: true, match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'] },
    website: { type: String, trim: true, maxlength: 200 },
    address: { type: addressSchema, default: () => ({}) },
    stateCode: { type: String, enum: { values: INDIAN_STATE_CODES, message: 'Invalid Indian state code' } },
    bankDetails: { type: bankDetailsSchema, default: () => ({}) },
    invoicePrefix: { type: String, trim: true, uppercase: true, default: 'INV', match: [/^[A-Z0-9\-]{1,10}$/, 'Invoice prefix must be 1-10 alphanumeric characters'] },
    invoiceNotes: { type: String, trim: true, maxlength: [1000, 'Invoice notes must not exceed 1000 characters'] },
    invoiceTerms: { type: String, trim: true, maxlength: [2000, 'Payment terms must not exceed 2000 characters'] },
    defaultDueDays: { type: Number, min: [0, 'Due days cannot be negative'], max: [365, 'Due days cannot exceed 365'], default: 30 },
    logo: { type: uploadedFileSchema, default: null },
    signature: { type: uploadedFileSchema, default: null },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            delete ret.__v;
            return ret;
        },
    },
});
settingsSchema.index({ businessId: 1 }, { unique: true });
settingsSchema.pre('save', function (next) {
    // if (this.isModified('gstin') && this.gstin) {
    //   this.stateCode = this.gstin.slice(0, 2);
    // }
    // next();
    if (this.isModified('gstin')) {
        this.stateCode = this.gstin ? this.gstin.slice(0, 2) : undefined;
    }
    next();
});
const Settings = mongoose.model('Settings', settingsSchema);
export { Settings, INDIAN_STATES, INDIAN_STATE_CODES };
//# sourceMappingURL=settings.model.js.map