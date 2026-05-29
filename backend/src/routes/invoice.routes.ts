import { Router } from 'express';
import * as controller from '../controllers/invoice.controller.js';
import authenticate from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import {
    CreateInvoiceSchema,
    UpdateInvoiceSchema,
    UpdateStatusSchema,
    InvoiceListQuerySchema,
    InvoiceIdParamSchema,
} from '../schemas/invoice.schema.server.js';

const router = Router();
router.use(authenticate);

router.get(
    '/',
    validate({ query: InvoiceListQuerySchema }),
    controller.listInvoices,
);

router.post(
    '/',
    validate({ body: CreateInvoiceSchema }),
    controller.createInvoice,
);

router.get(
    '/:id',
    validate({ params: InvoiceIdParamSchema }),
    controller.getInvoice,
);

router.put(
    '/:id',
    validate({ params: InvoiceIdParamSchema, body: UpdateInvoiceSchema }),
    controller.updateInvoice,
);

router.patch(
    '/:id/status',
    validate({ params: InvoiceIdParamSchema, body: UpdateStatusSchema }),
    controller.updateStatus,
);

router.delete(
    '/:id',
    validate({ params: InvoiceIdParamSchema }),
    controller.deleteInvoice,
);

export default router;