import mongoose, { Types } from 'mongoose';

import { Invoice } from '../models/invoice.model.js';
import { Customer } from '../models/customer.model.js';
import { Settings } from '../models/settings.model.js';
import { getProductsByIds } from '../services/product.service.js';
import AppError from '../utils/appError.js';
import logger from '../middleware/logger.js';
import { generateInvoiceNumber } from '../utils/invoiceNumber.js';
import { shouldApplyIGST, computeLineItem, computeInvoiceTotals } from '../utils/gstCalculator.js';
import type { InvoiceListQueryInput, CreateInvoiceInput, UpdateInvoiceInput } from '../schemas/invoice.schema.server.js';
import type { ICustomer } from '../models/customer.model.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const baseFilter = (bId: string | Types.ObjectId) => ({ businessId: bId, deletedAt: null });
const escRx = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ── Typed internals ───────────────────────────────────────────────────────────

interface ResolvedSettings {
    prefix: string;
    sellerStateCode: string;
    defaultNotes: string;
    defaultTerms: string;
}

interface RawLineItemDTO {
    productId?: string | null;
    name?: string;
    description?: string;
    hsnSacCode?: string;
    unit?: string;
    itemType?: 'goods' | 'service';
    quantity: number | string;
    rate: number | string;
    gstRate: number | string;
    taxIncluded?: boolean;
    discountPct?: number | string;
}

// ── Resolve helpers ───────────────────────────────────────────────────────────

const resolveCustomer = async (businessId: string | Types.ObjectId, customerId: string) => {
    const customer = await Customer.findOne({ _id: customerId, ...baseFilter(businessId) });
    if (!customer) throw new AppError('Customer not found.', 404, 'NOT_FOUND');
    return customer;
};

const resolveSettings = async (businessId: string | Types.ObjectId): Promise<ResolvedSettings> => {
    const settings = await Settings.findOne({ businessId });
    return {
        prefix: settings?.invoicePrefix ?? 'INV',
        sellerStateCode: settings?.stateCode ?? '',
        defaultNotes: settings?.invoiceNotes ?? '',
        defaultTerms: settings?.invoiceTerms ?? '',
    };
};

// ── Build computed line items from raw DTO items ──────────────────────────────

const buildLineItems = async (
    businessId: string | Types.ObjectId,
    rawItems: RawLineItemDTO[],
    applyIGST: boolean,
) => {
    // Batch-fetch linked products (O(1) map lookup per item)
    const productIds = rawItems.filter((i) => i.productId).map((i) => i.productId as string);
    const productMap = productIds.length
        ? await getProductsByIds(String(businessId), productIds)
        : new Map<string, any>();

    return rawItems.map((item) => {
        const product = item.productId ? productMap.get(String(item.productId)) : null;

        // Merge product defaults → item overrides (item always wins)
        const merged = {
            productId: item.productId ?? null,
            name: item.name || product?.name || '',
            description: item.description ?? product?.description ?? '',
            hsnSacCode: item.hsnSacCode ?? product?.hsnSacCode ?? '',
            unit: item.unit || product?.unit || 'PCS',
            itemType: (item.itemType || product?.type || 'goods') as 'goods' | 'service',
            quantity: Number(item.quantity),
            rate: Number(item.rate),
            gstRate: Number(item.gstRate),
            taxIncluded: item.taxIncluded ?? product?.taxIncluded ?? false,
            discountPct: Number(item.discountPct ?? 0),
        };

        const tax = computeLineItem(merged, applyIGST);
        return { ...merged, ...tax };
    });
};

// ── LIST ──────────────────────────────────────────────────────────────────────

export const listInvoices = async (
    businessId: string | Types.ObjectId,
    query: InvoiceListQueryInput,
) => {
    const { page, limit, search, status, customerId, dateFrom, dateTo, sortBy, sortDir } = query;
    const filter: Record<string, any> = baseFilter(businessId);

    if (search) {
        const rx = new RegExp(escRx(search), 'i');
        filter.$or = [
            { invoiceNumber: rx },
            { customerName: rx },
            { customerGstin: rx },
        ];
    }

    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;

    if (dateFrom || dateTo) {
        filter.invoiceDate = {};
        if (dateFrom) filter.invoiceDate.$gte = new Date(dateFrom);
        if (dateTo) filter.invoiceDate.$lte = new Date(dateTo);
    }

    const sort: Record<string, 1 | -1> = { [sortBy]: sortDir === 'asc' ? 1 : -1 };
    const skip = (page - 1) * limit;

    // Exclude heavy fields from listing — loaded only on detail view
    const projection = '-items -billingAddress -shippingAddress -internalNotes -termsAndConditions';

    const [items, total] = await Promise.all([
        Invoice.find(filter).select(projection).sort(sort).skip(skip).limit(limit).lean(),
        Invoice.countDocuments(filter),
    ]);

    return { items, total, page, limit };
};

// ── GET SINGLE ────────────────────────────────────────────────────────────────

export const getInvoice = async (
    businessId: string | Types.ObjectId,
    invoiceId: string,
) => {
    const invoice = await Invoice.findOne({ _id: invoiceId, ...baseFilter(businessId) });
    if (!invoice) throw new AppError('Invoice not found.', 404, 'NOT_FOUND');
    return invoice;
};

// ── CREATE ────────────────────────────────────────────────────────────────────

export const createInvoice = async (
    businessId: string | Types.ObjectId,
    dto: CreateInvoiceInput,
) => {
    // Parallel: customer + settings (independent queries)
    const [customer, settings] = await Promise.all([
        resolveCustomer(businessId, dto.customerId),
        resolveSettings(businessId),
    ]);

    const applyIGST = shouldApplyIGST(
        settings.sellerStateCode,
        customer.stateCode,
        customer.gstType,
    );

    const lineItems = await buildLineItems(businessId, dto.items as RawLineItemDTO[], applyIGST);
    const totals = computeInvoiceTotals(lineItems, applyIGST);

    const { invoiceNumber, financialYear, seq } = await generateInvoiceNumber({
        businessId,
        prefix: settings.prefix,
        invoiceDate: dto.invoiceDate,
    });

    const invoice = await Invoice.create({
        businessId,
        invoiceNumber,
        financialYear,
        seq,

        // Customer snapshot — immutable from this point on
        customerId: customer._id,
        customerName: customer.name,
        customerGstin: customer.gstin ?? '',
        customerEmail: customer.email ?? '',
        customerPhone: customer.phone ?? '',

        billingAddress: customer.billingAddress ?? {},
        shippingAddress: customer.sameAsShipping
            ? (customer.billingAddress ?? {})
            : (customer.shippingAddress ?? {}),

        sellerStateCode: settings.sellerStateCode,
        placeOfSupply: customer.stateCode ?? '',
        isIGST: applyIGST,

        invoiceDate: dto.invoiceDate,
        dueDate: dto.dueDate ?? null,

        items: lineItems,
        ...totals,

        status: dto.status ?? 'draft',
        notes: dto.notes ?? settings.defaultNotes,
        termsAndConditions: dto.termsAndConditions ?? settings.defaultTerms,
        internalNotes: dto.internalNotes ?? '',
    });

    logger.info({ msg: 'Invoice created', businessId, invoiceId: invoice._id, invoiceNumber });
    return invoice;
};

// ── UPDATE ────────────────────────────────────────────────────────────────────

/**
 * Only draft and sent invoices can be edited.
 * Paid / cancelled invoices are immutable — cancel and re-raise instead.
 */
export const updateInvoice = async (
    businessId: string | Types.ObjectId,
    invoiceId: string,
    dto: UpdateInvoiceInput,
) => {
    const existing = await Invoice.findOne({ _id: invoiceId, ...baseFilter(businessId) });
    if (!existing) throw new AppError('Invoice not found.', 404, 'NOT_FOUND');

    if (['paid', 'cancelled'].includes(existing.status)) {
        throw new AppError(
            `Cannot edit a ${existing.status} invoice. Cancel it and raise a new one.`,
            400,
            'IMMUTABLE_INVOICE',
        );
    }

    const updates: Record<string, any> = {};

    if (dto.items) {
        const settings = await resolveSettings(businessId);
        const customer = await Customer.findById(existing.customerId).lean<ICustomer>();
        const applyIGST = shouldApplyIGST(
            settings.sellerStateCode,
            customer?.stateCode ?? existing.placeOfSupply,
            customer?.gstType ?? 'B2C',
        );

        updates.isIGST = applyIGST;
        updates.items = await buildLineItems(businessId, dto.items as RawLineItemDTO[], applyIGST);
        Object.assign(updates, computeInvoiceTotals(updates.items, applyIGST));
    }

    if (dto.invoiceDate !== undefined) updates.invoiceDate = dto.invoiceDate;
    if (dto.dueDate !== undefined) updates.dueDate = dto.dueDate;
    if (dto.status !== undefined) updates.status = dto.status;
    if (dto.notes !== undefined) updates.notes = dto.notes;
    if (dto.termsAndConditions !== undefined) updates.termsAndConditions = dto.termsAndConditions;
    if (dto.internalNotes !== undefined) updates.internalNotes = dto.internalNotes;

    const invoice = await Invoice.findByIdAndUpdate(
        invoiceId,
        { $set: updates },
        { new: true, runValidators: true },
    );

    logger.info({ msg: 'Invoice updated', businessId, invoiceId });
    return invoice;
};

// ── STATUS UPDATE ─────────────────────────────────────────────────────────────

export const updateStatus = async (
    businessId: string | Types.ObjectId,
    invoiceId: string,
    status: string,
) => {
    const invoice = await Invoice.findOneAndUpdate(
        { _id: invoiceId, ...baseFilter(businessId) },
        { $set: { status } },
        { new: true },
    );
    if (!invoice) throw new AppError('Invoice not found.', 404, 'NOT_FOUND');
    logger.info({ msg: 'Invoice status updated', businessId, invoiceId, status });
    return invoice;
};

// ── SOFT DELETE ───────────────────────────────────────────────────────────────

/**
 * Soft delete = set deletedAt + mark status 'cancelled'.
 * Invoice number is permanently retired — never reassigned.
 */
export const deleteInvoice = async (
    businessId: string | Types.ObjectId,
    invoiceId: string,
    deletedBy: string | Types.ObjectId,
) => {
    const invoice = await Invoice.findOneAndUpdate(
        { _id: invoiceId, ...baseFilter(businessId) },
        { $set: { deletedAt: new Date(), deletedBy, status: 'cancelled' } },
        { new: true },
    );
    if (!invoice) throw new AppError('Invoice not found.', 404, 'NOT_FOUND');
    logger.info({ msg: 'Invoice soft-deleted', businessId, invoiceId, deletedBy });
    return invoice;
};