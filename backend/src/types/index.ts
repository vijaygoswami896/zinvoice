// import { Request } from 'express';

import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { GstRateType, UNITS, UnitType, VALID_GST_RATES } from '../constants/products';
import { PlaceOfSupplyResult } from '../gst/gstUtils';
import { GSTRate, GSTType } from '../gst/gstConstants';

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

export interface RawLineItem {
    name?: string;
    quantity: number;
    rate: number;
    gstRate: GSTRate;
    taxIncluded?: boolean;
    discountPct?: number;
    hsnSacCode?: string;
    itemType?: string;
    [key: string]: unknown;
}

export interface ComputedLineItem {
    name: string;
    quantity: number;
    rate: number;
    effectiveRate: number;
    gstRate: GSTRate;
    discountPct: number;
    discountAmt: number;
    taxIncluded: boolean;
    taxableAmount: number;
    gstAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    lineTotal: number;
    hsnSacCode?: string;
    itemType?: string;
    [key: string]: unknown;
}

export interface InvoiceTotals {
    subtotal: number;
    totalDiscount: number;
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;
    totalTax: number;
    grandTotal: number;
    roundOff: number;
    grandTotalRounded: number;
}

export interface HSNSummaryRow {
    hsnSacCode: string;
    description: string;
    itemType: string;
    gstRate: GSTRate;
    taxableAmount: number;
    cgst: number;
    sgst: number;
    igst: number;
    gstAmount: number;
    total: number;
}

export interface TaxRateSummaryRow {
    gstRate: GSTRate;
    taxableAmount: number;
    cgstRate: number;
    cgst: number;
    sgstRate: number;
    sgst: number;
    igstRate: number;
    igst: number;
    totalTax: number;
}

export interface PlaceOfSupply {
    isIGST: boolean;
    supplyType: string;
    [key: string]: unknown;
}

export interface InvoiceInput {
    sellerStateCode: string;
    buyerStateCode: string;
    gstType: GSTType;
    items: RawLineItem[];
    customerId?: string;
    invoiceDate?: string;
    dueDate?: string;
    customerGstin?: string;
}

export interface ComputeInvoiceOptions {
    skipValidation?: boolean;
    includeAmountInWords?: boolean;
    includeHSNSummary?: boolean;
    includeTaxRateSummary?: boolean;
}

export type ComputeInvoiceResult =
    | { valid: false; errors: string[] }
    | {
        valid: true;
        errors: [];
        placeOfSupply: PlaceOfSupplyResult;
        isIGST: boolean;
        supplyType: string;
        items: ComputedLineItem[];
        totals: InvoiceTotals;
        hsnSummary: HSNSummaryRow[];
        taxRateSummary: TaxRateSummaryRow[];
        amountInWords: string;
    };

export interface NonGSTInvoiceItem {
    name: string;
    quantity: number;
    rate: number;
    discountPct?: number;
    [key: string]: unknown;
}

export interface NonGSTComputedItem extends NonGSTInvoiceItem {
    effectiveRate: number;
    discountAmt: number;
    taxableAmount: number;
    gstAmount: 0;
    cgst: 0;
    sgst: 0;
    igst: 0;
    gstRate: 0;
    lineTotal: number;
}

export interface NonGSTInvoiceResult {
    items: NonGSTComputedItem[];
    subtotal: number;
    totalDiscount: number;
    totalTax: 0;
    totalCgst: 0;
    totalSgst: 0;
    totalIgst: 0;
    grandTotal: number;
    amountInWords: string;
    supplyType: string;
    isIGST: false;
}

export interface FinancialYearBounds {
    from: Date;
    to: Date;
    label: string;
}

export interface StatusRow {
    _id: string;
    count: number;
    totalValue: number;
    totalTax: number;
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;
}

export interface LifetimeRow {
    totalInvoices: number;
    totalRevenue: number;
    totalGST: number;
}

export interface MonthlyRevenueRow {
    _id: { year: number; month: number };
    revenue: number;
    gstCollected: number;
    invoiceCount: number;
    paidRevenue: number;
}

export interface MonthlyRevenuePoint {
    label: string;
    month: number;
    year: number;
    revenue: number;
    gstCollected: number;
    paidRevenue: number;
    invoiceCount: number;
}

export interface GSTSummaryResult {
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;
    totalTax: number;
    totalRevenue: number;
    intraState: number;
    interState: number;
    financialYear: string;
}

export interface TopCustomerRow {
    _id: Types.ObjectId;
    customerName: string;
    totalValue: number;
    invoiceCount: number;
}

export interface EntityCounts {
    customers: number;
    products: number;
    lowStock: number;
}

export interface DashboardQuery {
    revenueMonths?: number;
}