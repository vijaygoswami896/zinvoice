// src/controllers/pdf.controller.ts

import type { Request, Response } from 'express';
import { Invoice } from '../models/invoice.model.js';
import { Settings } from '../models/settings.model.js';
import { generatePDFBuffer, renderInvoiceHTML } from '../services/pdf.service.js';
import AppError from '../utils/appError.js';
import asyncHandler from '../utils/asyncHandler.js';
import logger from '../middleware/logger.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const bizId = (req: Request): string =>
    (req.user as { businessId?: string; id: string }).businessId
    ?? (req.user as { id: string }).id;

const fetchInvoiceAndSettings = async (businessId: string, invoiceId: string) => {
    const [invoice, settings] = await Promise.all([
        Invoice.findOne({ _id: invoiceId, businessId, deletedAt: null }),
        Settings.findOne({ businessId }),
    ]);
    if (!invoice) throw new AppError('Invoice not found.', 404, 'NOT_FOUND');
    return { invoice, settings };
};

// ── GET /api/v1/invoices/:id/pdf ──────────────────────────────────────────────

/**
 * Generates and streams the PDF directly to the client as a download.
 * Sets Content-Disposition: attachment so the browser saves the file.
 */
export const downloadPDF = asyncHandler(async (req: Request, res: Response) => {
    const { invoice, settings } = await fetchInvoiceAndSettings(bizId(req), req.params.id);

    logger.info({ invoiceId: invoice._id, invoiceNumber: invoice.invoiceNumber }, 'Generating PDF');

    const pdfBuffer = await generatePDFBuffer(invoice, settings);
    const filename = `${(invoice.invoiceNumber as string).replace(/\//g, '-')}.pdf`;

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
        'Cache-Control': 'no-store',
    });

    res.end(pdfBuffer);
});

// ── GET /api/v1/invoices/:id/preview ─────────────────────────────────────────

/**
 * Returns the rendered invoice HTML for in-browser preview.
 * The frontend loads this URL in an <iframe> inside the preview modal.
 *
 * Query param ?print=1 triggers the browser print dialog automatically.
 */
export const previewHTML = asyncHandler(async (req: Request, res: Response) => {
    const { invoice, settings } = await fetchInvoiceAndSettings(bizId(req), req.params.id);

    const html = renderInvoiceHTML(invoice, settings, { isPreview: true });

    res.set({
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
    });

    res.send(html);
});