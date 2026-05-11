'use strict';

const { Router } = require('express');
const controller = require('../controllers/settings.controller');
const authenticate = require('../middleware/authenticate');
const validate = require('../middleware/validate');
const { UpdateSettingsSchema } = require('../schemas/settings.schema.server');
const { handleUpload, uploadLogo, uploadSignature } = require('../middleware/upload.middleware');

const router = Router();

// All settings routes require authentication
router.use(authenticate);

/**
 * GET  /api/v1/settings         — fetch (or initialise) settings
 * PUT  /api/v1/settings         — update business settings
 */
router.get('/', controller.getSettings);
router.put('/', validate({ body: UpdateSettingsSchema }), controller.updateSettings);

/**
 * POST   /api/v1/settings/logo       — upload logo
 * DELETE /api/v1/settings/logo       — remove logo
 */
router.post('/logo', handleUpload(uploadLogo), controller.uploadLogo);
router.delete('/logo', controller.deleteLogo);

/**
 * POST   /api/v1/settings/signature  — upload signature
 * DELETE /api/v1/settings/signature  — remove signature
 */
router.post('/signature', handleUpload(uploadSignature), controller.uploadSignature);
router.delete('/signature', controller.deleteSignature);

module.exports = router;
