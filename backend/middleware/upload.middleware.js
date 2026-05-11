'use strict';

const multer = require('multer');
const path   = require('path');
const crypto = require('crypto');
const fs     = require('fs');
const AppError = require('../utils/AppError');

// ── Storage directory ─────────────────────────────────────────────────────────

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'storage', 'uploads');

// Ensure directory exists at startup (not per-request)
fs.mkdirSync(path.join(UPLOAD_DIR, 'logos'),      { recursive: true });
fs.mkdirSync(path.join(UPLOAD_DIR, 'signatures'),  { recursive: true });

// ── Constants ─────────────────────────────────────────────────────────────────

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE     = 2 * 1024 * 1024; // 2 MB

// ── Storage engine ────────────────────────────────────────────────────────────

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subfolder = file.fieldname === 'logo' ? 'logos' : 'signatures';
    cb(null, path.join(UPLOAD_DIR, subfolder));
  },
  filename: (req, file, cb) => {
    const userId  = req.user?.id || 'unknown';
    const ext     = path.extname(file.originalname).toLowerCase() || '.jpg';
    const unique  = crypto.randomBytes(8).toString('hex');
    // e.g. logo-64ab3f-a1b2c3d4.png
    cb(null, `${file.fieldname}-${userId.slice(-6)}-${unique}${ext}`);
  },
});

// ── File filter ───────────────────────────────────────────────────────────────

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Only JPEG, PNG, WebP and SVG images are allowed.',
        400,
        'INVALID_FILE_TYPE',
      ),
      false,
    );
  }
};

// ── Multer instance ───────────────────────────────────────────────────────────

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

/**
 * Middleware for logo upload: POST /settings/logo
 * Accepts a single file in the `logo` field.
 */
const uploadLogo = upload.single('logo');

/**
 * Middleware for signature upload: POST /settings/signature
 * Accepts a single file in the `signature` field.
 */
const uploadSignature = upload.single('signature');

/**
 * Wraps a multer middleware so that multer errors are forwarded
 * through Express's error-handling middleware rather than thrown.
 *
 * @param {Function} multerMiddleware
 * @returns {import('express').RequestHandler}
 */
const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(new AppError('File too large. Maximum size is 2 MB.', 400, 'FILE_TOO_LARGE'));
      }
      return next(new AppError(err.message, 400, 'UPLOAD_ERROR'));
    }

    // App-level errors from fileFilter
    if (err.isOperational) return next(err);

    next(new AppError('File upload failed.', 500, 'UPLOAD_FAILED'));
  });
};

/**
 * Builds the public URL for a stored file.
 * In production, swap this for a CDN/S3 URL.
 *
 * @param {Express.Multer.File} file
 * @returns {string}
 */
const buildFileUrl = (file) => {
  const subfolder = file.fieldname === 'logo' ? 'logos' : 'signatures';
  // Served by Express static: /uploads/logos/<filename>
  return `/uploads/${subfolder}/${file.filename}`;
};

/**
 * Deletes a previously uploaded file from disk (best-effort — does not throw).
 *
 * @param {string} fileUrl - URL as stored in the DB (e.g. /uploads/logos/logo-abc.png)
 */
const deleteFile = (fileUrl) => {
  if (!fileUrl) return;
  try {
    const relativePath = fileUrl.replace(/^\/uploads\//, '');
    const fullPath = path.join(UPLOAD_DIR, relativePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch {
    // Best-effort — log but don't fail the request
  }
};

module.exports = { handleUpload, uploadLogo, uploadSignature, buildFileUrl, deleteFile, UPLOAD_DIR };
