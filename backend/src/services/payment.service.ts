import mongoose from 'mongoose';

import { Payment } from '../models/payment.model.js';
import AppError from '../utils/appError.js';
import logger from '../middleware/logger.js';
import type { RecordPaymentInput, PaymentListQuery } from '../schemas/payment.schema.server.js';

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

// Lazy-load Invoice to avoid circular deps
// const getInvoice = () => require('../models/invoice.model').Invoice;
// const { Invoice } = await import('../models/invoice.model');

const baseFilter = (bId: string) => ({ businessId: bId, deletedAt: null });

// ── Helpers ───────────────────────────────────────────────────────────────────

export const getTotalPaid = async (invoiceId: string | mongoose.Types.ObjectId): Promise<number> => {
    const result = await Payment.aggregate([
        { $match: { invoiceId: mongoose.Types.ObjectId.createFromHexString(String(invoiceId)), deletedAt: null } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return round2(result[0]?.total ?? 0);
};

const deriveInvoiceStatus = (totalPaid: number, grandTotal: number, currentStatus: string): string => {
    if (currentStatus === 'cancelled') return 'cancelled';
    if (totalPaid >= grandTotal) return 'paid';
    return currentStatus === 'draft' ? 'draft' : 'sent';
};

// ── Record payment ────────────────────────────────────────────────────────────

export const recordPayment = async (businessId: string, dto: RecordPaymentInput) => {
    // const Invoice = getInvoice();
    const { Invoice } = await import('../models/invoice.model.js');

    const invoice = await Invoice.findOne({ _id: dto.invoiceId, ...baseFilter(businessId) });
    if (!invoice) throw new AppError('Invoice not found.', 404, 'NOT_FOUND');
    if (invoice.status === 'cancelled') throw new AppError('Cannot record a payment against a cancelled invoice.', 400, 'INVALID_STATUS');

    const alreadyPaid = await getTotalPaid(dto.invoiceId);
    if (alreadyPaid + dto.amount > invoice.grandTotal * 2) {
        throw new AppError(
            `Payment of ₹${dto.amount} would exceed the invoice total of ₹${invoice.grandTotal} by more than 100%. Please verify the amount.`,
            400, 'OVERPAYMENT',
        );
    }

    const payment = await Payment.create({
        businessId,
        invoiceId: invoice._id,
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        customerName: invoice.customerName,
        amount: dto.amount,
        mode: dto.mode,
        paymentDate: dto.paymentDate,
        reference: dto.reference ?? '',
        notes: dto.notes ?? '',
    });

    const newTotalPaid = round2(alreadyPaid + dto.amount);
    const newStatus = deriveInvoiceStatus(newTotalPaid, invoice.grandTotal, invoice.status);

    await Invoice.findByIdAndUpdate(invoice._id, { $set: { status: newStatus } });

    logger.info({ msg: 'Payment recorded', businessId, paymentId: payment._id, invoiceNumber: invoice.invoiceNumber, amount: dto.amount, newStatus });

    return { payment, invoiceStatus: newStatus, totalPaid: newTotalPaid };
};

// ── List payments ─────────────────────────────────────────────────────────────

export const listPayments = async (businessId: string, query: PaymentListQuery) => {
    const { page, limit, invoiceId, mode, dateFrom, dateTo, sortBy, sortDir } = query;

    const filter: Record<string, unknown> = baseFilter(businessId);
    if (invoiceId) filter.invoiceId = invoiceId;
    if (mode) filter.mode = mode;
    if (dateFrom || dateTo) {
        filter.paymentDate = {
            ...(dateFrom && { $gte: new Date(dateFrom) }),
            ...(dateTo && { $lte: new Date(dateTo) }),
        };
    }

    const sort = { [sortBy]: sortDir === 'asc' ? 1 : -1 } as Record<string, 1 | -1>;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        Payment.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Payment.countDocuments(filter),
    ]);

    return { items, total, page, limit };
};

// ── Get payments for a specific invoice ──────────────────────────────────────

export const getPaymentsForInvoice = async (businessId: string, invoiceId: string) => {
    // const Invoice = getInvoice();
    const { Invoice } = await import('../models/invoice.model.js');

    const [invoice, payments] = await Promise.all([
        Invoice.findOne({ _id: invoiceId, ...baseFilter(businessId) }).select('grandTotal status invoiceNumber'),
        Payment.find({ businessId, invoiceId, deletedAt: null }).sort({ paymentDate: 1 }).lean(),
    ]);

    if (!invoice) throw new AppError('Invoice not found.', 404, 'NOT_FOUND');

    const totalPaid = round2(payments.reduce((s, p) => s + p.amount, 0));
    const balance = round2(invoice.grandTotal - totalPaid);
    const paymentStatus = totalPaid <= 0 ? 'pending' : totalPaid >= invoice.grandTotal ? 'paid' : 'partial';

    return {
        payments,
        summary: {
            invoiceTotal: invoice.grandTotal,
            totalPaid,
            balance: Math.max(0, balance),
            paymentStatus,
            invoiceStatus: invoice.status,
        },
    };
};

// ── Delete payment ────────────────────────────────────────────────────────────

export const deletePayment = async (businessId: string, paymentId: string, deletedBy: string) => {
    // const Invoice = getInvoice();
    const { Invoice } = await import('../models/invoice.model.js');

    const payment = await Payment.findOneAndUpdate(
        { _id: paymentId, ...baseFilter(businessId) },
        { $set: { deletedAt: new Date(), deletedBy } },
        { new: true },
    );
    if (!payment) throw new AppError('Payment not found.', 404, 'NOT_FOUND');

    const totalPaid = await getTotalPaid(payment.invoiceId);
    const invoice = await Invoice.findById(payment.invoiceId).select('grandTotal status');

    if (invoice) {
        const newStatus = deriveInvoiceStatus(totalPaid, invoice.grandTotal, invoice.status);
        await Invoice.findByIdAndUpdate(invoice._id, { $set: { status: newStatus } });
    }

    logger.info({ msg: 'Payment deleted', businessId, paymentId, deletedBy });
    return payment;
};