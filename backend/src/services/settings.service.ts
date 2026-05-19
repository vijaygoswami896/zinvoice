import { Settings } from '../models/settings.model';
import AppError from '../utils/appError';
import logger from '../middleware/logger';
import { deleteFile } from '../middleware/upload.middleware';

const getSettings = async (userId: string) => {
  let settings = await Settings.findOne({ businessId: userId });

  if (!settings) {
    settings = await Settings.create({
      businessId: userId,
      businessName: 'My Business',
      invoicePrefix: 'INV',
    });
    logger.info({ msg: 'Default settings created', userId });
  }

  return settings;
};

const updateSettings = async (userId: string, dto: Record<string, unknown>) => {
  const settings = await Settings.findOneAndUpdate(
    { businessId: userId },
    { $set: { ...dto, businessId: userId } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );

  logger.info({ msg: 'Settings updated', userId });
  return settings;
};

const uploadLogo = async (userId: string, file: Express.Multer.File, fileUrl: string) => {
  const existing = await Settings.findOne({ businessId: userId });

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

const uploadSignature = async (userId: string, file: Express.Multer.File, fileUrl: string) => {
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

const deleteLogo = async (userId: string) => {
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

const deleteSignature = async (userId: string) => {
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

export default { getSettings, updateSettings, uploadLogo, uploadSignature, deleteLogo, deleteSignature };
