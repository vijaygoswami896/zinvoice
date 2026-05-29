import { Router } from 'express';

import * as controller from '../controllers/payment.controller.js';
import authenticate from '../middleware/authenticate.js';
import validate from '../middleware/validate.js';
import { RecordPaymentSchema, PaymentListQuerySchema, PaymentIdParamSchema } from '../schemas/payment.schema.server.js';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const mongoId = z.object({ invoiceId: z.string().regex(/^[a-f\d]{24}$/i) });

// POST   /api/v1/payments             — record payment
router.post('/', validate({ body: RecordPaymentSchema }), controller.recordPayment);

// GET    /api/v1/payments             — list all payments
router.get('/', validate({ query: PaymentListQuerySchema }), controller.listPayments);

// GET    /api/v1/payments/invoice/:id — payments for one invoice
router.get('/invoice/:invoiceId', validate({ params: mongoId }), controller.getPaymentsForInvoice);

// DELETE /api/v1/payments/:id         — soft-delete a payment
router.delete('/:id', validate({ params: PaymentIdParamSchema }), controller.deletePayment);

export default router;