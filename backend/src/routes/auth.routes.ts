import { Router } from 'express';
import authController from '../controllers/auth.controller';
import authenticate from '../middleware/authenticate';
import requireRole from '../middleware/requireRole';
import validate from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { RegisterSchema, LoginSchema } from '../schemas/auth.schema';

const router = Router();

router.use(authLimiter);

router.post('/login', validate({ body: LoginSchema }), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getMe);
router.post('/logout-all', authenticate, authController.logoutAll);

router.post(
    '/register',
    authenticate,
    requireRole('admin'),
    validate({ body: RegisterSchema }),
    authController.register,
);

export default router;
