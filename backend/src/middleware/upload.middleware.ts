import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError.js';

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'storage', 'uploads');

fs.mkdirSync(path.join(UPLOAD_DIR, 'logos'), { recursive: true });
fs.mkdirSync(path.join(UPLOAD_DIR, 'signatures'), { recursive: true });

const ALLOWED_MIMETYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    const subfolder = file.fieldname === 'logo' ? 'logos' : 'signatures';
    cb(null, path.join(UPLOAD_DIR, subfolder));
  },
  filename: (req, file, cb) => {
    const userId = req.user?.id ?? 'unknown';
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const unique = crypto.randomBytes(8).toString('hex');
    cb(null, `${file.fieldname}-${userId.slice(-6)}-${unique}${ext}`);
  },
});

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, WebP and SVG images are allowed.', 400, 'INVALID_FILE_TYPE'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
});

export const uploadLogo = upload.single('logo');
export const uploadSignature = upload.single('signature');

export const handleUpload = (multerMiddleware: ReturnType<typeof upload.single>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    multerMiddleware(req, res, (err) => {
      if (!err) return next();

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new AppError('File too large. Maximum size is 2 MB.', 400, 'FILE_TOO_LARGE'));
        }
        return next(new AppError(err.message, 400, 'UPLOAD_ERROR'));
      }

      if ((err as AppError).isOperational) return next(err);

      next(new AppError('File upload failed.', 500, 'UPLOAD_FAILED'));
    });
  };

export const buildFileUrl = (file: Express.Multer.File): string => {
  const subfolder = file.fieldname === 'logo' ? 'logos' : 'signatures';
  return `/uploads/${subfolder}/${file.filename}`;
};

export const deleteFile = (fileUrl: string): void => {
  if (!fileUrl) return;
  try {
    const relativePath = fileUrl.replace(/^\/uploads\//, '');
    const fullPath = path.join(UPLOAD_DIR, relativePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
  } catch {
    // best-effort
  }
};

export { UPLOAD_DIR };