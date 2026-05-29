import settingsService from '../services/settings.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import { buildFileUrl } from '../middleware/upload.middleware.js';
import getBusinessId from '../utils/getBusinessId.js';
// import { AuthenticatedRequest } from '../types';
const getSettings = asyncHandler(async (req, res) => {
    // const { user } = req as AuthenticatedRequest;
    const { user } = req;
    // const settings = await settingsService.getSettings(user!.id);
    const settings = await settingsService.getSettings(getBusinessId(req));
    sendSuccess(res, { data: { settings }, message: 'Settings retrieved.' });
});
const updateSettings = asyncHandler(async (req, res) => {
    const { user } = req;
    // const settings = await settingsService.updateSettings(user!.id, req.body);
    const settings = await settingsService.updateSettings(getBusinessId(req), req.body);
    sendSuccess(res, { data: { settings }, message: 'Settings saved.' });
});
const uploadLogo = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError('No file provided. Send a file in the `logo` field.', 400, 'NO_FILE');
    }
    const fileUrl = buildFileUrl(req.file);
    const settings = await settingsService.uploadLogo(getBusinessId(req), req.file, fileUrl);
    sendSuccess(res, { data: { logo: settings.logo }, message: 'Logo uploaded.', status: 201 });
});
const uploadSignature = asyncHandler(async (req, res) => {
    if (!req.file) {
        throw new AppError('No file provided. Send a file in the `signature` field.', 400, 'NO_FILE');
    }
    const fileUrl = buildFileUrl(req.file);
    const settings = await settingsService.uploadSignature(getBusinessId(req), req.file, fileUrl);
    sendSuccess(res, { data: { signature: settings.signature }, message: 'Signature uploaded.', status: 201 });
});
const deleteLogo = asyncHandler(async (req, res) => {
    const settings = await settingsService.deleteLogo(getBusinessId(req));
    sendSuccess(res, { data: { settings }, message: 'Logo removed.' });
});
const deleteSignature = asyncHandler(async (req, res) => {
    const settings = await settingsService.deleteSignature(getBusinessId(req));
    sendSuccess(res, { data: { settings }, message: 'Signature removed.' });
});
export default { getSettings, updateSettings, uploadLogo, uploadSignature, deleteLogo, deleteSignature };
//# sourceMappingURL=settings.controller.js.map