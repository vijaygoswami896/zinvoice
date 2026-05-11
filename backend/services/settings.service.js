'use strict';

const { Settings } = require('../models/settings.model');
const AppError = require('../utils/AppError');
const logger = require('../middleware/logger');
const { deleteFile } = require('../middleware/upload.middleware');

// ── Service methods ───────────────────────────────────────────────────────────

/**
 * Get settings for the authenticated user's business.
 * Creates a minimal default document if none exists yet (first-time setup).
 *
 * @param {string} userId
 */
const getSettings = async (userId) => {
  let settings = await Settings.findOne({ businessId: userId });

  if (!settings) {
    // First load — create blank settings so the frontend always gets a document
    settings = await Settings.create({
      businessId: userId,
      businessName: 'My Business',
      invoicePrefix: 'INV',
    });
    logger.info({ msg: 'Default settings created', userId });
  }

  return settings;
};

/**
 * Update (upsert) settings for the authenticated user's business.
 * Uses findOneAndUpdate with upsert to handle the first-save case.
 *
 * @param {string} userId
 * @param {object} dto    - Validated body from UpdateSettingsSchema
 */
const updateSettings = async (userId, dto) => {
  const settings = await Settings.findOneAndUpdate(
    { businessId: userId },
    { $set: { ...dto, businessId: userId } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  logger.info({ msg: 'Settings updated', userId });
  return settings;
};

/**
 * Upload and store a logo for the business.
 * Deletes the previous logo file from disk before replacing.
 *
 * @param {string}              userId
 * @param {Express.Multer.File} file
 * @param {string}              fileUrl - URL to store (from buildFileUrl)
 */
const uploadLogo = async (userId, file, fileUrl) => {
  const existing = await Settings.findOne({ businessId: userId });

  // Delete old logo if present
  if (existing?.logo?.url) {
    deleteFile(existing.logo.url);
  }

  const settings = await Settings.findOneAndUpdate(
    { businessId: userId },
    {
      $set: {
        logo: {
          url: fileUrl,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          uploadedAt: new Date(),
        },
      },
    },
    { new: true, upsert: true },
  );

  logger.info({ msg: 'Logo uploaded', userId, fileUrl });
  return settings;
};

/**
 * Upload and store a signature for the business.
 *
 * @param {string}              userId
 * @param {Express.Multer.File} file
 * @param {string}              fileUrl
 */
const uploadSignature = async (userId, file, fileUrl) => {
  const existing = await Settings.findOne({ businessId: userId });

  if (existing?.signature?.url) {
    deleteFile(existing.signature.url);
  }

  const settings = await Settings.findOneAndUpdate(
    { businessId: userId },
    {
      $set: {
        signature: {
          url: fileUrl,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          uploadedAt: new Date(),
        },
      },
    },
    { new: true, upsert: true },
  );

  logger.info({ msg: 'Signature uploaded', userId, fileUrl });
  return settings;
};

/**
 * Delete the logo from disk and clear the field in the DB.
 *
 * @param {string} userId
 */
const deleteLogo = async (userId) => {
  const settings = await Settings.findOne({ businessId: userId });
  if (!settings?.logo?.url) {
    throw new AppError('No logo to delete.', 404, 'NOT_FOUND');
  }

  deleteFile(settings.logo.url);

  settings.logo = null;
  await settings.save();

  logger.info({ msg: 'Logo deleted', userId });
  return settings;
};

/**
 * Delete the signature from disk and clear the field in the DB.
 *
 * @param {string} userId
 */
const deleteSignature = async (userId) => {
  const settings = await Settings.findOne({ businessId: userId });
  if (!settings?.signature?.url) {
    throw new AppError('No signature to delete.', 404, 'NOT_FOUND');
  }

  deleteFile(settings.signature.url);

  settings.signature = null;
  await settings.save();

  logger.info({ msg: 'Signature deleted', userId });
  return settings;
};

module.exports = { getSettings, updateSettings, uploadLogo, uploadSignature, deleteLogo, deleteSignature };
