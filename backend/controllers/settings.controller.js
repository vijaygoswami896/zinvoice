'use strict';

const settingsService = require('../services/settings.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { buildFileUrl } = require('../middleware/upload.middleware');

/**
 * GET /api/v1/settings
 * Returns the current user's business settings.
 * Creates defaults on first call.
 */
const getSettings = asyncHandler(async (req, res) => {
    const settings = await settingsService.getSettings(req.user.id);
    return sendSuccess(res, { data: { settings }, message: 'Settings retrieved.' });
});

/**
 * PUT /api/v1/settings
 * Full upsert of business settings (validated by Zod middleware).
 */
const updateSettings = asyncHandler(async (req, res) => {
    const settings = await settingsService.updateSettings(req.user.id, req.body);
    return sendSuccess(res, { data: { settings }, message: 'Settings saved.' });
});

/**
 * POST /api/v1/settings/logo
 * Replaces the business logo. Handled by multer middleware.
 */
const uploadLogo = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError('No file provided. Send a file in the `logo` field.', 400, 'NO_FILE');
    }

    const fileUrl = buildFileUrl(req.file);
    const settings = await settingsService.uploadLogo(req.user.id, req.file, fileUrl);

    return sendSuccess(res, {
        data: { logo: settings.logo },
        message: 'Logo uploaded.',
        status: 201,
    });
});

/**
 * POST /api/v1/settings/signature
 * Replaces the business signature.
 */
const uploadSignature = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError('No file provided. Send a file in the `signature` field.', 400, 'NO_FILE');
    }

    const fileUrl = buildFileUrl(req.file);
    const settings = await settingsService.uploadSignature(req.user.id, req.file, fileUrl);

    return sendSuccess(res, {
        data: { signature: settings.signature },
        message: 'Signature uploaded.',
        status: 201,
    });
});

/**
 * DELETE /api/v1/settings/logo
 */
const deleteLogo = asyncHandler(async (req, res) => {
    const settings = await settingsService.deleteLogo(req.user.id);
    return sendSuccess(res, { data: { settings }, message: 'Logo removed.' });
});

/**
 * DELETE /api/v1/settings/signature
 */
const deleteSignature = asyncHandler(async (req, res) => {
    const settings = await settingsService.deleteSignature(req.user.id);
    return sendSuccess(res, { data: { settings }, message: 'Signature removed.' });
});

module.exports = { getSettings, updateSettings, uploadLogo, uploadSignature, deleteLogo, deleteSignature };
