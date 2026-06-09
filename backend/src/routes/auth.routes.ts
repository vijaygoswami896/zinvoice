import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import authenticate from '../middleware/authenticate.js';
import requireRole from '../middleware/requireRole.js';
import validate from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { RegisterSchema, LoginSchema, SignupSchema, InviteSchema, ForgotPasswordSchema, ResetPasswordSchema } from '../schemas/auth.schema.js';

const router = Router();

router.use(authLimiter);

// ── Public
router.post('/signup', validate({ body: SignupSchema }), authController.signup);
router.post('/login', validate({ body: LoginSchema }), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authController.logout);
router.post('/forgot-password', validate({ body: ForgotPasswordSchema }), authController.forgotPassword);
router.post('/reset-password', validate({ body: ResetPasswordSchema }), authController.resetPassword);

// ── Authenticated
router.get('/me', authenticate, authController.getMe);
router.post('/logout-all', authenticate, authController.logoutAll);

// ── Admin only
router.post(
    '/invite',
    authenticate,
    requireRole('admin'),
    validate({ body: InviteSchema }),
    authController.invite,
);

export default router;
