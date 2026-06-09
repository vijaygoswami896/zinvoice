import mongoose, { Schema, Document, Model } from 'mongoose';

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Seed units available to every business by default.
 * These are created automatically when a business is onboarded.
 */
const DEFAULT_UNITS = Object.freeze([
    { name: 'Piece', shortName: 'pcs' },
    { name: 'Kilogram', shortName: 'kg' },
    { name: 'Gram', shortName: 'g' },
    { name: 'Litre', shortName: 'ltr' },
    { name: 'Millilitre', shortName: 'ml' },
    { name: 'Meter', shortName: 'mtr' },
    { name: 'Box', shortName: 'box' },
    { name: 'Dozen', shortName: 'doz' },
] as const);

// ── Interfaces ────────────────────────────────────────────────────────────────

interface IUnit extends Document {
    _id: mongoose.Types.ObjectId;

    /** Tenant anchor — every unit belongs to one business */
    businessId: mongoose.Types.ObjectId;

    /** Created by — audit trail */
    createdBy: mongoose.Types.ObjectId;

    /** Last modified by — audit trail */
    updatedBy: mongoose.Types.ObjectId | null;

    /** Display name  e.g. "Kilogram" */
    name: string;

    /** Abbreviated label used on invoices  e.g. "kg" */
    shortName: string;

    /**
     * System-seeded units cannot be edited or deleted by the tenant.
     * Custom units added by the tenant have isDefault = false.
     */
    isDefault: boolean;

    /** Soft-delete flag — keeps referential integrity on existing invoice lines */
    isDeleted: boolean;

    /** Populated when the unit is soft-deleted */
    deletedAt: Date | null;

    /** Who performed the soft-delete */
    deletedBy: mongoose.Types.ObjectId | null;

    /** Timestamps from mongoose */
    createdAt: Date;
    updatedAt: Date;

    // ── Instance helpers ──────────────────────────────────────────────────────

    /** Soft-delete this unit. Call `save()` after. */
    softDelete(deletedBy: mongoose.Types.ObjectId): void;

    /** Restore a previously soft-deleted unit. Call `save()` after. */
    restore(): void;
}

interface IUnitModel extends Model<IUnit> {
    /**
     * Returns all active (non-deleted) units for the given business,
     * ordered: defaults first, then custom units alphabetically.
     */
    findActiveByBusiness(businessId: mongoose.Types.ObjectId | string): Promise<IUnit[]>;

    /**
     * Seed the default unit list for a newly created business.
     * Safe to call multiple times — uses upsert logic (no duplicates).
     */
    seedDefaultsForBusiness(
        businessId: mongoose.Types.ObjectId | string,
        createdBy: mongoose.Types.ObjectId | string,
    ): Promise<void>;
}

// ── Schema ────────────────────────────────────────────────────────────────────

const unitSchema = new Schema<IUnit, IUnitModel>(
    {
        businessId: {
            type: Schema.Types.ObjectId,
            ref: 'Business',
            required: [true, 'Business reference is required'],
            index: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator reference is required'],
        },
        updatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        name: {
            type: String,
            required: [true, 'Unit name is required'],
            trim: true,
            minlength: [1, 'Unit name cannot be empty'],
            maxlength: [50, 'Unit name cannot exceed 50 characters'],
        },
        shortName: {
            type: String,
            required: [true, 'Short name is required'],
            trim: true,
            minlength: [1, 'Short name cannot be empty'],
            maxlength: [10, 'Short name cannot exceed 10 characters'],
            // Stored in lowercase for consistent display on invoices (kg, pcs, ltr)
            set: (v: string) => v.toLowerCase().trim(),
        },
        isDefault: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            select: false,
        },
        deletedAt: {
            type: Date,
            default: null,
            select: false,
        },
        deletedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
            select: false,
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_doc, ret) {
                const { __v, isDeleted, deletedAt, deletedBy, ...rest } = ret;
                return rest;
            },
        },
    },
);

// ── Indexes ───────────────────────────────────────────────────────────────────

/**
 * Primary query pattern: fetch all active units for a business.
 */
unitSchema.index({ businessId: 1, isDeleted: 1 });

/**
 * Uniqueness: a business cannot have two units with the same name (case-insensitive).
 * The collation enforces case-insensitive uniqueness at the DB level.
 */
unitSchema.index(
    { businessId: 1, name: 1 },
    {
        unique: true,
        partialFilterExpression: { isDeleted: false },
        collation: { locale: 'en', strength: 2 },
        name: 'unique_unit_name_per_business',
    },
);

/**
 * Uniqueness: a business cannot have two units with the same shortName.
 */
unitSchema.index(
    { businessId: 1, shortName: 1 },
    {
        unique: true,
        partialFilterExpression: { isDeleted: false },
        name: 'unique_unit_shortname_per_business',
    },
);

/**
 * Ordering helper: list defaults before custom units.
 */
unitSchema.index({ businessId: 1, isDefault: -1, name: 1 });

// ── Instance methods ──────────────────────────────────────────────────────────

unitSchema.methods.softDelete = function (
    deletedBy: mongoose.Types.ObjectId,
): void {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy;
};

unitSchema.methods.restore = function (): void {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
};

// ── Statics ───────────────────────────────────────────────────────────────────

unitSchema.statics.findActiveByBusiness = function (
    businessId: mongoose.Types.ObjectId | string,
): Promise<IUnit[]> {
    return this.find({
        businessId: new mongoose.Types.ObjectId(businessId.toString()),
        isDeleted: false,
    })
        .select('-__v')
        .sort({ isDefault: -1, name: 1 })  // defaults first, then alphabetical
        // .lean()
        .exec();
};

unitSchema.statics.seedDefaultsForBusiness = async function (
    businessId: mongoose.Types.ObjectId | string,
    createdBy: mongoose.Types.ObjectId | string,
): Promise<void> {
    const bId = new mongoose.Types.ObjectId(businessId.toString());
    const cId = new mongoose.Types.ObjectId(createdBy.toString());

    const ops = DEFAULT_UNITS.map((unit) => ({
        updateOne: {
            filter: {
                businessId: bId,
                shortName: unit.shortName,
                isDefault: true,
            },
            update: {
                $setOnInsert: {
                    businessId: bId,
                    createdBy: cId,
                    updatedBy: null,
                    name: unit.name,
                    shortName: unit.shortName,
                    isDefault: true,
                    isDeleted: false,
                    deletedAt: null,
                    deletedBy: null,
                },
            },
            upsert: true,
        },
    }));

    await this.bulkWrite(ops, { ordered: false });
};

// ── Model ─────────────────────────────────────────────────────────────────────

const Unit = mongoose.model<IUnit, IUnitModel>('Unit', unitSchema);

export { Unit, DEFAULT_UNITS };
export type { IUnit };