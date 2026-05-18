import { Router } from 'express';
import controller from '../controllers/settings.controller';
import authenticate from '../middleware/authenticate';
import validate from '../middleware/validate';
import { UpdateSettingsSchema } from '../schemas/settings.schema.server';
import { handleUpload, uploadLogo, uploadSignature } from '../middleware/upload.middleware';

const router = Router();

router.use(authenticate);

router.get('/', controller.getSettings);
router.put('/', validate({ body: UpdateSettingsSchema }), controller.updateSettings);

router.post('/logo', handleUpload(uploadLogo), controller.uploadLogo);
router.delete('/logo', controller.deleteLogo);

router.post('/signature', handleUpload(uploadSignature), controller.uploadSignature);
router.delete('/signature', controller.deleteSignature);

export default router;