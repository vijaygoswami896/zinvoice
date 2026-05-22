// import { Request } from 'express';

import mongoose, { Document, Model, Schema } from 'mongoose';
import { GstRateType, UNITS, UnitType, VALID_GST_RATES } from '../constants/products';

export interface EnvTypes {
    NODE_ENV: string;
    PORT: number;
    CLIENT_URL: string;

    MONGO_URI: string;
    MONGO_MIN_POOL_SIZE: number;
    MONGO_MAX_POOL_SIZE: number;

    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;

    // SMTP_HOST: string;
    // SMTP_PORT: number;
    // SMTP_USER: string;
    // SMTP_PASS: string;
    // MAIL_FROM: string;

    // PUPPETEER_EXECUTABLE_PATH: string;
    // PDF_STORAGE_PATH: string;

    RATE_LIMIT_WINDOW_MS: number;
    RATE_LIMIT_MAX: number;
    RATE_LIMIT_AUTH_MAX: number;

    LOG_LEVEL: string;

    isProd: boolean;
    isDev: boolean;
    isTest: boolean;
}

// export interface AuthenticatedRequest extends Request {
//     user: { id: string; role: string }; // non-optional — guaranteed by authenticate middleware
// }

// export interface AuthenticatedRequest extends Request {
//     user: {
//         id: string;
//         role: string;
//         businessId?: string; // add this
//     };
// }

export type ProductType = 'goods' | 'service';

export interface IProduct extends Document {
    businessId: mongoose.Types.ObjectId;

    // Classification
    name: string;
    type: ProductType;
    hsnSacCode?: string;

    // Pricing
    price: number;
    unit: UnitType;

    // Tax
    gstRate: GstRateType;
    taxIncluded: boolean;

    // Inventory
    inventoryEnabled: boolean;
    stockQuantity: number;
    lowStockThreshold: number;

    // Meta
    description?: string;
    isActive: boolean;

    // Soft delete
    deletedAt: Date | null;
    deletedBy: mongoose.Types.ObjectId | null;

    // Virtuals
    isLowStock: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export interface ProductModel extends Model<IProduct> { }