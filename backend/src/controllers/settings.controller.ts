import { Request, Response } from 'express';
import settingsService from '../services/settings.service';
import { sendSuccess } from '../utils/apiResponse';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/appError';
import { buildFileUrl } from '../middleware/upload.middleware';
import { AuthenticatedRequest } from '../types';

const getSettings = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const settings = await settingsService.getSettings(user.id);
    sendSuccess(res, { data: { settings }, message: 'Settings retrieved.' });
});

const updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const settings = await settingsService.updateSettings(user.id, req.body);
    sendSuccess(res, { data: { settings }, message: 'Settings saved.' });
});

const uploadLogo = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;

    if (!req.file) {
        throw new AppError('No file provided. Send a file in the `logo` field.', 400, 'NO_FILE');
    }

    const fileUrl = buildFileUrl(req.file);
    const settings = await settingsService.uploadLogo(user.id, req.file, fileUrl);

    sendSuccess(res, { data: { logo: settings.logo }, message: 'Logo uploaded.', status: 201 });
});

const uploadSignature = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;

    if (!req.file) {
        throw new AppError('No file provided. Send a file in the `signature` field.', 400, 'NO_FILE');
    }

    const fileUrl = buildFileUrl(req.file);
    const settings = await settingsService.uploadSignature(user.id, req.file, fileUrl);

    sendSuccess(res, { data: { signature: settings.signature }, message: 'Signature uploaded.', status: 201 });
});

const deleteLogo = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const settings = await settingsService.deleteLogo(user.id);
    sendSuccess(res, { data: { settings }, message: 'Logo removed.' });
});

const deleteSignature = asyncHandler(async (req: Request, res: Response) => {
    const { user } = req as AuthenticatedRequest;
    const settings = await settingsService.deleteSignature(user.id);
    sendSuccess(res, { data: { settings }, message: 'Signature removed.' });
});

export default { getSettings, updateSettings, uploadLogo, uploadSignature, deleteLogo, deleteSignature };