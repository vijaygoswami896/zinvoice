import { Router } from 'express';
import * as unitController from '../controllers/unit.controller.js';
import validate from '../middleware/validate.js';
import authenticate from '../middleware/authenticate.js';
import {
    createUnitSchema,
    updateUnitSchema,
    deleteUnitSchema,
    getUnitByIdSchema,
    listUnitsSchema,
    restoreUnitSchema,
} from '../schemas/unit.schema.js';

const router = Router();

router.use(authenticate);

// ── Collection routes ─────────────────────────────────────────────────────────
router.get(
    '/',
    validate({ query: listUnitsSchema.shape.query }),
    unitController.listUnits,
);
router.post(
    '/',
    validate({ body: createUnitSchema.shape.body }),
    unitController.createUnit,
);

// ── Restore (before /:id to avoid route collision) ────────────────────────────
router.patch(
    '/:id/restore',
    validate({ params: restoreUnitSchema.shape.params }),
    unitController.restoreUnit,
);

// ── Member routes ─────────────────────────────────────────────────────────────
router.get(
    '/:id',
    validate({ params: getUnitByIdSchema.shape.params }),
    unitController.getUnitById,
);
router.patch(
    '/:id',
    validate({ params: updateUnitSchema.shape.params, body: updateUnitSchema.shape.body }),
    unitController.updateUnit,
);
router.delete(
    '/:id',
    validate({ params: deleteUnitSchema.shape.params }),
    unitController.deleteUnit,
);

export default router;