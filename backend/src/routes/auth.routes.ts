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


// 'use strict';

// const { Router } = require('express');
// const authController = require('../controllers/auth.controller');
// const authenticate = require('../middleware/authenticate');
// const requireRole = require('../middleware/requireRole');
// const validate = require('../middleware/validate');
// const { authLimiter } = require('../middleware/rateLimiter');
// const { RegisterSchema, LoginSchema } = require('../schemas/auth.schema');

// const router = Router();

// // All auth routes get the strict rate limiter (10 req / 15 min per IP)
// router.use(authLimiter);

// // ── Public routes (no token required) ────────────────────────────────────────

// /**
//  * POST /api/v1/auth/login
//  * Body: { email, password }
//  * Returns: { accessToken, user }
//  * Sets: httpOnly refresh token cookie (path: /api/v1/auth/refresh)
//  */
// router.post('/login', validate({ body: LoginSchema }), authController.login);

// /**
//  * POST /api/v1/auth/refresh
//  * Reads: httpOnly refresh token cookie
//  * Returns: { accessToken, user }
//  * Sets: new rotated httpOnly refresh token cookie
//  */
// router.post('/refresh', authController.refreshToken);

// /**
//  * POST /api/v1/auth/logout
//  * Revokes the current refresh token and clears the cookie.
//  * Does NOT require a valid access token (user may be mid-expiry).
//  */
// router.post('/logout', authController.logout);

// // ── Protected routes (valid access token required) ────────────────────────────

// /**
//  * GET /api/v1/auth/me
//  * Returns the currently authenticated user profile.
//  */
// router.get('/me', authenticate, authController.getMe);

// /**
//  * POST /api/v1/auth/logout-all
//  * Revokes all refresh tokens across all devices.
//  */
// router.post('/logout-all', authenticate, authController.logoutAll);

// // ── Admin-only routes ─────────────────────────────────────────────────────────

// /**
//  * POST /api/v1/auth/register
//  * Creates a new user account.
//  * - Any authenticated admin can create both 'admin' and 'staff' accounts.
//  * - Staff cannot register new users.
//  *
//  * Note: The very first admin is seeded via a CLI script or direct DB insert
//  * during initial deployment (bootstrapping problem — no admin exists yet).
//  */
// router.post(
//     '/register',
//     authenticate,
//     requireRole('admin'),
//     validate({ body: RegisterSchema }),
//     authController.register,
// );

// module.exports = router;