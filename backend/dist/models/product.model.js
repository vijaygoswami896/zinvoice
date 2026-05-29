"use strict";
// import mongoose, { Document, Model, Schema } from 'mongoose';
// // ── Reference data ────────────────────────────────────────────────────────────
// /**
//  * Standard Indian units of measurement used on invoices.
//  * GST Council uses these UQC (Unit Quantity Codes).
//  */
// export const UNITS = [
//     'PCS', // Pieces
//     'NOS', // Numbers
//     'KGS', // Kilograms
//     'GMS', // Grams
//     'LTR', // Litres
//     'MLT', // Millilitres
//     'MTR', // Metres
//     'SQM', // Square metres
//     'CBM', // Cubic metres
//     'BOX', // Box
//     'PKT', // Packet
//     'BAG', // Bag
//     'SET', // Set
//     'PAR', // Pair
//     'ROL', // Roll
//     'TUB', // Tube
//     'HRS', // Hours — for services
//     'DAY', // Days — for services
//     'MON', // Month — for services
//     'JOB', // Job — for services
//     'OTH', // Others
// ] as const;
// export const VALID_GST_RATES = [0, 5, 12, 18, 28] as const;
// // ── Types ─────────────────────────────────────────────────────────────────────
// export type ProductType = 'goods' | 'service';
// export type UnitType = (typeof UNITS)[number];
// export type GstRateType = (typeof VALID_GST_RATES)[number];
// export interface IProduct extends Document {
//     businessId: mongoose.Types.ObjectId;
//     // Classification
//     name: string;
//     type: ProductType;
//     hsnSacCode?: string;
//     // Pricing
//     price: number;
//     unit: UnitType;
//     // Tax
//     gstRate: GstRateType;
//     taxIncluded: boolean;
//     // Inventory
//     inventoryEnabled: boolean;
//     stockQuantity: number;
//     lowStockThreshold: number;
//     // Meta
//     description?: string;
//     isActive: boolean;
//     // Soft delete
//     deletedAt: Date | null;
//     deletedBy: mongoose.Types.ObjectId | null;
//     // Virtuals
//     isLowStock: boolean;
//     createdAt: Date;
//     updatedAt: Date;
// }
// export interface ProductModel extends Model<IProduct> { }
// // ── Schema ────────────────────────────────────────────────────────────────────
// const productSchema = new Schema<IProduct, ProductModel>(
//     {
//         /**
//          * businessId scopes every product to a single business.
//          * All queries include { businessId, deletedAt: null }.
//          */
//         businessId: {
//             type: Schema.Types.ObjectId,
//             ref: 'User',
//             required: [true, 'businessId is required'],
//         },
//         // ── Classification ────────────────────────────────────────────────────────
//         name: {
//             type: String,
//             required: [true, 'Product name is required'],
//             trim: true,
//             minlength: [2, 'Name must be at least 2 characters'],
//             maxlength: [200, 'Name must not exceed 200 characters'],
//         },
//         /**
//          * type drives which code field applies:
//          *  - 'goods'   → HSN code
//          *  - 'service' → SAC code
//          */
//         type: {
//             type: String,
//             required: [true, 'Product type is required'],
//             enum: {
//                 values: ['goods', 'service'],
//                 message: 'Type must be goods or service',
//             },
//         },
//         /**
//          * Stored as string to preserve leading zeros.
//          */
//         hsnSacCode: {
//             type: String,
//             trim: true,
//             match: [/^\d{4,8}$/, 'HSN/SAC code must be 4 to 8 digits'],
//         },
//         // ── Pricing ───────────────────────────────────────────────────────────────
//         price: {
//             type: Number,
//             required: [true, 'Price is required'],
//             min: [0, 'Price cannot be negative'],
//         },
//         unit: {
//             type: String,
//             required: [true, 'Unit is required'],
//             enum: {
//                 values: UNITS,
//                 message: `Unit must be one of: ${UNITS.join(', ')}`,
//             },
//             default: 'PCS',
//         },
//         // ── Tax ───────────────────────────────────────────────────────────────────
//         gstRate: {
//             type: Number,
//             required: [true, 'GST rate is required'],
//             enum: {
//                 values: VALID_GST_RATES,
//                 message: `GST rate must be one of: ${VALID_GST_RATES.join(', ')}`,
//             },
//             default: 18,
//         },
//         taxIncluded: {
//             type: Boolean,
//             default: false,
//         },
//         // ── Inventory ─────────────────────────────────────────────────────────────
//         inventoryEnabled: {
//             type: Boolean,
//             default: false,
//         },
//         stockQuantity: {
//             type: Number,
//             min: [0, 'Stock cannot be negative'],
//             default: 0,
//         },
//         lowStockThreshold: {
//             type: Number,
//             min: [0, 'Threshold cannot be negative'],
//             default: 10,
//         },
//         // ── Meta ──────────────────────────────────────────────────────────────────
//         description: {
//             type: String,
//             trim: true,
//             maxlength: [1000, 'Description must not exceed 1000 characters'],
//         },
//         isActive: {
//             type: Boolean,
//             default: true,
//         },
//         // ── Soft delete ───────────────────────────────────────────────────────────
//         deletedAt: {
//             type: Date,
//             default: null,
//         },
//         deletedBy: {
//             type: Schema.Types.ObjectId,
//             ref: 'User',
//             default: null,
//         },
//     },
//     {
//         timestamps: true,
//         toJSON: {
//             virtuals: true,
//             transform: (_doc, ret: Record<string, unknown>) => {
//                 delete ret.__v;
//                 return ret;
//             },
//         },
//     }
// );
// // ── Indexes ───────────────────────────────────────────────────────────────────
// productSchema.index({ businessId: 1, deletedAt: 1 });
// productSchema.index({ businessId: 1, type: 1, deletedAt: 1 });
// productSchema.index({ businessId: 1, name: 1, deletedAt: 1 });
// productSchema.index({ businessId: 1, hsnSacCode: 1, deletedAt: 1 });
// productSchema.index({ businessId: 1, isActive: 1, deletedAt: 1 });
// // ── Virtuals ──────────────────────────────────────────────────────────────────
// /**
//  * isLowStock — true when inventory is enabled
//  * and stock is at or below threshold.
//  */
// productSchema.virtual('isLowStock').get(function (this: IProduct) {
//     return (
//         this.inventoryEnabled &&
//         this.stockQuantity <= this.lowStockThreshold
//     );
// });
// // ── Pre-validate ──────────────────────────────────────────────────────────────
// productSchema.pre('validate', function (next) {
//     const product = this as IProduct;
//     if (product.type === 'service' && product.inventoryEnabled) {
//         product.inventoryEnabled = false;
//         product.stockQuantity = 0;
//     }
//     next();
// });
// // ── Pre-save ──────────────────────────────────────────────────────────────────
// productSchema.pre('save', function (next) {
//     const product = this as IProduct;
//     // Default services to HRS unit if still PCS
//     if (
//         product.isModified('type') &&
//         product.type === 'service' &&
//         product.unit === 'PCS'
//     ) {
//         product.unit = 'HRS';
//     }
//     next();
// });
// // ── Model ─────────────────────────────────────────────────────────────────────
// export const Product = mongoose.model<IProduct, ProductModel>(
//     'Product',
//     productSchema
// );
//# sourceMappingURL=product.model.js.map