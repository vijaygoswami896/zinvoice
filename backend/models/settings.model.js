'use strict';

const mongoose = require('mongoose');

/**
 * Indian state codes for place-of-supply validation (GSTIN prefix).
 * State code is the first 2 digits of a GSTIN.
 */
const INDIAN_STATE_CODES = [
  '01','02','03','04','05','06','07','08','09','10',
  '11','12','13','14','15','16','17','18','19','20',
  '21','22','23','24','25','26','27','28','29','30',
  '31','32','33','34','35','36','37','38','97','99',
];

const INDIAN_STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram',
  'Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
  'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu',
  'Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry',
];

// ── Sub-schemas ───────────────────────────────────────────────────────────────

const addressSchema = new mongoose.Schema(
  {
    line1:    { type: String, trim: true, maxlength: 200 },
    line2:    { type: String, trim: true, maxlength: 200 },
    city:     { type: String, trim: true, maxlength: 100 },
    state:    { type: String, trim: true, enum: { values: INDIAN_STATES, message: 'Invalid Indian state' } },
    pincode:  {
      type: String,
      trim: true,
      match: [/^\d{6}$/, 'Pincode must be exactly 6 digits'],
    },
    country:  { type: String, default: 'India', trim: true },
  },
  { _id: false },
);

const bankDetailsSchema = new mongoose.Schema(
  {
    bankName:      { type: String, trim: true, maxlength: 100 },
    accountName:   { type: String, trim: true, maxlength: 100 },
    accountNumber: { type: String, trim: true, maxlength: 20 },
    ifscCode:      {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code format (e.g. SBIN0001234)'],
    },
    branch:        { type: String, trim: true, maxlength: 100 },
    upiId:         { type: String, trim: true, maxlength: 100 },
  },
  { _id: false },
);

// ── Uploaded file sub-document ────────────────────────────────────────────────

const uploadedFileSchema = new mongoose.Schema(
  {
    url:          { type: String, required: true },  // Served URL / path
    originalName: { type: String },
    mimetype:     { type: String },
    size:         { type: Number },                  // bytes
    uploadedAt:   { type: Date, default: Date.now },
  },
  { _id: false },
);

// ── Main settings schema ──────────────────────────────────────────────────────

const settingsSchema = new mongoose.Schema(
  {
    /**
     * businessId links settings to a user.
     * One settings document per user (enforced by unique index).
     * When multi-business support is added, scope to a Business model.
     */
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // ── Business identity ───────────────────────────────────────────────────

    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      minlength: [2, 'Business name must be at least 2 characters'],
      maxlength: [150, 'Business name must not exceed 150 characters'],
    },

    legalName: {
      type: String,
      trim: true,
      maxlength: [150, 'Legal name must not exceed 150 characters'],
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

    pan: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g. AAPFU0939F)'],
    },

    registrationDate: { type: Date },

    gstRegistrationType: {
      type: String,
      enum: {
        values: ['regular', 'composition', 'unregistered'],
        message: 'Registration type must be regular, composition, or unregistered',
      },
      default: 'regular',
    },

    // ── Contact ─────────────────────────────────────────────────────────────

    email:   { type: String, trim: true, lowercase: true, maxlength: 255 },
    phone:   { type: String, trim: true, match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number'] },
    website: { type: String, trim: true, maxlength: 200 },

    // ── Address ─────────────────────────────────────────────────────────────

    address: { type: addressSchema, default: () => ({}) },

    /**
     * stateCode: 2-digit Indian state code derived from GSTIN.
     * Used to determine CGST/SGST vs IGST on invoices.
     * Stored separately so it's queryable without parsing GSTIN.
     */
    stateCode: {
      type: String,
      enum: { values: INDIAN_STATE_CODES, message: 'Invalid Indian state code' },
    },

    // ── Bank ────────────────────────────────────────────────────────────────

    bankDetails: { type: bankDetailsSchema, default: () => ({}) },

    // ── Invoice settings ────────────────────────────────────────────────────

    invoicePrefix: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'INV',
      match: [/^[A-Z0-9\-]{1,10}$/, 'Invoice prefix must be 1–10 alphanumeric characters'],
    },

    invoiceNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Invoice notes must not exceed 1000 characters'],
    },

    invoiceTerms: {
      type: String,
      trim: true,
      maxlength: [2000, 'Payment terms must not exceed 2000 characters'],
    },

    defaultDueDays: {
      type: Number,
      min: [0, 'Due days cannot be negative'],
      max: [365, 'Due days cannot exceed 365'],
      default: 30,
    },

    // ── Uploads ─────────────────────────────────────────────────────────────

    logo:      { type: uploadedFileSchema, default: null },
    signature: { type: uploadedFileSchema, default: null },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

// ── Indexes ───────────────────────────────────────────────────────────────────

settingsSchema.index({ businessId: 1 }, { unique: true });

// ── Pre-save: derive stateCode from GSTIN ─────────────────────────────────────

settingsSchema.pre('save', function (next) {
  if (this.isModified('gstin') && this.gstin) {
    this.stateCode = this.gstin.slice(0, 2);
  }
  next();
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = { Settings, INDIAN_STATES, INDIAN_STATE_CODES };
