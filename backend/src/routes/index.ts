import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import settingsRoutes from './settings.routes.js';
import customerRoutes from './customer.routes.js'
import productRoutes from './product.routes.js'
import invoiceRoutes from './invoice.routes.js'
import pdfRoutes from './pdf.routes.js'

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/customers', customerRoutes);
router.use('/products', productRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/invoices', pdfRoutes);

export default router;
