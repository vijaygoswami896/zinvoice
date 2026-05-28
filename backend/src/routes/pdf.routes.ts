// src/routes/pdf.routes.ts

import { Router } from 'express';
import * as controller from '../controllers/pdf.controller.js';
import authenticate from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { InvoiceIdParamSchema } from '../schemas/invoice.schema.server.js';

const router = Router();
router.use(authenticate);

/**
 * GET /api/v1/invoices/:id/pdf
 *
 * Downloads the invoice as a PDF file.
 * Content-Disposition: attachment → browser save dialog.
 */
router.get(
    '/:id/pdf',
    validate({ params: InvoiceIdParamSchema }),
    controller.downloadPDF,
);

/**
 * GET /api/v1/invoices/:id/preview
 *
 * Returns rendered invoice HTML for in-browser preview.
 * Loaded inside an <iframe> in the PdfPreviewModal.
 * Append ?print=1 to auto-trigger the browser print dialog.
 */
router.get(
    '/:id/preview',
    validate({ params: InvoiceIdParamSchema }),
    controller.previewHTML,
);

export default router;