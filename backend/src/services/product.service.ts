import mongoose, { FilterQuery, FlattenMaps, SortOrder } from 'mongoose';

// import { IProduct, Product } from '../models/product.model.js';
import AppError from '../utils/appError.js';
import logger from '../middleware/logger.js';

import {
    ProductBodyInput,
    ProductListQueryInput,
} from '../schemas/product.schema.server.js';
import { IProduct } from '../types/index.js';
import { Product } from '../models/product.model.js';

// type LeanProduct = mongoose.mongo.WithId<mongoose.FlattenMaps<IProduct>>;

// ── Helpers ───────────────────────────────────────────────────────────────────

const baseFilter = (
    businessId: string
): FilterQuery<IProduct> => ({
    businessId,
    deletedAt: null,
});

const escapeRegex = (str: string): string =>
    str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProductListResult {
    items: Array<Record<string, unknown> & { isLowStock: boolean }>;
    total: number;
    page: number;
    limit: number;
}

// ── List ──────────────────────────────────────────────────────────────────────

/**
 * List products with pagination, search, and filters.
 * Also used by the invoice line-item product picker (search only).
 */
export const listProducts = async (
    businessId: string,
    query: ProductListQueryInput
): Promise<ProductListResult> => {
    const {
        page,
        limit,
        search,
        type,
        gstRate,
        isActive,
        lowStock,
        sortBy,
        sortDir,
    } = query;

    const filter: FilterQuery<IProduct> = baseFilter(businessId);

    // Full-text style search across name, HSN/SAC code, description
    if (search) {
        const regex = new RegExp(escapeRegex(search), 'i');

        filter.$or = [
            { name: regex },
            { hsnSacCode: regex },
            { description: regex },
        ];
    }

    if (type) {
        filter.type = type;
    }

    if (gstRate !== undefined) {
        filter.gstRate = gstRate;
    }

    if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
    }

    // Low-stock filter
    if (lowStock === 'true') {
        filter.inventoryEnabled = true;
        filter.type = 'goods';

        (filter as any).$expr = {
            $lte: ['$stockQuantity', '$lowStockThreshold'],
        };
    }

    const sort: Record<string, SortOrder> = {
        [sortBy]: sortDir === 'asc' ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean(),

        Product.countDocuments(filter),
    ]);

    // Reattach virtual since lean() strips virtuals
    const itemsWithVirtual = items.map((product) => ({
        ...product,

        isLowStock:
            product.inventoryEnabled &&
            product.stockQuantity <= product.lowStockThreshold,
    }));

    return {
        items: itemsWithVirtual,
        total,
        page,
        limit,
    };
};

// ── Get single ────────────────────────────────────────────────────────────────

export const getProduct = async (
    businessId: string,
    productId: string
): Promise<IProduct> => {
    const product = await Product.findOne({
        _id: productId,
        ...baseFilter(businessId),
    });

    if (!product) {
        throw new AppError(
            'Product not found.',
            404,
            'NOT_FOUND'
        );
    }

    return product;
};

// ── Create ────────────────────────────────────────────────────────────────────

export const createProduct = async (
    businessId: string,
    dto: ProductBodyInput
): Promise<IProduct> => {
    const product = await Product.create({
        ...dto,
        businessId,
    });

    logger.info({
        msg: 'Product created',
        businessId,
        productId: product._id,
        type: dto.type,
    });

    return product;
};

// ── Update ────────────────────────────────────────────────────────────────────

export const updateProduct = async (
    businessId: string,
    productId: string,
    dto: Partial<ProductBodyInput>
): Promise<IProduct> => {
    const product = await Product.findOneAndUpdate(
        {
            _id: productId,
            ...baseFilter(businessId),
        },
        {
            $set: dto,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!product) {
        throw new AppError(
            'Product not found.',
            404,
            'NOT_FOUND'
        );
    }

    logger.info({
        msg: 'Product updated',
        businessId,
        productId,
    });

    return product;
};

// ── Soft delete ───────────────────────────────────────────────────────────────

export const deleteProduct = async (
    businessId: string,
    productId: string,
    deletedBy: string
): Promise<IProduct> => {
    const product = await Product.findOneAndUpdate(
        {
            _id: productId,
            ...baseFilter(businessId),
        },
        {
            $set: {
                deletedAt: new Date(),
                deletedBy,
            },
        },
        {
            new: true,
        }
    );

    if (!product) {
        throw new AppError(
            'Product not found.',
            404,
            'NOT_FOUND'
        );
    }

    logger.info({
        msg: 'Product soft-deleted',
        businessId,
        productId,
        deletedBy,
    });

    return product;
};

// ── Stock adjustment ──────────────────────────────────────────────────────────

/**
 * Atomically increment or decrement stock quantity.
 * Used internally by the invoice module when recording sales.
 */
export const adjustStock = async (
    businessId: string,
    productId: string,
    delta: number,
    reason = ''
): Promise<IProduct> => {

    // First verify product exists
    const existing = await Product.findOne({ _id: productId, ...baseFilter(businessId) });

    if (!existing) throw new AppError('Product not found.', 404, 'NOT_FOUND');

    if (!existing.inventoryEnabled) throw new AppError('Inventory not enabled for this product.', 400, 'INVENTORY_DISABLED');

    // Then do atomic stock update
    const product = await Product.findOneAndUpdate(
        {
            _id: productId,
            ...baseFilter(businessId),
            inventoryEnabled: true,
            ...(delta < 0 ? { stockQuantity: { $gte: Math.abs(delta) } } : {}),
        },
        { $inc: { stockQuantity: delta } },
        { new: true },
    );

    if (!product) throw new AppError('Insufficient stock.', 400, 'INSUFFICIENT_STOCK');

    logger.info({
        msg: 'Stock adjusted',
        businessId,
        productId,
        delta,
        newStock: product.stockQuantity,
        reason,
    });

    return product;
};

// ── Bulk fetch ────────────────────────────────────────────────────────────────

/**
 * Bulk-fetch products by ID array.
 * Used by invoice module for line-item resolution.
 */
export const getProductsByIds = async (
    businessId: string,
    ids: string[]
) => {
    if (ids.length === 0) return new Map(); // ← add this guard

    const products = await Product.find({
        _id: { $in: ids },
        ...baseFilter(businessId),
        isActive: true,
    }).lean();

    return new Map(
        products.map((product) => [
            product._id.toString(),
            product,
        ])
    );
};