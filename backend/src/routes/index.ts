import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import settingsRoutes from './settings.routes';
import customerRoutes from './customer.routes'

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/settings', settingsRoutes);
router.use('/customers', customerRoutes);

export default router;
